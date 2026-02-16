'use client';

import Link from 'next/link';
import { useActionState, useState, useRef } from 'react'; 
import { updateProperty } from '@/lib/actions';
import ImageUpload, { ImageFile } from '@/app/admin/ui/image-upload'; 
import dynamic from 'next/dynamic';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

// Importamos el mapa dinámicamente (sin SSR)
const LocationPicker = dynamic(() => import('@/app/admin/ui/location-picker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-800 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

// NUEVO: Definimos librerías fuera
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
  sellerType?: string | null;
  sellerName?: string | null;
  sellerImage?: string | null;
  
  latitude?: number | string | null;
  longitude?: number | string | null;
  lockboxCode?: string | null;
  availableDate?: Date | string | null; 

   isForSale?: boolean;

   isForRent?: boolean;
   monthlyRent?: number | null;
   securityDeposit?: number | null;
}

// --- HELPER COMPONENT: ACCORDION (CORREGIDO) ---
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
      
      {/* CORRECCIÓN AQUI: 
         Usamos una clase CSS condicional ('block' vs 'hidden') en lugar de 
         renderizado condicional ({isOpen && ...}). 
         Esto mantiene los inputs en el DOM para que FormData los capture.
      */}
      <div className={isOpen ? 'block p-6 border-t border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200' : 'hidden'}>
        {children}
      </div>
    </div>
  );
};

export default function EditForm({ property }: { property: PropertyData }) {
  const [state, formAction, isPending] = useActionState(updateProperty, null);
    
    //seal & rental states
    const [isForSale, setIsForSale] = useState<boolean>(property.isForSale ?? true);
    const [isForRent, setIsForRent] = useState<boolean>(property.isForRent || false);

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
  const [sellerImageFiles, setSellerImageFiles] = useState<ImageFile[]>(property.sellerImage ? [{ url: property.sellerImage }] : []);
  const [showSeller, setShowSeller] = useState<boolean>(property.showSeller || false);

  // --- LOCATION STATE ---
  const [address, setAddress] = useState(property.address || '');
  const [city, setCity] = useState(property.city || '');
  const [stateLoc, setStateLoc] = useState(property.state || 'TN');
  const [zipCode, setZipCode] = useState(property.zipCode || '');
  
  const [coords, setCoords] = useState({ 
    lat: Number((property as any).latitude) || 35.1495, 
    lng: Number((property as any).longitude) || -90.0490 
  });

  const handleLocationChange = (lat: number, lng: number) => {
      setCoords({ lat, lng });
  };
  
  const fullAddressQuery = `${address}, ${city}, ${stateLoc} ${zipCode}`;

  // --- NUEVO: Manejador de Autocomplete ---
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

  // --- SMS ALERT STATE ---
  const [smsTarget, setSmsTarget] = useState<'ZIP' | 'ALL'>('ZIP');
  const [smsMessage, setSmsMessage] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsStatus, setSmsStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [showSmsModal, setShowSmsModal] = useState(false);

  const handlePreSendSms = () => {
    if (!smsMessage.trim()) {
        setSmsStatus({ type: 'error', msg: 'Please enter a message body before sending.' });
        return;
    }
    setSmsStatus(null);
    setShowSmsModal(true);
  };

  const executeSendSms = async () => {
    setShowSmsModal(false);
    setIsSendingSms(true);
    
    try {
        const webhookUrl = "https://services.leadconnectorhq.com/hooks/sD7ANbPAIA28p65ZSvJl/webhook-trigger/60c52337-437d-42f5-b553-5e489e2bc5b5";
        
        const payload = {
            propertyId: property.id,
            propertySlug: property.slug,
            propertyTitle: property.titleEn,
            targetAudience: smsTarget, 
            targetZipCode: zipCode, 
            messageBody: smsMessage,
            sentAt: new Date().toISOString()
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            setSmsStatus({ type: 'success', msg: '✅ Alert queued successfully! Drip campaign started.' });
            setSmsMessage(''); 
        } else {
            setSmsStatus({ type: 'error', msg: '❌ Failed to trigger webhook.' });
        }
    } catch (error) {
        setSmsStatus({ type: 'error', msg: '❌ Network error sending alert.' });
    } finally {
        setIsSendingSms(false);
    }
  };

  return (
    <>
      <form action={formAction} className="space-y-6 relative">
        
        {/* HIDDEN INPUTS */}
        <input type="hidden" name="id" value={property.id} />
        <input type="hidden" name="mainImageData" value={JSON.stringify(mainImageFiles[0] || null)} />
        <input type="hidden" name="galleryImagesData" value={JSON.stringify(galleryImageFiles)} />

        {/* 1. STATUS & LOCATION (Default Open) */}
        <AccordionSection title="Status, Location & Specs" icon="📍" defaultOpen={true}>
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              
              {/* Status & Slug */}
              <div className="sm:col-span-2">
                  <label className="block text-xs font-bold leading-6 text-[#f8ed1a] uppercase">Status</label>
                  <select 
                    name="status" 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm"
                  >
                      <option value="AVAILABLE">Available</option>
                      <option value="UNDER_CONTRACT">Under Contract</option>
                      <option value="SOLD">Sold</option>
                      <option value="DRAFT">Draft</option>
                      <option value="COMING_SOON">Coming Soon</option>
                  </select>
              </div>

              {/* Status Conditional: Este input sí queremos que desaparezca si no es COMING_SOON, o podemos dejarlo oculto */}
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
                  <input type="text" name="phoneNumber" defaultValue={property.phoneNumber || '901-660-4115'}  className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>
              <div className="sm:col-span-6">
                  <label className="block text-xs font-bold leading-6 text-gray-400 uppercase">Slug (URL)</label>
                  <input type="text" name="slug" defaultValue={property.slug} required className="mt-2 block w-full rounded bg-gray-800 border-0 text-white shadow-sm ring-1 ring-inset ring-gray-700 focus:ring-[#f8ed1a] sm:text-sm" />
              </div>

              {/* --- LOCATION (CON AUTOCOMPLETE) --- */}
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
                  </div>
                  <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">SEO Spanish</h4>
                      <input type="text" name="seoTitleEs" placeholder="Meta Title" defaultValue={property.seoTitleEs || ''} className="mb-2 block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                      <textarea name="seoDescriptionEs" rows={2} placeholder="Meta Desc" defaultValue={property.seoDescriptionEs || ''} className="block w-full rounded bg-gray-900 border-0 text-white ring-1 ring-gray-700 sm:text-sm"></textarea>
                  </div>
              </div>
          </div>
        </AccordionSection>

        {/* 3. FINANCIALS */}
        <AccordionSection title="Financial Data (Sale)" icon="💰">
          <div className="space-y-6">
              
              {/* CHECKBOX VENTA */}
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

              {/* NOTA: Aquí 'isForSale' es una decisión lógica de negocio. 
                 Si el usuario desmarca 'isForSale', es correcto que los inputs 
                 desaparezcan y no se envíen (o se envíen vacíos).
                 Mantenemos esto condicional porque es funcional, no solo visual.
              */}
              {isForSale && (
                  <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 animate-in fade-in slide-in-from-top-2">
                      <div className="sm:col-span-2">
                          <label className="block text-xs font-bold leading-6 text-white uppercase">Total Price ($)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            name="price" 
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

        {/* 3.5 RENTAL INFO (Solo si isForRent es true) */}
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

        {/* 4.5 LOCATION & ACCESS (Interactivo con Mapa) */}
        <AccordionSection title="Location & Access" icon="🐸🗺️">
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

        {/* 5. SELLER INFO */}
        <AccordionSection title="Seller Profile" icon="👤">
          <div className="space-y-6">
              <div className="flex items-center">
                  <input id="showSeller" name="showSeller" type="checkbox" checked={showSeller} onChange={(e) => setShowSeller(e.target.checked)} className="h-5 w-5 rounded bg-gray-800 text-[#529e14]" />
                  <label htmlFor="showSeller" className="ml-2 text-sm font-bold text-white">Show "Meet Seller" Section</label>
              </div>
              {showSeller && (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 animate-in fade-in">
                      <div>
                          <label className="block text-xs font-bold text-[#f8ed1a] uppercase">Role</label>
                          <select name="sellerType" defaultValue={property.sellerType || 'OWNER'} className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 sm:text-sm">
                              <option value="OWNER">Owner (Dueño)</option>
                              <option value="AGENT">Agent (Vendedor)</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-[#f8ed1a] uppercase">Name</label>
                          <input type="text" name="sellerName" defaultValue={property.sellerName || ''} className="mt-2 block w-full rounded bg-gray-800 border-0 text-white ring-1 ring-gray-700 sm:text-sm" />
                      </div>
                      <div className="sm:col-span-2">
                          <input type="hidden" name="sellerImage" value={sellerImageFiles[0]?.url || ''} />
                          <ImageUpload 
                            label="Seller Photo" 
                            value={sellerImageFiles} 
                            onChange={(files) => setSellerImageFiles(files)} 
                            multiple={false}
                            disableMetadata={true} 
                          />
                      </div>
                  </div>
              )}
          </div>
        </AccordionSection>

        {/* 6. MARKETING ALERTS (SMS) */}
        <AccordionSection title="Marketing: Send SMS Alert" icon="📲">
          <div className="bg-[#529e14]/10 p-6 rounded-lg border border-[#529e14]/30">
              <div className="grid grid-cols-1 gap-6">
                  <div>
                      <label className="block text-xs font-bold text-[#f8ed1a] uppercase mb-2">Target Audience</label>
                      <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                  type="radio" 
                                  name="smsTarget" 
                                  value="ZIP" 
                                  checked={smsTarget === 'ZIP'} 
                                  onChange={() => setSmsTarget('ZIP')}
                                  className="text-[#529e14] focus:ring-[#529e14] bg-gray-800 border-gray-600"
                              />
                              <span className="text-white text-sm">Target Zip Code Only ({zipCode})</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                  type="radio" 
                                  name="smsTarget" 
                                  value="ALL" 
                                  checked={smsTarget === 'ALL'} 
                                  onChange={() => setSmsTarget('ALL')}
                                  className="text-[#529e14] focus:ring-[#529e14] bg-gray-800 border-gray-600"
                              />
                              <span className="text-white text-sm">All Active Buyers</span>
                          </label>
                      </div>
                  </div>
                  
                  <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Message Body</label>
                      <textarea 
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                          placeholder="New property alert! Check out this deal in..."
                          rows={3} 
                          className="block w-full rounded-md border-0 py-2 bg-gray-900 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-[#529e14] sm:text-sm"
                      ></textarea>
                  </div>

                  <div className="flex items-center justify-between">
                      <div className="text-sm">
                          {smsStatus && (
                              <span className={`font-bold ${smsStatus.type === 'success' ? 'text-[#529e14]' : 'text-red-500'}`}>
                                  {smsStatus.msg}
                              </span>
                          )}
                      </div>
                      <button 
                          type="button" 
                          onClick={handlePreSendSms}
                          disabled={isSendingSms || !smsMessage}
                          className={`px-4 py-2 rounded font-bold uppercase text-xs tracking-wider text-white shadow-lg transition-all ${
                              isSendingSms ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
                          }`}
                      >
                          {isSendingSms ? 'Sending...' : '🚀 Send SMS Alert'}
                      </button>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase">* This action triggers a webhook to GHL (10 SMS/hr drip).</p>
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
          <Link href="/admin" className="text-sm font-bold leading-6 text-gray-400 hover:text-white">Cancel</Link>
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

      {/* --- CONFIRMATION MODAL --- */}
      {showSmsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-800 border border-gray-600 rounded-xl p-8 max-w-lg w-full shadow-2xl transform scale-100">
                <div className="flex items-center gap-3 mb-4 text-[#f8ed1a]">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h3 className="text-2xl font-black uppercase">Confirm SMS Alert</h3>
                </div>
                
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    You are about to send an SMS blast to: <br/>
                    <strong className="text-white text-xl block mt-2 p-3 bg-gray-900 rounded border border-gray-700 text-center">
                        {smsTarget === 'ZIP' ? `Buyers in Zip Code: ${zipCode}` : 'ALL Active Buyers'}
                    </strong>
                </p>
                
                <div className="bg-gray-900/50 p-4 rounded mb-6 border-l-4 border-[#529e14]">
                    <p className="text-gray-400 text-xs uppercase font-bold mb-1">Message Preview:</p>
                    <p className="text-white italic">"{smsMessage}"</p>
                </div>

                <div className="flex justify-end gap-4">
                    <button 
                        onClick={() => setShowSmsModal(false)} 
                        className="px-6 py-3 rounded font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={executeSendSms} 
                        className="px-6 py-3 rounded bg-[#529e14] hover:bg-[#458510] text-white font-black uppercase shadow-lg hover:scale-105 transition-all"
                    >
                        Yes, Send Alert
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}