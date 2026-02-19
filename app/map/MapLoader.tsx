'use client';

import dynamic from 'next/dynamic';

// 1. Carga dinámica centralizada
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0f1c]">
      <p className="text-[#f8ed1a] font-bold animate-pulse uppercase tracking-widest text-xs">
        Loading Map...
      </p>
    </div>
  )
});

// 2. Exportamos el Loader aceptando cualquier prop (ideal para reutilizar en Sellers o Properties)
export default function MapLoader(props: any) {
  return <MapClient {...props} />;
}