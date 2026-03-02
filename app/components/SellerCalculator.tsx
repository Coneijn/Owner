'use client';

import { useState, useEffect } from 'react';

interface SellerCalculatorProps {
  defaultPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  commissionRate?: number; // Porcentaje de comisión (ej. 5 para 5%)
  closingCostsRate?: number; // Porcentaje de costos de cierre (ej. 1.5 para 1.5%)
  lang?: 'es' | 'en'; 
}

const TEXTS = {
  es: {
    title: "Ganancia del Vendedor",
    estimated: "Ganancia Neta Estimada",
    includes: "Deduciendo comisiones y costos de cierre", 
    yourPrice: "Precio de Venta",
    min: "Mínimo",
    max: "Máximo",
    commission: "Comisiones Estimadas",
    closingCosts: "Costos de Cierre"
  },
  en: {
    title: "Seller Net Proceeds",
    estimated: "Est. Net Proceeds",
    includes: "Deducting commissions & closing costs",
    yourPrice: "Sale Price",
    min: "Minimum",
    max: "Maximum",
    commission: "Est. Commissions",
    closingCosts: "Closing Costs"
  }
};

export default function SellerCalculator({ 
  defaultPrice = 500000, 
  minPrice = 100000,
  maxPrice = 2000000,
  commissionRate = 5, 
  closingCostsRate = 1.5,
  lang = 'es' 
}: SellerCalculatorProps) {
  
  const [price, setPrice] = useState(defaultPrice);
  const [netProceeds, setNetProceeds] = useState(0);
  const [commissionAmount, setCommissionAmount] = useState(0);
  const [closingAmount, setClosingAmount] = useState(0);

  const t = TEXTS[lang];

  useEffect(() => {
    // Calculamos las deducciones basadas en el precio de venta
    const calculatedCommission = price * (commissionRate / 100);
    const calculatedClosing = price * (closingCostsRate / 100);
    
    setCommissionAmount(calculatedCommission);
    setClosingAmount(calculatedClosing);
    
    // Ganancia neta = Precio - Comisión - Costos de Cierre
    setNetProceeds(price - calculatedCommission - calculatedClosing);

  }, [price, commissionRate, closingCostsRate]);

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border border-gray-800">
      
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
        <span className="text-2xl">💰</span> {t.title}
      </h3>

      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10 mb-8 backdrop-blur-sm">
        <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
            {t.estimated}
        </span>
        <span className="text-5xl font-black text-[#529e14] tracking-tight">
          {formatMoney(netProceeds)}
        </span>
        <span className="block text-[10px] text-gray-500 mt-2 font-medium uppercase">
            {t.includes}
        </span>
      </div>

      <div className="space-y-8">
        {/* Slider de Precio de Venta */}
        <div>
          <div className="flex justify-between mb-3 items-end">
            <label className="text-sm font-bold text-white uppercase tracking-wide">{t.yourPrice}</label>
            <span className="font-black text-white text-lg">{formatMoney(price)}</span>
          </div>
          
          <input 
            type="range" 
            min={minPrice} 
            max={maxPrice} 
            step={10000} // Saltos de 10,000 en 10,000
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#529e14]"
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
            <span>{t.min}: {formatMoney(minPrice)}</span>
            <span>{t.max}: {formatMoney(maxPrice)}</span>
          </div>
        </div>

        {/* Resumen de Deducciones */}
        <div className="pt-6 border-t border-gray-800 text-sm font-medium text-gray-400 space-y-3">
          <div className="flex justify-between items-center">
            <span className="uppercase text-xs">{t.commission} ({commissionRate}%):</span>
            <span className="text-[#f8ed1a] font-bold">-{formatMoney(commissionAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="uppercase text-xs">{t.closingCosts} ({closingCostsRate}%):</span>
            <span className="text-[#f8ed1a] font-bold">-{formatMoney(closingAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}