'use client'; 

import Link from 'next/link';
import { createProperty } from '@/lib/actions';
import { useActionState, useState, useMemo, useRef, useCallback } from 'react'; 
import ImageUpload, { ImageFile } from '@/app/components/ui/image-upload'; 
import dynamic from 'next/dynamic'; 
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const LocationPicker = dynamic(() => import('@/app/components/ui/location-picker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-800 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

const libraries: ("places" | "visualization")[] = ["places", "visualization"];

// Tipos para los vendedores
interface SellerProfileOption {
  id: string;
  sellerName: string | null;
  sellerType: string;
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

// --- NUEVA INTERFAZ DE PROPS PARA EL COMPONENTE COMPARTIDO ---
interface SharedPropertyFormProps {
  sellers?: SellerProfileOption[];
  isAdmin: boolean;           // <- Nos dice si lo abre el Admin
  currentSellerId?: string;   // <- El ID del vendedor si lo abre un vendedor
}

export default function SharedPropertyForm({ sellers = [], isAdmin, currentSellerId }: SharedPropertyFormProps) {
    const [state, formAction, isPending] = useActionState(createProperty, null);
    
    // --- LÓGICA DE RUTAS SEGÚN EL ROL ---
    const cancelRoute = isAdmin ? '/admin' : '/dashboard-vendedor';
    
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: libraries 
    });

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    // Estados para imágenes
    const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>([]);
    const [galleryImageFiles, setGalleryImageFiles] = useState<ImageFile[]>([]);
    
    // --- ESTADO DEL VENDEDOR ---
    // Si no es admin, forzamos showSeller a true visualmente pero lo ocultamos después
    const [showSeller, setShowSeller] = useState<boolean>(!isAdmin); 
    
    // rent or sale
    const[isForRent, setIsForRent] = useState<boolean>(false);
    const[isForSale, setIsForSale] = useState<boolean>(true);

    // 1) Estado para controlar el STATUS
    const [status, setStatus] = useState<string>('AVAILABLE');
    const isStrict = status !== 'DRAFT' && status !== 'COMING_SOON';

    // 2) Estado para el PRECIO
    const [price, setPrice] = useState<number | string>('');
    
    // --- ESTADOS DE UBICACIÓN ---
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [stateLoc, setStateLoc] = useState('TN'); 
    const [zipCode, setZipCode] = useState('');
    
    const [coords, setCoords] = useState({ lat: 35.1495, lng: -90.0490 });
    
    const handleLocationChange = useCallback((lat: number, lng: number) => {
      setCoords(prev => {
          if (prev.lat === lat && prev.lng === lng) return prev;
          return { lat, lng };
      });
  }, []);
    const fullAddressQuery = `${address}, ${city}, ${stateLoc} ${zipCode}`;

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

    const calculatedInsurance = useMemo(() => {
      const p = Number(price);
      if (!p) return 2148; 
      if (p > 300000) return 2640;       
      if (p > 250000) return 2508;       
      if (p > 125000) return 2400;       
      return 2148;                       
    }, [price]);

    const handleFormSubmit = (formData: FormData) => {
        if (!isForSale) {
             formData.set('price', '0');
             formData.set('downPayment', '0');
             formData.set('interestRate', '0');
             formData.set('taxes', '0');
             formData.set('insurance', '0');
        }
        if (!isForRent) {
             formData.set('monthlyRent', '0');
             formData.set('securityDeposit', '0');
        }
        
        if (status === 'SOLD') formData.set('isForSale', 'on');
        if (status === 'RENTED') formData.set('isForRent', 'on');

        if (!isStrict) {
            const financialFields = ['price', 'downPayment', 'interestRate', 'taxes', 'monthlyRent', 'securityDeposit'];
            financialFields.forEach((field) => {
                const value = formData.get(field);
                if (!value || value === '') {
                    formData.set(field, '0');
                }
            });
        }
        
        // --- INYECCIÓN SILENCIOSA DEL VENDEDOR ---
        // Si es un vendedor quien está creando esto, inyectamos su ID y marcamos showSeller "on"
        if (!isAdmin && currentSellerId) {
            formData.set('sellerProfileId', currentSellerId);
            formData.set('showSeller', 'on'); // Forzamos que se muestre en el backend
        }

        formAction(formData);
    };

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-10 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-10 border-b border-gray-800 pb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-black leading-7 text-white uppercase tracking-tight sm:truncate">
              New Property
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Add a new home to the public catalog.
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href={cancelRoute}
              className="inline-flex items-center rounded-lg bg-white/5 border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 shadow-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Form */}
        <form action={handleFormSubmit} className="space-y-6 relative">
          
          <input type="hidden" name="mainImageData" value={JSON.stringify(mainImageFiles[0] || null)} />
          <input type="hidden" name="galleryImagesData" value={JSON.stringify(galleryImageFiles)} />

          {/* 1. STATUS, LOCATION & SPECS */}
          <AccordionSection title="Status, Location & Specs" icon="📍" defaultOpen={true}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                
                {/* Status & Slug */}
                <div className="sm:col-span-2">
                    <label className="block text-xs font-bold leading-6 text-[#f8ed1a] uppercase">Status</label>
                    <select 
                        name="status" 
                        value={status}
                        onChange={(e) => {
                            const newStatus = e.target.value;
                            setStatus(newStatus);
                            if (newStatus === 'SOLD') setIsForSale(true);
                            if (newStatus === 'RENTED') setIsForRent(true);
                        }}
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
                            className="mt-2 block w-full rounded bg-gray-800 border border-blue-500/50 text-white shadow-sm ring-1 ring-inset ring-blue-500/20 focus:ring-blue-500 sm:text-sm" 
                        />
                    </div>
                )}
                
                <div className={`${status === 'COMING_SOON' ? 'sm:col-span-2' : 'sm:col-span-4'}`}>
                    <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Slug (URL)</label>
                    <input 
                        type="text" 
                        name="slug" 
                        placeholder="e.g. 123-main-st-memphis" 
                        required 
                        className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                    />
                </div>

                {/* --- LOCATION (CON AUTOCOMPLETE) --- */}
                <div className="sm:col-span-4">
                    <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Address (Search Here)</label>
                    {isLoaded ? (
                        <Autocomplete
                            onLoad={(auto) => (autocompleteRef.current = auto)}
                            onPlaceChanged={onPlaceChanged}
                        >
                            <input 
                                type="text" 
                                name="address" 
                                required 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)} 
                                placeholder="Type to search Google Maps..."
                                className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm placeholder-gray-500" 
                            />
                        </Autocomplete>
                    ) : (
                        <input 
                            type="text" 
                            disabled
                            placeholder="Loading Maps..."
                            className="mt-2 block w-full rounded bg-gray-800 border-0 text-gray-500 cursor-not-allowed sm:text-sm" 
                        />
                    )}
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-xs font-bold leading-6 text-[#f8ed1a] uppercase">Contact Phone</label>
                    <input type="tel" name="phoneNumber" placeholder="901-660-4115" className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                </div>

                <div className="sm:col-span-2 sm:col-start-1">
                    <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">City</label>
                    <input 
                        type="text" 
                        name="city" 
                        required 
                        value={city}
                        onChange={(e) => setCity(e.target.value)} 
                        className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">State</label>
                    <input 
                        type="text" 
                        name="state" 
                        value={stateLoc}
                        onChange={(e) => setStateLoc(e.target.value)} 
                        className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                    />
                </div>
                
                <div className="sm:col-span-2">
                    <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Zip Code</label>
                    <input 
                        type="text" 
                        name="zipCode" 
                        required 
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                    />
                </div>

                {/* Specs */}
                <div className="sm:col-span-6 border-t border-gray-700 pt-6 mt-2">
                    <p className="text-[#f8ed1a] text-xs font-black uppercase mb-4">Specifications</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase">Bedrooms</label>
                            <input type="number" name="bedrooms" required className="mt-1 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase">Bathrooms</label>
                            <input type="number" step="0.5" name="bathrooms" required className="mt-1 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase">Sqft</label>
                            <input type="number" name="sqft" required className="mt-1 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase">Year</label>
                            <input type="number" name="yearBuilt" className="mt-1 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                        </div>
                    </div>
                </div>
            </div>
          </AccordionSection>

          {/* 2. ADVANCED CONFIG & SEO */}
          <AccordionSection title="Advanced Config & SEO" icon="⚙️">
            <div className="grid grid-cols-1 gap-6">
                <div className="flex gap-8 flex-wrap p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-start">
                        <div className="flex h-6 items-center">
                          <input id="isFeatured" name="isFeatured" type="checkbox" className="h-5 w-5 rounded bg-gray-800 border-gray-600 text-[#529e14] focus:ring-[#529e14]" />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="isFeatured" className="text-sm font-bold text-white block">Featured Property</label>
                          <span className="text-xs text-gray-400">Shows in the <strong className="text-[#f8ed1a]">Home Page Carousel</strong>.</span>
                        </div>
                    </div>
                    
                    <div className="flex items-start">
                        <div className="flex h-6 items-center">
                          <input id="isOffMarket" name="isOffMarket" type="checkbox" className="h-5 w-5 rounded bg-gray-800 border-gray-600 text-red-500 focus:ring-red-500" />
                        </div>
                        <div className="ml-3">
                          <label htmlFor="isOffMarket" className="text-sm font-bold text-white block">Off Market Deal</label>
                          <span className="text-xs text-gray-400">Activates the <strong className="text-[#f8ed1a]">Yellow Label</strong>.</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-[#f8ed1a] uppercase">Calendar Link</label>
                    <input type="url" name="calendarLink" placeholder="https://cal.com/..." className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">SEO English</h4>
                        <input type="text" name="seoTitleEn" placeholder="Meta Title" className="mb-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                        <textarea name="seoDescriptionEn" rows={2} placeholder="Meta Desc" className="block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">SEO Spanish</h4>
                        <input type="text" name="seoTitleEs" placeholder="Meta Title" className="mb-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                        <textarea name="seoDescriptionEs" rows={2} placeholder="Meta Desc" className="block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm"></textarea>
                    </div>
                </div>
            </div>
          </AccordionSection>

          {/* 3. FINANCIAL DATA */}
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
                            <label className="block text-xs font-bold leading-6 text-white uppercase">
                                Total Price ($) {isStrict && <span className="text-red-500">*</span>}
                            </label>
                            <input 
                                type="number" 
                                step="0.01" 
                                name="price" 
                                onChange={(e) => setPrice(e.target.value)}
                                required={isStrict && isForSale}
                                min={isStrict ? "1" : "0"} 
                                placeholder={!isStrict ? "0.00" : ""}
                                className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm" 
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold leading-6 text-white uppercase">
                                Down Payment {isStrict && <span className="text-red-500">*</span>}
                            </label>
                            <select 
                                name="downPayment" 
                                required={isStrict && isForSale}
                                defaultValue={isStrict ? "10000" : "0"}
                                className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#f8ed1a] sm:text-sm"
                            >
                                
                                <option value="10000">$10,000</option>
                                <option value="20000">$20,000</option>
                                <option value="30000">$30,000</option>
                                <option value="40000">$40,000</option>
                                <option value="50000">$50,000</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold leading-6 text-white uppercase">
                                Interest Rate (%) {isStrict && <span className="text-red-500">*</span>}
                            </label>
                            <input 
                                type="number" 
                                step="0.01" 
                                name="interestRate" 
                                defaultValue="10.0" 
                                required={isStrict && isForSale} 
                                min={isStrict ? "0.01" : "0"}
                                className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm" 
                            />
                        </div>
                        
                        <div className="sm:col-span-3">
                            <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">
                                Annual Taxes ($) {isStrict && <span className="text-red-500">*</span>}
                            </label>
                            <input 
                                type="number" 
                                step="0.01" 
                                name="taxes" 
                                required={isStrict && isForSale}
                                min={isStrict ? "1" : "0"}
                                placeholder={!isStrict ? "0.00" : ""}
                                className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm" 
                            />
                        </div>
                        
                        <input type="hidden" name="insurance" value={calculatedInsurance} />
                        <div className="sm:col-span-3">
                            <label className="block text-xs font-bold leading-6 text-gray-500 uppercase">Estimated Annual Insurance</label>
                            <div className="mt-2 block w-full py-2 px-3 rounded bg-gray-800/50 border border-gray-700 text-gray-400 sm:text-sm cursor-not-allowed">
                                ${calculatedInsurance.toLocaleString()} (Auto-calculated)
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </AccordionSection>

          {/* 3.5 RENTAL DATA */}
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
                      Monthly Rent ($) {isStrict && isForRent && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="monthlyRent"
                      placeholder="0.00"
                      required={isStrict && isForRent}
                      className="mt-2 block w-full rounded bg-gray-800 text-white ring-1 ring-gray-600 focus:ring-[#529e14] sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold leading-6 text-white uppercase">
                      Security Deposit ($) {isStrict && isForRent && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="securityDeposit"
                      placeholder="0.00"
                      required={isStrict && isForRent}
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
                    <input type="url" name="videoUrl" placeholder="https://youtube.com..." className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 pt-4 border-t border-gray-700">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">🇺🇸 English Content</h3>
                        <input type="text" name="titleEn" placeholder="Title EN" required className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                        <textarea name="descriptionEn" rows={4} placeholder="Description EN" className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-[#f8ed1a] uppercase">🇲🇽 Spanish Content</h3>
                        <input type="text" name="titleEs" placeholder="Title ES" required className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
                        <textarea name="descriptionEs" rows={4} placeholder="Description ES" className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase">Features (Comma separated)</label>
                    <textarea name="features" rows={2} className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"></textarea>
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
                          placeholder="e.g. 1234" 
                          className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" 
                        />
                    </div>
                </div>
            </div>
          </AccordionSection>

          {/* 5. SELLER PROFILE (SOLO VISIBLE PARA ADMIN) */}
          {isAdmin && (
            <AccordionSection title="Seller Profile" icon="👤">
               <div className="space-y-6">
                  <div className="flex items-center">
                      <input 
                        id="showSeller" 
                        name="showSeller" 
                        type="checkbox" 
                        checked={showSeller} 
                        onChange={(e) => setShowSeller(e.target.checked)} 
                        className="h-5 w-5 rounded bg-gray-800 text-[#529e14]" 
                      />
                      <label htmlFor="showSeller" className="ml-2 text-sm font-bold text-white">
                        Show "Meet Seller" Section
                      </label>
                  </div>
                  
                  {showSeller && (
                      <div className="animate-in fade-in">
                          <label className="block text-xs font-bold text-[#f8ed1a] uppercase mb-2">Select a Seller Profile</label>
                          <select 
                            name="sellerProfileId" 
                            className="block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm p-3"
                          >
                              <option value="">-- No seller selected --</option>
                              {sellers.map((seller) => (
                                  <option key={seller.id} value={seller.id}>
                                      {seller.sellerName || 'Unnamed Profile'} ({seller.sellerType})
                                  </option>
                              ))}
                          </select>
                          <p className="text-xs text-gray-400 mt-2">
                            You can create new profiles in the <Link href="/admin/sellers/new" className="text-[#529e14] hover:underline">Seller Profiles Manager</Link>.
                          </p>
                      </div>
                  )}
               </div>
            </AccordionSection>
          )}

          {/* ERROR MESSAGE */}
          {state?.message && (
            <div className="rounded-md bg-red-900/30 p-4 border border-red-800">
              <p className="text-sm text-red-400">{state.message}</p>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="flex items-center justify-end gap-x-6 pt-6 border-t border-gray-800 pb-16">
            <Link href={cancelRoute} className="text-sm font-bold leading-6 text-gray-400 hover:text-white transition-colors">Cancel</Link>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#529e14] px-8 py-3 text-sm font-black text-white shadow-lg hover:bg-[#458510] hover:scale-105 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Create Property'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}