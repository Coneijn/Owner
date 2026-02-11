// lib/blog-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // Generar slug simple si no viene uno
  const slug = (rawData.slug as string) || (rawData.titleEn as string).toLowerCase().replace(/\s+/g, '-');

  await prisma.post.create({
    data: {
      slug,
      isPublished: rawData.isPublished === 'on',
      titleEn: rawData.titleEn as string,
      titleEs: rawData.titleEs as string,
      contentEn: rawData.contentEn as string,
      contentEs: rawData.contentEs as string,
      mainImage: rawData.mainImage as string,
    },
  });

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  redirect('/admin/blog');
}

export async function updatePost(formData: FormData) {
  const id = formData.get('id') as string;
  const rawData = Object.fromEntries(formData.entries());

  await prisma.post.update({
    where: { id },
    data: {
      slug: rawData.slug as string,
      isPublished: rawData.isPublished === 'on',
      titleEn: rawData.titleEn as string,
      titleEs: rawData.titleEs as string,
      contentEn: rawData.contentEn as string,
      contentEs: rawData.contentEs as string,
      mainImage: rawData.mainImage as string,
    },
  });

  revalidatePath('/admin/blog');
  revalidatePath(`/blog/${rawData.slug}`);
  redirect('/admin/blog');
}

export async function deletePost(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) return;

  try {
    await prisma.post.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    // En caso de error, no redirigimos para que el usuario vea qué pasó
    return { message: 'Error deleting post' };
  }

  // 1. Revalidar para actualizar la caché de la lista
  revalidatePath('/admin/blog');

  // 2. REDIRECCIONAR para sacarnos de la página 404 (el post ya no existe)
  redirect('/admin/blog'); 
}