'use client';

import Link from 'next/link';
import { useActionState, useState, useRef, useCallback } from 'react'; 
// IMPORTANTE: Asegúrate de que esta acción valide en el backend que el usuario es dueño de la propiedad
import { updateProperty } from '@/lib/actions'; 
import ImageUpload, { ImageFile } from '@/app/components/ui/image-upload'; 
import dynamic from 'next/dynamic';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

// Importamos el mapa dinámicamente (sin SSR)
const LocationPicker = dynamic(() => import('@/app/components/ui/location-picker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-800 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

const libraries: ("places")[] = ["places"];

// --- HELPER PARA FECHAS ---
const formatDateForInput = (dateVal: string | Date | null | undefined) => {
    if (!dateVal) return '';
    const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

// --- TYPES ---
interface PropertyData {
  id: string;
  status: string;
  slug: string;
  calendarLink?: string | null;
  isFeatured: boolean;
  isOffMarket: boolean;
  seoTitleEn?: string | null;
  seoDescriptionEn?: string | null;
  seoTitleEs?: string | null;
  seoDescriptionEs?: string | null;
  focusKeywordEn?: string | null;
  focusKeywordEs?: string | null;
  address: string;
  phoneNumber?: string | null;
  city: string;
  state?: string | null;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt?: number | null;
  price: number;
  downPayment: number;
  interestRate: number;
  taxes: number;
  insurance: number;
  titleEn: string;
  descriptionEn?: string | null;
  titleEs: string;
  descriptionEs?: string | null;
  mainImage?: string | null;
  galleryImages: string[];
  images?: any[]; 
  videoUrl?: string | null;
  features: string[];
  showSeller: boolean;
  sellerProfileId?: string | null; // Mantenemos el ID para enviarlo oculto
  latitude?: number | string | null;
  longitude?: number | string | null;
  lockboxCode?: string | null;
  availableDate?: Date | string | null; 
  isForSale?: boolean;
  isForRent?: boolean;
  monthlyRent?: number | null;
  securityDeposit?: number | null;
  //datos para agente
  emoji?: string | null;
  condition?: string | null;
  commissionPct?: number | null;
  commissionAmt?: number | null;
  commissionNote?: string | null;
  showingSteps?: string[];
  showingNotes?: string | null;
  buyerTags?: string[];
  buyerIncome?: string | null;
  buyerCredit?: string | null;
  buyerFinancing?: string | null;
}

// --- HELPER COMPONENT: ACCORDION ---
const AccordionSection = ({ 
  title, 
  children, 
  defaultOpen = false, 
  icon
}: { 
  title: string, 
  children: React.ReactNode, 
  defaultOpen?: boolean, 
  icon?: string
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-900/30 overflow-hidden mb-4 transition-all duration-200">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-3">
            {icon && <span className="text-lg">{icon}</span>}
            <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wide">{title}</h2>
        </div>
        <span className={`transform transition-transform duration-200 text-[#f8ed1a] ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      <div className={isOpen ? 'block p-6 border-t border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200' : 'hidden'}>
        {children}
      </div>
    </div>
  );
};

export default function SellerEditForm({ property }: { property: PropertyData }) {
  const [state, formAction, isPending] = useActionState(updateProperty, null);
    
  // Sale & rental states
  const [isForSale, setIsForSale] = useState<boolean>(property.isForSale ?? true);
  const [isForRent, setIsForRent] = useState<boolean>(property.isForRent || false);
  
// --- CALCULADORA DE COMISIÓN ---
  const priceRef = useRef<HTMLInputElement>(null);
  const pctRef = useRef<HTMLInputElement>(null);
  const amtRef = useRef<HTMLInputElement>(null);

  const handleCommissionCalc = () => {
    if (priceRef.current && pctRef.current && amtRef.current) {
      const p = parseFloat(priceRef.current.value) || 0;
      const pct = parseFloat(pctRef.current.value) || 0;
      
      if (p > 0 && pct > 0) {
        amtRef.current.value = (p * (pct / 100)).toFixed(2);
      } else if (pct === 0) {
        amtRef.current.value = '';
      }
    }
  };

  // --- NUEVO ESTADO: Controla la visibilidad del vendedor ---
  const [showSeller, setShowSeller] = useState<boolean>(property.showSeller || false);

  // ---  Cargar Script de Google ---
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
 
  // --- STATUS STATE ---
  const [status, setStatus] = useState<string>(property.status);

  // --- IMAGE STATE ---
  const initialMain: ImageFile[] = property.images && property.images.length > 0
    ? property.images.filter((img: any) => img.isMain).map((img: any) => ({ 
        url: img.url,
        altText: img.altText || '',
        title: img.title || '',
        caption: img.caption || '',
        description: img.description || ''
      }))
    : property.mainImage ? [{ url: property.mainImage, altText: '' }] : [];

  const initialGallery: ImageFile[] = property.images && property.images.length > 0
    ? property.images.filter((img: any) => !img.isMain).map((img: any) => ({ 
        url: img.url,
        altText: img.altText || '',
        title: img.title || '',
        caption: img.caption || '',
        description: img.description || ''
      }))
    : property.galleryImages ? property.galleryImages.map((url: string) => ({ url, altText: '' })) : [];

  const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>(initialMain);
  const [galleryImageFiles, setGalleryImageFiles] = useState<ImageFile[]>(initialGallery);

  // --- LOCATION STATE ---
  const [address, setAddress] = useState(property.address || '');
  const [city, setCity] = useState(property.city || '');
  const [stateLoc, setStateLoc] = useState(property.state || 'TN');
  const [zipCode, setZipCode] = useState(property.zipCode || '');
  
  const [coords, setCoords] = useState({ 
    lat: Number((property as any).latitude) || 35.1495, 
    lng: Number((property as any).longitude) || -90.0490 
  });

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setCoords(prev => {
        if (prev.lat === lat && prev.lng === lng) return prev;
        return { lat, lng };
    });
  }, []);
  
  const fullAddressQuery = `${address}, ${city}, ${stateLoc} ${zipCode}`;

  // --- Manejador de Autocomplete ---
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
        const place = autocompleteRef.current.getPlace();
        
        if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            setCoords({ lat, lng });

            let streetNumber = "";
            let route = "";
            let newCity = "";
            let newState = "";
            let newZip = "";

            place.address_components?.forEach(component => {
                const types = component.types;
                if (types.includes("street_number")) streetNumber = component.long_name;
                if (types.includes("route")) route = component.long_name;
                if (types.includes("locality")) newCity = component.long_name;
                if (types.includes("administrative_area_level_1")) newState = component.short_name;
                if (types.includes("postal_code")) newZip = component.long_name;
            });

            const fullStreet = (streetNumber && route) ? `${streetNumber} ${route}` : (place.name || address);
            
            setAddress(fullStreet);
            if (newCity) setCity(newCity);
            if (newState) setStateLoc(newState);
            if (newZip) setZipCode(newZip);
        }
    }
  };

  return (
    <>
      <form action={formAction} className="space-y-6 relative">
        
        {/* HIDDEN INPUTS */}
        <input type="hidden" name="id" value={property.id} />
        <input type="hidden" name="sellerProfileId" value={property.sellerProfileId || ''} />
        
        {/* --- NUEVO: Input oculto dinámico para showSeller --- */}
        <input type="hidden" name="showSeller" value={showSeller ? 'true' : 'false'} />
        
        <input type="hidden" name="mainImageData" value={JSON.stringify(mainImageFiles[0] || null)} />
        <input type="hidden" name="galleryImagesData" value={JSON.stringify(galleryImageFiles)} />

        {/* --- NUEVO: SECCIÓN PRIVACIDAD DEL VENDEDOR --- */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h3 className="text-[#f8ed1a] font-black uppercase tracking-wide text-sm flex items-center gap-2">
                    <span>👤</span> Public Profile Visibility
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                    Allow buyers to see your name, photo, and role on the property page.
                </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={showSeller}
                    onChange={(e) => setShowSeller(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#529e14]"></div>
                <span className="ml-3 text-sm font-bold text-white uppercase min-w-[60px]">
                    {showSeller ? 'Visible' : 'Hidden'}
                </span>
            </label>
        </div>

        {/* 1. STATUS & LOCATION */}
        <AccordionSection title="Status, Location & Specs" icon="📍" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              
              <div className="sm:col-span-2">
                  <label className="block text-xs font-bold leading-6 text-[#f8ed1a] uppercase">Status</label>
                  <select 
                    name="status" 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"
                  >
                      <option value="AVAILABLE">Available</option>
                      <option value="UNDER_CONTRACT">Under Contract | Pending</option>
                      <option value="SOLD">Sold</option>
                      <option value="RENTED">Rented</option>
                      <option value="DRAFT">Draft</option>
                      <option value="COMING_SOON">Coming Soon</option>
                  </select>
              </div>

              {status === 'COMING_SOON' && (
                <div className="sm:col-span-2 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-bold leading-6 text-blue-400 uppercase">Available Date</label>
                    <input 
                        type="date" 
                        name="availableDate" 
                        defaultValue={formatDateForInput(property.availableDate)}
                        className="mt-2 block w-full rounded bg-gray-800 border border-blue-500/50 text-white shadow-sm ring-1 ring-inset ring-blue-500/20 focus:ring-blue-500 sm:text-sm" 
                    />
                </div>
              )}

              <div className="sm:col-span-2">
                  <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Phone Number</label>
                  <input type="text" name="phoneNumber" defaultValue={property.phoneNumber || ''}  className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>
              <div className="sm:col-span-6">
                  <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Slug (URL)</label>
                  <input type="text" name="slug" defaultValue={property.slug} required className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              {/* LOCATION */}
              <div className="sm:col-span-3">
                  <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Address</label>
                  {isLoaded ? (
                    <Autocomplete
                        onLoad={(auto) => (autocompleteRef.current = auto)}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <input 
                            type="text" 
                            name="address" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)}
                            required 
                            placeholder="Type to search..."
                            className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm placeholder-gray-500" 
                        />
                    </Autocomplete>
                  ) : (
                    <input 
                        type="text" 
                        disabled
                        placeholder="Loading..."
                        className="mt-2 block w-full rounded bg-gray-800 border-0 text-gray-500 cursor-not-allowed sm:text-sm"
                    />
                  )}
              </div>
              <div className="sm:col-span-1">
                  <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    required 
                    className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                  />
              </div>
              <div className="sm:col-span-1">
                  <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={stateLoc} 
                    onChange={(e) => setStateLoc(e.target.value)}
                    className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                  />
              </div>
              <div className="sm:col-span-1">
                  <label className="block text-xs font-bold leading-6 text-[#f8ed1a] uppercase">Zip Code</label>
                  <input 
                    type="text" 
                    name="zipCode" 
                    value={zipCode} 
                    onChange={(e) => setZipCode(e.target.value)}
                    required 
                    className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                  />
              </div>

              {/* Specs */}
              <div className="sm:col-span-6 border-t border-gray-700 pt-6 mt-2">
                  <p className="text-[#f8ed1a] text-xs font-black uppercase mb-4">Specifications</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase">Bedrooms</label>
                          <input type="number" name="bedrooms" defaultValue={property.bedrooms} className="mt-1 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase">Bathrooms</label>
                          <input type="number" step="0.5" name="bathrooms" defaultValue={property.bathrooms} className="mt-1 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase">Sqft</label>
                          <input type="number" name="sqft" defaultValue={property.sqft} className="mt-1 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase">Year</label>
                          <input type="number" name="yearBuilt" defaultValue={property.yearBuilt || ''} className="mt-1 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                      </div>
                  </div>
              </div>
          </div>
        </AccordionSection>

        {/* 2. ADVANCED CONFIG & SEO */}
        <AccordionSection title="Advanced Config & SEO" icon="⚙️" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-6">
              <div className="flex gap-8 flex-wrap p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input id="isFeatured" name="isFeatured" type="checkbox" defaultChecked={property.isFeatured} className="h-5 w-5 rounded bg-gray-800 border-gray-600 text-[#529e14] focus:ring-[#529e14]" />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="isFeatured" className="text-sm font-bold text-white block">Featured Property</label>
                        <span className="text-xs text-gray-400">Shows in the <strong className="text-[#f8ed1a]">Home Page Carousel</strong>.</span>
                      </div>
                  </div>
                  
                  <div className="flex items-start">
                      <div className="flex h-6 items-center">
                        <input id="isOffMarket" name="isOffMarket" type="checkbox" defaultChecked={property.isOffMarket} className="h-5 w-5 rounded bg-gray-800 border-gray-600 text-red-500 focus:ring-red-500" />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="isOffMarket" className="text-sm font-bold text-white block">Off Market Deal</label>
                        <span className="text-xs text-gray-400">Activates the <strong className="text-[#f8ed1a]">Yellow Label</strong> on cards.</span>
                      </div>
                  </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-[#f8ed1a] uppercase">Calendar Link</label>
                  <input type="url" name="calendarLink" defaultValue={property.calendarLink || ''} className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                  <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">SEO English</h4>
                      <input type="text" name="seoTitleEn" placeholder="Meta Title" defaultValue={property.seoTitleEn || ''} className="mb-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                      <textarea name="seoDescriptionEn" rows={2} placeholder="Meta Desc" defaultValue={property.seoDescriptionEn || ''} className="block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm"></textarea>
                      
                      {/* NUEVO CAMPO EN INGLÉS */}
                      <input type="text" name="focusKeywordEn" defaultValue={property.focusKeywordEn || ''} placeholder="Focus Keyword" className="mt-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                  </div>
                  <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">SEO Spanish</h4>
                      <input type="text" name="seoTitleEs" placeholder="Meta Title" defaultValue={property.seoTitleEs || ''} className="mb-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                      <textarea name="seoDescriptionEs" rows={2} placeholder="Meta Desc" defaultValue={property.seoDescriptionEs || ''} className="block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm"></textarea>
                      
                      {/* NUEVO CAMPO EN ESPAÑOL */}
                      <input type="text" name="focusKeywordEs" defaultValue={property.focusKeywordEs || ''} placeholder="Focus Keyword" className="mt-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                  </div>
              </div>
          </div>
        </AccordionSection>

        {/* 3. FINANCIALS */}
        <AccordionSection title="Financial Data (Sale)" icon="💰">
          <div className="space-y-6">
              
              <div className="flex items-center">
                <input
                  id="isForSale"
                  name="isForSale"
                  type="checkbox"
                  checked={isForSale} 
                  onChange={(e) => setIsForSale(e.target.checked)} 
                  className="h-5 w-5 rounded bg-gray-800 text-[#529e14] focus:ring-[#529e14] border-gray-600"
                />
                <label htmlFor="isForSale" className="ml-2 text-sm font-bold text-white uppercase">
                  Enable Sale Option
                </label>
              </div>

              {isForSale && (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 animate-in fade-in slide-in-from-top-2">
                      <div className="sm:col-span-2">
                          <label className="block text-xs font-bold leading-6 text-white uppercase">Total Price ($)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            name="price" 
                            ref={priceRef}
                            onChange={handleCommissionCalc}
                            defaultValue={String(property.price || 0)} 
                            required={isForSale} 
                            className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm" 
                          />
                      </div>
                      <div className="sm:col-span-2">
                          <label className="block text-xs font-bold leading-6 text-white uppercase">
                                Down Payment ($)
                            </label>
                            <select
                                name="downPayment"
                                defaultValue={String(property.downPayment || 0)}
                                required={isForSale}
                                className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm"
                            >
                                <option value="10000">$10,000</option>
                                <option value="20000">$20,000</option>
                                <option value="30000">$30,000</option>
                                <option value="40000">$40,000</option>
                                <option value="50000">$50,000</option>
                            </select>
                      </div>
                      <div className="sm:col-span-2">
                          <label className="block text-xs font-bold leading-6 text-white uppercase">Interest Rate (%)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            name="interestRate" 
                            defaultValue={String(property.interestRate || 10)} 
                            required={isForSale} 
                            className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm" 
                          />
                      </div>
                      <div className="sm:col-span-3">
                          <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Annual Taxes ($)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            name="taxes" 
                            defaultValue={String(property.taxes || 0)} 
                            className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm" 
                          />
                      </div>
                      <div className="sm:col-span-3">
                          <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Annual Insurance ($)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            name="insurance" 
                            defaultValue={String(property.insurance || 0)} 
                            className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm" 
                          />
                      </div>
                  </div>
              )}
          </div>
        </AccordionSection>

        {/* 3.5 RENTAL INFO */}
        <AccordionSection title="Financial Data (Rent)" icon="🔑">
          <div className="space-y-6">
            
            <div className="flex items-center">
              <input
                id="isForRent"
                name="isForRent"
                type="checkbox"
                checked={isForRent} 
                onChange={(e) => setIsForRent(e.target.checked)} 
                className="h-5 w-5 rounded bg-gray-800 text-[#529e14] focus:ring-[#529e14] border-gray-600"
              />
              <label htmlFor="isForRent" className="ml-2 text-sm font-bold text-white uppercase">
                Enable Rental / Lease Option
              </label>
            </div>

            {isForRent && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 animate-in fade-in slide-in-from-top-2">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold leading-6 text-white uppercase">
                    Monthly Rent ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="monthlyRent"
                    defaultValue={property.monthlyRent || ''}
                    placeholder="0.00"
                    className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold leading-6 text-white uppercase">
                    Security Deposit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="securityDeposit"
                    defaultValue={property.securityDeposit || ''}
                    placeholder="0.00"
                    className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </AccordionSection>

        {/* 4. MEDIA & CONTENT */}
        <AccordionSection title="Photos, Video & Descriptions" icon="📷">
          <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                  <ImageUpload label="Main Image" value={mainImageFiles} onChange={setMainImageFiles} multiple={false} />
                  <ImageUpload label="Gallery Images" value={galleryImageFiles} onChange={setGalleryImageFiles} multiple={true} />
              </div>

              <div>
                  <label className="block text-xs font-bold text-[#f8ed1a] uppercase">Video Tour URL</label>
                  <input type="url" name="videoUrl" defaultValue={property.videoUrl || ''} placeholder="https://youtube.com..." className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 pt-4 border-t border-gray-700">
                  <div className="space-y-4">
                      <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">🇺🇸 English Content</h3>
                      <input type="text" name="titleEn" defaultValue={property.titleEn} placeholder="Title EN" className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                      <textarea name="descriptionEn" rows={4} defaultValue={property.descriptionEn || ''} placeholder="Description EN" className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">🇲🇽 Spanish Content</h3>
                      <input type="text" name="titleEs" defaultValue={property.titleEs} placeholder="Title ES" className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                      <textarea name="descriptionEs" rows={4} defaultValue={property.descriptionEs || ''} placeholder="Description ES" className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                  </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase">Features (Comma separated)</label>
                  <textarea name="features" rows={2} defaultValue={property.features.join(', ')} className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
              </div>
          </div>
        </AccordionSection>

        {/* 4.5 LOCATION & ACCESS */}
        <AccordionSection title="Location & Access" icon="🗺️">
            <div className="space-y-6">
                <div className="w-full">
                    <LocationPicker 
                        lat={coords.lat} 
                        lng={coords.lng} 
                        searchQuery={fullAddressQuery}
                        onLocationChange={handleLocationChange} 
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase">Latitude</label>
                        <input 
                            type="text" 
                            name="latitude" 
                            value={coords.lat}
                            onChange={(e) => setCoords({...coords, lat: Number(e.target.value)})}
                            className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase">Longitude</label>
                        <input 
                            type="text" 
                            name="longitude" 
                            value={coords.lng}
                            onChange={(e) => setCoords({...coords, lng: Number(e.target.value)})}
                            className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#f8ed1a] uppercase">Lockbox Code</label>
                        <input 
                            type="text" 
                            name="lockboxCode" 
                            defaultValue={(property as any).lockboxCode || ''} 
                            placeholder="e.g. 1234" 
                            className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                        />
                    </div>
                </div>
            </div>
        </AccordionSection>

            {/* --- AGENT PORTAL / REP DASHBOARD --- */}
          <AccordionSection title="Agent Portal Details" icon="💼">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
              
              {/* Emoji & Condition */}
              <div>
                <label htmlFor="emoji" className="block text-sm font-medium leading-6 text-white">Emoji Identificator</label>
                <div className="mt-2">
                  <input type="text" name="emoji" id="emoji" defaultValue={property.emoji || ''} placeholder="🏡" className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div>
  <label htmlFor="condition" className="block text-sm font-medium leading-6 text-white">Property Condition</label>
  <div className="mt-2">
    <select 
      name="condition" 
      id="condition" 
      defaultValue={property.condition || ''}
      className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6"
    >
      <option value="" className="bg-gray-800">-- Select condition --</option>
      <option value="Excellent (Move-in ready, no repairs needed)" className="bg-gray-800">Excellent (Move-in ready, no repairs needed)</option>
      <option value="Good (Minor cosmetic updates needed)" className="bg-gray-800">Good (Minor cosmetic updates needed)</option>
      <option value="Fair (Some repairs required)" className="bg-gray-800">Fair (Some repairs required)</option>
      <option value="Needs Work (Major repairs needed)" className="bg-gray-800">Needs Work (Major repairs needed)</option>
    </select>
  </div>
</div>

             {/* Commissions */}
              <div>
                <label htmlFor="commissionPct" className="block text-sm font-medium leading-6 text-white">Commission Percentage (%)</label>
                <div className="mt-2">
                  <input 
                    type="number" 
                    step="0.01" 
                    name="commissionPct" 
                    id="commissionPct" 
                    ref={pctRef} 
                    onChange={handleCommissionCalc} 
                    defaultValue={property.commissionPct || ''}  
                    placeholder="7.00" 
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6" 
                  />
                </div>
              </div>
              <div>
                <label htmlFor="commissionAmt" className="block text-sm font-medium leading-6 text-white">Comision amount ($)</label>
                <div className="mt-2">
                  <input 
                    type="number" 
                    step="0.01" 
                    name="commissionAmt" 
                    id="commissionAmt" 
                    ref={amtRef} 
                    readOnly
                    defaultValue={property.commissionAmt || ''} 
                    placeholder="12950" 
                    className="block w-full rounded-md border-0 bg-white/10 py-1.5 text-gray-400 shadow-sm ring-1 ring-inset ring-white/10 cursor-not-allowed focus:outline-none sm:text-sm sm:leading-6"                  />
                </div>
              </div>

              {/* Showings */}
              <div className="md:col-span-2">
                <label htmlFor="showingSteps" className="block text-sm font-medium leading-6 text-white">Showing Steps (Separated by commas)</label>
                <div className="mt-2">
                  <textarea name="showingSteps" id="showingSteps" rows={2} defaultValue={property.showingSteps?.join(', ') || ''} placeholder="Email showings@ownertodueno.com, Receive lockbox code, Greet the buyer" className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="showingNotes" className="block text-sm font-medium leading-6 text-white">Additional Notes for Showings</label>
                <div className="mt-2">
                  <textarea name="showingNotes" id="showingNotes" rows={2} defaultValue={property.showingNotes || ''} placeholder="Best times: weekday evenings and Saturday mornings." className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6" />
                </div>
              </div>

              {/* Buyers */}
              <div className="md:col-span-2">
                <label htmlFor="buyerTags" className="block text-sm font-medium leading-6 text-white">Buyer Tags (Separated by commas)</label>
                <div className="mt-2">
                  <input type="text" name="buyerTags" id="buyerTags" defaultValue={property.buyerTags?.join(', ') || ''} placeholder="First-time homebuyers, Young families" className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div>
                <label htmlFor="buyerIncome" className="block text-sm font-medium leading-6 text-white">Client Target Income</label>
                <div className="mt-2">
                  <input type="text" name="buyerIncome" id="buyerIncome" defaultValue={property.buyerIncome || ''} placeholder="$55K–$90K" className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div>
                <label htmlFor="buyerCredit" className="block text-sm font-medium leading-6 text-white">Client Target Credit</label>
                <div className="mt-2">
                  <input type="text" name="buyerCredit" id="buyerCredit" defaultValue={property.buyerCredit || ''} placeholder="580+" className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6" />
                </div>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="buyerFinancing" className="block text-sm font-medium leading-6 text-white">Eligible Financing</label>
                <div className="mt-2">
                  <select 
                    name="buyerFinancing" 
                    id="buyerFinancing" 
                    defaultValue={property.buyerFinancing || ''}
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-[#529e14] sm:text-sm sm:leading-6"
                  >
                    <option value="" className="bg-gray-800">-- Select financing --</option>
                    <option value="FHA" className="bg-gray-800">FHA</option>
                    <option value="VA" className="bg-gray-800">VA</option>
                    <option value="Conventional" className="bg-gray-800">Conventional</option>
                  </select>
                </div>
              </div>

            </div>
          </AccordionSection>

        {/* ERROR MESSAGE (MAIN FORM) */}
        {state?.message && (
          <div className="rounded-md bg-red-900/30 p-4 border border-red-800">
            <p className="text-sm text-red-400">{state.message}</p>
          </div>
        )}

        {/* MAIN SAVE BUTTON */}
        <div className="sticky bottom-0 z-40 bg-[#1a1a1a]/95 backdrop-blur py-4 border-t border-gray-800 flex items-center justify-end gap-x-6">
          <Link href="/sellerDashboard/" className="text-sm font-bold leading-6 text-gray-400 hover:text-white">Cancel</Link>
          <button
            type="submit"
            disabled={isPending}
            className={`rounded-lg px-8 py-3 text-sm font-black uppercase tracking-wide text-white shadow-lg transition-all ${
              isPending ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#529e14] hover:bg-[#458510] hover:scale-105'
            }`}
          >
            {isPending ? 'Saving...' : 'Update Property'}
          </button>
        </div>

      </form>
    </>
  );
}