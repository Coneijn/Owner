'use client';

import { useState } from 'react';
import Image from 'next/image';
import StaticPropertyMap from './StaticPropertyMap';

interface GalleryProps {
  images: string[];
  title: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}

export default function PropertyGallery({ images, title, address, lat, lng }: GalleryProps) {
  // 1. Filtramos imágenes y construimos el carrusel mixto
  const validImages = images.filter(img => img && img.trim() !== "");
  
  const galleryItems: { type: 'image' | 'map', content: string }[] = [];
  
  // Insertar primera imagen (si hay)
  if (validImages.length > 0) galleryItems.push({ type: 'image', content: validImages[0] });
  // Insertar mapa en la posición 2 (o posición 1 si no hay imágenes)
  if (lat && lng) galleryItems.push({ type: 'map', content: 'map' });
  // Insertar el resto de las imágenes
  if (validImages.length > 1) validImages.slice(1).forEach(img => galleryItems.push({ type: 'image', content: img }));

  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = galleryItems[activeIndex];
  const showStreetView = galleryItems.length === 0;

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
            {activeItem?.type === 'image' && (
                <Image
                key={activeItem.content} 
                src={activeItem.content}
                alt={title}
                fill
                priority 
                className="object-cover transition-opacity duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 800px"
                />
            )}
            
            {activeItem?.type === 'map' && lat && lng && (
                <div className="absolute inset-0 w-full h-full z-0">
                    <StaticPropertyMap lat={lat} lng={lng} />
                </div>
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
      {!showStreetView && galleryItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {galleryItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all bg-gray-100 ${
                activeIndex === idx 
                  ? 'border-[#f8ed1a] opacity-100 ring-2 ring-[#f8ed1a]/30' 
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'image' ? (
                  <Image 
                    src={item.content} 
                    alt={`Thumbnail ${idx}`} 
                    fill
                    className="object-cover"
                    sizes="100px" 
                  />
              ) : (
                  <div className="w-full h-full relative">                      
                      {lat && lng && (
                          <div className="absolute inset-0 pointer-events-none">
                              <StaticPropertyMap lat={lat} lng={lng} isThumbnail={true} />
                          </div>
                      )}                     
                  </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}