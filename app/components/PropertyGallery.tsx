'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryProps {
  images: string[];
  title: string;
  address: string;
}

export default function PropertyGallery({ images, title, address }: GalleryProps) {
  // 1. Filtramos imágenes
  const validImages = images.filter(img => img && img.trim() !== "");
  
  const [activeImage, setActiveImage] = useState(validImages.length > 0 ? validImages[0] : null);
  const showStreetView = validImages.length === 0;

  // 2. CONFIGURACIÓN STREET VIEW STATIC API
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const encodedAddress = encodeURIComponent(address || 'Memphis, TN');

  // Parámetros clave para una buena foto:
  // size: 600x400 (Buena resolución sin ser 4k para ahorrar ancho de banda)
  // fov: 90 (Campo de visión amplio, tipo gran angular inmobiliario)
  // pitch: 10 (Ligeramente hacia arriba para ver bien la fachada)
  // source: outdoor (Intenta priorizar fotos de calle, no de interiores subidas por usuarios)
  const staticMapUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodedAddress}&fov=90&heading=0&pitch=10&source=outdoor&key=${apiKey}`;

  return (
    <div className="space-y-4">
      {/* Contenedor Principal */}
      <div className="aspect-w-16 aspect-h-9 bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg h-96 relative group border border-gray-800">
        
        {showStreetView ? (
          /* --- MODO STATIC IMAGE (Foto plana) --- */
          <div className="w-full h-full relative group">
             {/* Usamos <img> estándar para evitar configurar dominios en next.config.ts por ahora */}
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img
                src={staticMapUrl}
                alt={`Street view of ${title}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
             />
             
             {/* Etiqueta informativa */}
             <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md z-10 border border-white/10 font-bold uppercase tracking-wide flex items-center gap-2">
                <span>📸</span> Street View
             </div>

             {/* Link para abrir en Google Maps (Mejora de UX) */}
             <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 z-0"
                aria-label="Open in Google Maps"
             >
                <span className="sr-only">Open Map</span>
             </a>
          </div>
        ) : (
          /* --- MODO GALERÍA NORMAL --- */
          <>
            {activeImage && (
                <Image
                key={activeImage} 
                src={activeImage}
                alt={title}
                fill
                priority 
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 800px"
                />
            )}

            <div className="absolute bottom-4 right-4 z-10 w-24 h-12 pointer-events-none opacity-90">
                <Image
                src="/logo.png" 
                alt="Logo"
                fill
                className="object-contain" 
                sizes="100px"
                />
            </div>
          </>
        )}

      </div>

      {/* Tira de Miniaturas */}
      {!showStreetView && validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img 
                  ? 'border-[#f8ed1a] opacity-100 ring-2 ring-[#f8ed1a]/30' 
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image 
                src={img} 
                alt={`Thumbnail ${idx}`} 
                fill
                className="object-cover"
                sizes="100px" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}