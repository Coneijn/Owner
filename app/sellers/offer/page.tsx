'use client';

import { useState, use } from 'react';
import Header from '@/app/components/Header';
import Link from 'next/link';
import CashOfferWidget from '@/app/components/CashOfferWidget';
import SellerFunnelModal from '@/app/components/SellerFunnelModal'; // Ajusta la ruta si es diferente

type Props = {
  searchParams: Promise<{ address?: string; lang?: string }>;
};

export default function OfferPage({ searchParams }: Props) {
  // Desempaquetamos los parámetros en Next.js 15
  const params = use(searchParams);
  const address = params.address || '';
  const lang = (params.lang === 'en' ? 'en' : 'es') as 'es' | 'en';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

  // Esta función abre el modal cuando el usuario elige una de las 4 opciones
  const handleSelectOption = (strategyName: string, widgetData: any) => {
    setPrefillData({
      strategySelected: strategyName,
      ...widgetData
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200">
      <Header lang={lang} activePage="sellers" />

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {/* Botón para regresar a la página principal de sellers */}
        <div className="mb-8">
          <Link 
            href={`/sellers?lang=${lang}`} 
            className="inline-flex items-center gap-2 text-[#529e14] hover:text-white font-bold uppercase tracking-wide transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-[#529e14]"
          >
            ← {lang === 'en' ? 'Enter a different address' : 'Ingresar otra dirección'}
          </Link>
        </div>

        {/* Encabezado limpio de la propiedad */}
        <h1 className="text-3xl md:text-4xl font-black text-white mb-8 border-b border-gray-800 pb-4">
          {lang === 'en' ? 'Property Analysis For:' : 'Análisis de Propiedad Para:'} <br/>
          <span className="text-[#f8ed1a] drop-shadow-md">{address}</span>
        </h1>

        {/* 
          Llamamos al widget pasándole la dirección inicial y activando 
          el auto-análisis para que salte directamente a los resultados 
        */}
        {address ? (
          <CashOfferWidget 
            lang={lang} 
            onSelectOption={handleSelectOption} 
            initialAddress={address} 
            autoAnalyze={true} 
          />
        ) : (
          <div className="p-8 bg-red-500/20 text-red-200 rounded-xl border border-red-500/50">
            {lang === 'en' ? 'No address provided in the URL.' : 'No se proporcionó ninguna dirección en la URL.'}
          </div>
        )}
      </main>

      {/* Modal del embudo que se abre al dar clic en un botón de oferta */}
      <SellerFunnelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        lang={lang} 
        prefillData={prefillData} 
      />
    </div>
  );
}