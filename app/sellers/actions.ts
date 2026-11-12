'use server';

import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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

    // 6. Sincronización en segundo plano con GoHighLevel (RF-04)
    if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || 'Vendedor';
      const lastName = nameParts.slice(1).join(' ') || '';

      fetch('https://services.leadconnectorhq.com/contacts/upsert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId: process.env.GHL_LOCATION_ID,
          email: normalizedEmail,
          phone: phone.trim(),
          firstName,
          lastName,
          tags: ['seller', 'self-service', 'pipeline-onboarding', 'draft_incomplete'],
          customFields: [
            { key: 'property_address', value: addressData.address },
            { key: 'suggested_price_min', value: suggestedPriceMin },
            { key: 'suggested_price_max', value: suggestedPriceMax },
            { key: 'estimated_monthly_payment', value: estimatedMonthlyPayment },
            {
              key: 'draft_url',
              value: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ownertodueno.com'}/sellerDashboard/properties/${property.id}/edit`,
            },
          ],
        }),
      })
        .then(async (ghlRes) => {
          if (ghlRes.ok) {
            const ghlData = await ghlRes.json();
            const contactId = ghlData?.contact?.id;
            if (contactId && sellerProfile) {
              await prisma.sellerProfile.update({
                where: { id: sellerProfile.id },
                data: { ghlContactId: contactId },
              });
            }
          }
        })
        .catch((err) => console.error('Error al sincronizar con GHL:', err));
    }

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