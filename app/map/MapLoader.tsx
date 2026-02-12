'use client';

import dynamic from 'next/dynamic';

// Import dinámico del cliente
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0f1c]">
      <p className="text-[#f8ed1a] font-bold animate-pulse uppercase tracking-widest text-xs">Loading Map...</p>
    </div>
  )
});

// 1. Definimos la interfaz de la Propiedad
interface PropertyProps {
  id: string;
  title: string;
  address: string;
  price: number;
  slug: string;
  lat: number;
  lng: number;
  image?: string | null; 
  beds: number;
  baths: number;
  sqft: number;
}

// 2. Actualizamos las props del Loader para incluir onMarkerClick
interface MapLoaderProps {
  properties: PropertyProps[];
  lang: string;
  highlightedProperty?: PropertyProps | null;
  // AGREGADO: La función para manejar el click
  onMarkerClick?: (property: PropertyProps) => void; 
}

export default function MapLoader({ 
  properties, 
  lang, 
  highlightedProperty, 
  onMarkerClick // Recibimos la función
}: MapLoaderProps) {
  return (
    <MapClient 
      properties={properties} 
      lang={lang} 
      highlightedProperty={highlightedProperty} 
      onMarkerClick={onMarkerClick} // Pasamos la función al cliente real
    />
  );
}