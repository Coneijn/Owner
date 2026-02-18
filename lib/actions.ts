'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PropertyStatus } from '@prisma/client';

// lib/actions.ts (Solo la función authenticate)
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/admin', 
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials. Please check your email and password.';
        
        case 'CallbackRouteError':
          const cause = error.cause as any;
          if (cause?.err?.message === '2FA_REQUIRED') {
             return '2FA_REQUIRED'; 
          }
          return 'Authentication error.';

        default:
          return 'Something went wrong. Please try again.';
      }
    }
    throw error;
  }
}

// --- DELETE ---
export async function deleteProperty(formData: FormData) {
  const id = formData.get('id') as string;
  
  try {
    await prisma.property.delete({
      where: { id },
    });
    
    revalidatePath('/admin');
    revalidatePath('/');
    return { message: 'Propiedad eliminada' };
  } catch (error) {
    return { message: 'Error al eliminar' };
  }
}

// --- HELPERS ---
function processFeatures(input: unknown): string[] {
  if (typeof input !== 'string') return [];
  if (!input.trim()) return [];
  return input.split(',').map(item => item.trim());
}

// Helper para parsear los JSON de imágenes
function parseImageData(jsonString: unknown) {
  if (typeof jsonString !== 'string' || !jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Error parsing image JSON", e);
    return null;
  }
}

// Helper para procesar fechas vacías o inválidas
function parseDate(dateString: unknown): Date | null {
  if (typeof dateString !== 'string' || !dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

// Helper para procesar coordenadas (evita NaN)
function parseFloatSafe(value: unknown): number | null {
  if (!value) return null;
  const parsed = parseFloat(value as string);
  return isNaN(parsed) ? null : parsed;
}

// NUEVO HELPER: Para manejar Decimals opcionales (Precio, Renta, etc)
// Si viene vacío "", devuelve null. Si trae valor, devuelve el string para Prisma.
function parseDecimalOrNull(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim() === '') return null;
    return value;
}

// --- CREATE ---
export async function createProperty(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const mainImageObj = parseImageData(rawFormData.mainImageData);
  const galleryImagesArray = parseImageData(rawFormData.galleryImagesData) || [];
  const imagesToCreate = [];
  const slugInput = rawFormData.slug as string;
  const sanitizedSlug = slugInput.trim().toLowerCase().replace(/\s+/g, '-');

  // Procesamiento de imágenes
  if (mainImageObj && mainImageObj.url) {
    imagesToCreate.push({
      url: mainImageObj.url,
      altText: mainImageObj.altText || '',
      title: mainImageObj.title || '',
      caption: mainImageObj.caption || '',
      description: mainImageObj.description || '',
      isMain: true,
      order: 0
    });
  }

  if (Array.isArray(galleryImagesArray)) {
    galleryImagesArray.forEach((img: any, index: number) => {
      imagesToCreate.push({
        url: img.url,
        altText: img.altText || '',
        title: img.title || '',
        caption: img.caption || '',
        description: img.description || '',
        isMain: false,
        order: index + 1
      });
    });
  }

  const legacyGalleryUrls = Array.isArray(galleryImagesArray) ? galleryImagesArray.map((img:any) => img.url) : [];

  try {
    await prisma.property.create({
      data: {
        slug: sanitizedSlug,
        status: rawFormData.status as PropertyStatus, 
        isFeatured: rawFormData.isFeatured === 'on',
        isOffMarket: rawFormData.isOffMarket === 'on',
        
        // --- NUEVOS FLAGS ---
        isForSale: rawFormData.isForSale === 'on', // Checkbox de venta
        isForRent: rawFormData.isForRent === 'on', // Checkbox de renta

        calendarLink: rawFormData.calendarLink as string,
        availableDate: parseDate(rawFormData.availableDate),

        // SEO Fields
        seoTitleEn: rawFormData.seoTitleEn as string,
        seoDescriptionEn: rawFormData.seoDescriptionEn as string,
        seoTitleEs: rawFormData.seoTitleEs as string,
        seoDescriptionEs: rawFormData.seoDescriptionEs as string,

        // Bilingüe
        titleEn: rawFormData.titleEn as string,
        titleEs: rawFormData.titleEs as string,
        descriptionEn: rawFormData.descriptionEn as string,
        descriptionEs: rawFormData.descriptionEs as string,
        
        // --- Financiero VENTA (Ahora opcionales con parseDecimalOrNull) ---
        price: parseDecimalOrNull(rawFormData.price), 
        downPayment: parseDecimalOrNull(rawFormData.downPayment),
        interestRate: parseDecimalOrNull(rawFormData.interestRate),
        taxes: parseDecimalOrNull(rawFormData.taxes),
        insurance: parseDecimalOrNull(rawFormData.insurance),

        // --- Financiero RENTA (Nuevos) ---
        monthlyRent: parseDecimalOrNull(rawFormData.monthlyRent),
        securityDeposit: parseDecimalOrNull(rawFormData.securityDeposit),
        
        // Ubicación y Contacto
        address: rawFormData.address as string,
        city: rawFormData.city as string,
        state: rawFormData.state as string,
        zipCode: rawFormData.zipCode as string,
        phoneNumber: rawFormData.phoneNumber as string,
        
        // Coordenadas y Acceso
        latitude: parseFloatSafe(rawFormData.latitude),
        longitude: parseFloatSafe(rawFormData.longitude),
        lockboxCode: rawFormData.lockboxCode as string,

        // Specs
        bedrooms: Number(rawFormData.bedrooms),
        bathrooms: Number(rawFormData.bathrooms),
        sqft: Number(rawFormData.sqft),
        lotSize: Number(rawFormData.lotSize) || 0,
        yearBuilt: Number(rawFormData.yearBuilt) || new Date().getFullYear(),
        
        // Multimedia
        mainImage: mainImageObj?.url || '',
        galleryImages: legacyGalleryUrls,
        videoUrl: rawFormData.videoUrl as string,
        features: processFeatures(rawFormData.features),

        images: {
          create: imagesToCreate
        },

        // Vendedor 
        showSeller: rawFormData.showSeller === 'on',
        sellerName: rawFormData.sellerName as string,
        sellerImage: rawFormData.sellerImage as string, 
        sellerType: rawFormData.sellerType as string,
      },
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return { message: 'Error al crear la propiedad.' };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}

// --- UPDATE MODIFICADO ---
export async function updateProperty(prevState: any, formData: FormData) {
  const id = formData.get('id') as string; 
  const rawFormData = Object.fromEntries(formData.entries());
  const slugInput = rawFormData.slug as string;
  const sanitizedSlug = slugInput.trim().toLowerCase().replace(/\s+/g, '-');
  
  // Procesamiento de imágenes (Tu código existente se mantiene igual)
  const mainImageObj = parseImageData(rawFormData.mainImageData);
  const galleryImagesArray = parseImageData(rawFormData.galleryImagesData) || [];

  const imagesToCreate = [];

  if (mainImageObj && mainImageObj.url) {
    imagesToCreate.push({
      url: mainImageObj.url,
      altText: mainImageObj.altText || '',
      title: mainImageObj.title || '',
      caption: mainImageObj.caption || '',
      description: mainImageObj.description || '',
      isMain: true,
      order: 0
    });
  }

  if (Array.isArray(galleryImagesArray)) {
    galleryImagesArray.forEach((img: any, index: number) => {
      imagesToCreate.push({
        url: img.url,
        altText: img.altText || '',
        title: img.title || '',
        caption: img.caption || '',
        description: img.description || '',
        isMain: false,
        order: index + 1
      });
    });
  }

  const legacyGalleryUrls = Array.isArray(galleryImagesArray) ? galleryImagesArray.map((img:any) => img.url) : [];

  // ============================================================
  // [NUEVO] LÓGICA DE DETECCIÓN DE CAMBIO DE PRECIO
  // ============================================================
  
  // 1. Preparamos el nuevo precio para usarlo en la lógica y en el update
  const newPriceValue = parseDecimalOrNull(rawFormData.price);
  
  // Objeto donde guardaremos los campos de historial si hubo cambio
  let priceHistoryData = {};

  try {
    // 2. Obtenemos el precio actual de la BD antes de sobreescribirlo
    const currentProperty = await prisma.property.findUnique({
      where: { id },
      select: { price: true }
    });

    // 3. Comparamos los valores numéricamente
    // Convertimos a Number para evitar problemas comparando objetos Decimal vs Strings
    const currentPriceNum = currentProperty?.price ? Number(currentProperty.price) : null;
    const newPriceNum = newPriceValue ? Number(newPriceValue) : null;

    // Si ambos existen (o uno es null y el otro no) y son diferentes:
    if (newPriceNum !== currentPriceNum) {
       console.log(`Detectado cambio de precio: De ${currentPriceNum} a ${newPriceNum}`);
       
       priceHistoryData = {
         previousPrice: currentProperty?.price, // Guardamos el valor Decimal original
         lastPriceChangeAt: new Date()          // Marcamos la fecha de hoy
       };
    }

    // ============================================================
    // FIN LÓGICA DE PRECIOS -> EJECUTAMOS EL UPDATE
    // ============================================================

    await prisma.property.update({
      where: { id },
      data: {
        slug: sanitizedSlug,
        status: rawFormData.status as PropertyStatus,
        isFeatured: rawFormData.isFeatured === 'on',
        isOffMarket: rawFormData.isOffMarket === 'on',
        
        // --- NUEVOS FLAGS ---
        isForSale: rawFormData.isForSale === 'on',
        isForRent: rawFormData.isForRent === 'on',

        calendarLink: rawFormData.calendarLink as string,
        availableDate: parseDate(rawFormData.availableDate),
        
        // SEO Fields
        seoTitleEn: rawFormData.seoTitleEn as string,
        seoDescriptionEn: rawFormData.seoDescriptionEn as string,
        seoTitleEs: rawFormData.seoTitleEs as string,
        seoDescriptionEs: rawFormData.seoDescriptionEs as string,

        // Bilingüe
        titleEn: rawFormData.titleEn as string,
        titleEs: rawFormData.titleEs as string,
        descriptionEn: rawFormData.descriptionEn as string,
        descriptionEs: rawFormData.descriptionEs as string,
        
        // --- Financiero VENTA ---
        price: newPriceValue, // Usamos la variable que ya procesamos arriba
        
        // [NUEVO] Aquí inyectamos los datos del historial si existen
        ...priceHistoryData,

        downPayment: parseDecimalOrNull(rawFormData.downPayment),
        interestRate: parseDecimalOrNull(rawFormData.interestRate),
        taxes: parseDecimalOrNull(rawFormData.taxes),
        insurance: parseDecimalOrNull(rawFormData.insurance),

        // --- Financiero RENTA ---
        monthlyRent: parseDecimalOrNull(rawFormData.monthlyRent),
        securityDeposit: parseDecimalOrNull(rawFormData.securityDeposit),
        
        // Ubicación
        address: rawFormData.address as string,
        city: rawFormData.city as string,
        state: rawFormData.state as string,
        zipCode: rawFormData.zipCode as string,
        phoneNumber: rawFormData.phoneNumber as string,
        
        // Coordenadas y Acceso
        latitude: parseFloatSafe(rawFormData.latitude),
        longitude: parseFloatSafe(rawFormData.longitude),
        lockboxCode: rawFormData.lockboxCode as string,
        
        // Specs
        bedrooms: Number(rawFormData.bedrooms),
        bathrooms: Number(rawFormData.bathrooms),
        sqft: Number(rawFormData.sqft),
        lotSize: Number(rawFormData.lotSize) || 0,
        yearBuilt: Number(rawFormData.yearBuilt) || new Date().getFullYear(),
        
        // Multimedia
        mainImage: mainImageObj?.url || '',
        galleryImages: legacyGalleryUrls,
        videoUrl: rawFormData.videoUrl as string,
        features: processFeatures(rawFormData.features),

        images: {
          deleteMany: {}, 
          create: imagesToCreate 
        },

        // Vendedor 
        showSeller: rawFormData.showSeller === 'on',
        sellerName: rawFormData.sellerName as string,
        sellerImage: rawFormData.sellerImage as string,
        sellerType: rawFormData.sellerType as string,
      },
    });

  } catch (error) {
    console.error('Error updating property:', error);
    return { message: 'Error al actualizar la propiedad.' };
  }

  revalidatePath('/admin');
  revalidatePath(`/propiedades/${sanitizedSlug}`); // Ojo: usa el slug sanitizado, no el raw
  redirect('/admin');
}