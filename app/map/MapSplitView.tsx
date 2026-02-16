'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import FloatingSearch from './ui/FloatingSearch';
import FilterModal from './ui/FilterModal';
import { calculateEstimatedPayment, formatMoney } from '@/lib/utils'; 
import MapFloatingButtons from './ui/MapFloatingButtons';

// --- MAP LOADER ---
const MapClient = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-[#0a0f1c]">
      <p className="text-[#f8ed1a] font-bold animate-pulse uppercase tracking-widest text-xs">Loading Map...</p>
    </div>
  )
});

// 1. INTERFAZ ACTUALIZADA SEGÚN TU SCHEMA PRISMA
interface PropertyProps {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  slug: string;
  lat: number;
  lng: number;
  image?: string | null; 
  beds: number;
  baths: number;
  sqft: number;
  status: string;
  
  // Financieros
  downPayment: number;
  interestRate: number;
  taxes: number;
  insurance: number;
  monthlyRent: number;
  securityDeposit: number;

  // Features
  features?: string[];

  // --- CORRECCIÓN: CAMPOS PLANOS (Match Prisma Schema) ---
  sellerName?: string | null;
  sellerImage?: string | null;
  sellerType?: string | null;
  showSeller?: boolean;

  // (Opcional) Soporte retroactivo por si viene de la API anidada
  seller?: {
      name: string;
      image?: string | null;
      type?: string;
  };
}

interface MapLoaderProps {
  properties: PropertyProps[];
  lang: string;
  highlightedProperty?: any | null;
  onMarkerClick?: (property: any) => void; 
  searchType: string;
}

function MapLoader({ 
  properties, 
  lang, 
  highlightedProperty, 
  onMarkerClick,
  searchType 
}: MapLoaderProps) {
  return (
    <MapClient 
      properties={properties} 
      lang={lang} 
      highlightedProperty={highlightedProperty} 
      onMarkerClick={onMarkerClick} 
      searchType={searchType} 
    />
  );
}

// --- UTILIDADES ---
const getStatusBadge = (status: string, texts: any) => {
    switch (status) {
        case 'COMING_SOON':
            return { text: texts.comingSoon, color: 'bg-blue-600/80 border-blue-400/30' };
        case 'AVAILABLE':
        default:
            return { text: texts.available, color: 'bg-black/70 border-white/10' };
    }
};

function MapTabs({ currentType, texts }: { currentType: string, texts: any }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSwitch = (newType: string) => {
        if (newType === currentType) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', newType);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="inline-flex bg-[#121826]/90 backdrop-blur-md rounded-full p-1 border border-gray-700 shadow-xl mb-3">
            <button
                onClick={() => handleSwitch('buy')}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                    currentType === 'buy'
                        ? 'bg-[#f8ed1a] text-black shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                {texts.buy}
            </button>
            <button
                onClick={() => handleSwitch('rent')}
                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                    currentType === 'rent'
                        ? 'bg-[#f8ed1a] text-black shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
                {texts.rent}
            </button>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL ---
export default function MapSplitView({ properties, lang, t, searchType }: any) {
  const [highlighted, setHighlighted] = useState<any | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (highlighted) {
      const stillExists = properties.find((p: any) => p.id === highlighted.id);
      if (!stillExists) {
        setHighlighted(null);
        setIsMobileExpanded(false); 
      } else {
        setHighlighted(stillExists);
      }
    }
  }, [properties, highlighted]); 

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
                    labelTexts={t.card}
                    specsTexts={t.specs}
                    searchType={searchType}
                />
             ))}
          </div>
      </div>

     {/* MAP CONTAINER */}
     <div className="absolute inset-0 w-full h-full lg:relative lg:flex-1 z-0 bg-[#0a0f1c] relative">
         <MapLoader 
            properties={properties} 
            lang={lang} 
            highlightedProperty={highlighted} 
            onMarkerClick={handleMarkerClick}
            searchType={searchType}
         />
         
         <div className="hidden lg:flex flex-col gap-2 absolute top-6 left-4 right-4 z-[50] justify-center transition-all duration-300 ease-out pointer-events-none">
  
  {/* 1. Contenedor de Tabs (Buy/Rent) */}
  {/* Usamos 'pointer-events-auto' y 'self-start' para que los tabs sean clicables y no se estiren a todo el ancho */}
  <div className="pointer-events-auto self-start ml-2"> 
      <MapTabs currentType={searchType} texts={t.tabs} />
  </div>

  {/* 2. Barra de Búsqueda */}
  {/* 'w-full' para llenar el espacio y 'max-w-7xl' para que no sea infinita en pantallas gigantes */}
  <div className="w-full pointer-events-auto max-w-7xl mx-auto">
      <FloatingSearch placeholder={t.search.placeholder} onOpenFilters={() => setIsFilterOpen(true)} />
  </div>

</div>
      </div>

      {/* MOBILE UI */}
      <div className="lg:hidden pointer-events-none absolute inset-0 z-30 flex flex-col justify-end">
          
      <div className="absolute top-0 left-0 w-full pointer-events-auto p-4 pt-4 flex flex-col items-center">             <MapTabs currentType={searchType} texts={t.tabs} />
             <FloatingSearch placeholder={t.search.placeholder} onOpenFilters={() => setIsFilterOpen(true)} />
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

          <div className={`pointer-events-auto bg-[#0a0f1c] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.6)] border-t border-white/10 transition-all duration-500 ease-in-out flex flex-col ${isMobileExpanded ? 'h-[75vh]' : 'h-auto pb-6'} `}>
              <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setIsMobileExpanded(!isMobileExpanded)}>
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
              </div>

              <div id="mobile-list-container" className={`flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4 scrollbar-hide ${!isMobileExpanded ? 'overflow-hidden' : ''} `}>
                 {orderedProperties.length > 0 ? (
                      (isMobileExpanded ? orderedProperties : [orderedProperties[0]]).map((property: any) => (
                         <DesktopCard 
                            key={property.id} 
                            property={property} 
                            isHighlighted={highlighted?.id === property.id} 
                            onClick={() => handleMobileCardClick(property)}
                            statusTexts={t.status}
                            labelTexts={t.card}
                            specsTexts={t.specs}
                            isMobile={true} 
                            searchType={searchType}
                        />
                      ))
                 ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                         <span className="text-2xl mb-2">🔍</span>
                         <p className="text-sm font-bold">No matching properties found.</p>
                      </div>
                 )}
                 {isMobileExpanded && <div className="h-4"></div>}
              </div>
          </div>
      </div>

      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <MapFloatingButtons lang={lang} />

    </div>
  );
}

// --- CARD ACTUALIZADA ---
function DesktopCard({ property, isHighlighted, onClick, statusTexts, labelTexts, specsTexts, isMobile = false, searchType = 'buy' }: any) {
    const badge = getStatusBadge(property.status, statusTexts);
    
    // Obtener la primera Feature
    const firstFeature = property.features && property.features.length > 0 ? property.features[0] : null;

    // --- CORRECCIÓN: Obtener imagen del vendedor desde campos planos ---
    // Intentamos leer 'sellerImage' (Schema Prisma) y si no, 'seller.image' (API)
    const sellerImgUrl = property.sellerImage || property.seller?.image;

    // Cálculo de precio según tipo
    const isRentMode = searchType === 'rent';
    const displayMonthly = isRentMode 
        ? (property.monthlyRent || 0)
        : calculateEstimatedPayment(
            property.price,
            property.downPayment,
            property.taxes,
            property.insurance,
            property.interestRate
          );
    const displayTotalPrice = isRentMode 
        ? (property.securityDeposit || 0)
        : property.price;

    const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;

    return (
        <div 
            onClick={onClick} 
            className={`
                cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 group flex flex-col relative
                ${isHighlighted 
                    ? 'bg-[#121826] border-[#f8ed1a] shadow-[0_0_30px_rgba(248,237,26,0.15)] scale-[1.02]' 
                    : 'bg-[#121826] border-white/5 hover:border-white/20 hover:shadow-xl'}
            `}
        >
            {/* Image Section */}
            <div className={`relative w-full ${isMobile ? 'h-40' : 'h-48'}`}>
                {property.image ? (
                    <Image 
                        src={property.image} 
                        alt={property.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">🏠</div>
                )}
                
                {/* 1. Status Badge (Izquierda) */}
                <div className={`absolute top-3 left-3 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                    {badge.text}
                </div>

                {/* 2. Feature Badge (Derecha) */}
                {firstFeature && (
                    <div className="absolute top-3 right-3 bg-[#f8ed1a] text-black text-[10px] font-black px-2 py-1 rounded-md shadow-lg uppercase tracking-wider transform rotate-1 group-hover:rotate-0 transition-transform">
                        {firstFeature}
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="p-4 flex flex-col gap-3">
                
                {/* Precios y Vendedor */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    {/* Bloque Precios */}
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-[#f8ed1a]">
                                {formatMoney(displayMonthly)}
                            </span>
                            <span className="text-xs font-bold text-[#f8ed1a] uppercase">/mo</span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 tracking-tight flex gap-1">
                            {isRentMode && <span className="uppercase text-gray-600 mr-1">Dep:</span>}
                            {formatMoney(displayTotalPrice)}
                            {!isRentMode && <span className="text-[9px] font-normal text-gray-600 ml-1 self-center">TOTAL</span>}
                        </h3>
                    </div>

                    {/* 3. Foto del Vendedor (CORREGIDO) */}
                    {sellerImgUrl && (
                        <div className="relative group/seller">
                            <div className="w-10 h-10 rounded-full p-[2px] border border-white/10 bg-white/5 overflow-hidden">
                                <Image 
                                    src={sellerImgUrl} 
                                    alt="Seller"
                                    width={40}
                                    height={40}
                                    className="rounded-full w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Specs y Dirección */}
                <div>
                    <p className="text-white text-sm font-bold uppercase tracking-wide truncate mb-2" title={fullAddress}>
                        📍 {fullAddress}
                    </p>

                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <span className="bg-gray-800/50 px-2 py-1 rounded flex items-center gap-1">
                            <strong className="text-white">{property.beds}</strong> {specsTexts?.beds || 'Beds'}
                        </span>
                        <span className="bg-gray-800/50 px-2 py-1 rounded flex items-center gap-1">
                            <strong className="text-white">{property.baths}</strong> {specsTexts?.baths || 'Baths'}
                        </span>
                        <span className="bg-gray-800/50 px-2 py-1 rounded flex items-center gap-1">
                            <strong className="text-white">{property.sqft}</strong> {specsTexts?.sqft || 'Sqft'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}