'use client';

import { useState, useEffect } from 'react';
import { submitSellerLead } from '@/lib/ghl-actions';
import ImageUpload, { ImageFile } from '@/app/components/ui/image-upload'; 
import { createDraftPropertyFromFunnel, updateDraftPropertyMedia } from '@/lib/actions'; 

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'es' | 'en';
  prefillData?: any; 
}

type StepType = "property" | "details" | "contact" | "media" | "pricing" | "howItWorks" | "schedule" | "done";

const MONTHLY_SERVICE_FEE = 129;
const DOWN_PAYMENT_MIN = 10000;
const DOWN_PAYMENT_MAX = 20000;
const INTEREST_MIN = 10;
const INTEREST_MAX = 12;
const LISTING_FEE_PCT = 0.5;
const LISTING_FEE_CAP = 10000;
const TERM_YEARS = 15;

function calcMonthlyNote(principal: number, annualRate: number, years: number) {
  const r = annualRate / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const DICTIONARY = {
  es: {
    property: { title: "Ubicación de la Propiedad", street: "Dirección", city: "Ciudad", state: "Estado", zip: "Código Postal", btn: "Continuar ->" },
    details: { 
      title: "Detalles de la Propiedad", beds: "Habitaciones", baths: "Baños", sqft: "Pies Cuadrados", year: "Año Const.", 
      price: "Precio de Venta ($)", downPayment: "Enganche ($)", interestRate: "Tasa de Interés (%)", taxes: "Impuestos Anuales ($)", insurance: "Seguro Anual ($)", monthlyRent: "Renta Mensual ($)",
      saleSection: "Datos Financieros (Venta)", rentSection: "Datos Financieros (Renta)", physicalSection: "Características Físicas",
      cond: "Condición", desc: "Descripción Breve", 
      lotSize: "Tamaño Lote (SqFt)", garage: "Garaje", confirmBtn: "Confirmar Información ->", editBtn: "✏️ Editar", saveBtn: "Guardar Cambios",
      condOpts: [{id: "excellent", label: "Excelente", emoji: "✨"}, {id: "good", label: "Buena", emoji: "👍"}, {id: "fair", label: "Regular", emoji: "🔧"}, {id: "poor", label: "Necesita Trabajo", emoji: "🏚"}], btn: "Continuar ->" 
    },
    contact: { title: "Tus Datos de Contacto", sub: "Ingresa tus datos para guardar tu progreso y contactarte.", fname: "Nombre", lname: "Apellido", phone: "Celular", email: "Correo Electrónico", btn: "Continuar ->", loading: "Procesando..." },
    media: { title: "Fotos y Acceso", sub: "Para publicar tu casa, necesitamos fotos y cómo acceder a ella.", photos: "Fotos de la Propiedad", code: "Código de Acceso (Lockbox)", codePlaceholder: "Ej. 1234 o 'No tiene'", btn: "Continuar ->", loading: "Guardando..." },
    pricing: { title: "Tus Ganancias Estimadas", asking: "Precio de Venta", down: "Enganche (Recibes tú)", financed: "Monto a Financiar", interest: "Tasa de Interés", term: "Plazo", gross: "Pago Mensual Bruto", fee: "Cuota de Administración", net: "Ingreso Mensual Neto", oneTime: "Tarifa Única de Publicación (paga el comprador)", oneTimeSub1: "50% del enganche, tope a $10,000", oneTimeSub2: "*Esta tarifa sale del enganche del comprador — no de tu bolsillo. Conservas tu precio íntegro.", disclaimer: "📌 Estos son estimados basados en tu precio de venta. Los términos finales se acuerdan entre tú y el comprador.", btn: "Cómo Funciona ->" },
    howItWorks: { title: "Cómo Funciona", pts: [{icon: "🏷️", title: "Tú estableces el precio", body: "Los compradores darán un enganche de $10k–$20k."}, {icon: "📈", title: "Interés del 10–12%", body: "Actúas como el banco a 15 años."}, {icon: "💵", title: "Cobramos 50% del enganche", body: "Como tarifa al comprador (tope $10k)."}, {icon: "🔧", title: "$129/mes de administración", body: "Manejamos la amortización y papeleo."}], btn: "Agendar Llamada ->" },
    schedule: { title: "Agenda tu Llamada", sub: "Elige un horario para afinar los detalles de tu publicación.", booked: "¿Ya agendaste? Continuar ->", doneTitle: "¡Llamada Agendada!", doneSub: "Revisa tu teléfono y correo para la confirmación.", btn: "Terminar ->" },
    done: { title: "¡Todo Listo", sub: "Tu propiedad está en proceso y tu llamada agendada.", next: "Qué pasa después:", pts: [["📅", "Recibirás recordatorios de tu llamada"], ["📸", "Revisaremos las fotos enviadas"], ["🌐", "Saldrás en ownertodueno.com"], ["💰", "Al conectar comprador, inician pagos"]], link: "<- Volver al inicio" },
    back: "<- Volver",btn: "Obtener mi Oferta ->"
  },
  en: {
    property: { title: "Property Location", street: "Street Address", city: "City", state: "State", zip: "Zip Code", btn: "Continue ->" },
    details: { 
      title: "Property Details", beds: "Bedrooms", baths: "Bathrooms", sqft: "Sq Ft", year: "Year Built", 
      price: "Asking Price ($)", downPayment: "Down Payment ($)", interestRate: "Interest Rate (%)", taxes: "Annual Taxes ($)", insurance: "Annual Insurance ($)", monthlyRent: "Monthly Rent ($)",
      saleSection: "Financial Data (Sale)", rentSection: "Financial Data (Rent)", physicalSection: "Physical Features",
      cond: "Condition", desc: "Brief Description", 
      lotSize: "Lot Size (SqFt)", garage: "Garage", confirmBtn: "Confirm Information ->", editBtn: "✏️ Edit", saveBtn: "Save Changes",
      condOpts: [{id: "excellent", label: "Excellent", emoji: "✨"}, {id: "good", label: "Good", emoji: "👍"}, {id: "fair", label: "Fair", emoji: "🔧"}, {id: "poor", label: "Needs Work", emoji: "🏚"}], btn: "Continue ->" 
    },
    contact: { title: "Your Contact Info", sub: "Enter your details to save your progress and get in touch.", fname: "First Name", lname: "Last Name", phone: "Cell Number", email: "Email Address", btn: "Continue ->", loading: "Processing..." },
    media: { title: "Photos & Access", sub: "To list your home, we need photos and access instructions.", photos: "Property Photos", code: "Access Code (Lockbox)", codePlaceholder: "E.g. 1234 or 'No lockbox'", btn: "Continue ->", loading: "Saving..." },
    pricing: { title: "Your Estimated Earnings", asking: "Asking Price", down: "Down Payment (To You)", financed: "Financed Amount", interest: "Interest Rate", term: "Term", gross: "Gross Monthly Payment", fee: "Admin Fee", net: "Net Monthly Income", oneTime: "One-Time Listing Fee (paid by buyer)", oneTimeSub1: "50% of down payment, capped at $10k", oneTimeSub2: "*This fee comes out of the buyer's down payment. You keep your full asking price.", disclaimer: "📌 These are estimates based on your asking price. Final terms are agreed upon between you and your buyer.", btn: "How It Works ->" },
    howItWorks: { title: "How It Works", pts: [{icon: "🏷️", title: "You set the asking price", body: "Buyers will make a down payment of $10k–$20k."}, {icon: "📈", title: "Interest rate: 10–12%", body: "You act as the bank for 15 years."}, {icon: "💵", title: "We collect 50% of down payment", body: "As a placement fee (capped at $10k)."}, {icon: "🔧", title: "$129/month admin fee", body: "We manage amortization and paperwork."}], btn: "Book Your Call ->" },
    schedule: { title: "Book Your Call", sub: "Pick a time to fine-tune your listing details.", booked: "Already booked? Continue ->", doneTitle: "Call Booked!", doneSub: "Check your phone and email for confirmation.", btn: "Finish ->" },
    done: { title: "You're All Set", sub: "Your property is being processed and your call is booked.", next: "What happens next:", pts: [["📅", "You'll receive call reminders"], ["📸", "We'll review your uploaded photos"], ["🌐", "Your listing goes live"], ["💰", "Once matched, payments begin"]], link: "<- Back to home" },
    btn: "Get My Offer ->", back: "<- Back"
  }
};

export default function SellerFunnelModal({ isOpen, onClose, lang, prefillData }: ModalProps) {
  const t = DICTIONARY[lang];
  
  const currentFlow: StepType[] = prefillData 
    ? ["property", "details","contact", "media", "schedule", "done"] 
    : ["property", "details", "contact", "pricing", "howItWorks", "media", "schedule", "done"];

  const [stepId, setStepId] = useState<StepType>(currentFlow[0]);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  
  const [draftPropertyId, setDraftPropertyId] = useState<string | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [data, setData] = useState({
    street: '', city: '', state: '', zip: '',
    beds: '', baths: '', sqft: '', yearBuilt: '', 
    askingPrice: '', downPayment: '', interestRate: '', taxes: '', insurance: '', monthlyRent: '', // Campos financieros agregados
    lotSize: '', garage: '', // Campos físicos agregados
    condition: 'good', description: '',
    firstName: '', lastName: '', phone: '', email: '',
    photos: [] as ImageFile[],
    accessCode: '',
    strategySelected: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (prefillData) {
        setData(prev => ({
          ...prev,
          street: prefillData.parsedAddress?.street || prefillData.address || '',
          city: prefillData.parsedAddress?.city || '',
          state: prefillData.parsedAddress?.state || '',
          zip: prefillData.parsedAddress?.zip || '',
          beds: prefillData.propertyDetails?.bedrooms?.toString() || '',
          baths: prefillData.propertyDetails?.bathrooms?.toString() || '',
          sqft: prefillData.propertyDetails?.sqft?.toString() || '',
          yearBuilt: prefillData.propertyDetails?.yearBuilt?.toString() || '',
          lotSize: prefillData.propertyDetails?.lotSize?.toString() || '',
          garage: prefillData.propertyDetails?.garage?.toString() || '',

          askingPrice: prefillData.inputs?.arv?.toString() || '',
          strategySelected: prefillData.strategySelected || '',
          // Precarga de los nuevos datos del widget
          downPayment: prefillData.inputs?.sfDownPaymentFlat?.toString() || '',
          interestRate: prefillData.inputs?.sfInterestRate?.toString() || '',
         taxes: prefillData.inputs?.taxesAnnual !== undefined ? prefillData.inputs.taxesAnnual.toString() : '',
         insurance: prefillData.inputs?.insuranceAnnual !== undefined ? prefillData.inputs.insuranceAnnual.toString() : '',
          monthlyRent: prefillData.inputs?.estimatedRent?.toString() || '',
        }));
        setStepId("property"); // Inician en property para revisar dirección
        setIsEditingDetails(false);
      } else {
        setStepId("property");
        setIsEditingDetails(true); // Si no hay prefill, empiezan editando
      }
    }
  }, [isOpen, prefillData]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && (e.data.type === "booking-confirmed" || e.data === "booking-confirmed")) setBooked(true);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!isOpen) return null;

  const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.value });
  const handlePropChange = (key: string, val: any) => setData(prev => ({ ...prev, [key]: val }));

  const goNext = () => setStepId(currentFlow[currentFlow.indexOf(stepId) + 1]);
  const goBack = () => setStepId(currentFlow[currentFlow.indexOf(stepId) - 1]);

  // FASE 1: Se crea el Lead en GHL y la propiedad DRAFT en la BD
  const handleSubmitContact = async () => {
  setLoading(true);
  
  try {
    await submitSellerLead(data); 

    
      const draftPayload = {
        ...data,
        phoneNumber: data.phone,
        beds: Number(data.beds) || 0,
        baths: Number(data.baths) || 0,
        sqft: Number(data.sqft) || 0,
        lotSize: data.lotSize ? Number(data.lotSize) : null,
        yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : null,
        askingPrice: Number(data.askingPrice) || 0,
        downPayment: Number(data.downPayment) || 0,
        interestRate: Number(data.interestRate) || 0,
        taxes: Number(data.taxes) || 0,
        insurance: Number(data.insurance) || 0,
        monthlyRent: Number(data.monthlyRent) || 0,
        garage: data.garage ? Number(data.garage) : null,
      };

      const result = await createDraftPropertyFromFunnel(draftPayload);

    if (result.success && result.propertyId) {
      setDraftPropertyId(result.propertyId);
    }
  } catch (error) {
    console.error("Error al guardar los datos:", error);
  } finally {
    setLoading(false);
    goNext();
  }
};

  // FASE 2: Se adjuntan las fotos y el lockbox al DRAFT existente
  const handleSubmitMedia = async () => {
      setLoading(true);
      try {
          if (draftPropertyId) {
             await updateDraftPropertyMedia(draftPropertyId, data.photos, data.accessCode);
          }
      } catch(error) {
          console.error("Error al guardar media", error);
      } finally {
          setLoading(false);
          goNext();
      }
  }

  const price = parseInt(data.askingPrice) || 185000;
  const downLow = Math.min(Math.max(price * 0.07, DOWN_PAYMENT_MIN), DOWN_PAYMENT_MAX);
  const downHigh = Math.min(Math.max(price * 0.12, DOWN_PAYMENT_MIN), DOWN_PAYMENT_MAX);
  const listingFee = Math.min(downHigh * LISTING_FEE_PCT, LISTING_FEE_CAP);
  const noteAfterDown = price - downHigh;
  const monthlyLow = calcMonthlyNote(price - downHigh, INTEREST_MIN / 100, TERM_YEARS);
  const monthlyHigh = calcMonthlyNote(price - downLow, INTEREST_MAX / 100, TERM_YEARS);
  const netLow = Math.max(0, monthlyLow - MONTHLY_SERVICE_FEE);
  const netHigh = Math.max(0, monthlyHigh - MONTHLY_SERVICE_FEE);

  const inputClass = "w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-[#f8ed1a] outline-none transition-colors mb-4";
  const labelClass = "text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2";
  const btnPrimary = "w-full py-4 mt-2 bg-[#529e14] text-white font-black uppercase tracking-wide rounded-lg shadow-lg hover:bg-[#458510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center";
  const btnBack = "w-full py-3 mt-4 bg-transparent border border-gray-700 text-gray-400 font-bold uppercase tracking-wide rounded hover:text-white hover:border-gray-500 transition-colors";

  const currentIdx = currentFlow.indexOf(stepId);
  const totalProgSteps = currentFlow.length - 1; 
  const progressPct = stepId !== "done" ? Math.round((currentIdx / totalProgSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-xl relative shadow-2xl my-8">
        
        {stepId !== "done" && (
          <div className="w-full bg-gray-800 rounded-t-2xl h-2 overflow-hidden">
            <div className="bg-[#f8ed1a] h-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white font-bold text-xl transition-colors z-50">✕</button>

        <div className="p-6 sm:p-8">

          {/* PASO 1: PROPERTY (Oculto si viene del widget) */}
          {stepId === "property" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">{t.property.title}</h2>
              <input name="street" placeholder={t.property.street} value={data.street} onChange={handleChange} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input name="city" placeholder={t.property.city} value={data.city} onChange={handleChange} className={inputClass} />
                <input name="state" placeholder={t.property.state} value={data.state} onChange={handleChange} maxLength={2} className={inputClass} />
              </div>
              <input name="zip" placeholder={t.property.zip} value={data.zip} onChange={handleChange} maxLength={5} className={inputClass} />
              <button className={btnPrimary} disabled={!data.street || !data.city} onClick={goNext}>{t.property.btn}</button>
              <button className={btnBack} onClick={onClose}>{t.back}</button>
            </div>
          )}

        {/* PASO 2: DETAILS (Modo Confirmación y Edición) */}
          {stepId === "details" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-2xl font-black text-white uppercase tracking-wide">{t.details.title}</h2>
                 {!isEditingDetails && (
                   <button onClick={() => setIsEditingDetails(true)} className="text-[#f8ed1a] text-sm font-bold hover:underline flex items-center gap-1">
                     {t.details.editBtn}
                   </button>
                 )}
               </div>

               {!isEditingDetails ? (
                 // --- MODO LECTURA (CONFIRMACIÓN) ---
                 <div className="bg-black/40 border border-white/10 rounded-xl p-5 mb-6">
                   <h3 className="text-xs text-[#f8ed1a] font-bold uppercase mb-4 border-b border-gray-700 pb-1">{t.details.physicalSection}</h3>
                   <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-6">
                     <div><span className="text-gray-500 block text-xs uppercase">{t.details.beds}</span> <span className="text-white font-bold">{data.beds || '-'}</span></div>
                     <div><span className="text-gray-500 block text-xs uppercase">{t.details.baths}</span> <span className="text-white font-bold">{data.baths || '-'}</span></div>
                     <div><span className="text-gray-500 block text-xs uppercase">{t.details.sqft}</span> <span className="text-white font-bold">{data.sqft ? Number(data.sqft).toLocaleString('en-US') : '-'}</span></div>
                     <div><span className="text-gray-500 block text-xs uppercase">{t.details.lotSize}</span> <span className="text-white font-bold">{data.lotSize ? Number(data.lotSize).toLocaleString('en-US') : '-'}</span></div>
                     <div><span className="text-gray-500 block text-xs uppercase">{t.details.garage}</span> <span className="text-white font-bold">{data.garage || '-'}</span></div>
                     <div><span className="text-gray-500 block text-xs uppercase">{t.details.year || "Year"}</span> <span className="text-white font-bold">{data.yearBuilt || '-'}</span></div>
                   </div>

                   <h3 className="text-xs text-[#f8ed1a] font-bold uppercase mb-4 border-b border-gray-700 pb-1">
                     {data.strategySelected === 'rent' ? t.details.rentSection : t.details.saleSection}
                   </h3>
                   <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                     {data.strategySelected === 'rent' ? (
                       <div><span className="text-gray-500 block text-xs uppercase">{t.details.monthlyRent}</span> <span className="text-white font-bold">${data.monthlyRent ? Number(data.monthlyRent).toLocaleString('en-US') : '-'}</span></div>
                     ) : (
                       <>
                         <div className="col-span-2"><span className="text-gray-500 block text-xs uppercase">{t.details.price}</span> <span className="text-white font-bold">${data.askingPrice ? Number(data.askingPrice).toLocaleString('en-US') : '-'}</span></div>
                         <div><span className="text-gray-500 block text-xs uppercase">{t.details.downPayment}</span> <span className="text-white font-bold">${data.downPayment ? Number(data.downPayment).toLocaleString('en-US') : '-'}</span></div>
                         <div><span className="text-gray-500 block text-xs uppercase">{t.details.interestRate}</span> <span className="text-white font-bold">{data.interestRate || '-'}%</span></div>
                       </>
                     )}
                   </div>
                 </div>
               ) : (
                 // --- MODO EDICIÓN ---
                 <>
                   <h3 className="text-xs text-[#f8ed1a] font-bold uppercase mb-2 border-b border-gray-700 pb-1">{t.details.physicalSection}</h3>
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                     <div><label className={labelClass}>{t.details.beds}</label><input type="number" name="beds" value={data.beds} onChange={handleChange} className={inputClass} /></div>
                     <div><label className={labelClass}>{t.details.baths}</label><input type="number" step="0.5" name="baths" value={data.baths} onChange={handleChange} className={inputClass} /></div>
                     <div><label className={labelClass}>{t.details.sqft}</label><input type="number" name="sqft" value={data.sqft} onChange={handleChange} className={inputClass} /></div>
                     <div><label className={labelClass}>{t.details.year || "Year"}</label><input type="number" name="yearBuilt" value={data.yearBuilt} onChange={handleChange} className={inputClass} /></div>
                     <div><label className={labelClass}>{t.details.lotSize}</label><input type="number" name="lotSize" value={data.lotSize} onChange={handleChange} className={inputClass} /></div>
                     <div><label className={labelClass}>{t.details.garage}</label><input type="number" name="garage" value={data.garage} onChange={handleChange} className={inputClass} /></div>
                   </div>

                   {/* Renderizado condicional Renta vs Venta */}
                   {data.strategySelected === 'rent' ? (
                     <>
                       <h3 className="text-xs text-[#f8ed1a] font-bold uppercase mb-2 border-b border-gray-700 pb-1">{t.details.rentSection}</h3>
                       <div className="mb-4">
                         <label className={labelClass}>{t.details.monthlyRent}</label>
                         <input type="number" name="monthlyRent" value={data.monthlyRent} onChange={handleChange} className={inputClass} />
                       </div>
                     </>
                   ) : (
                     <>
                       <h3 className="text-xs text-[#f8ed1a] font-bold uppercase mb-2 border-b border-gray-700 pb-1">{t.details.saleSection}</h3>
                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div className="col-span-2">
                           <label className={labelClass}>{t.details.price}</label>
                           <input type="number" name="askingPrice" value={data.askingPrice} onChange={handleChange} className={inputClass} />
                         </div>
                         <div><label className={labelClass}>{t.details.downPayment}</label><input type="number" name="downPayment" value={data.downPayment} onChange={handleChange} className={inputClass} /></div>
                         <div><label className={labelClass}>{t.details.interestRate}</label><input type="number" step="0.1" name="interestRate" value={data.interestRate} onChange={handleChange} className={inputClass} /></div>
                         <div><label className={labelClass}>{t.details.taxes}</label><input type="number" name="taxes" value={data.taxes} onChange={handleChange} className={inputClass} /></div>
                         <div><label className={labelClass}>{t.details.insurance}</label><input type="number" name="insurance" value={data.insurance} onChange={handleChange} className={inputClass} /></div>
                       </div>
                     </>
                   )}
                 </>
               )}

               {!isEditingDetails ? (
                 <button className={btnPrimary} onClick={goNext}>{t.details.confirmBtn}</button>
               ) : (
                 <button className={btnPrimary} onClick={() => setIsEditingDetails(false)}>{t.details.saveBtn}</button>
               )}
               <button className={btnBack} onClick={goBack}>{t.back}</button>
            </div>
          )}

          {/* PASO 3: CONTACTO (Aquí se crea el Lead y el DRAFT) */}
          {stepId === "contact" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-2">{t.contact.title}</h2>
              <p className="text-gray-400 text-sm mb-6">{t.contact.sub}</p>
              
              <div className="text-left">
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" placeholder={t.contact.fname} value={data.firstName} onChange={handleChange} className={inputClass} />
                  <input name="lastName" placeholder={t.contact.lname} value={data.lastName} onChange={handleChange} className={inputClass} />
                </div>
                <input type="tel" name="phone" placeholder={t.contact.phone} value={data.phone} onChange={handleChange} className={inputClass} />
                <input type="email" name="email" placeholder={t.contact.email} value={data.email} onChange={handleChange} className={inputClass} />
              </div>

              <button className={btnPrimary} disabled={loading || !data.email || !data.firstName} onClick={handleSubmitContact}>
                {loading ? t.contact.loading : t.contact.btn}
              </button>
              {!prefillData && <button className={btnBack} onClick={goBack}>{t.back}</button>}
            </div>
          )}

          {/* PASO 4: MEDIA (Aquí se adjuntan las fotos al DRAFT) */}
          {stepId === "media" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-2 text-center">{t.media.title}</h2>
              <p className="text-gray-400 text-sm mb-6 text-center">{t.media.sub}</p>
              
              <div className="mb-6">
                <ImageUpload 
                  label={t.media.photos} 
                  value={data.photos} 
                  onChange={(imgs) => handlePropChange('photos', imgs)} 
                  multiple={true} 
                  disableMetadata={true} 
                />
              </div>

              <div className="mb-6">
                <label className={labelClass}>{t.media.code}</label>
                <input 
                  type="text" 
                  name="accessCode" 
                  placeholder={t.media.codePlaceholder} 
                  value={data.accessCode} 
                  onChange={handleChange} 
                  className={inputClass} 
                />
              </div>

              
              <button className={btnPrimary} disabled={loading} onClick={handleSubmitMedia}>
                  {loading ? t.media.loading : t.media.btn}
              </button>
              <button className={btnBack} onClick={goBack}>{t.back}</button>
            </div>
          )}

          {/* PASO 5: PRICING (Oculto si viene del widget) */}
          {stepId === "pricing" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black text-[#f8ed1a] uppercase tracking-wide mb-6 text-center">{t.pricing.title}</h2>
              <button className={btnPrimary} onClick={goNext}>{t.pricing.btn}</button>
              <button className={btnBack} onClick={goBack}>{t.back}</button>
            </div>
          )}

          {/* PASO 6: HOW IT WORKS (Oculto si viene del widget) */}
          {stepId === "howItWorks" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">{t.howItWorks.title}</h2>
               <button className={btnPrimary} onClick={goNext}>{t.howItWorks.btn}</button>
               <button className={btnBack} onClick={goBack}>{t.back}</button>
            </div>
          )}

          {/* PASO 7: CALENDAR */}
          {stepId === "schedule" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              {!booked ? (
                <>
                  <h2 className="text-xl font-black text-white uppercase tracking-wide mb-2 text-center">{t.schedule.title}</h2>
                  <p className="text-gray-400 text-sm mb-4 text-center">{t.schedule.sub}</p>
                  
                  <div className="rounded-xl overflow-hidden border border-gray-800 h-[450px] bg-white relative mb-4">
                    <iframe 
                        src={`https://api.leadconnectorhq.com/widget/booking/zigZYlLW8X7nRcvgAitP?firstName=${encodeURIComponent(data.firstName)}&lastName=${encodeURIComponent(data.lastName)}&email=${encodeURIComponent(data.email)}&phone=${encodeURIComponent(data.phone)}`} 
                        className="w-full h-full border-none" 
                        title="Calendar"
                    />
                  </div>
                  
                  <button className="w-full text-[#529e14] font-bold text-sm underline cursor-pointer pb-2" onClick={() => setBooked(true)}>{t.schedule.booked}</button>
                  <button className={btnBack} onClick={goBack}>{t.back}</button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="text-2xl font-black text-[#f8ed1a] mb-2">{t.schedule.doneTitle}</h3>
                  <p className="text-gray-400 mb-8">{t.schedule.doneSub}</p>
                  <button className={btnPrimary} onClick={goNext}>{t.schedule.btn}</button>
                </div>
              )}
            </div>
          )}

          {/* PASO 8: DONE */}
          {stepId === "done" && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-black text-white mb-2">{t.done.title}, {data.firstName}!</h2>
              <p className="text-gray-400 mb-8">{t.done.sub}</p>
              
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left mb-8">
                <div className="text-xs text-[#f8ed1a] font-black uppercase mb-4 tracking-widest">{t.done.next}</div>
                {t.done.pts.map(([icon, text], i) => (
                  <div key={i} className="flex gap-4 py-2 items-start">
                    <span className="text-xl">{icon}</span>
                    <span className="text-gray-300 text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>

              <button onClick={onClose} className="text-gray-500 hover:text-white font-bold transition-colors">{t.done.link}</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}