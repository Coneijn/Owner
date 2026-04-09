'use client';

import { useState, useMemo } from 'react';

interface CalculatorProps {
  price: number;
  defaultDownPayment: number;
  interestRate: number;
  taxes: number;
  insurance: number;
  lang?: 'es' | 'en'; 
}

const SERVICE_FEE = 39;

const TEXTS = {
  es: {
    title: "Tu Pago Mensual",
    estimated: "Estimado Mensual",
    includes: "Incluye Impuestos, Seguro y Servicio", 
    yourDown: "Tu Enganche",
    min: "Mínimo",
    loanTerm: "Plazo del Préstamo",
    years: "Años",
    homePrice: "Precio Casa",
    interest: "Tasa Interés",
    viewBreakdown: "Ver Desglose", 
    hideBreakdown: "Ocultar Desglose",
    principalAndInterest: "Principal e Interés",
    taxes: "Impuestos",
    insurance: "Seguro",
    serviceFee: "Tarifa de Servicio"
  },
  en: {
    title: "Your Monthly Payment",
    estimated: "Est. Monthly Payment",
    includes: "Includes Taxes, Insurance & Service",
    yourDown: "Your Down Payment",
    min: "Minimum",
    loanTerm: "Loan Term",
    years: "Years",
    homePrice: "Home Price",
    interest: "Interest Rate",
    viewBreakdown: "View Breakdown", 
    hideBreakdown: "Hide Breakdown",
    principalAndInterest: "Principal & Interest",
    taxes: "Taxes",
    insurance: "Insurance",
    serviceFee: "Service Fee"
  }
};

export default function MortgageCalculator({ 
  price, 
  defaultDownPayment, 
  interestRate, 
  taxes, 
  insurance,
  lang = 'es' 
}: CalculatorProps) {
  
  const [downPayment, setDownPayment] = useState(defaultDownPayment);
  const [termYears, setTermYears] = useState(30);
  const [showBreakdown, setShowBreakdown] = useState(false); 

  const t = TEXTS[lang];

  /*calcula y guarda todas las partes */
  const breakdown = useMemo(() => {
    const loanAmount = price - downPayment;
    
    const monthlyRate = (interestRate / 100) / 12;
    const numberOfPayments = termYears * 12;

    let principalAndInterest = 0;
    if (monthlyRate > 0) {
      principalAndInterest = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      principalAndInterest = loanAmount / numberOfPayments;
    }

    const monthlyTaxes = taxes / 12;
    const monthlyInsurance = insurance / 12;
    const total = principalAndInterest + monthlyTaxes + monthlyInsurance + SERVICE_FEE;

    return { principalAndInterest, monthlyTaxes, monthlyInsurance, total };
  }, [price, downPayment, termYears, interestRate, taxes, insurance]);

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border border-gray-800">
      
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
        <span className="text-2xl">🧮</span> {t.title}
      </h3>

      <div className="text-center py-8 px-4 bg-white/5 rounded-xl border border-white/10 mb-8 backdrop-blur-sm flex flex-col items-center">
        <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
            {t.estimated}
        </span>
        <span className="text-5xl font-black text-[#f8ed1a] tracking-tight">
          {formatMoney(breakdown.total)}
        </span>
        <span className="block text-[10px] text-gray-500 mt-2 mb-4 font-medium uppercase">
            {t.includes}
        </span>

        {/*Botón y sección colapsable */}
        <button 
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-xs text-gray-400 underline hover:text-white transition"
        >
          {showBreakdown ? t.hideBreakdown : t.viewBreakdown}
        </button>

        {showBreakdown && (
          <div className="mt-4 w-full p-4 bg-black/20 rounded-lg border border-gray-700 text-sm space-y-2 text-gray-300 text-left animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between">
              <span>{t.principalAndInterest}</span>
              <span className="font-bold text-white">{formatMoney(breakdown.principalAndInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.taxes}</span>
              <span className="font-bold text-white">{formatMoney(breakdown.monthlyTaxes)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.insurance}</span>
              <span className="font-bold text-white">{formatMoney(breakdown.monthlyInsurance)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
              <span>{t.serviceFee}</span>
              <span className="font-bold text-white">{formatMoney(SERVICE_FEE)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* Enganche Slider */}
        <div>
          <div className="flex justify-between mb-3 items-end">
            <label className="text-sm font-bold text-white uppercase tracking-wide">{t.yourDown}</label>
            <span className="font-black text-[#529e14] text-lg">{formatMoney(downPayment)}</span>
          </div>
          
          <input 
            type="range" 
            min={defaultDownPayment} 
            max={price * 0.5} 
            step={5000} // <--- AQUI ESTÁ EL CAMBIO (Antes 1000)
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#529e14]"
          />
          
          <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
            <span>{t.min}: {formatMoney(defaultDownPayment)}</span>
            <span>50%</span>
          </div>
        </div>

        {/* Plazo Selector */}
        <div>
          <label className="block text-sm font-bold text-white uppercase tracking-wide mb-3">{t.loanTerm}</label>
          <div className="grid grid-cols-3 gap-3">
            {[15, 20, 30].map(year => (
              <button
                key={year}
                onClick={() => setTermYears(year)}
                className={`py-2 px-2 text-sm rounded-lg font-bold transition-all duration-200 uppercase tracking-wide ${
                  termYears === year 
                    ? 'bg-[#529e14] text-white shadow-lg transform scale-105' 
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700 hover:text-white' 
                }`}
              >
                {year} {t.years}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen Datos Fijos */}
        <div className="pt-6 border-t border-gray-800 text-xs font-medium text-gray-400 space-y-2">
          <div className="flex justify-between">
            <span className="uppercase">{t.homePrice}:</span>
            <span className="text-white font-bold">{formatMoney(price)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}