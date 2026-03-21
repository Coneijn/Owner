'use client';

import { useState, useEffect } from 'react';

interface SellerFinanceCalculatorProps {
  defaultPrice?: number;
  lang?: 'es' | 'en'; 
}

const TEXTS = {
  es: {
    title: "Calculadora de Flujo de Caja",
    estimated: "Tu Ingreso Mensual",
    includes: "Pago principal e intereses", 
    salePrice: "Precio de Venta",
    downPayment: "Enganche",
    interestRate: "Tasa de Interés que Cobras",
    loanTerm: "Plazo del Préstamo",
    years: "Años",
    financedAmount: "Monto Financiado",
    annualIncome: "Ingreso Anual",
    totalCollected: "Total Cobrado al Final",
  },
  en: {
    title: "Cash Flow Calculator",
    estimated: "Your Monthly Income",
    includes: "Principal and interest payment",
    salePrice: "Home Sale Price",
    downPayment: "Down Payment",
    interestRate: "Interest Rate You Charge",
    loanTerm: "Loan Term",
    years: "Years",
    financedAmount: "Financed Amount",
    annualIncome: "Annual Income",
    totalCollected: "Total Collected Over Term",
  }
};

export default function SellerFinanceCalculator({ 
  defaultPrice = 200000, 
  lang = 'es' 
}: SellerFinanceCalculatorProps) {
  
  // Estados basados en el HTML proporcionado
  const [price, setPrice] = useState(defaultPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(10);
  const [interestRate, setInterestRate] = useState(8);
  const [termYears, setTermYears] = useState(30);
  
  // Estados para los resultados
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [financedAmount, setFinancedAmount] = useState(0);

  const t = TEXTS[lang];

  useEffect(() => {
    // 1. Calcular el monto del enganche y lo que se va a financiar
    const downPaymentAmount = price * (downPaymentPercent / 100);
    const amountToFinance = price - downPaymentAmount;
    setFinancedAmount(amountToFinance);
    
    // 2. Calcular el pago mensual (fórmula de hipoteca tradicional)
    const monthlyRate = (interestRate / 100) / 12;
    const numberOfPayments = termYears * 12;

    let calculatedMonthly = 0;
    if (monthlyRate > 0) {
      calculatedMonthly = amountToFinance * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else {
      calculatedMonthly = amountToFinance / numberOfPayments;
    }

    setMonthlyIncome(calculatedMonthly);

  }, [price, downPaymentPercent, interestRate, termYears]);

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border border-gray-800">
      
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
        <span className="text-2xl">💰</span> {t.title}
      </h3>

      {/* Tarjeta de Ingreso Mensual */}
      <div className="text-center py-6 bg-white/5 rounded-xl border border-white/10 mb-8 backdrop-blur-sm">
        <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">
            {t.estimated}
        </span>
        <span className="text-5xl font-black text-[#529e14] tracking-tight">
          {formatMoney(monthlyIncome)}<span className="text-2xl text-gray-400">/mo</span>
        </span>
        <span className="block text-[10px] text-gray-500 mt-2 font-medium uppercase">
            {t.includes}
        </span>
      </div>

      <div className="space-y-6">
        {/* Slider: Precio de Venta */}
        <div>
          <div className="flex justify-between mb-2 items-end">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.salePrice}</label>
            <span className="font-black text-white text-lg">{formatMoney(price)}</span>
          </div>
          <input 
            type="range" min={100000} max={400000} step={5000} 
            value={price} onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#529e14]"
          />
        </div>

        {/* Slider: Porcentaje de Enganche */}
        <div>
          <div className="flex justify-between mb-2 items-end">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.downPayment}</label>
            <span className="font-black text-white text-lg">{downPaymentPercent}% <span className="text-sm text-gray-500 font-normal">— {formatMoney(price * (downPaymentPercent / 100))}</span></span>
          </div>
          <input 
            type="range" min={5} max={30} step={1} 
            value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#529e14]"
          />
        </div>

        {/* Slider: Tasa de Interés */}
        <div>
          <div className="flex justify-between mb-2 items-end">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.interestRate}</label>
            <span className="font-black text-white text-lg">{interestRate}%</span>
          </div>
          <input 
            type="range" min={6} max={12} step={0.5} 
            value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#529e14]"
          />
        </div>

        {/* Selector: Plazo del Préstamo */}
        <div>
          <div className="flex justify-between mb-3 items-end">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{t.loanTerm}</label>
            <span className="font-black text-white text-lg">{termYears} {t.years}</span>
          </div>
          <input 
            type="range" min={10} max={30} step={5} 
            value={termYears} onChange={(e) => setTermYears(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#529e14]"
          />
        </div>

        {/* Resumen de Resultados Finales */}
        <div className="pt-6 border-t border-gray-800 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">{t.financedAmount}</span>
            <span className="text-white font-bold">{formatMoney(financedAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">{t.annualIncome}</span>
            <span className="text-white font-bold">{formatMoney(monthlyIncome * 12)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">{t.totalCollected}</span>
            <span className="text-[#f8ed1a] font-bold">{formatMoney(monthlyIncome * (termYears * 12))}</span>
          </div>
        </div>

      </div>
    </div>
  );
}