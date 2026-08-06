'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MapLoader from './MapLoader'; 
import FloatingSearch from './ui/FloatingSearch';
import FilterModal from './ui/FilterModal';
import { calculateEstimatedPayment, formatMoney } from '@/lib/utils'; 
import MapFloatingButtons from './ui/MapFloatingButtons';
import MapErrorBoundary from './MapErrorBoundary';

export interface PropertyProps {
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
  downPayment: number;
  interestRate: number;
  taxes: number;
  insurance: number;
  monthlyRent: number;
  securityDeposit: number;
  features?: string[];
  sellerName?: string | null;
  sellerImage?: string | null;
  sellerType?: string | null;
  showSeller?: boolean;
  createdAt: string; 
  lastPriceChangeAt?: string | null;
  isForRent?: boolean;
  previousprice?: number | null;
}

const getStatusBadge = (status: string, texts: any) => {
    switch (status) {
        case 'COMING_SOON':
            return { text: texts.comingSoon, color: 'bg-blue-600/80 border-blue-400/30' };
        case 'SOLD': 
            return { text: texts.sold, color: 'bg-red-600/80 border-red-400/30 text-white' };
        case 'AVAILABLE':
        default:
            return { text: texts.available, color: 'bg-black/70 border-white/10' };
    }
};

function MapTabs({ currentType, texts, lang = 'en' }: { currentType: string, texts: any, lang?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSwitch = (newType: string) => {
        if (newType === currentType) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', newType);
        router.push(`?${params.toString()}`);
    };

    const buttonBaseClass = lang === 'es' 
        ? 'px-2.5 py-1.5 text-[10px] md:px-6 md:text-xs' 
        : 'px-4 py-2 text-xs';

    return (
        <div className="inline-flex bg-[#121826]/90 backdrop-blur-md rounded-full p-0.5 border border-gray-700 shadow-xl mb-3 gap-0.5">
            <button onClick={() => handleSwitch('buy')} className={`${buttonBaseClass} rounded-full font-black uppercase tracking-wider transition-all ${currentType === 'buy' ? 'bg-[#f8ed1a] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{texts.buy}</button>
            <button onClick={() => handleSwitch('rent')} className={`${buttonBaseClass} rounded-full font-black uppercase tracking-wider transition-all ${currentType === 'rent' ? 'bg-[#f8ed1a] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{texts.rent}</button>
            <button onClick={() => handleSwitch('sold')} className={`${buttonBaseClass} rounded-full font-black uppercase tracking-wider transition-all ${currentType === 'sold' ? 'bg-[#f8ed1a] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>{texts.sold}</button>
        </div>
    );
}
// --- NUEVO: Componente para el Slider de Precio ---
function PriceSlider({ min, max, lang }: { min: number, max: number, lang: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [value, setValue] = useState(Number(searchParams.get('maxPrice')) || max);

    useEffect(() => {
        const urlMax = searchParams.get('maxPrice');
        if (urlMax) setValue(Number(urlMax));
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(Number(e.target.value));
    };

    const handleCommit = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('maxPrice', value.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 bg-[#121826]/90 backdrop-blur-md rounded-full px-3 py-1.5 md:py-2 border border-gray-700 shadow-xl h-full">
            <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase whitespace-nowrap">
                {lang === 'en' ? 'Max: ' : 'Máx: '}${value >= 1000 ? Math.round(value/1000) + 'k' : value}
            </span>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={handleChange}
                onMouseUp={handleCommit}
                onTouchEnd={handleCommit}
                className="w-20 md:w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#f8ed1a]"
            />
        </div>
    );
}
// --- NUEVO: Componente para alternar Precio Mensual vs Total ---
function PriceToggle({ priceDisplay, setPriceDisplay, lang }: { priceDisplay: 'monthly'|'total', setPriceDisplay: (val: 'monthly'|'total') => void, lang: string }) {
    return (
        <div className="inline-flex bg-[#121826]/90 backdrop-blur-md rounded-full p-0.5 border border-gray-700 shadow-xl mb-3 h-full items-center">
            <button 
                onClick={() => setPriceDisplay('monthly')}
                className={`px-3 py-1.5 md:py-2 text-[10px] md:text-xs rounded-full font-black uppercase tracking-wider transition-all ${priceDisplay === 'monthly' ? 'bg-[#f8ed1a] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                {lang === 'en' ? 'Monthly' : 'Mensual'}
            </button>
            <button 
                onClick={() => setPriceDisplay('total')}
                className={`px-3 py-1.5 md:py-2 text-[10px] md:text-xs rounded-full font-black uppercase tracking-wider transition-all ${priceDisplay === 'total' ? 'bg-[#f8ed1a] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                {lang === 'en' ? 'Total' : 'Total'}
            </button>
        </div>
    );
}

export default function MapSplitView({ properties, lang, t, searchType, globalMinPrice = 0, globalMaxPrice = 1000000 }: any) {
  const [highlighted, setHighlighted] = useState<any | null>(null);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // --- NUEVO: Estado global para el modo de visualización de precios ---
  const [priceDisplay, setPriceDisplay] = useState<'monthly' | 'total'>('monthly');

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
             {searchType === 'sold' && <SoldCTACard lang={lang} />}

             {orderedProperties.map((property: any) => (
                <DesktopCard 
                    key={property.id} 
                    property={property} 
                    isHighlighted={highlighted?.id === property.id} 
                    onClick={() => setHighlighted(property)}
                    statusTexts={t.status}
                    specsTexts={t.specs}
                    searchType={searchType}
                    priceDisplay={priceDisplay} // Pasamos el toggle a la tarjeta
                />
             ))}
          </div>
      </div>

     {/* MAP CONTAINER */}
     <div className="absolute inset-0 w-full h-full lg:relative lg:flex-1 z-0 bg-[#0a0f1c] relative">
         <MapErrorBoundary>
             <MapLoader 
                properties={properties} 
                lang={lang} 
                highlightedProperty={highlighted} 
                onMarkerClick={handleMarkerClick}
                searchType={searchType}
                priceDisplay={priceDisplay} // Pasamos el toggle al mapa
             />
         </MapErrorBoundary>
         
         <div className="hidden lg:flex flex-col gap-2 absolute top-6 left-4 right-4 z-[50] justify-center transition-all duration-300 ease-out pointer-events-none">
            <div className="pointer-events-auto self-start ml-2 flex flex-wrap items-center gap-2">
                  <MapTabs currentType={searchType} texts={t.tabs} />
                 <PriceToggle priceDisplay={priceDisplay} setPriceDisplay={setPriceDisplay} lang={lang} />
                 <PriceSlider min={globalMinPrice} max={globalMaxPrice} lang={lang} />
             </div>
            <div className="w-full pointer-events-auto max-w-7xl mx-auto">
                <FloatingSearch placeholder={t.search.placeholder} onOpenFilters={() => setIsFilterOpen(true)} />
            </div>
         </div>
      </div>

      {/* MOBILE UI */}
      <div className="lg:hidden pointer-events-none absolute inset-0 z-30 flex flex-col justify-end">
          
          <div className="absolute top-0 left-0 w-full pointer-events-auto p-4 pt-4 flex flex-col items-start gap-2">             
             <div className="flex flex-wrap items-center gap-2 w-full">
                  <MapTabs currentType={searchType} texts={t.tabs} />
                  <PriceToggle priceDisplay={priceDisplay} setPriceDisplay={setPriceDisplay} lang={lang} />
                  <PriceSlider min={globalMinPrice} max={globalMaxPrice} lang={lang} />
              </div>
             <div className="w-full">
                <FloatingSearch placeholder={t.search.placeholder} onOpenFilters={() => setIsFilterOpen(true)} />
             </div>
          </div>

          <div className="flex justify-center mb-4 pointer-events-auto relative z-50">
              <button 
                onClick={() => setIsMobileExpanded(!isMobileExpanded)} 
                className={`
                  border border-gray-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-xl flex items-center gap-2 backdrop-blur-md transition-all
                  ${isMobileExpanded ? 'bg-red-900/90 border-red-500 hover:bg-red-800' : 'bg-[#121826]/90 hover:bg-[#1a2336]'}
                `}
              >
                  <span>{isMobileExpanded ? '▼' : '☰'}</span> 
                  {isMobileExpanded ? (lang === 'en' ? 'Close List' : 'Ocultar Lista') : `${t.sidebar.viewList} (${properties.length})`}
              </button>
          </div>

          <div className={`pointer-events-auto bg-[#0a0f1c] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.6)] border-t border-white/10 transition-all duration-500 ease-in-out flex flex-col ${isMobileExpanded ? 'h-[75vh]' : 'h-0 overflow-hidden'} `}>
              <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setIsMobileExpanded(false)}>
                  <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
              </div>

              <div id="mobile-list-container" className="flex-1 overflow-y-auto px-4 pt-2 pb-4 space-y-4 scrollbar-hide">
                 {searchType === 'sold' && <SoldCTACard lang={lang} isMobile={true} />}

                 {orderedProperties.length > 0 ? (
                      orderedProperties.map((property: any) => (
                         <DesktopCard 
                            key={property.id} 
                            property={property} 
                            isHighlighted={highlighted?.id === property.id} 
                            onClick={() => handleMobileCardClick(property)}
                            statusTexts={t.status}
                            specsTexts={t.specs}
                            isMobile={true} 
                            searchType={searchType}
                            priceDisplay={priceDisplay} // Toggle en móvil
                        />
                      ))
                 ) : (
                      <div className="flex flex-col items-center justify-center h-40 text-center text-gray-500">
                         <span className="text-2xl mb-2">🔍</span>
                         <p className="text-sm font-bold">No matching properties found.</p>
                      </div>
                 )}
                 <div className="h-4"></div>
              </div>
          </div>
      </div>
      
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      <div className="block">
          <MapFloatingButtons lang={lang} />
      </div>
    </div>
  );
}

function SoldCTACard({ lang, isMobile = false }: { lang: string, isMobile?: boolean }) {
    const title = lang === 'en' ? 'Your property could be here!' : '¡Tu propiedad podría estar aquí!';
    const subtitle = lang === 'en' ? 'Send us your details and sell your house fast.' : 'Manda tus datos y vende tu casa con nosotros.';
    const buttonText = lang === 'en' ? 'Sell my property' : 'Vender mi propiedad';

    return (
        <div className={`relative rounded-2xl overflow-hidden border-2 border-dashed border-[#f8ed1a]/40 bg-[#121826]/60 flex flex-col items-center justify-center p-6 text-center transition-all duration-300 hover:border-[#f8ed1a] hover:bg-[#121826] group ${isMobile ? 'min-h-[160px] my-2' : 'min-h-[200px]'}`}>
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🏡✨</div>
            <h3 className="text-white font-black text-lg md:text-xl mb-1 uppercase tracking-tight">{title}</h3>
            <p className="text-gray-400 text-xs md:text-sm mb-5 px-2">{subtitle}</p>
            <Link href="/sellers" className="bg-[#f8ed1a] text-black font-black uppercase tracking-wider text-xs px-6 py-3 rounded-full shadow-[0_0_15px_rgba(248,237,26,0.3)] hover:shadow-[0_0_25px_rgba(248,237,26,0.6)] hover:scale-105 transition-all duration-300">{buttonText}</Link>
        </div>
    );
}

// --- CARD ACTUALIZADA CON LÓGICA DE PRECIOS DINÁMICOS ---
function DesktopCard({ property, isHighlighted, onClick, statusTexts, specsTexts, isMobile = false, searchType = 'buy', priceDisplay }: any) {
    const badge = getStatusBadge(property.status, statusTexts);
    const firstFeature = property.features && property.features.length > 0 ? property.features[0] : null;
    const sellerImgUrl = property.sellerImage || property.seller?.image;

    const isRentMode = searchType === 'rent';
    
    // Cálculos base
    const monthlyRate = isRentMode 
        ? (property.monthlyRent || 0)
        : calculateEstimatedPayment(property.price, property.downPayment, property.taxes, property.insurance, property.interestRate);
        
    const totalPrice = isRentMode 
        ? (property.securityDeposit || 0)
        : property.price;

    // Lógica dinámica basada en el Toggle (Mensual vs Total)
    const mainPrice = priceDisplay === 'monthly' ? monthlyRate : totalPrice;
    const subPrice = priceDisplay === 'monthly' ? totalPrice : monthlyRate;
    
    const mainLabel = priceDisplay === 'monthly' ? '/mo' : (isRentMode ? 'DEP' : 'TOTAL');
    const subLabelPrefix = priceDisplay === 'monthly' ? (isRentMode ? 'Dep:' : '') : '';
    const subLabelSuffix = priceDisplay === 'monthly' ? (isRentMode ? '' : 'TOTAL') : (isRentMode ? '/mo' : '/mo est.');

    const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zipCode}`;

    return (
        <div onClick={onClick} className={`cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300 group flex flex-col relative ${isHighlighted ? 'bg-[#121826] border-[#f8ed1a] shadow-[0_0_30px_rgba(248,237,26,0.15)] scale-[1.02]' : 'bg-[#121826] border-white/5 hover:border-white/20 hover:shadow-xl'}`}>
            <div className={`relative w-full ${isMobile ? 'h-40' : 'h-48'}`}>
                {property.image ? (
                    <Image src={property.image} alt={property.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">🏠</div>
                )}
                <div className={`absolute top-3 left-3 backdrop-blur-md px-3 py-1 rounded-md text-white text-[10px] font-bold uppercase tracking-wider border ${badge.color}`}>
                    {badge.text}
                </div>
                {firstFeature && (
                    <div className="absolute top-3 right-3 bg-[#f8ed1a] text-black text-[10px] font-black px-2 py-1 rounded-md shadow-lg uppercase tracking-wider transform rotate-1 group-hover:rotate-0 transition-transform">
                        {firstFeature}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-[#f8ed1a]">
                                {formatMoney(mainPrice)}
                            </span>
                            <span className="text-xs font-bold text-[#f8ed1a] uppercase">{mainLabel}</span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-400 tracking-tight flex gap-1 items-center">
                            {subLabelPrefix && <span className="uppercase text-gray-600 mr-1">{subLabelPrefix}</span>}
                            {formatMoney(subPrice)}
                            {subLabelSuffix && <span className="text-[9px] font-normal text-gray-600 ml-1 mt-0.5">{subLabelSuffix}</span>}
                        </h3>
                    </div>

                    {sellerImgUrl && (
                        <div className="relative group/seller">
                            <div className="w-10 h-10 rounded-full p-[2px] border border-white/10 bg-white/5 overflow-hidden">
                                <Image src={sellerImgUrl} alt="Seller" width={40} height={40} className="rounded-full w-full h-full object-cover" />
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-white text-sm font-bold uppercase tracking-wide truncate mb-2" title={fullAddress}>
                        📍 {fullAddress}
                    </p>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <span className="bg-gray-800/50 px-2 py-1 rounded flex items-center gap-1"><strong className="text-white">{property.beds}</strong> {specsTexts?.beds || 'Beds'}</span>
                        <span className="bg-gray-800/50 px-2 py-1 rounded flex items-center gap-1"><strong className="text-white">{property.baths}</strong> {specsTexts?.baths || 'Baths'}</span>
                        <span className="bg-gray-800/50 px-2 py-1 rounded flex items-center gap-1"><strong className="text-white">{property.sqft}</strong> {specsTexts?.sqft || 'Sqft'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}