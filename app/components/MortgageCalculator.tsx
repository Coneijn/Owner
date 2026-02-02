'use client';

import { useState, useEffect } from 'react';

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
    interest: "Tasa Interés"
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
    interest: "Interest Rate"
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
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const t = TEXTS[lang];

  useEffect(() => {
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

    // CAMBIO: Sumamos el SERVICE_FEE al total
    setMonthlyPayment(principalAndInterest + monthlyTaxes + monthlyInsurance + SERVICE_FEE);

  }, [price, downPayment, termYears, interestRate, taxes, insurance]);

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border border-gray-800">
      
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
        <span className="text-2xl">🧮</span> {t.title}
      </h3>

      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10 mb-8 backdrop-blur-sm">
        <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
            {t.estimated}
        </span>
        <span className="text-5xl font-black text-[#f8ed1a] tracking-tight">
          {formatMoney(monthlyPayment)}
        </span>
        <span className="block text-[10px] text-gray-500 mt-2 font-medium uppercase">
            {t.includes}
        </span>
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
            step={1000}
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