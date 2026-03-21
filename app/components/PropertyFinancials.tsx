'use client';

import { useState } from 'react';
import MortgageCalculator from './MortgageCalculator';
import RentInfo from './RentInfo';

interface PropertyFinancialsProps {
  property: {
    price?: number | null;
    downPayment?: number | null;
    interestRate?: number | null;
    taxes?: number | null;
    insurance?: number | null;
    isForSale?: boolean;
    isForRent?: boolean;
    monthlyRent?: number | null;
    securityDeposit?: number | null;
  };
  lang: 'es' | 'en';
}

const TEXTS = {
  es: {
    saleOption: "Opción de Compra",
    rentOption: "Opción de Renta",
  },
  en: {
    saleOption: "Buy Option",
    rentOption: "Rent Option",
  }
};

export default function PropertyFinancials({ property, lang }: PropertyFinancialsProps) {
  const t = TEXTS[lang];

  // Lógica de Estado Inicial:
  // Si está en Venta y Renta -> Por defecto mostramos "Venta" (o lo que prefieras)
  // Si solo está en Renta -> 'RENT'
  // Si solo está en Venta -> 'SALE'
  const [activeTab, setActiveTab] = useState<'SALE' | 'RENT'>(() => {
    if (property.isForRent && !property.isForSale) return 'RENT';
    return 'SALE';
  });

  const showTabs = property.isForSale && property.isForRent;

  return (
    <div className="space-y-6">
      
      {/* 1. SECCIÓN DE PESTAÑAS (Solo si tiene AMBAS opciones) */}
      {showTabs && (
        <div className="flex p-1 bg-[#1a1a1a] rounded-xl border border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('SALE')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-black uppercase tracking-wide transition-all ${
              activeTab === 'SALE'
                ? 'bg-[#529e14] text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.saleOption}
          </button>
          <button
            onClick={() => setActiveTab('RENT')}
            className={`flex-1 py-3 px-4 rounded-lg text-sm font-black uppercase tracking-wide transition-all ${
              activeTab === 'RENT'
                ? 'bg-[#f8ed1a] text-black shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.rentOption}
          </button>
        </div>
      )}

      {/* 2. RENDERIZADO CONDICIONAL DE LAS VISTAS */}
      
      {/* CASO: MOSTRAR VENTA (Si está activo el tab SALE y la propiedad es de venta) */}
      {property.isForSale && activeTab === 'SALE' && (
        <div className="animate-in fade-in slide-in-from-left-4 duration-300">
          <MortgageCalculator
            price={Number(property.price) || 0}
            defaultDownPayment={Number(property.downPayment) || 0}
            interestRate={Number(property.interestRate) || 0}
            taxes={Number(property.taxes) || 0}
            insurance={Number(property.insurance) || 0}
            lang={lang}
          />
        </div>
      )}

      {/* CASO: MOSTRAR RENTA (Si está activo el tab RENT y la propiedad es de renta) */}
      {property.isForRent && activeTab === 'RENT' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <RentInfo
            monthlyRent={Number(property.monthlyRent)}
            securityDeposit={Number(property.securityDeposit)}
            lang={lang}
          />
        </div>
      )}

    </div>
  );
}