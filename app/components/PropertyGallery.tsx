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
  // NUEVAS PROPIEDADES PARA EL OVERLAY
  bedrooms?: number | null;
  bathrooms?: number | null;
  sqft?: number | null;
  lang?: 'es' | 'en';
}

export default function PropertyGallery({ 
  images, title, address, lat, lng, 
  bedrooms, bathrooms, sqft, lang = 'en' 
}: GalleryProps) {
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

  const staticMapUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${encodedAddress}&fov=90&heading=0&pitch=10&source=outdoor&key=${apiKey}`;

  // Mini diccionario para el overlay
  const dict = {
    es: { beds: 'Habitaciones', baths: 'Baños' },
    en: { beds: 'Beds', baths: 'Baths' }
  }[lang];

  // Componente interno para el Overlay de Características
  const SpecsOverlay = () => {
    if (bedrooms == null && bathrooms == null && sqft == null) return null;
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pb-4 px-4 flex justify-between items-end z-10 pointer-events-none">
        <div className="flex gap-4 sm:gap-6">
          {bedrooms != null && (
            <div className="flex flex-col text-white drop-shadow-md">
              <span className="text-xl sm:text-2xl font-black leading-none">{bedrooms}</span>
              <span className="text-[10px] text-[#f8ed1a] uppercase font-bold tracking-wider">{dict.beds}</span>
            </div>
          )}
          {bathrooms != null && (
            <div className="flex flex-col text-white drop-shadow-md">
              <span className="text-xl sm:text-2xl font-black leading-none">{bathrooms}</span>
              <span className="text-[10px] text-[#f8ed1a] uppercase font-bold tracking-wider">{dict.baths}</span>
            </div>
          )}
          {sqft != null && (
            <div className="flex flex-col text-white drop-shadow-md">
              <span className="text-xl sm:text-2xl font-black leading-none">{sqft}</span>
              <span className="text-[10px] text-[#f8ed1a] uppercase font-bold tracking-wider">Sq Ft</span>
            </div>
          )}
        </div>
        
        {/* Logo a la derecha */}
        <div className="relative w-20 h-10 opacity-90 drop-shadow-lg">
          <Image
            src="/logo.png" 
            alt="Logo"
            fill
            className="object-contain object-right" 
            sizes="80px"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Contenedor Principal */}
      <div className="aspect-w-16 aspect-h-9 bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg h-[400px] sm:h-[500px] relative group border border-gray-800">
        
        {showStreetView ? (
          <div className="w-full h-full relative group">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img
                src={staticMapUrl}
                alt={`Street view of ${title}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
             />
             <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md z-10 border border-white/10 font-bold uppercase tracking-wide flex items-center gap-2">
                <span>📸</span> Street View
             </div>
             <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 z-0"
                aria-label="Open in Google Maps"
             />
             <SpecsOverlay />
          </div>
        ) : (
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

            <SpecsOverlay />
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
              className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all bg-gray-100 ${
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