'use client';

import dynamic from 'next/dynamic';

// Importación dinámica apuntando al archivo vecino './MapClient'
const MapClient = dynamic(() => import('./MapClient'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50">
      <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">
        Cargando Mapa...
      </p>
    </div>
  ) 
});

export default function MapLoader({ properties }: { properties: any[] }) {
  return <MapClient properties={properties} />;
}