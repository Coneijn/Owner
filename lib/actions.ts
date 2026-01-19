'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PropertyStatus } from '@prisma/client';

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

function processArray(input: unknown): string[] {
  if (typeof input !== 'string') return [];
  if (!input.trim()) return [];
  return input.split(',').map(item => item.trim());
}

export async function createProperty(prevState: any, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());

  try {
    await prisma.property.create({
      data: {
        slug: rawFormData.slug as string,
        status: rawFormData.status as PropertyStatus, 
        isFeatured: rawFormData.isFeatured === 'on',
        isOffMarket: rawFormData.isOffMarket === 'on',
        calendarLink: rawFormData.calendarLink as string,

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
        
        // Specs
        bedrooms: Number(rawFormData.bedrooms),
        bathrooms: Number(rawFormData.bathrooms),
        sqft: Number(rawFormData.sqft),
        lotSize: Number(rawFormData.lotSize) || 0,
        yearBuilt: Number(rawFormData.yearBuilt) || new Date().getFullYear(),
        
        // Multimedia y Features
        mainImage: rawFormData.mainImage as string,
        galleryImages: processArray(rawFormData.galleryImages),
        features: processArray(rawFormData.features),
        videoUrl: rawFormData.videoUrl as string,

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

export async function updateProperty(prevState: any, formData: FormData) {
  const id = formData.get('id') as string; 
  const rawFormData = Object.fromEntries(formData.entries());

  try {
    await prisma.property.update({
      where: { id },
      data: {
        slug: rawFormData.slug as string,
        status: rawFormData.status as PropertyStatus,
        isFeatured: rawFormData.isFeatured === 'on',
        isOffMarket: rawFormData.isOffMarket === 'on',
        calendarLink: rawFormData.calendarLink as string,
        
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
        
        // Specs
        bedrooms: Number(rawFormData.bedrooms),
        bathrooms: Number(rawFormData.bathrooms),
        sqft: Number(rawFormData.sqft),
        lotSize: Number(rawFormData.lotSize) || 0,
        yearBuilt: Number(rawFormData.yearBuilt) || new Date().getFullYear(),
        
        // Multimedia
        mainImage: rawFormData.mainImage as string,
        galleryImages: processArray(rawFormData.galleryImages),
        features: processArray(rawFormData.features),
        videoUrl: rawFormData.videoUrl as string,

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