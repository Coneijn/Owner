'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import MapLoader from './MapLoader';
import FloatingSearch from './ui/FloatingSearch';
import FilterModal from './ui/FilterModal'; // <--- IMPORTANTE

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusBadge = (status: string, texts: any) => {
    switch (status) {
        case 'COMING_SOON':
            return { text: texts.comingSoon, color: 'bg-blue-600/80 border-blue-400/30' };
        case 'AVAILABLE':
        default:
            return { text: texts.forSale, color: 'bg-black/70 border-white/10' };
    }
};

export default function MapSplitView({ properties, lang, t }: any) {
  const [highlighted, setHighlighted] = useState<any | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  
  // --- 1. ESTADO DEL MODAL ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const orderedProperties = useMemo(() => {
    if (!highlighted) return properties;
    const otherProperties = properties.filter((p: any) => p.id !== highlighted.id);
    return [highlighted, ...otherProperties];
  }, [highlighted, properties]);

  useEffect(() => {
    if (highlighted) {
        const container = document.getElementById('sidebar-list-container');
        if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
        const mobileContainer = document.getElementById('mobile-list-container');
        if (mobileContainer) mobileContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [highlighted]);

  const handleMarkerClick = (prop: any) => {
      setHighlighted(prop);
      setIsMobileExpanded(false);
  };

  const handleMobileCardClick = (prop: any) => {
      setHighlighted(prop);
      setIsMobileExpanded(false);
  };

  return (
    <div className="relative w-full h-full bg-[#0a0f1c] lg:flex lg:flex-row overflow-hidden">
      
      {/* SIDEBAR (DESKTOP) */}
      <div className="hidden lg:flex flex-col w-[450px] h-full z-20 border-r border-white/10 shadow-2xl bg-[#0a0f1c]">
          <div className="p-6 border-b border-white/10 bg-[#0a0f1c]">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {properties.length} {t.sidebar.results}
              </h2>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                  {t.sidebar.inventory}
              </p>
          </div>
          <div id="sidebar-list-container" className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
             {orderedProperties.map((property: any) => (
                <DesktopCard 
                    key={property.id} 
                    property={property} 
                    isHighlighted={highlighted?.id === property.id} 
                    onClick={() => setHighlighted(property)}
                    statusTexts={t.status}
                />
             ))}
          </div>
      </div>

      {/* MAPA CONTAINER */}
      <div className="absolute inset-0 w-full h-full lg:relative lg:flex-1 z-0 bg-[#0a0f1c] relative">
         
         <MapLoader 
            properties={properties} 
            lang={lang} 
            highlightedProperty={highlighted} 
            onMarkerClick={handleMarkerClick} 
         />

         {/* --- SEARCH BAR DESKTOP --- */}
         {/* Conexión del evento onOpenFilters */}
         <div className="hidden lg:block absolute top-20 left-6 z-[50] w-[90%] max-w-8xl transition-all duration-300 ease-out">
            <FloatingSearch 
                placeholder={t.search.placeholder} 
                onOpenFilters={() => setIsFilterOpen(true)} // <--- AQUÍ
            />
         </div>

      </div>

      {/* MOBILE UI */}
      <div className="lg:hidden pointer-events-none absolute inset-0 z-30 flex flex-col justify-end">
          
          {/* --- SEARCH BAR MOBILE --- */}
          {/* Conexión del evento onOpenFilters */}
          <div className="absolute top-0 left-0 w-full pointer-events-auto p-4 pt-20">
             <FloatingSearch 
                placeholder={t.search.placeholder} 
                onOpenFilters={() => setIsFilterOpen(true)} // <--- AQUÍ
             />
          </div>

          {!isMobileExpanded && (
              <div className="flex justify-center mb-4 pointer-events-auto">
                  <button 
                    onClick={() => setIsMobileExpanded(true)}
                    className="bg-[#121826] border border-gray-700 text-white font-bold text-xs px-4 py-2 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-md hover:bg-[#1a2336]"
                  >
                      <span>☰</span> {t.sidebar.viewList} ({properties.length})
                  </button>
              </div>
          )}

          <div 
            className={`
                pointer-events-auto bg-[#0a0f1c] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.6)] border-t border-white/10 transition-all duration-500 ease-in-out flex flex-col
                ${isMobileExpanded ? 'h-[75vh]' : 'h-auto pb-6'} 
            `}
          >
              <div 
                className="w-full flex justify-center pt-3 pb-1 cursor-pointer"
                onClick={() => setIsMobileExpanded(!isMobileExpanded)}
              >
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
              </div>

              <div 
                id="mobile-list-container"
                className={`
                    flex-1 overflow-y-auto px-4 pt-2 pb-safe space-y-4 scrollbar-hide
                    ${!isMobileExpanded ? 'overflow-hidden' : ''} 
                `}
              >
                 {/* CORRECCIÓN DE SEGURIDAD:
                    1. Verificamos si hay propiedades (orderedProperties.length > 0).
                    2. Si NO hay, mostramos mensaje de "No resultados".
                    3. Si SÍ hay, procedemos con la lógica de expandir/colapsar.
                 */}
                 {orderedProperties.length > 0 ? (
                     (isMobileExpanded ? orderedProperties : [orderedProperties[0]]).map((property: any) => {
                        // Doble verificación por si acaso algo falló en la lógica anterior
                        if (!property) return null;

                        const badge = getStatusBadge(property.status, t.status);
                        
                        return (
                            <div 
                                key={property.id} 
                                onClick={() => handleMobileCardClick(property)}
                                className="group"
                            >
                                <div className={`
                                    relative rounded-2xl overflow-hidden border transition-all duration-300
                                    ${highlighted?.id === property.id 
                                        ? 'bg-[#121826] border-[#f8ed1a] shadow-lg ring-1 ring-[#f8ed1a]/30' 
                                        : 'bg-[#121826] border-white/5'}
                                `}>
                                    <div className="relative h-40 w-full">
                                        {property.image ? (
                                            <Image src={property.image} alt={property.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">🏠</div>
                                        )}
                                        
                                        <div className={`absolute top-3 left-3 backdrop-blur-md px-2 py-1 rounded text-white text-[9px] font-black uppercase tracking-wider ${badge.color}`}>
                                            {badge.text}
                                        </div>
                                    </div>

                                    <div className="p-4 flex justify-between items-end">
                                        <div>
                                            <h3 className="text-xl font-black text-[#f8ed1a] tracking-tight">
                                                {formatMoney(property.price)}
                                            </h3>
                                            <div className="flex items-center gap-3 text-gray-300 text-xs font-bold mt-1">
                                                <span>{property.beds} bds</span>
                                                <span className="text-gray-600">|</span>
                                                <span>{property.baths} ba</span>
                                                <span className="text-gray-600">|</span>
                                                <span>{property.sqft} sqft</span>
                                            </div>
                                            <p className="text-gray-500 text-[10px] uppercase mt-1 truncate max-w-[200px]">
                                                {property.address}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-[#f8ed1a] p-2 rounded-full text-black shadow-lg shadow-yellow-900/20 transform group-active:scale-95 transition-transform">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                     })
                 ) : (
                     /* Estado Vacío (Empty State) para Móvil */
                     <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                        <span className="text-2xl mb-2">🔍</span>
                        <p className="text-sm font-bold">No matching properties found.</p>
                        <p className="text-xs">Try adjusting your filters.</p>
                     </div>
                 )}
                 
                 {isMobileExpanded && <div className="h-10"></div>}
              </div>
          </div>
      </div>

      {/* --- 2. RENDERIZADO DEL MODAL (EN CAPA SUPERIOR) --- */}
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
      />

    </div>
  );
}

// ... DesktopCard component (sin cambios) ...
function DesktopCard({ property, isHighlighted, onClick, statusTexts }: any) {
    const badge = getStatusBadge(property.status, statusTexts);
    return (
        <div onClick={onClick} className={`cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 group ${isHighlighted ? 'bg-[#121826] border-[#f8ed1a] shadow-[0_0_30px_rgba(248,237,26,0.15)] scale-[1.02]' : 'bg-[#121826] border-white/5 hover:border-white/20 hover:shadow-xl'}`}>
            <div className="relative h-48 w-full">
                {property.image ? <Image src={property.image} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">🏠</div>}
                <div className={`absolute top-3 left-3 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>{badge.text}</div>
            </div>
            <div className="p-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-2xl font-black text-[#f8ed1a] tracking-tight">{formatMoney(property.price)}</h3>
                    <div className="flex items-center gap-3 text-gray-300 text-sm font-medium mt-1">
                        <span><span className="font-bold text-white">{property.beds}</span> bds</span>|<span><span className="font-bold text-white">{property.baths}</span> ba</span>|<span><span className="font-bold text-white">{property.sqft}</span> sqft</span>
                    </div>
                    <p className="text-gray-500 text-xs uppercase mt-2 font-bold tracking-wide">{property.address}</p>
                </div>
            </div>
        </div>
    );
}