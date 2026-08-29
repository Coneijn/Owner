import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import SeoEditClient from './seo-edit-client';

export default async function SeoEditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  // 1. Obtenemos la propiedad con sus imagenes
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!property) notFound();

  // 2. Normalizamos las imagenes con todos los campos de metadatos
  const allImages: any[] = [];
  property.images.forEach(img => {
    allImages.push({ 
      id: img.id, 
      url: img.url, 
      altText: img.altText || '', 
      title: img.title || '',
      caption: img.caption || '',
      description: img.description || '',
      isMain: img.isMain 
    });
  });

  if (property.mainImage && typeof property.mainImage === 'string' && property.mainImage.trim() !== '') {
    if (!allImages.some(img => img.url === property.mainImage)) {
      allImages.push({ id: `main-${property.id}`, url: property.mainImage, altText: '', title: '', caption: '', description: '', isMain: true });
    }
  }

  if (Array.isArray(property.galleryImages) && property.galleryImages.length > 0) {
    property.galleryImages.forEach((url, idx) => {
      if (url && typeof url === 'string' && url.trim() !== '') {
        if (!allImages.some(img => img.url === url)) {
          allImages.push({ id: `gallery-${property.id}-${idx}`, url: url, altText: '', title: '', caption: '', description: '', isMain: false });
        }
      }
    });
  }

  const safeProperty = {
    id: property.id,
    titleEn: property.titleEn || '',
    descriptionEn: property.descriptionEn || '',
    titleEs: property.titleEs || '',
    descriptionEs: property.descriptionEs || '',
    seoTitleEn: property.seoTitleEn || '',
    seoDescriptionEn: property.seoDescriptionEn || '',
    focusKeywordEn: property.focusKeywordEn || '',
    seoTitleEs: property.seoTitleEs || '',
    seoDescriptionEs: property.seoDescriptionEs || '',
    focusKeywordEs: property.focusKeywordEs || '',
    videoUrl: property.videoUrl || '',
    allImages,
  };

  // 3. Server Action integrada para procesar el formulario
  async function saveSeoData(formData: FormData) {
    'use server';
    const propId = formData.get('id') as string;
    
    await prisma.property.update({
      where: { id: propId },
      data: {
        titleEn: formData.get('titleEn') as string,
        descriptionEn: formData.get('descriptionEn') as string,
        titleEs: formData.get('titleEs') as string,
        descriptionEs: formData.get('descriptionEs') as string,
        seoTitleEn: formData.get('seoTitleEn') as string,
        seoDescriptionEn: formData.get('seoDescriptionEn') as string,
        focusKeywordEn: formData.get('focusKeywordEn') as string,
        seoTitleEs: formData.get('seoTitleEs') as string,
        seoDescriptionEs: formData.get('seoDescriptionEs') as string,
        focusKeywordEs: formData.get('focusKeywordEs') as string,
        videoUrl: formData.get('videoUrl') as string,
      }
    });

    // Actualizamos los Metadatos de las imagenes
    const imagesDataJson = formData.get('imagesData');
    if (imagesDataJson) {
       const imagesData = JSON.parse(imagesDataJson as string);
       for (const item of imagesData) {
          if (item.id.startsWith('main-') || item.id.startsWith('gallery-')) {
             await prisma.propertyImage.create({
                data: {
                   url: item.url,
                   altText: item.altText,
                   title: item.title,
                   caption: item.caption,
                   description: item.description,
                   isMain: item.isMain,
                   propertyId: propId
                }
             });
          } else {
             await prisma.propertyImage.update({
                where: { id: item.id },
                data: { 
                   altText: item.altText,
                   title: item.title,
                   caption: item.caption,
                   description: item.description 
                }
             });
          }
       }
    }
    
    redirect('/admin/image-seo');
  }

  return <SeoEditClient property={safeProperty} saveAction={saveSeoData} />;
}