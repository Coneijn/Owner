'use client';

import { useState } from 'react';
import SellerFunnelModal from './SellerFunnelModal'; 

interface WrapperProps {
  lang: 'es' | 'en';
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
    welcome: { title: "List Your Home.", titleHigh: "Get Paid Monthly.", sub: "OwnerToDueno connects sellers with buyers who want to finance directly — no banks, no waiting!  You set the terms, we handle the rest.", pts: [["📋", "List your home", "Free to start"], ["🤝", "Find a buyer", "We match you"], ["💰", "Collect monthly", "For 15+ years"]], btn: "List My Home ->" },
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

export default function SellerFunnelWrapper({ lang }: WrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const t = DICTIONARY[lang];
  const btnPrimary = "w-full py-4 mt-2 bg-[#529e14] text-white font-black uppercase tracking-wide rounded-lg shadow-lg hover:bg-[#458510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center";
  
  return (
    <>
      <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="text-7xl md:text-8xl text-center mb-8 drop-shadow-lg">
          🏡
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-white m-0 mb-4 tracking-tight leading-tight">
          {t.welcome.title}<br />
          <span className="text-[#f8ed1a] drop-shadow-md">{t.welcome.titleHigh}</span>
        </h1>
        
        <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
          {t.welcome.sub}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
          {t.welcome.pts.map(([icon, title, sub], i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center shadow-lg">
              <div className="text-4xl mb-3">{icon}</div>
              <div className="text-sm md:text-base font-bold text-white uppercase tracking-wider">{title}</div>
              <div className="text-xs md:text-sm text-gray-400 mt-2">{sub}</div>
            </div>
          ))}
        </div>
        
        <div className="max-w-md mx-auto">
          <button className={btnPrimary} onClick={() => setIsModalOpen(true)}>{t.welcome.btn}</button>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 px-6 py-4 bg-[#529e14] text-white text-lg font-black uppercase tracking-wide rounded-full shadow-2xl hover:bg-[#458510] hover:scale-110 transition-all border-2 border-white/10"
      >
        {lang === 'en' ? 'List Now 🚀' : 'Publicar Ahora 🚀'}
      </button>

      <SellerFunnelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        lang={lang} 
      />
    </>
  );
}