'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PropertyStatus } from '@prisma/client';

// --- AUTH ---
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
          return 'Credenciales inválidas. Verifica tu correo y contraseña.';
        default:
          return 'Algo salió mal. Inténtalo de nuevo.';
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

// --- CREATE ---
export async function createProperty(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const mainImageObj = parseImageData(rawFormData.mainImageData);
  const galleryImagesArray = parseImageData(rawFormData.galleryImagesData) || [];
  const imagesToCreate = [];
  const slugInput = rawFormData.slug as string;
  const sanitizedSlug = slugInput.trim().toLowerCase().replace(/\s+/g, '-');

  // Procesamiento de imágenes (Igual que antes)
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
        calendarLink: rawFormData.calendarLink as string,
        
        // --- NUEVO: Fecha disponible ---
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
        
        // Financiero 
        price: rawFormData.price as string, 
        downPayment: rawFormData.downPayment as string,
        interestRate: rawFormData.interestRate as string,
        taxes: rawFormData.taxes as string,
        insurance: rawFormData.insurance as string,
        
        // Ubicación y Contacto
        address: rawFormData.address as string,
        city: rawFormData.city as string,
        state: rawFormData.state as string,
        zipCode: rawFormData.zipCode as string,
        phoneNumber: rawFormData.phoneNumber as string,
        
        // --- NUEVO: Coordenadas y Acceso ---
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

// --- UPDATE ---
export async function updateProperty(prevState: any, formData: FormData) {
  const id = formData.get('id') as string; 
  const rawFormData = Object.fromEntries(formData.entries());
  const slugInput = rawFormData.slug as string;
  const sanitizedSlug = slugInput.trim().toLowerCase().replace(/\s+/g, '-');
  const mainImageObj = parseImageData(rawFormData.mainImageData);
  const galleryImagesArray = parseImageData(rawFormData.galleryImagesData) || [];

  const imagesToCreate = [];

  // Procesamiento de imágenes (Igual que antes)
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
    await prisma.property.update({
      where: { id },
      data: {
        slug: sanitizedSlug,
        status: rawFormData.status as PropertyStatus,
        isFeatured: rawFormData.isFeatured === 'on',
        isOffMarket: rawFormData.isOffMarket === 'on',
        calendarLink: rawFormData.calendarLink as string,
        
        // --- NUEVO: Fecha disponible ---
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
        
        // Financiero
        price: rawFormData.price as string,
        downPayment: rawFormData.downPayment as string,
        interestRate: rawFormData.interestRate as string,
        taxes: rawFormData.taxes as string,
        insurance: rawFormData.insurance as string,
        
        // Ubicación
        address: rawFormData.address as string,
        city: rawFormData.city as string,
        state: rawFormData.state as string,
        zipCode: rawFormData.zipCode as string,
        phoneNumber: rawFormData.phoneNumber as string,
        
        // --- NUEVO: Coordenadas y Acceso ---
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
  revalidatePath(`/propiedades/${rawFormData.slug}`); 
  redirect('/admin');
}