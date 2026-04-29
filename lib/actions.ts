'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PropertyStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// lib/actions.ts (Solo la función authenticate)
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  let targetUrl = '';

  try {
    // 1. Intentamos el login SIN redirección automática
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirect: false, 
    });

    // 2. Si llegamos aquí, las credenciales son válidas.
    // Buscamos al usuario en la BD para determinar su destino real.
    const email = formData.get('email') as string;
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sellerProfile: true,
        agentProfile: true,
        buyerProfile: true,
        renterProfile: true,
      }
    });

    if (user) {
      if (user.role === 'ADMIN') {
        targetUrl = '/admin';
      } else if (user.agentProfile) {
        targetUrl = '/agentsDashboard';
      } else if (user.sellerProfile) {
        targetUrl = '/sellerDashboard';
      } else if (user.buyerProfile) {
        targetUrl = '/buyersDashboard';
      } else if (user.renterProfile) {
        targetUrl = '/rentersDashboard';
      }else {
        targetUrl = '/';
      }
    }

  } catch (error) {
    if (error instanceof AuthError) {
      // Tu lógica actual de manejo de errores (2FA, credenciales, etc.)
      const cause = error.cause as any;
      if (cause?.err?.message === '2FA_REQUIRED') return '2FA_REQUIRED';
      return 'Invalid credentials.';
    }
    // No relanzamos errores aquí porque manejaremos la redirección abajo
  }

  // 3. REDIRECCIÓN FINAL (Fuera del try/catch)
  if (targetUrl) {
    redirect(targetUrl);
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

    // --- VALIDACIÓN ESTRICTA EN EL SERVIDOR ---
    const newStatus = rawFormData.status as PropertyStatus;
    if (newStatus === 'SOLD' || newStatus === 'UNDER_CONTRACT') {
      if (!rawFormData.price || !rawFormData.downPayment || Number(rawFormData.price) === 0) {
        return { message: 'Error: Los datos financieros de Venta (Precio y Enganche) son obligatorios para este estatus.' };
      }
    }
    if (newStatus === 'RENTED') {
      if (!rawFormData.monthlyRent || !rawFormData.securityDeposit || Number(rawFormData.monthlyRent) === 0) {
        return { message: 'Error: Los datos financieros de Renta (Mensualidad y Depósito) son obligatorios para este estatus.' };
      }
    }

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
  let basePath = '/admin'; // <-- DECLARADO AFUERA DEL TRY

  try {
    // 1. Obtenemos sesión
    const session = await auth();

    // --- Determinar la ruta base según el rol ---
    if (session?.user?.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });
      // Si el usuario existe y NO es ADMIN, asume que es Vendedor
      if (dbUser && dbUser.role !== 'ADMIN') {
        basePath = '/sellerDashboard';
      }
    }

    const currentProperty = await prisma.property.findUnique({
      where: { id },
      select: { price: true, status: true } 
    });

    const currentPriceNum = currentProperty?.price ? Number(currentProperty.price) : null;
    const newPriceNum = newPriceValue ? Number(newPriceValue) : null;
    const oldStatus = currentProperty?.status;
    const newStatus = rawFormData.status as PropertyStatus;
    let logDetails = 'Propiedad actualizada.'; // Mensaje por defecto para la auditoría

    // --- VALIDACIÓN ESTRICTA EN EL SERVIDOR ---
    if (newStatus === 'SOLD' || newStatus === 'UNDER_CONTRACT') {
      if (!rawFormData.price || !rawFormData.downPayment || Number(rawFormData.price) === 0) {
        return { message: 'Error: Los datos financieros de Venta (Precio y Enganche) son obligatorios para este estatus.' };
      }
    }
    if (newStatus === 'RENTED') {
      if (!rawFormData.monthlyRent || !rawFormData.securityDeposit || Number(rawFormData.monthlyRent) === 0) {
        return { message: 'Error: Los datos financieros de Renta (Mensualidad y Depósito) son obligatorios para este estatus.' };
      }
    }

    if (newPriceNum !== currentPriceNum) {
       console.log(`Detectado cambio de precio: De ${currentPriceNum} a ${newPriceNum}`);
       
       priceHistoryData = {
         previousPrice: currentProperty?.price, 
         lastPriceChangeAt: new Date()          
       };

       // Si el precio cambió, lo anotamos en el log
       logDetails = `Propiedad actualizada. Cambio de precio detectado: de $${currentPriceNum || 0} a $${newPriceNum || 0}`;
    }

    // 2. Determinamos si debemos posponer el cambio de estado
    const statusInput = rawFormData.status as PropertyStatus;
    const isTransitioning = statusInput === 'SOLD' || statusInput === 'RENTED';

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        slug: sanitizedSlug,
        // Si va a asignación, mantenemos el estado actual o lo ponemos en UNDER_CONTRACT temporalmente
        status: isTransitioning ? (currentProperty?.status || 'AVAILABLE') : statusInput,
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
        // Solo actualizamos si el campo existe en el formulario (evita borrarlo si el acordeón está cerrado)
        sellerProfileId: rawFormData.sellerProfileId !== undefined ? parseStringOrNull(rawFormData.sellerProfileId) : undefined,
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

  revalidatePath(basePath);
  revalidatePath(`/propiedades/${sanitizedSlug}`); 
  const finalStatus = rawFormData.status as PropertyStatus;
  
  // Si el nuevo estado es SOLD o RENTED, forzamos la ida a la página de asignación
  if(finalStatus === 'SOLD' || finalStatus === 'RENTED') {
    redirect(`${basePath}/properties/${id}/assign?type=${finalStatus}`);
  }
  
  // Si no, regresamos al dashboard desde donde vinimos
  redirect(basePath);
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

    const draftFeatures :string[] = [];
    if (data.garage && Number(data.garage) > 0) {
       draftFeatures.push(`Garage: ${data.garage}`);
    }

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
        lotSize: data.lotSize ? Number(data.lotSize) : 0, // Aprovechamos para guardar el lote
        features: draftFeatures, // Guardamos el array que contiene el garaje
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

// --- ASSIGN PROPERTY CLIENT (Actualizado para el nuevo Schema 28-04-26) ---
export async function assignPropertyClient(
  propertyId: string, 
  clientType: 'BUYER' | 'RENTER', 
  formData: FormData
) {
  try {
    // 1. VALIDACIÓN DE SESIÓN Y PERMISOS
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, message: 'No estás autenticado.' };
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return { success: false, message: 'Propiedad no encontrada.' };
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { sellerProfile: true }
    });

    if (dbUser?.role !== 'ADMIN') {
      const isSeller = !!dbUser?.sellerProfile;
      if (!isSeller || property.sellerProfileId !== dbUser?.sellerProfile?.id) {
        return { success: false, message: 'No tienes permiso para asignar clientes a esta propiedad.' };
      }
    }

    // 2. EXTRACCIÓN DE DATOS PERSONALES DEL FORMULARIO
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const startDateString = formData.get('startDate') as string;
    const startDate = startDateString ? new Date(startDateString) : new Date();

    // Datos del Co-propietario
    const hasCoOwner = formData.get('hasCoOwner') === 'on';
    const coEmail = formData.get('coEmail') as string;
    const coFirstName = formData.get('coFirstName') as string;
    const coLastName = formData.get('coLastName') as string;
    const coPhone = formData.get('coPhone') as string;

    if (!email || !firstName || !lastName) {
      return { success: false, message: 'Faltan datos obligatorios del cliente titular.' };
    }

    // --- FUNCIÓN INTERNA PARA CREAR/BUSCAR USUARIOS Y PERFILES ---
    const getOrCreateProfile = async (uEmail: string, uFirstName: string, uLastName: string, uPhone: string) => {
      let targetUser = await prisma.user.findUnique({
        where: { email: uEmail },
        include: { renterProfile: true, buyerProfile: true }
      });

      if (!targetUser) {
        const temporaryPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
        targetUser = await prisma.user.create({
          data: {
            email: uEmail,
            password: temporaryPassword,
            name: `${uFirstName} ${uLastName}`,
            forcePasswordChange: true,
            role: 'USER',
          },
          include: { renterProfile: true, buyerProfile: true }
        });
      }

      let profileId = '';
      if (clientType === 'RENTER') {
        if (!targetUser.renterProfile) {
          const newRenter = await prisma.renterProfile.create({
            data: { userId: targetUser.id, RenterName: `${uFirstName} ${uLastName}`, phone: uPhone || null }
          });
          profileId = newRenter.id;
        } else {
          profileId = targetUser.renterProfile.id;
        }
      } else {
        if (!targetUser.buyerProfile) {
          const newBuyer = await prisma.buyerProfile.create({
            data: { userId: targetUser.id, firstName: uFirstName, lastName: uLastName, phone: uPhone || null }
          });
          profileId = newBuyer.id;
        } else {
          profileId = targetUser.buyerProfile.id;
        }
      }
      return profileId;
    };

    // 3. CREAR O BUSCAR AL TITULAR
    const primaryProfileId = await getOrCreateProfile(email, firstName, lastName, phone);
    if (!primaryProfileId) return { success: false, message: 'Error al obtener perfil titular.' };
    
    // Arreglo de relaciones que espera Prisma
    const profilesToConnect = [{ id: primaryProfileId }];

    // 4. CREAR O BUSCAR AL CO-PROPIETARIO (Previene duplicados si envían el mismo correo por error)
    if (hasCoOwner && coEmail && coFirstName && coLastName && coEmail.toLowerCase() !== email.toLowerCase()) {
      const coProfileId = await getOrCreateProfile(coEmail, coFirstName, coLastName, coPhone);
      if (coProfileId) profilesToConnect.push({ id: coProfileId });
    }

    // 5. ASIGNACIÓN A LA PROPIEDAD Y CREACIÓN DE CONTRATOS
    if (clientType === 'RENTER') {
      const monthlyRent = parseFloat(formData.get('monthlyRent') as string || '0');
      const securityDeposit = parseFloat(formData.get('securityDeposit') as string || '0');

      await prisma.leaseAgreement.create({
        data: {
          propertyId,
          renters: { connect: profilesToConnect }, // <-- Relación Muchos-a-Muchos en Prisma
          startDate,
          monthlyRent,
          securityDeposit,
          isActive: true
        }
      });

      // AQUÍ ES DONDE SE ACTUALIZA REALMENTE EL STATUS A RENTED
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'RENTED', isForRent: true }
      });

    } else if (clientType === 'BUYER') {
      const totalAmount = parseFloat(formData.get('totalAmount') as string || '0');
      const downPayment = parseFloat(formData.get('downPayment') as string || '0');
      const interestRate = parseFloat(formData.get('interestRate') as string || '0');
      const termInYears = parseInt(formData.get('termInYears') as string || '30');
      
      const principal = totalAmount - downPayment;
      const taxes = property.taxes ? Number(property.taxes) / 12 : 0; 
      const insurance = property.insurance ? Number(property.insurance) / 12 : 0; 

      const termInMonths = termInYears * 12;
      const monthlyInterestRate = interestRate > 0 ? (interestRate / 100) / 12 : 0;

      let pmt = 0;
      if (principal > 0) {
        if (monthlyInterestRate > 0) {
          pmt = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termInMonths)) / (Math.pow(1 + monthlyInterestRate, termInMonths) - 1);
        } else {
          pmt = principal / termInMonths;
        }
      }

      const firstMonthInterest = principal * monthlyInterestRate;
      const firstMonthPrincipal = pmt - firstMonthInterest;
      const totalDue = pmt + taxes + insurance;
      const newRemainingBalance = principal - firstMonthPrincipal;

      const firstPaymentDate = new Date(startDate);
      firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);

      await prisma.contract.create({
        data: {
          propertyId: propertyId,
          buyers: { connect: profilesToConnect }, // <-- Relación Muchos-a-Muchos en Prisma
          type: 'LOAN',
          totalAmount,
          downPayment,
          principalAmount: principal > 0 ? principal : 0,
          interestRate,
          termInYears,
          monthlyTaxes: taxes,
          monthlyInsurance: insurance,
          startDate, 
          payments: {
            create: {
              paymentDate: firstPaymentDate,
              totalDue: totalDue > 0 ? totalDue : 0,
              principal: firstMonthPrincipal > 0 ? firstMonthPrincipal : 0,
              interest: firstMonthInterest > 0 ? firstMonthInterest : 0,
              taxes,
              insurance,
              serviceFee: 0,
              remainingBalance: newRemainingBalance > 0 ? newRemainingBalance : 0,
              status: 'PENDING'
            }
          }
        }
      });

      // AQUÍ ES DONDE SE ACTUALIZA REALMENTE EL STATUS A SOLD
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'SOLD', isForSale: true }
      });
    }

    // 6. LOG DE AUDITORÍA
    await prisma.auditLog.create({
      data: {
        action: `PROPERTY_ASSIGNED_TO_${clientType}`,
        entityType: 'PROPERTY',
        entityId: propertyId,
        userId: session.user.id,
        propertyId: propertyId,
        address: property.address,
        details: `Propiedad asignada al email: ${email}`,
      }
    });

    revalidatePath('/admin');
    revalidatePath(`/admin/properties/${propertyId}/edit`);
    
    return { success: true, message: 'Cliente y contrato generados correctamente.' };

  } catch (error) {
    console.error('Error assigning property client:', error);
    return { success: false, message: 'Ocurrió un error al procesar la asignación.' };
  }
}