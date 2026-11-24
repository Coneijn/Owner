'use server';

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const GHL_SELLER_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/4f9624b6-15f8-492f-bbbb-5ca537e21777';

interface RegisterSellerInput {
  name: string;
  email: string;
  phone: string;
  addressData: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  estimatedMonthlyPayment: number;
}

export async function registerSellerAction(data: RegisterSellerInput) {
  try {
    const {
      name,
      email,
      phone,
      addressData,
      suggestedPriceMin,
      suggestedPriceMax,
      estimatedMonthlyPayment,
    } = data;

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Upsert o Creación del Usuario
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Generar contraseña temporal aleatoria para cumplir con password String
      const tempPasswordHash = crypto.randomBytes(24).toString('hex');

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name.trim(),
          password: tempPasswordHash,
          role: 'USER', // Enum Role: ADMIN | STAFF | USER
          forcePasswordChange: true,
        },
      });
    }

    // 2. Token de Verificación (VerificationToken model)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: verificationToken,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 horas
      },
    });

    // 3. Crear o enlazar SellerProfile
    let sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });

    if (!sellerProfile) {
      sellerProfile = await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          sellerName: name.trim(),
          phone: phone.trim(),
          sellerType: 'OWNER',
          agreementSigned: false,
          hasAssistant: false,
        },
      });
    } else {
      // Actualizar teléfono o nombre si estaban vacíos
      sellerProfile = await prisma.sellerProfile.update({
        where: { id: sellerProfile.id },
        data: {
          sellerName: sellerProfile.sellerName || name.trim(),
          phone: sellerProfile.phone || phone.trim(),
        },
      });
    }

    // 4. Generación de Slug Único
    const cleanAddress = addressData.address || 'propiedad';
    const cleanCity = addressData.city || 'tx';
    const baseSlug = `${cleanAddress}-${cleanCity}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${baseSlug}-${crypto.randomBytes(3).toString('hex')}`;

    // 5. Creación de Property con los requerimientos estrictos de schema.prisma
    const property = await prisma.property.create({
      data: {
        slug: uniqueSlug,
        status: 'DRAFT', // Enum PropertyStatus: DRAFT
        isDraftComplete: false,
        isForSale: true,
        isForRent: false,

        // Campos bilingües obligatorios
        titleEn: `Property at ${addressData.address}`,
        titleEs: `Propiedad en ${addressData.address}`,
        descriptionEn: 'Draft listing awaiting complete details.',
        descriptionEs: 'Borrador de propiedad en espera de detalles operativos.',

        // Ubicación
        address: addressData.address,
        city: addressData.city || 'Unknown',
        state: addressData.state || 'TX',
        zipCode: addressData.zipCode || '00000',
        latitude: addressData.latitude ?? null,
        longitude: addressData.longitude ?? null,

        // Especificaciones obligatorias (inicializadas para DRAFT)
        bedrooms: 0,
        bathrooms: 0,
        sqft: 0,
        mainImage: '/images/default-property-placeholder.jpg',
        galleryImages: [],
        features: [],

        // Estimaciones Ligeras (RF-06 a RF-09)
        suggestedPriceMin,
        suggestedPriceMax,
        suggestedInterestRate: 10.0,
        estimatedMonthlyPayment,

        // Lista de campos faltantes para la auditoría de Frank & Lucy (RF-15, RF-28)
        missingFields: [
          'bedrooms',
          'bathrooms',
          'sqft',
          'mainImage',
          'lockboxCode',
          'salePrice',
          'estimatedTaxes',
          'estimatedInsurance',
        ],

        // Relación con el SellerProfile
        sellerProfileId: sellerProfile.id,
      },
    });

    // 6. Envío de datos en segundo plano al Webhook de GoHighLevel
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Vendedor';
    const lastName = nameParts.slice(1).join(' ') || '';
    const draftUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://ownertodueno.com'}/sellerDashboard/properties/${property.id}/edit`;

    fetch(GHL_SELLER_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        sellerProfileId: sellerProfile.id,
        propertyId: property.id,
        propertySlug: property.slug,
        firstName,
        lastName,
        fullName: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        propertyAddress: addressData.address,
        city: addressData.city || 'Unknown',
        state: addressData.state || 'TX',
        zipCode: addressData.zipCode || '00000',
        latitude: addressData.latitude ?? null,
        longitude: addressData.longitude ?? null,
        suggestedPriceMin,
        suggestedPriceMax,
        estimatedMonthlyPayment,
        draftUrl,
        tags: ['seller', 'self-service', 'pipeline-onboarding', 'draft_incomplete'],
      }),
    })
      .then((res) => {
        if (!res.ok) {
          console.error(`Error en webhook de GHL: HTTP ${res.status}`);
        }
      })
      .catch((err) => console.error('Error al enviar payload al webhook de GHL:', err));

    return {
      success: true,
      propertyId: property.id,
      redirectUrl: `/sellerDashboard/properties/${property.id}/edit`,
    };
  } catch (error: any) {
    console.error('Error en registerSellerAction:', error);
    return {
      success: false,
      error: error?.message || 'Error al procesar el registro del vendedor.',
    };
  }
}
const LOWER_MARGIN = 0.10; // -10% sobre el valor estimado
const UPPER_MARGIN = 0.10; // +10% sobre el valor estimado

export async function getRentCastEstimateAction(fullAddress: string) {
  try {
    const apiKey = process.env.RENTCAST_API_KEY;
    if (!apiKey) {
      console.error('RENTCAST_API_KEY no está configurada');
      return { success: false, error: 'API key missing' };
    }

    const url = `https://api.rentcast.io/v1/avm/value?address=${encodeURIComponent(fullAddress)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        Accept: 'application/json',
      },
      // Cache opcional para no gastar créditos repetidos si el usuario re-selecciona la misma dirección
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`Error RentCast HTTP ${response.status}`);
      return { success: false, error: `RentCast error: ${response.status}` };
    }

    const data = await response.json();

    if (!data?.price || typeof data.price !== 'number') {
      return { success: false, error: 'No se encontró valuación para esta dirección' };
    }

    const basePrice = data.price;

    // Aplicamos márgenes y redondeamos a múltiplos de $5,000 para respetar el step="5000" de los inputs
    const suggestedMin = Math.round((basePrice * (1 - LOWER_MARGIN)) / 5000) * 5000;
    const suggestedMax = Math.round((basePrice * (1 + UPPER_MARGIN)) / 5000) * 5000;

    return {
      success: true,
      estimatedValue: basePrice,
      suggestedMin,
      suggestedMax,
    };
  } catch (error: any) {
    console.error('Error en getRentCastEstimateAction:', error);
    return { success: false, error: error?.message || 'Error consultando RentCast' };
  }
}