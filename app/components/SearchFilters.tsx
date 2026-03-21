'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface SearchFiltersProps {
  texts: {
    zipLabel: string;
    placeholder: string;
    featureLabel: string;
    allOption: string;
    searchBtn: string;
    garage: string;
    pool: string;
    garden: string;
    fireplace: string;
  };
  variant?: 'hero' | 'compact';
}

export default function SearchFilters({ texts, variant = 'hero' }: SearchFiltersProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('zip', term);
    } else {
      params.delete('zip');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleFeature = (feature: string, isChecked: boolean) => {
    const params = new URLSearchParams(searchParams);
    if (isChecked) {
      params.set('feature', feature);
    } else {
      params.delete('feature');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  // --- ESTILOS DINÁMICOS ---
  const isCompact = variant === 'compact';

  // CONTENEDOR: En 'compact', forzamos una sola fila horizontal (flex-row) siempre
  const containerClasses = isCompact
    ? "w-full flex flex-row gap-2 items-center" 
    : "bg-[#1a1a1a] p-6 rounded-xl shadow-2xl -mt-10 mx-4 md:mx-auto max-w-4xl relative z-20 border-2 border-[#f8ed1a] flex flex-col md:flex-row gap-6 items-end";

  // LABELS: En 'compact', los ocultamos visualmente (sr-only) para ahorrar altura
  const labelClasses = isCompact
    ? "sr-only" // Screen reader only (invisible pero accesible)
    : "block text-xs font-black text-[#f8ed1a] uppercase mb-2 tracking-wider";

  // INPUTS: Más pequeños en altura (h-9) y texto ajustado
  const inputClasses = isCompact
    ? "w-full bg-gray-900 text-white font-medium border border-gray-700 rounded-lg h-9 px-3 focus:ring-1 focus:ring-[#f8ed1a] text-xs placeholder-gray-500"
    : "w-full bg-white text-gray-900 font-medium border-0 rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#f8ed1a] placeholder-gray-400";

  // WRAPPERS: Distribución de espacio
  // En compact: Zip (ancho fijo pequeño), Select (flexible), Botón (auto)
  const wrapperZip = isCompact ? "w-[100px] flex-shrink-0" : "flex-1 w-full";
  const wrapperSelect = isCompact ? "flex-1 min-w-0" : "flex-1 w-full";
  const wrapperBtn = isCompact ? "w-auto flex-shrink-0" : "w-full md:w-auto";

  return (
    <div className={containerClasses}>
      
      {/* 1. Input Zip Code */}
      <div className={wrapperZip}>
        <label className={labelClasses}>{texts.zipLabel}</label>
        <input
          type="text"
          // En modo compacto usamos un placeholder más corto "ZIP" para que quepa
          placeholder={isCompact ? texts.zipLabel : texts.placeholder}
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('zip')?.toString()}
          className={`${inputClasses} text-center`}
        />
      </div>

      {/* 2. Select Features */}
      <div className={wrapperSelect}>
        <label className={labelClasses}>{texts.featureLabel}</label>
        <div className="relative">
            <select 
              onChange={(e) => handleFeature(e.target.value, e.target.value !== '')}
              defaultValue={searchParams.get('feature')?.toString() || ''}
              className={`${inputClasses} appearance-none cursor-pointer truncate pr-6`}
            >
              <option value="">{isCompact ? texts.featureLabel : texts.allOption}</option>
              <option value="Garage">{texts.garage}</option>
              <option value="Pool">{texts.pool}</option>
              <option value="Garden">{texts.garden}</option>
              <option value="Fireplace">{texts.fireplace}</option>
            </select>
            
            {/* Flecha */}
            <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${isCompact ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </div>
        </div>
      </div>

      {/* 3. Botón Buscar */}
      <div className={wrapperBtn}>
         {isCompact ? (
            // Botón Compacto (Solo Icono)
            <button className="h-9 w-9 bg-[#f8ed1a] text-black rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>
         ) : (
            // Botón Normal (Texto Grande)
            <button className="w-full h-12 bg-[#529e14] text-white px-8 rounded-lg font-black uppercase tracking-wide hover:bg-[#458510] transition-colors shadow-lg hover:shadow-xl transform active:scale-95 duration-150">
               {texts.searchBtn}
            </button>
         )}
      </div>
    </div>
  );
}