'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Importamos el Mapa (que ahora es Client Component)
import MapLoader from './MapLoader'; 

// Definimos la interfaz aquí o impórtala de tus types
interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  lat: number;
  lng: number;
  slug: string;
  image?: string | null;
  beds: number;
  baths: number;
  sqft: number;
}

interface MapSplitViewProps {
  properties: Property[];
  lang: string;
  t: any; // Diccionario de textos
}

export default function MapSplitView({ properties, lang, t }: MapSplitViewProps) {
  // ESTADO PARA COMUNICAR LISTA -> MAPA
  const [highlighted, setHighlighted] = useState<Property | null>(null);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col-reverse lg:flex-row relative w-full min-h-0 z-0">
        
        {/* --- A. LISTADO (Izquierda/Abajo) --- */}
        <div className="
            w-full lg:w-[400px] 
            h-[40vh] lg:h-full 
            bg-[#1a1a1a] 
            border-t lg:border-t-0 lg:border-r border-gray-800 
            overflow-y-auto 
            flex-shrink-0 
            relative z-20 shadow-2xl
            scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
        ">
            <div className="p-3 space-y-3">
                {properties.map(property => (
                    // Al hacer clic en la tarjeta, avisamos al estado
                    <div 
                        key={property.id} 
                        onClick={() => setHighlighted(property)} // <--- AQUÍ LA MAGIA
                        className={`
                            cursor-pointer 
                            bg-[#242424] border 
                            rounded-lg p-2.5 flex gap-3 transition-all group
                            ${highlighted?.id === property.id ? 'border-[#f8ed1a] bg-[#2a2a2a]' : 'border-gray-800 hover:border-[#f8ed1a] hover:bg-[#2a2a2a]'}
                        `}
                    >
                        {/* Imagen */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded bg-black overflow-hidden">
                            {property.image ? (
                                <Image 
                                src={property.image} 
                                alt={property.title} 
                                fill 
                                className="object-cover group-hover:scale-110 transition-transform duration-500" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="text-white font-bold text-xs leading-tight line-clamp-1" title={property.address}>
                                    {property.address}
                                </h3>
                                <p className="text-[#529e14] font-black text-sm mt-0.5">
                                    {formatMoney(property.price)}
                                </p>
                            </div>
                            
                            <div className="flex justify-between items-end mt-1">
                                <div className="flex gap-2 text-[10px] text-gray-400 font-medium">
                                    <span className="flex items-center gap-0.5"><span className="text-[#f8ed1a]">🛏</span>{property.beds}</span>
                                    <span className="flex items-center gap-0.5"><span className="text-[#f8ed1a]">🚿</span>{property.baths}</span>
                                    <span className="hidden sm:flex items-center gap-0.5"><span className="text-[#f8ed1a]">📐</span>{property.sqft}</span>
                                </div>
                                
                                {/* Botón Ver Detalles (Link normal) */}
                                <Link 
                                    href={`/propiedades/${property.slug}?lang=${lang}`}
                                    onClick={(e) => e.stopPropagation()} // Evitar que el clic active el mapa también
                                    className="bg-[#f8ed1a] hover:bg-white text-black text-[9px] font-black uppercase px-2 py-1 rounded transition-colors"
                                >
                                    {t.viewDetails}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {properties.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-xs">
                        <p>No properties found.</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- B. MAPA (Derecha/Arriba) --- */}
        <div className="flex-1 relative h-[60vh] lg:h-full z-10 bg-gray-900">
            {/* Pasamos el 'highlighted' al mapa */}
            <MapLoader 
                properties={properties} 
                lang={lang} 
                highlightedProperty={highlighted} 
            />
            
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-3 py-1 rounded-full pointer-events-none z-[1000] border border-white/10 lg:hidden">
                Map View
            </div>
        </div>
    </div>
  );
}