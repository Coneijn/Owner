'use client'; 

import Link from 'next/link';
import { createProperty } from '@/lib/actions'; 
import { useActionState, useState, useCallback, useMemo } from 'react'; 
import ImageUpload, { ImageFile } from '@/app/components/ui/image-upload'; 
import dynamic from 'next/dynamic'; 

const LocationPicker = dynamic(() => import('@/app/components/ui/location-picker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-[#1a1a1a] animate-pulse rounded-lg flex items-center justify-center text-gray-500 font-bold uppercase tracking-wide text-xs">Cargando Mapa...</div>
});

interface Props {
  sellerProfileId: string;
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
    <div className="border border-gray-700/50 rounded-lg bg-gray-900/40 overflow-hidden mb-4 transition-all duration-200 shadow-sm">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-800/80 hover:bg-gray-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f8ed1a]/50"
      >
        <div className="flex items-center gap-3">
            {icon && <span className="text-lg">{icon}</span>}
            <h2 className="text-xs md:text-sm font-black text-white uppercase tracking-widest">{title}</h2>
        </div>
        <span className={`transform transition-transform duration-300 text-[#f8ed1a] ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      <div className={isOpen ? 'block p-6 border-t border-gray-700/50 animate-in fade-in slide-in-from-top-2 duration-300' : 'hidden'}>
        {children}
      </div>
    </div>
  );
};

export default function SellerNewPropertyForm({ sellerProfileId }: Props) {
  const [state, formAction, isPending] = useActionState(createProperty, null);
  
  // Estados de Operación
  const [isForSale, setIsForSale] = useState(true);
  const [isForRent, setIsForRent] = useState(false);
  
  // --- ESTADO DE VISIBILIDAD DEL VENDEDOR ---
  const [showSeller, setShowSeller] = useState<boolean>(true);
  
  // Estado para UX Smart (Cálculo automático)
  const [price, setPrice] = useState('');

  // Estados para Imágenes
  const [mainImageFiles, setMainImageFiles] = useState<ImageFile[]>([]);
  const [galleryImageFiles, setGalleryImageFiles] = useState<ImageFile[]>([]);

  // Estados de Ubicación para el LocationPicker
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateLoc, setStateLoc] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [coords, setCoords] = useState({ lat: 19.7028, lng: -101.1924 });

  const fullAddressQuery = `${address}, ${city}, ${stateLoc} ${zipCode}`;

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setCoords(prev => {
        if (prev.lat === lat && prev.lng === lng) return prev;
        return { lat, lng };
    });
  }, []);

  // Automatización inteligente: Calcula un seguro anual estimado basado en el precio
  const estimatedInsurance = useMemo(() => {
    const numericPrice = parseFloat(price);
    return isNaN(numericPrice) ? '0.00' : (numericPrice * 0.0035).toFixed(2);
  }, [price]);

  // Interceptar el formulario
  const handleFormSubmit = (formData: FormData) => {
    if (!isForSale) {
         formData.set('price', '0');
         formData.set('downPayment', '0');
         formData.set('interestRate', '0');
         formData.set('taxes', '0');
         formData.set('insurance', '0');
    } else {
         // Inyectar el cálculo automático si no se llenó manualmente
         if (!formData.get('insurance')) formData.set('insurance', estimatedInsurance);
    }
    
    formData.set('sellerProfileId', sellerProfileId);
    
    // --- ACTUALIZADO: Mandamos el valor real del estado showSeller ---
    formData.set('showSeller', showSeller ? 'true' : 'false');
    
    formData.set('latitude', coords.lat.toString());
    formData.set('longitude', coords.lng.toString());

    formAction(formData);
  };

  const inputStyles = "block w-full rounded-md bg-[#1a1a1a] border border-gray-700 py-2.5 px-4 text-white text-sm focus:ring-2 focus:ring-[#f8ed1a] focus:border-transparent outline-none transition-all placeholder-gray-600";
  const labelStyles = "block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-[#1a1a1a] py-10 font-sans text-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"></div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Agregar Propiedad</h1>
        <p className="mt-2 text-sm text-[#f8ed1a]/80 font-medium tracking-wide">COMPLETA LOS DETALLES DE TU NUEVA PROPIEDAD PARA PUBLICARLA.</p>
      </div>

      <form action={handleFormSubmit} className="space-y-6">
        
        <input type="hidden" name="mainImageData" value={JSON.stringify(mainImageFiles[0] || null)} />
        <input type="hidden" name="galleryImagesData" value={JSON.stringify(galleryImageFiles)} />

        <div className="space-y-4">

          {/* --- NUEVO: SECCIÓN PRIVACIDAD DEL VENDEDOR --- */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-5 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                  <h3 className="text-[#f8ed1a] font-black uppercase tracking-wide text-sm flex items-center gap-2">
                      <span>👤</span> Visibilidad de tu Perfil (Público)
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                      Permite que los compradores vean tu nombre, foto y rol en la página de la propiedad.
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
                  <span className="ml-3 text-sm font-bold text-white uppercase min-w-[70px]">
                      {showSeller ? 'Visible' : 'Oculto'}
                  </span>
              </label>
          </div>
          
          <AccordionSection title="Información Básica" defaultOpen={true} icon="📋">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className={labelStyles}>Título (Español) *</label>
                  <input name="titleEs" type="text" required className={inputStyles} placeholder="Ej. Casa de lujo en el centro" />
              </div>
              <div>
                  <label className={labelStyles}>Title (English) *</label>
                  <input name="titleEn" type="text" required className={inputStyles} placeholder="Ex. Luxury house downtown" />
              </div>

              <div className="col-span-1 md:col-span-2">
                  <label className={labelStyles}>Estado de la Propiedad</label>
                  <select name="status" className={inputStyles}>
                    <option value="AVAILABLE">Disponible (Available)</option>
                    <option value="DRAFT">Borrador (Draft)</option>
                    <option value="COMING_SOON">Próximamente (Coming Soon)</option>
                  </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                  <label className={labelStyles}>Slug (URL) *</label>
                  <input name="slug" type="text" required placeholder="ej-casa-en-centro" className={inputStyles} />
              </div>

              <div>
                  <label className={labelStyles}>Descripción (Español) *</label>
                  <textarea name="descriptionEs" rows={4} required className={inputStyles} placeholder="Describe la propiedad..." />
              </div>
              <div>
                  <label className={labelStyles}>Description (English) *</label>
                  <textarea name="descriptionEn" rows={4} required className={inputStyles} placeholder="Describe the property..." />
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Detalles Financieros" icon="💰">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="border border-gray-700/50 p-5 rounded-lg bg-[#1a1a1a]/50">
                <label className="flex items-center space-x-3 mb-5 cursor-pointer group">
                  <input type="checkbox" name="isForSale" checked={isForSale} onChange={(e) => setIsForSale(e.target.checked)} className="form-checkbox h-5 w-5 text-[#529e14] rounded bg-[#1a1a1a] border-gray-600 focus:ring-[#529e14] focus:ring-offset-gray-900 transition-colors" value="on" />
                  <span className="text-white font-bold uppercase tracking-wide text-sm group-hover:text-[#529e14] transition-colors">En Venta (For Sale)</span>
                </label>
                {isForSale && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className={labelStyles}>Precio Total *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input name="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required={isForSale} className={`${inputStyles} pl-8`} placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyles}>Enganche Mínimo</label>
                      <input name="downPayment" type="number" step="0.01" className={inputStyles} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">Seguro Anual Estimado: <span className="text-[#f8ed1a]">${estimatedInsurance}</span></label>
                    </div>
                  </div>
                )}
              </div>

              <div className="border border-gray-700/50 p-5 rounded-lg bg-[#1a1a1a]/50">
                <label className="flex items-center space-x-3 mb-5 cursor-pointer group">
                  <input type="checkbox" name="isForRent" checked={isForRent} onChange={(e) => setIsForRent(e.target.checked)} className="form-checkbox h-5 w-5 text-[#f8ed1a] rounded bg-[#1a1a1a] border-gray-600 focus:ring-[#f8ed1a] focus:ring-offset-gray-900 transition-colors" value="on" />
                  <span className="text-white font-bold uppercase tracking-wide text-sm group-hover:text-[#f8ed1a] transition-colors">En Renta (For Rent)</span>
                </label>
                {isForRent && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className={labelStyles}>Renta Mensual *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                        <input name="monthlyRent" type="number" step="0.01" required={isForRent} className={`${inputStyles} pl-8`} placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className={labelStyles}>Depósito de Seguridad</label>
                      <input name="securityDeposit" type="number" step="0.01" className={inputStyles} placeholder="0.00" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="Ubicación y Características" icon="🏠">
             <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="col-span-2">
                    <label className={labelStyles}>Dirección Completa *</label>
                    <input name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle y número" required className={inputStyles} />
                </div>
                
                <div>
                    <label className={labelStyles}>Ciudad *</label>
                    <input name="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad" required className={inputStyles} />
                </div>
                <div>
                    <label className={labelStyles}>Estado *</label>
                    <input name="state" value={stateLoc} onChange={(e) => setStateLoc(e.target.value)} placeholder="Estado" required className={inputStyles} />
                </div>
                <div className="col-span-2 md:col-span-1">
                    <label className={labelStyles}>Código Postal *</label>
                    <input name="zipCode" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="ZIP" required className={inputStyles} />
                </div>
                
                <div className="col-span-2 grid grid-cols-3 gap-4 mt-2 pt-4 border-t border-gray-700/50">
                  <div>
                    <label className={labelStyles}>Camas</label>
                    <input name="bedrooms" type="number" required className={inputStyles} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelStyles}>Baños</label>
                    <input name="bathrooms" type="number" step="0.5" required className={inputStyles} placeholder="0" />
                  </div>
                  <div>
                    <label className={labelStyles}>Metros (Sqft)</label>
                    <input name="sqft" type="number" required className={inputStyles} placeholder="0" />
                  </div>
                </div>
             </div>
             
             <div className="w-full mt-6 bg-[#1a1a1a] p-2 rounded-lg border border-gray-700/50">
                <label className={`${labelStyles} px-2 pt-2`}>Ajustar Pin en el Mapa</label>
                <div className="rounded-md overflow-hidden">
                    <LocationPicker 
                        lat={coords.lat} 
                        lng={coords.lng} 
                        searchQuery={fullAddressQuery}
                        onLocationChange={handleLocationChange} 
                    />
                </div>
             </div>
          </AccordionSection>

          <AccordionSection title="Fotos y Archivos Multimedia" icon="📸">
             <div className="space-y-8">
                <ImageUpload 
                  label="Imagen Principal (Cover)" 
                  value={mainImageFiles} 
                  onChange={setMainImageFiles} 
                  multiple={false} 
                />
                <div className="border-t border-gray-700/50 pt-8">
                    <ImageUpload 
                    label="Galería de Imágenes" 
                    value={galleryImageFiles} 
                    onChange={setGalleryImageFiles} 
                    multiple={true} 
                    />
                </div>
             </div>
          </AccordionSection>

        </div>

        {/* ERROR MESSAGE */}
        {state?.message && (
          <div className="rounded-md bg-red-900/20 p-4 border border-red-500/50 animate-in fade-in">
            <p className="text-xs uppercase tracking-wide font-bold text-red-400">{state.message}</p>
          </div>
        )}

        {/* SUBMIT BUTTON */}
        <div className="flex items-center justify-end gap-x-6 pt-6 mt-8 border-t border-gray-800">
          <Link href="/sellerDashboard/properties" className="text-xs uppercase tracking-wider font-bold text-gray-400 hover:text-white transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-[#529e14] px-8 py-3 text-sm font-black text-white shadow-lg shadow-[#529e14]/20 hover:bg-[#458510] hover:-translate-y-0.5 transition-all uppercase tracking-widest disabled:opacity-50 disabled:hover:translate-y-0 flex items-center"
          >
            {isPending ? 'Guardando...' : 'Crear Propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
}