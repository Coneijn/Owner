// app/map/MapLoader.tsx
'use client';

import dynamic from 'next/dynamic';

// Aquí movemos la lógica del dynamic import
// Al estar en un archivo 'use client', Next.js ya no se queja
const MapClient = dynamic(() => import('./MapClient'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <p className="text-xl font-bold text-gray-500 animate-pulse">Cargando Mapa...</p>
    </div>
  ) 
});

// Este componente recibe las propiedades y se las pasa al mapa real
export default function MapLoader({ properties }: { properties: any[] }) {
  return <MapClient properties={properties} />;
}