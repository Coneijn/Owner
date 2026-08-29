import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SeoImagesClient from './seo-client';

export const dynamic = 'force-dynamic';

export default async function ImageSeoPage() {
  // 1. Obtenemos las propiedades incluyendo sus imagenes relacionadas y campos de texto
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      titleEn: true,
      address: true,
      slug: true,
      status: true,
      mainImage: true,
      galleryImages: true,
      images: {
        select: {
          id: true,
          url: true,
          altText: true,
          isMain: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Unificamos todas las imagenes (relacionadas + campos antiguos) para enviarlas al Client
  const safeProperties = properties.map((p) => {
    const allImages: { id: string; url: string; altText: string | null; isMain: boolean }[] = [];
    
    // A. Agregar imagenes de la relacion PropertyImage
    p.images.forEach((img) => {
      allImages.push({
        id: img.id,
        url: img.url,
        altText: img.altText,
        isMain: img.isMain,
      });
    });

    // B. Revisar mainImage: si existe y no esta repetida, se agrega como faltante de alt text
    if (p.mainImage && typeof p.mainImage === 'string' && p.mainImage.trim() !== '') {
      const exists = allImages.some(img => img.url === p.mainImage);
      if (!exists) {
        allImages.push({
          id: `main-${p.id}`,
          url: p.mainImage,
          altText: null,
          isMain: true,
        });
      }
    }

    // C. Revisar galleryImages: si existen y no estan repetidas, se agregan como faltantes
    if (Array.isArray(p.galleryImages) && p.galleryImages.length > 0) {
      p.galleryImages.forEach((url, index) => {
        if (url && typeof url === 'string' && url.trim() !== '') {
          const exists = allImages.some(img => img.url === url);
          if (!exists) {
            allImages.push({
              id: `gallery-${p.id}-${index}`,
              url: url,
              altText: null,
              isMain: false,
            });
          }
        }
      });
    }

    return {
      id: p.id,
      titleEn: p.titleEn,
      address: p.address,
      slug: p.slug,
      status: p.status,
      images: allImages,
    };
  });
  return (
    <div className="min-h-screen bg-[#0a0f1c] p-4 sm:p-8 font-sans text-gray-200">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Image SEO <span className="text-[#f8ed1a]">Auditor</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Revisa y gestiona las propiedades a las que les falta el texto alternativo (Alt Text) en sus imágenes.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-lg text-sm font-bold text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* --- COMPONENTE INTERACTIVO --- */}
        <SeoImagesClient properties={safeProperties} />

      </div>
    </div>
  );
}