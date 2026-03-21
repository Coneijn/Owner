'use client';

import { useState } from 'react'; // Eliminamos useEffect
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; // Importamos la librería

interface FloatingSearchProps {
  placeholder?: string;
  onOpenFilters?: () => void;
}

export default function FloatingSearch({ placeholder, onOpenFilters }: FloatingSearchProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  // 1. Estado local para que el input sea rápido y fluido al escribir
  const [text, setText] = useState(searchParams.get('query')?.toString() || '');

  // 2. Callback optimizado: Solo se ejecuta 500ms después del último tecleo
  const updateUrl = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    
    // Esto es lo que recarga la página (Server Action), ahora está protegido
    replace(`?${params.toString()}`);
  }, 500);

  // 3. Manejador del input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value); // Actualiza la UI inmediatamente
    updateUrl(value); // Programa la actualización del servidor
  };

  // Verificamos si hay filtros activos (para el puntito rojo)
  const hasActiveFilters = ['minPrice', 'maxPrice', 'beds', 'baths', 'sqft'].some(key => searchParams.has(key));

  return (
    <div className="flex gap-3 w-full">
      {/* Search Input */}
      <div className="flex-1 bg-[#121826]/90 backdrop-blur-md rounded-full shadow-xl border border-gray-700 flex items-center px-4 h-12 hover:border-gray-500 transition-colors group">
        <span className="text-gray-400 mr-3 group-hover:text-white transition-colors">🔍</span>
        <input 
          type="text" 
          placeholder={placeholder || "Memphis, TN"} 
          value={text}
          onChange={handleChange}
          className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500 font-medium"
        />
      </div>

      {/* Botón Filtros */}
      <button 
        onClick={onOpenFilters}
        className="relative w-12 h-12 bg-[#121826]/90 backdrop-blur-md rounded-full shadow-xl border border-gray-700 flex items-center justify-center text-white hover:border-[#f8ed1a] hover:text-[#f8ed1a] transition-all shrink-0 active:scale-95"
      >
        <span className="text-lg">⚙️</span>
        {hasActiveFilters && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-[#f8ed1a] border-2 border-[#121826] rounded-full animate-pulse"></span>
        )}
      </button>
    </div>
  );
}