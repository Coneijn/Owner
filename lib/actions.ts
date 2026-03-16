'use server';

import { signIn, auth } from '@/auth';
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
  const session = await auth(); // Obtenemos el usuario logueado
  
  try {
    // 1. Buscamos la propiedad antes de eliminarla para guardar sus datos en el log
    const propertyToDelete = await prisma.property.findUnique({ where: { id } });
    
    if (propertyToDelete) {
      // 2. Eliminamos la propiedad
      await prisma.property.delete({
        where: { id },
      });

      // 3. Guardamos el Log
      await prisma.auditLog.create({
        data: {
          action: 'PROPERTY_DELETED',
          entityType: 'PROPERTY',
          entityId: id,
          userId: session?.user?.id || null, // Actor interno
          propertyId: id,
          address: propertyToDelete.address,
          details: 'Propiedad eliminada del sistema.',
        }
      });
    }
    
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
    // 1. OBTENEMOS LA SESIÓN
    const session = await auth();

    // 2. GUARDAMOS EL RESULTADO EN UNA VARIABLE (newProperty)
    const newProperty = await prisma.property.create({
      data: {
        // ... (Mantén exactamente todos los datos que ya tienes aquí adentro)
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
        showSeller: rawFormData.showSeller === 'on',
        sellerProfileId: parseStringOrNull(rawFormData.sellerProfileId),
        emoji: parseStringOrNull(rawFormData.emoji),
        condition: parseStringOrNull(rawFormData.condition),
        commissionPct: parseDecimalOrNull(rawFormData.commissionPct),
        commissionAmt: parseDecimalOrNull(rawFormData.commissionAmt),
        commissionNote: parseStringOrNull(rawFormData.commissionNote),
        showingSteps: processFeatures(rawFormData.showingSteps),
        showingNotes: parseStringOrNull(rawFormData.showingNotes),
        buyerTags: processFeatures(rawFormData.buyerTags),
        buyerIncome: parseStringOrNull(rawFormData.buyerIncome),
        buyerCredit: parseStringOrNull(rawFormData.buyerCredit),
        buyerFinancing: parseStringOrNull(rawFormData.buyerFinancing),
      },
    });

    // 3. CREAMOS EL REGISTRO DE AUDITORÍA
    await prisma.auditLog.create({
      data: {
        action: 'PROPERTY_CREATED',
        entityType: 'PROPERTY',
        entityId: newProperty.id,
        userId: session?.user?.id || null, // Guardamos el ID de quien la creó
        propertyId: newProperty.id,
        address: newProperty.address,
        details: 'Nueva propiedad agregada al sistema.',
      }
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
    // 1. Obtenemos sesión
    const session = await auth();

    const currentProperty = await prisma.property.findUnique({
      where: { id },
      select: { price: true }
    });

    const currentPriceNum = currentProperty?.price ? Number(currentProperty.price) : null;
    const newPriceNum = newPriceValue ? Number(newPriceValue) : null;

    let logDetails = 'Propiedad actualizada.'; // Mensaje por defecto para la auditoría

    if (newPriceNum !== currentPriceNum) {
       console.log(`Detectado cambio de precio: De ${currentPriceNum} a ${newPriceNum}`);
       
       priceHistoryData = {
         previousPrice: currentProperty?.price, 
         lastPriceChangeAt: new Date()          
       };

       // Si el precio cambió, lo anotamos en el log
       logDetails = `Propiedad actualizada. Cambio de precio detectado: de $${currentPriceNum || 0} a $${newPriceNum || 0}`;
    }

    // 2. Actualizamos la propiedad y la guardamos en una variable
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        // ... (Todos los datos que ya tienes para actualizar)
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
        showSeller: rawFormData.showSeller === 'on',
        sellerProfileId: parseStringOrNull(rawFormData.sellerProfileId),
        emoji: parseStringOrNull(rawFormData.emoji),
        condition: parseStringOrNull(rawFormData.condition),
        commissionPct: parseDecimalOrNull(rawFormData.commissionPct),
        commissionAmt: parseDecimalOrNull(rawFormData.commissionAmt),
        commissionNote: parseStringOrNull(rawFormData.commissionNote),
        showingSteps: processFeatures(rawFormData.showingSteps),
        showingNotes: parseStringOrNull(rawFormData.showingNotes),
        buyerTags: processFeatures(rawFormData.buyerTags),
        buyerIncome: parseStringOrNull(rawFormData.buyerIncome),
        buyerCredit: parseStringOrNull(rawFormData.buyerCredit),
        buyerFinancing: parseStringOrNull(rawFormData.buyerFinancing),
      },
    });

    // 3. Creamos el log
    await prisma.auditLog.create({
      data: {
        action: 'PROPERTY_UPDATED',
        entityType: 'PROPERTY',
        entityId: updatedProperty.id,
        userId: session?.user?.id || null, // Actor interno
        propertyId: updatedProperty.id,
        address: updatedProperty.address,
        details: logDetails, // Guardará el mensaje de si cambió el precio o no
      }
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
// 1. CREAR EL BORRADOR INICIAL (Sin fotos)
export async function createDraftPropertyFromFunnel(data: any) {
  try {
    const slug = `draft-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Discernir si es renta o venta basado en el widget
    const isRent = data.strategySelected === 'rent';
    const isSale = !isRent; // Por defecto lo tratamos como venta si es Seller Finance, Cash, etc.

    const draftProperty = await prisma.property.create({
      data: {
        slug,
        status: PropertyStatus.DRAFT,
        isOffMarket: true,
        isForSale: isSale,
        isForRent: isRent,
        titleEn: `Draft: ${data.street || 'Pending Address'}`,
        titleEs: `Borrador: ${data.street || 'Dirección Pendiente'}`,
        descriptionEn: data.description || 'Draft property created from the seller funnel.',
        descriptionEs: data.description || 'Propiedad en borrador creada desde el embudo de vendedores.',
        
        // Datos de Ubicación Actualizados
        address: data.street || 'Dirección pendiente',
        city: data.city || 'Ciudad pendiente',
        state: data.state || 'Estado pendiente',
        zipCode: data.zip || '00000',
        phoneNumber: data.phone || data.phoneNumber || '', 
        
        // Campos Físicos
        bedrooms: data.beds ? Number(data.beds) : 0,
        bathrooms: data.baths ? Number(data.baths) : 0,
        sqft: data.sqft ? Number(data.sqft) : 0,
        yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : new Date().getFullYear(),
        
        // Datos Financieros (Condicionales)
        price: isSale && data.askingPrice ? Number(data.askingPrice) : null,
        downPayment: isSale && data.downPayment ? Number(data.downPayment) : null,
        interestRate: isSale && data.interestRate ? Number(data.interestRate) : null,
        taxes: isSale && data.taxes ? Number(data.taxes) : null,
        insurance: isSale && data.insurance ? Number(data.insurance) : null,
        monthlyRent: isRent && data.monthlyRent ? Number(data.monthlyRent) : null,

        mainImage: "", 
        showingNotes: `CONTACTO LEAD:\nNombre: ${data.firstName} ${data.lastName}\nTel: ${data.phone}\nEmail: ${data.email}\nEstrategia Elegida: ${data.strategySelected || 'N/A'}`,
      }
    });

    return { success: true, propertyId: draftProperty.id };
  } catch (error) {
    console.error("Error creating draft property:", error);
    return { success: false, message: "No se pudo guardar el borrador en la BD." };
  }
}
// 2. ACTUALIZAR EL BORRADOR CON FOTOS Y LOCKBOX
export async function updateDraftPropertyMedia(propertyId: string, photos: any[], lockboxCode: string) {
  try {
    const mainImageUrl = photos && photos.length > 0 ? photos[0].url : "";
    const galleryUrls = photos && photos.length > 1 ? photos.slice(1).map((p: any) => p.url) : [];

    const imagesToCreate = photos.map((img: any, index: number) => ({
        url: img.url,
        altText: '',
        title: '',
        caption: '',
        description: '',
        isMain: index === 0,
        order: index
    }));

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        lockboxCode: lockboxCode || null,
        mainImage: mainImageUrl,
        galleryImages: galleryUrls,
        images: {
            create: imagesToCreate
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating draft property media:", error);
    return { success: false, message: "No se pudieron actualizar las fotos del borrador." };
  }
}