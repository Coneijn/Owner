'use client';

import { useState } from 'react';
import SellerFunnelModal from './SellerFunnelModal'; 
import CashOfferWidget from './CashOfferWidget'; // Importamos el nuevo widget

interface WrapperProps {
  lang: 'es' | 'en';
  allProperties?: any[]; 
}

const DICTIONARY = {
  es: {
    welcome: { 
      title: (
        <span className="block text-center">
          {/* Subtítulo superior en color rojo/salmón */}
          <span className="block text-base md:text-xl lg:text-2xl text-[#e55050] font-semibold mb-2 md:mb-4 tracking-wide">
            ¿Cansado de dejar dinero sobre la mesa?
          </span>
          
          {/* Texto principal */}
          <span className="block text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] drop-shadow-xl text-white">
            ¿Y si pudieras combinar <br />
            <span className="text-[#f8ed1a]">Venta de contratos, Remodelaciones, Rentas,</span> <br />
            <span className="text-[#f8ed1a]">y Préstamos de Capital Privado</span> — todo en <br />
            una sola estrategia?
          </span>
        </span>
      ),
      titleHigh: "", 
      sub: "Ingresa tu dirección para ver estimaciones reales. Ya sea que quieras ser el banco, vender rápido en efectivo, remodelar o rentar. Tú decides, nosotros te conectamos.", 
      pts: [
        ["📊", "Analiza tu casa", "Datos en tiempo real"], 
        ["🤝", "Anuncia tu casa", "4 opciones diferentes"], 
        ["💰", "Maximiza tu dinero", "Tú tienes el control"]
      ] 
    }
  },
  en: {
    welcome: { 
      
      title: (
        <span className="block text-center">
          {/* Subtítulo superior en color rojo/salmón */}
          <span className="block text-base md:text-xl lg:text-2xl text-[#e55050] font-semibold mb-2 md:mb-4 tracking-wide">
            Tired of Leaving Money on the Table?
          </span>
          
          {/* Texto principal */}
          <span className="block text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] drop-shadow-xl text-white">
            What if you could combine <br />
            <span className="text-[#f8ed1a]">Wholesaling, Flipping, Landlording,</span> <br />
            <span className="text-[#f8ed1a]">and Hard Money Lending</span> — all in <br />
            one strategy?
          </span>
        </span>
      ),
      titleHigh: "", 
      sub: "Enter your address to see real estimates. Whether you want to be the bank, sell for fast cash, fix & list, or rent it out. You decide, we connect you.", 
      pts: [
        ["📊", "Analyze your home", "Real-time data"], 
        ["🤝", "List your home", "4 different options"], 
        ["💰", "Maximize your money", "You are in control"]
      ] 
    }
  }
};

export default function SellerFunnelWrapper({ lang, allProperties }: WrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null); // Estado para guardar la data del widget
  
  const t = DICTIONARY[lang];

  // Esta función recibe los datos cuando el usuario hace clic en "Elegir esta opción" en el Widget
  const handleSelectOption = (strategyName: string, widgetData: any) => {
    // Guardamos la estrategia elegida y toda la data calculada (dirección, ARV, camas, baños, etc.)
    setPrefillData({
      strategySelected: strategyName,
      ...widgetData
    });
    // Abrimos el embudo (Modal)
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300 mb-8" >
        {/* Icono Principal */}
        <div className="text-7xl md:text-8xl text-center mb-8 drop-shadow-lg">
          🏡
        </div>
        
        {/* PARTE SUPERIOR DEL SÁNDWICH: Título principal fusionado */}
        <h1 className="text-5xl md:text-6xl font-black text-[#f8ed1a] drop-shadow-md m-0 mb-10 tracking-tight leading-tight">
          {t.welcome.title}
        </h1>
        
        {/* EL RELLENO DEL SÁNDWICH: El Widget de Cash Offer */}
        <div className="max-w-6xl mx-auto text-left mb-16 relative z-30">
          <CashOfferWidget lang={lang} onSelectOption={handleSelectOption} allProperties={allProperties}/>
        </div>

        {/* PARTE INFERIOR DEL SÁNDWICH: Maximize Your Profit + Subtítulo + Puntos */}
        <div className="mt-8">
          <h2 className="text-5xl md:text-6xl font-black text-[#f8ed1a] drop-shadow-md m-0 mb-6 tracking-tight leading-tight">
            {t.welcome.titleHigh}
          </h2>
          
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
            {t.welcome.sub}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto relative z-10">
            {t.welcome.pts.map(([icon, title, sub], i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center shadow-lg">
                <div className="text-4xl mb-3">{icon}</div>
                <div className="text-sm md:text-base font-bold text-white uppercase tracking-wider">{title}</div>
                <div className="text-xs md:text-sm text-gray-400 mt-2">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Le pasamos la data pre-cargada al Modal para que omita los primeros pasos */}
      <SellerFunnelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        lang={lang} 
        prefillData={prefillData} 
      />
    </>
  );
}