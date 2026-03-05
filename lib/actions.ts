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
      //redirectTo: '/login',
      
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

function parseImageData(jsonString: unknown) {
  if (typeof jsonString !== 'string' || !jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Error parsing image JSON", e);
    return null;
  }
}

function parseDate(dateString: unknown): Date | null {
  if (typeof dateString !== 'string' || !dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

function parseFloatSafe(value: unknown): number | null {
  if (!value) return null;
  const parsed = parseFloat(value as string);
  return isNaN(parsed) ? null : parsed;
}

function parseDecimalOrNull(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim() === '') return null;
    return value;
}

// NUEVO HELPER: Para manejar IDs opcionales (como el del vendedor)
function parseStringOrNull(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  return value;
}

// --- CREATE SELLER PROFILE (NUEVO) ---
export async function createSellerProfile(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  
  try {
    await prisma.sellerProfile.create({
      data: {
        sellerName: rawFormData.sellerName as string,
        sellerType: rawFormData.sellerType as string,
        sellerImage: parseStringOrNull(rawFormData.sellerImage),
        // No pasamos userId, se quedará como null automáticamente
      },
    });
  } catch (error) {
    console.error('Error creating seller profile:', error);
    return { message: 'Error al crear el perfil del vendedor.' };
  }

  revalidatePath('/admin/sellers');
  return { success: true }; // ✅ DEVOLVER ÉXITO
}


// --- CREATE PROPERTY ---
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
        
        isForSale: rawFormData.isForSale === 'on', 
        isForRent: rawFormData.isForRent === 'on', 

        calendarLink: rawFormData.calendarLink as string,
        availableDate: parseDate(rawFormData.availableDate),

        seoTitleEn: rawFormData.seoTitleEn as string,
        seoDescriptionEn: rawFormData.seoDescriptionEn as string,
        seoTitleEs: rawFormData.seoTitleEs as string,
        seoDescriptionEs: rawFormData.seoDescriptionEs as string,
        focusKeywordEn: rawFormData.focusKeywordEn as string,
        focusKeywordEs: rawFormData.focusKeywordEs as string,
        titleEn: rawFormData.titleEn as string,
        titleEs: rawFormData.titleEs as string,
        descriptionEn: rawFormData.descriptionEn as string,
        descriptionEs: rawFormData.descriptionEs as string,
        
        price: parseDecimalOrNull(rawFormData.price), 
        downPayment: parseDecimalOrNull(rawFormData.downPayment),
        interestRate: parseDecimalOrNull(rawFormData.interestRate),
        taxes: parseDecimalOrNull(rawFormData.taxes),
        insurance: parseDecimalOrNull(rawFormData.insurance),

        monthlyRent: parseDecimalOrNull(rawFormData.monthlyRent),
        securityDeposit: parseDecimalOrNull(rawFormData.securityDeposit),
        
        address: rawFormData.address as string,
        city: rawFormData.city as string,
        state: rawFormData.state as string,
        zipCode: rawFormData.zipCode as string,
        phoneNumber: rawFormData.phoneNumber as string,
        
        latitude: parseFloatSafe(rawFormData.latitude),
        longitude: parseFloatSafe(rawFormData.longitude),
        lockboxCode: rawFormData.lockboxCode as string,

        bedrooms: Number(rawFormData.bedrooms),
        bathrooms: Number(rawFormData.bathrooms),
        sqft: Number(rawFormData.sqft),
        lotSize: Number(rawFormData.lotSize) || 0,
        yearBuilt: Number(rawFormData.yearBuilt) || new Date().getFullYear(),
        
        mainImage: mainImageObj?.url || '',
        galleryImages: legacyGalleryUrls,
        videoUrl: rawFormData.videoUrl as string,
        features: processFeatures(rawFormData.features),

        images: {
          create: imagesToCreate
        },

        // --- CAMBIO APLICADO: Vendedor ---
        showSeller: rawFormData.showSeller === 'on',
        sellerProfileId: parseStringOrNull(rawFormData.sellerProfileId),
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

  const newPriceValue = parseDecimalOrNull(rawFormData.price);
  let priceHistoryData = {};

  try {
    const currentProperty = await prisma.property.findUnique({
      where: { id },
      select: { price: true }
    });

    const currentPriceNum = currentProperty?.price ? Number(currentProperty.price) : null;
    const newPriceNum = newPriceValue ? Number(newPriceValue) : null;

    if (newPriceNum !== currentPriceNum) {
       console.log(`Detectado cambio de precio: De ${currentPriceNum} a ${newPriceNum}`);
       
       priceHistoryData = {
         previousPrice: currentProperty?.price, 
         lastPriceChangeAt: new Date()          
       };
    }

    await prisma.property.update({
      where: { id },
      data: {
        slug: sanitizedSlug,
        status: rawFormData.status as PropertyStatus,
        isFeatured: rawFormData.isFeatured === 'on',
        isOffMarket: rawFormData.isOffMarket === 'on',
        
        isForSale: rawFormData.isForSale === 'on',
        isForRent: rawFormData.isForRent === 'on',

        calendarLink: rawFormData.calendarLink as string,
        availableDate: parseDate(rawFormData.availableDate),
        
        seoTitleEn: rawFormData.seoTitleEn as string,
        seoDescriptionEn: rawFormData.seoDescriptionEn as string,
        seoTitleEs: rawFormData.seoTitleEs as string,
        seoDescriptionEs: rawFormData.seoDescriptionEs as string,
        focusKeywordEn: rawFormData.focusKeywordEn as string,
        focusKeywordEs: rawFormData.focusKeywordEs as string,
        titleEn: rawFormData.titleEn as string,
        titleEs: rawFormData.titleEs as string,
        descriptionEn: rawFormData.descriptionEn as string,
        descriptionEs: rawFormData.descriptionEs as string,
        
        price: newPriceValue, 
        
        ...priceHistoryData,

        downPayment: parseDecimalOrNull(rawFormData.downPayment),
        interestRate: parseDecimalOrNull(rawFormData.interestRate),
        taxes: parseDecimalOrNull(rawFormData.taxes),
        insurance: parseDecimalOrNull(rawFormData.insurance),

        monthlyRent: parseDecimalOrNull(rawFormData.monthlyRent),
        securityDeposit: parseDecimalOrNull(rawFormData.securityDeposit),
        
        address: rawFormData.address as string,
        city: rawFormData.city as string,
        state: rawFormData.state as string,
        zipCode: rawFormData.zipCode as string,
        phoneNumber: rawFormData.phoneNumber as string,
        
        latitude: parseFloatSafe(rawFormData.latitude),
        longitude: parseFloatSafe(rawFormData.longitude),
        lockboxCode: rawFormData.lockboxCode as string,
        
        bedrooms: Number(rawFormData.bedrooms),
        bathrooms: Number(rawFormData.bathrooms),
        sqft: Number(rawFormData.sqft),
        lotSize: Number(rawFormData.lotSize) || 0,
        yearBuilt: Number(rawFormData.yearBuilt) || new Date().getFullYear(),
        
        mainImage: mainImageObj?.url || '',
        galleryImages: legacyGalleryUrls,
        videoUrl: rawFormData.videoUrl as string,
        features: processFeatures(rawFormData.features),

        images: {
          deleteMany: {}, 
          create: imagesToCreate 
        },

        // --- CAMBIO APLICADO: Vendedor ---
        showSeller: rawFormData.showSeller === 'on',
        sellerProfileId: parseStringOrNull(rawFormData.sellerProfileId),
      },
    });

  } catch (error) {
    console.error('Error updating property:', error);
    return { message: 'Error al actualizar la propiedad.' };
  }

  revalidatePath('/admin');
  revalidatePath(`/propiedades/${sanitizedSlug}`); 
  redirect('/admin');
}
// --- ACTIONS PARA SELLERS (Agregar al final de lib/actions.ts) ---

export async function deleteSellerProfile(formData: FormData) {
  const id = formData.get('id') as string;
  try {
    await prisma.sellerProfile.delete({
      where: { id },
    });
    revalidatePath('/admin/sellers');
    return { success: true, message: 'Vendedor eliminado correctamente.' };
  } catch (error) {
    console.error('Error deleting seller:', error);
    return { success: false, message: 'Error al eliminar el vendedor.' };
  }
}

export async function assignPropertiesToSeller(sellerId: string, propertyIds: string[]) {
  try {
    // Filtramos IDs vacíos por seguridad
    const validPropertyIds = propertyIds.filter(id => id.trim() !== '');

    if (validPropertyIds.length > 0) {
      // Actualizamos masivamente las propiedades para asignarles este vendedor
      await prisma.property.updateMany({
        where: { 
          id: { in: validPropertyIds } 
        },
        data: { 
          sellerProfileId: sellerId,
          showSeller: true // Activamos automáticamente la visibilidad de la sección
        }
      });
    }

    revalidatePath('/admin/sellers');
    revalidatePath('/admin');
    return { success: true, message: 'Propiedades asignadas correctamente.' };
  } catch (error) {
    console.error('Error assigning properties:', error);
    return { success: false, message: 'Error al asignar las propiedades.' };
  }
}
// --- UPDATE SELLER PROFILE ---
export async function updateSellerProfile(id: string, prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  
  try {
    await prisma.sellerProfile.update({
      where: { id },
      data: {
        sellerName: rawFormData.sellerName as string,
        sellerType: rawFormData.sellerType as string,
        // Usamos el mismo helper que creamos antes
        sellerImage: parseStringOrNull(rawFormData.sellerImage), 
      },
    });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    return { message: 'Error al actualizar el perfil del vendedor.' };
  }

  revalidatePath('/admin/sellers');
  return { success: true }; // ✅ DEVOLVER ÉXITO
}