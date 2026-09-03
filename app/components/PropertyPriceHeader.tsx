"use client";

import React, { useState } from 'react';

type PropertyPriceHeaderProps = {
  price: number;
  monthlyRent: number;
  isForSale: boolean;
  isForRent: boolean;
  lang: 'es' | 'en';
};

export default function PropertyPriceHeader({
  price,
  monthlyRent,
  isForSale,
  isForRent,
  lang,
}: PropertyPriceHeaderProps) {
  // Si está en venta por defecto mostramos 'sale', si no, 'rent'
  const [activeTab, setActiveTab] = useState<'sale' | 'rent'>(
    isForSale ? 'sale' : 'rent'
  );

  // Formateador de moneda
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mini diccionario local
  const t = {
    es: {
      buy: "Comprar",
      rent: "Rentar",
      perMonth: "/mes",
      viewBreakdown: "Ver desglose",
    },
    en: {
      buy: "Buy",
      rent: "Rent",
      perMonth: "/mo",
      viewBreakdown: "View breakdown",
    }
  }[lang];

  const currentPrice = activeTab === 'sale' ? price : monthlyRent;
  const priceSuffix = activeTab === 'rent' ? t.perMonth : '';
  const showTabs = isForSale && isForRent;

  return (
    <div className="flex flex-col items-start lg:items-end w-full">
      
      {/* Pestañas: Solo se muestran si la propiedad está en Venta Y en Renta */}
      {showTabs && (
        <div className="flex bg-gray-200 rounded-full p-1 mb-3 shadow-inner">
          <button
            onClick={() => setActiveTab('sale')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'sale'
                ? 'bg-[#1a1a1a] text-[#f8ed1a] shadow-md'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.buy}
          </button>
          <button
            onClick={() => setActiveTab('rent')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === 'rent'
                ? 'bg-[#1a1a1a] text-[#f8ed1a] shadow-md'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.rent}
          </button>
        </div>
      )}

      {/* Contenedor del Precio */}
      <div className="text-left lg:text-right w-full flex flex-row lg:flex-col justify-between items-center lg:items-end">
        <p className="text-4xl md:text-5xl font-black text-[#529e14] tracking-tight transition-all duration-300">
          {formatMoney(currentPrice)}
          <span className="text-2xl md:text-3xl">{priceSuffix}</span>
        </p>

        {/* Gatillo en Móvil para abrir el modal del Desglose (Solo visible si es Venta) */}
        {activeTab !== 'rent' && (
          <div className="lg:hidden block mt-1">
            <label 
              htmlFor="calculator-modal" 
              className="cursor-pointer group select-none inline-block p-2 active:scale-95 transition-transform"
            >
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider underline decoration-dotted">
                {t.viewBreakdown}
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}