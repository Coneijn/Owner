"use client";

import { useState } from 'react';

export default function MapLegend({ lang }: { lang: 'es' | 'en' }) {
  // En móvil iniciará cerrado. En desktop las clases de Tailwind ignorarán este estado y lo mostrarán siempre.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-20 bg-[#1a1a1a]/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl flex flex-col w-[220px] md:w-auto">
      
      {/* Cabecera / Botón interactivo solo en móvil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-3 md:p-4 w-full cursor-pointer md:cursor-default md:pointer-events-none"
      >
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-left border-b-0 md:border-b md:border-white/5 md:pb-2 w-full">
          {lang === 'en' ? 'Map Legend' : 'Simbología'}
        </h4>
        
        {/* Ícono de flecha (solo visible en móvil) */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 md:hidden ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Contenido de la simbología (Oculto en móvil si está cerrado, siempre visible en desktop) */}
      <div className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col gap-4 px-3 pb-3 md:px-4 md:pb-4 pt-0`}>
        
        {/* Propiedades Vendidas */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg shrink-0">
            <img src="/frog-pin.png" alt="Sold" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <p className="text-white text-[11px] font-bold leading-none">
              {lang === 'en' ? 'Sold Property' : 'Propiedad Vendida'}
            </p>
          </div>
        </div>

        {/* Compradores Interesados */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg shrink-0">
            <div 
              className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(255,255,200,0.5)]" 
              style={{ backgroundColor: 'rgba(255, 255, 200, 1)' }}
            />
          </div>
          <div>
            <p className="text-white text-[11px] font-bold leading-none">
              {lang === 'en' ? 'Interested Buyers' : 'Compradores Interesados'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}