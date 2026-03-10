'use client';

import { useState, useEffect } from 'react';
import { submitSellerLead } from '@/lib/ghl-actions';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'es' | 'en';
}

type StepType = "property" | "details" | "contact" | "pricing" | "howItWorks" | "schedule" | "done";
const STEPS: StepType[] = ["property", "details", "contact", "pricing", "howItWorks", "schedule", "done"];

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
    welcome: { title: "Publica tu Casa.", titleHigh: "Recibe Pagos Mensuales.", sub: "OwnerToDueno conecta vendedores con compradores que quieren financiamiento directo — sin bancos, sin esperas. Tú pones las reglas, nosotros el resto.", pts: [["📋", "Publica tu casa", "Gratis para empezar"], ["🤝", "Encuentra comprador", "Te conectamos"], ["💰", "Cobra mensual", "Por 15+ años"]], btn: "Publicar Mi Casa ->" },
    property: { title: "Ubicación de la Propiedad", street: "Dirección", city: "Ciudad", state: "Estado", zip: "Código Postal", btn: "Continuar ->" },
    details: { title: "Detalles de la Propiedad", beds: "Habitaciones", baths: "Baños", sqft: "Pies Cuadrados", price: "Precio de Venta ($)", cond: "Condición", desc: "Descripción Breve", condOpts: [{id: "excellent", label: "Excelente", emoji: "✨"}, {id: "good", label: "Buena", emoji: "👍"}, {id: "fair", label: "Regular", emoji: "🔧"}, {id: "poor", label: "Necesita Trabajo", emoji: "🏚"}], btn: "Ver Ganancias Estimadas ->" },
    contact: { title: "Tus Datos de Contacto", sub: "Para mostrarte tu proyección financiera, necesitamos saber a dónde enviarla.", fname: "Nombre", lname: "Apellido", phone: "Celular", email: "Correo Electrónico", btn: "Ver mis Ganancias ->", loading: "Procesando..." },
    pricing: { title: "Tus Ganancias Estimadas", asking: "Precio de Venta", down: "Enganche (Recibes tú)", financed: "Monto a Financiar", interest: "Tasa de Interés", term: "Plazo", gross: "Pago Mensual Bruto", fee: "Cuota de Administración", net: "Ingreso Mensual Neto", oneTime: "Tarifa Única de Publicación (paga el comprador)", oneTimeSub1: "50% del enganche, tope a $10,000", oneTimeSub2: "*Esta tarifa sale del enganche del comprador — no de tu bolsillo. Conservas tu precio íntegro.", disclaimer: "📌 Estos son estimados basados en tu precio de venta. Los términos finales se acuerdan entre tú y el comprador.", btn: "Cómo Funciona ->" },
    howItWorks: { title: "Cómo Funciona", pts: [{icon: "🏷️", title: "Tú estableces el precio", body: "Los compradores darán un enganche de $10k–$20k."}, {icon: "📈", title: "Interés del 10–12%", body: "Actúas como el banco a 15 años."}, {icon: "💵", title: "Cobramos 50% del enganche", body: "Como tarifa al comprador (tope $10k)."}, {icon: "🔧", title: "$129/mes de administración", body: "Manejamos la amortización y papeleo."}], btn: "Agendar Llamada ->" },
    schedule: { title: "Agenda tu Llamada", sub: "Elige un horario para afinar los detalles de tu publicación.", booked: "¿Ya agendaste? Continuar ->", doneTitle: "¡Llamada Agendada!", doneSub: "Revisa tu teléfono y correo para la confirmación.", btn: "Terminar ->" },
    done: { title: "¡Todo Listo", sub: "Tu propiedad está en proceso y tu llamada agendada.", next: "Qué pasa después:", pts: [["📅", "Recibirás recordatorios de tu llamada"], ["📸", "Recolectaremos fotos en la llamada"], ["🌐", "Saldrás en ownertodueno.com"], ["💰", "Al conectar comprador, inician pagos"]], link: "<- Volver al inicio" },
    back: "<- Volver"
  },
  en: {
    welcome: { title: "List Your Home.", titleHigh: "Get Paid Monthly.", sub: "OwnerToDueno connects sellers with buyers who want to finance directly — no banks, no waiting. You set the terms, we handle the rest.", pts: [["📋", "List your home", "Free to start"], ["🤝", "Find a buyer", "We match you"], ["💰", "Collect monthly", "For 15+ years"]], btn: "List My Home ->" },
    property: { title: "Property Location", street: "Street Address", city: "City", state: "State", zip: "Zip Code", btn: "Continue ->" },
    details: { title: "Property Details", beds: "Bedrooms", baths: "Bathrooms", sqft: "Sq Ft", price: "Asking Price ($)", cond: "Condition", desc: "Brief Description", condOpts: [{id: "excellent", label: "Excellent", emoji: "✨"}, {id: "good", label: "Good", emoji: "👍"}, {id: "fair", label: "Fair", emoji: "🔧"}, {id: "poor", label: "Needs Work", emoji: "🏚"}], btn: "See Estimated Earnings ->" },
    contact: { title: "Your Contact Info", sub: "To show your financial projection, we need to know where to send it.", fname: "First Name", lname: "Last Name", phone: "Cell Number", email: "Email Address", btn: "See My Earnings ->", loading: "Processing..." },
    pricing: { title: "Your Estimated Earnings", asking: "Asking Price", down: "Down Payment (To You)", financed: "Financed Amount", interest: "Interest Rate", term: "Term", gross: "Gross Monthly Payment", fee: "Admin Fee", net: "Net Monthly Income", oneTime: "One-Time Listing Fee (paid by buyer)", oneTimeSub1: "50% of down payment, capped at $10k", oneTimeSub2: "*This fee comes out of the buyer's down payment. You keep your full asking price.", disclaimer: "📌 These are estimates based on your asking price. Final terms are agreed upon between you and your buyer.", btn: "How It Works ->" },
    howItWorks: { title: "How It Works", pts: [{icon: "🏷️", title: "You set the asking price", body: "Buyers will make a down payment of $10k–$20k."}, {icon: "📈", title: "Interest rate: 10–12%", body: "You act as the bank for 15 years."}, {icon: "💵", title: "We collect 50% of down payment", body: "As a placement fee (capped at $10k)."}, {icon: "🔧", title: "$129/month admin fee", body: "We manage amortization and paperwork."}], btn: "Book Your Call ->" },
    schedule: { title: "Book Your Call", sub: "Pick a time to fine-tune your listing details.", booked: "Already booked? Continue ->", doneTitle: "Call Booked!", doneSub: "Check your phone and email for confirmation.", btn: "Finish ->" },
    done: { title: "You're All Set", sub: "Your property is being processed and your call is booked.", next: "What happens next:", pts: [["📅", "You'll receive call reminders"], ["📸", "We'll collect photos on the call"], ["🌐", "Your listing goes live"], ["💰", "Once matched, payments begin"]], link: "<- Back to home" },
    back: "<- Back"
  }
};

export default function SellerFunnelModal({ isOpen, onClose, lang }: ModalProps) {
  const t = DICTIONARY[lang];
  
  const [stepId, setStepId] = useState<StepType>("property");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const [data, setData] = useState({
    street: '', city: '', state: '', zip: '',
    beds: '', baths: '', sqft: '', askingPrice: '', condition: 'good', description: '',
    firstName: '', lastName: '', phone: '', email: ''
  });

  useEffect(() => {
    if (isOpen) setStepId("property");
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && (e.data.type === "booking-confirmed" || e.data === "booking-confirmed")) setBooked(true);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!isOpen) return null;

  const handleChange = (e: any) => setData({ ...data, [e.target.name]: e.target.value });
  const handlePropChange = (key: string, val: string) => setData(prev => ({ ...prev, [key]: val }));

  const goNext = () => setStepId(STEPS[STEPS.indexOf(stepId) + 1]);
  const goBack = () => setStepId(STEPS[STEPS.indexOf(stepId) - 1]);

  const handleSubmitContact = async () => {
    setLoading(true);
    await submitSellerLead(data); 
    setLoading(false);
    goNext();
  };

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

  const currentIdx = STEPS.indexOf(stepId);
  const totalProgSteps = STEPS.length - 1; 
  const progressPct = stepId !== "done" 
    ? Math.round((currentIdx / totalProgSteps) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-xl relative shadow-2xl my-8">
        
        {stepId !== "done" && (
          <div className="w-full bg-gray-800 rounded-t-2xl h-2 overflow-hidden">
            <div className="bg-[#f8ed1a] h-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
          </div>
        )}

        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white font-bold text-xl transition-colors">✕</button>

        <div className="p-6 sm:p-8">

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

          {stepId === "details" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">{t.details.title}</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div><label className={labelClass}>{t.details.beds}</label><input type="number" name="beds" value={data.beds} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>{t.details.baths}</label><input type="number" name="baths" value={data.baths} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>{t.details.sqft}</label><input type="number" name="sqft" value={data.sqft} onChange={handleChange} className={inputClass} /></div>
              </div>
              
              <label className={labelClass}>{t.details.price}</label>
              <input name="askingPrice" value={data.askingPrice} onChange={e => handlePropChange('askingPrice', e.target.value.replace(/[^0-9]/g, ''))} 
                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-[#f8ed1a] font-bold text-lg focus:border-[#f8ed1a] outline-none transition-colors mb-4" />
              
              <label className={labelClass}>{t.details.cond}</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {t.details.condOpts.map(c => (
                  <button key={c.id} onClick={() => handlePropChange("condition", c.id)} 
                    className={`p-3 rounded-lg border transition-all text-left ${data.condition === c.id ? 'bg-[#529e14]/10 border-[#529e14]' : 'bg-gray-900 border-gray-700 hover:border-gray-500'}`}>
                    <span className="text-xl mr-2">{c.emoji}</span>
                    <span className="text-white text-sm font-bold">{c.label}</span>
                  </button>
                ))}
              </div>

              <label className={labelClass}>{t.details.desc}</label>
              <textarea name="description" value={data.description} onChange={handleChange} rows={3} className={inputClass} />

              <button className={btnPrimary} disabled={!data.askingPrice} onClick={goNext}>{t.details.btn}</button>
              <button className={btnBack} onClick={goBack}>{t.back}</button>
            </div>
          )}

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
              <button className={btnBack} onClick={goBack}>{t.back}</button>
            </div>
          )}

          {stepId === "pricing" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-2xl font-black text-[#f8ed1a] uppercase tracking-wide mb-6 text-center">{t.pricing.title}</h2>
              
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 shadow-inner mb-6">
                {[
                  [t.pricing.asking, `$${price.toLocaleString()}`],
                  [t.pricing.down, `$${Math.round(downLow).toLocaleString()} – $${Math.round(downHigh).toLocaleString()}`],
                  [t.pricing.financed, `$${Math.round(noteAfterDown).toLocaleString()}`],
                  [t.pricing.interest, `${INTEREST_MIN}–${INTEREST_MAX}%`],
                  [t.pricing.term, `${TERM_YEARS} yrs`],
                ].map(([label, val], i) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-3">
                    <span className="text-gray-400 font-bold text-xs uppercase">{label}</span>
                    <span className="text-white font-black">{val}</span>
                  </div>
                ))}
                
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-gray-400 font-bold text-xs uppercase">{t.pricing.gross}</span>
                  <span className="text-white font-black">${Math.round(monthlyLow).toLocaleString()} – ${Math.round(monthlyHigh).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <span className="text-gray-400 font-bold text-xs uppercase">{t.pricing.fee}</span>
                  <span className="text-red-400 font-black">-${MONTHLY_SERVICE_FEE}/mo</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-300 uppercase font-black text-sm">{t.pricing.net}</span>
                  <span className="text-[#f8ed1a] font-black text-2xl">${Math.round(netLow).toLocaleString()} – ${Math.round(netHigh).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-black border border-gray-800 rounded-xl p-4 mb-4">
                <div className="text-xs text-[#529e14] font-black uppercase mb-2">{t.pricing.oneTime}</div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-300 text-sm">{t.pricing.oneTimeSub1}</span>
                  <span className="text-[#529e14] font-black text-lg">${Math.round(listingFee).toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500 italic">{t.pricing.oneTimeSub2}</p>
              </div>

              <p className="text-xs text-gray-500 text-center mb-6">{t.pricing.disclaimer}</p>

              <button className={btnPrimary} onClick={goNext}>{t.pricing.btn}</button>
              <button className={btnBack} onClick={goBack}>{t.back}</button>
            </div>
          )}

          {stepId === "howItWorks" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
               <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">{t.howItWorks.title}</h2>
               <div className="space-y-4 mb-6">
                  {t.howItWorks.pts.map((p, i) => (
                    <div key={i} className="flex gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800">
                      <div className="text-2xl mt-0.5">{p.icon}</div>
                      <div>
                        <div className="text-white font-bold mb-1">{p.title}</div>
                        <div className="text-sm text-gray-400">{p.body}</div>
                      </div>
                    </div>
                  ))}
               </div>
               <button className={btnPrimary} onClick={goNext}>{t.howItWorks.btn}</button>
               <button className={btnBack} onClick={goBack}>{t.back}</button>
            </div>
          )}

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