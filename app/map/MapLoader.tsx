'use client';

import dynamic from 'next/dynamic';

const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-white">
      <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Map...</p>
    </div>
  )
});

// 1. EXTENDEMOS LA INTERFAZ CON DATOS FINANCIEROS
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
  // Nuevos campos necesarios para el cálculo
  downPayment: number;
  interestRate: number;
  taxes: number;
  insurance: number;
  monthlyRent: number;
  securityDeposit: number;
}

interface MapLoaderProps {
  properties: PropertyProps[];
  lang: string;
  highlightedProperty?: any | null; // Usamos any temporalmente o PropertyProps para flexibilidad
  onMarkerClick?: (property: any) => void; 
  searchType: string; // 2. NUEVA PROP
}

export default function MapLoader({ 
  properties, 
  lang, 
  highlightedProperty, 
  onMarkerClick,
  searchType // Recibimos el tipo
}: MapLoaderProps) {
  return (
    <MapClient 
      properties={properties} 
      lang={lang} 
      highlightedProperty={highlightedProperty} 
      onMarkerClick={onMarkerClick} 
      searchType={searchType} // Lo pasamos al cliente
    />
  );
}