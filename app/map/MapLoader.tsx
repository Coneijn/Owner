'use client';

import dynamic from 'next/dynamic';

// Import dinámico
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-900">
      <p className="text-gray-500 font-bold animate-pulse">Loading Map...</p>
    </div>
  )
});

// INTERFAZ IDENTICA A MapClient
interface PropertyProps {
  id: string;
  title: string;
  address: string;
  price: number;
  slug: string;
  lat: number;
  lng: number;
  image?: string | null; // <--- Sincronizado: | null
  beds: number;
  baths: number;
  sqft: number;
}

interface MapLoaderProps {
  properties: PropertyProps[];
  lang: string;
  highlightedProperty?: PropertyProps | null;
}

export default function MapLoader({ properties, lang, highlightedProperty }: MapLoaderProps) {
  return (
    <MapClient 
      properties={properties} 
      lang={lang} 
      highlightedProperty={highlightedProperty} 
    />
  );
}