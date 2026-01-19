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
}

export default function SearchFilters({ texts }: SearchFiltersProps) {
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

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl shadow-2xl -mt-10 mx-4 md:mx-auto max-w-4xl relative z-20 border-2 border-[#f8ed1a] flex flex-col md:flex-row gap-6 items-end">
      
      {/* Input Zip Code */}
      <div className="flex-1 w-full">
        <label className="block text-xs font-black text-[#f8ed1a] uppercase mb-2 tracking-wider">
          {texts.zipLabel}
        </label>
        <input
          type="text"
          placeholder={texts.placeholder}
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('zip')?.toString()}
          className="w-full bg-white text-gray-900 font-medium border-0 rounded-lg h-12 px-4 focus:ring-2 focus:ring-[#f8ed1a] placeholder-gray-400"
        />
      </div>

      {/* Select Features */}
      <div className="w-full md:w-auto">
        <label className="block text-xs font-black text-[#f8ed1a] uppercase mb-2 tracking-wider">
          {texts.featureLabel}
        </label>
        <div className="relative">
            <select 
            onChange={(e) => handleFeature(e.target.value, e.target.value !== '')}
            defaultValue={searchParams.get('feature')?.toString() || ''}
            className="w-full md:w-56 bg-white text-gray-900 font-medium border-0 rounded-lg h-12 px-4 pr-8 focus:ring-2 focus:ring-[#f8ed1a] appearance-none cursor-pointer"
            >
            <option value="">{texts.allOption}</option>
            <option value="Garage">{texts.garage}</option>
            <option value="Pool">{texts.pool}</option>
            <option value="Garden">{texts.garden}</option>
            <option value="Fireplace">{texts.fireplace}</option>
            </select>
            {/* Flecha personalizada para el select (opcional para estilo) */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </div>
        </div>
      </div>

      {/* Botón visual */}
      <div className="w-full md:w-auto">
         <button className="w-full h-12 bg-[#529e14] text-white px-8 rounded-lg font-black uppercase tracking-wide hover:bg-[#458510] transition-colors shadow-lg hover:shadow-xl transform active:scale-95 duration-150">
           {texts.searchBtn}
         </button>
      </div>
    </div>
  );
}