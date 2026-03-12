'use client';

import { useState, useEffect } from 'react';

interface DealInputs {
  arv: number;
  rehabCosts: number;
  investorDiscountPercent: number;
  realtorFeePercent: number;
  sfPricePremiumPercent: number;
  sfDownPaymentPercent: number;
  sfDownPaymentFlat: number; 
  sfInterestRate: number;
  sfTermYears: number;
}

interface CashOfferWidgetProps {
  lang?: 'es' | 'en';
}

const i18n = {
  es: {
    title: "Descubre el Verdadero Potencial de tu Propiedad",
    placeholder: "Ingresa la dirección completa...",
    analyzeBtn: "Ver mis Opciones",
    analyzing: "Analizando...",
    beds: "Camas",
    baths: "Baños",
    sqft: "Pies²",
    switchToMoney: "Cambiar a $",
    switchToPercent: "Cambiar a %",
    backedByComps: "Respaldado por {n} ventas recientes",
    rangeTitle: "Tu Potencial de Ganancia",
    rangeDesc: "Como dueño, tienes múltiples formas de capitalizar tu propiedad. Véndela rápido tal como está, invierte en repararla para obtener el precio de mercado, o conviértete en el banco y genera ingresos pasivos mes a mes.",
    transparencyTitle: "🧠 ¿Cómo calculamos esto?",
    transparencyArv: "El Valor Remodelado (ARV) se estimó analizando {n} propiedades comparables vendidas recientemente en tu zona.",
    transparencyRehab: "Las reparaciones se estimaron a {price}/SqFt basándonos en el tamaño ({sqft} SqFt) y la edad de tu propiedad.",
    cashBuyerTitle: "Venta Rápida",
    cashBuyerSub: "(Sell to Cash Buyer)",
    cashBuyerDesc: "Vende \"tal como está\" sin gastar en reparaciones. Cierre en días, no en meses.",
    arvLabel: "Valor Remodelado (ARV):",
    investorDiscountLabel: "Descuento Inversionista:",
    rehabSavingsLabel: "Ahorro en Reparaciones:",
    cashInPocketLabel: "Efectivo en tu Bolsillo:",
    fixListTitle: "Fix & List",
    fixListSub: "(Remodela y Vende)",
    fixListDesc: "Invierte tu dinero en reparar la casa para venderla al precio máximo en el mercado tradicional.",
    marketSaleLabel: "Venta a Precio Mercado:",
    yourInvestmentLabel: "Tu Inversión en Arreglos:",
    realtorFeeLabel: "Comisiones Reales ({n}%):",
    netProfitLabel: "Ganancia Neta Final:",
    sellerFinanceTitle: "Sé el Banco",
    sellerFinanceSub: "(Financiamiento por Dueño)",
    sellerFinanceDesc: "Vende a plazos. Recibe un pago inicial hoy y genera ingresos mensuales sin lidiar con inquilinos.",
    downPaymentReceivedLabel: "Pago Inicial que Recibes:",
    monthlyIncomeLabel: "Ingreso Mensual (P&I):",
    termLabel: "Plazo del Contrato:",
    termValue: "{years} años al {rate}%",
    totalYieldLabel: "Rendimiento Total:",
    fineTuneBtn: "⚙️ Ajustar los Números de mi Propiedad",
    hide: "▲ Ocultar",
    show: "▼ Mostrar Controles",
    sectionCondition: "Condición Actual",
    arvInput: "Valor Remodelada (ARV $)",
    rehabInput: "Costo para Reparar ($)",
    sectionCosts: "Costos de Venta",
    discountInput: "Descuento Inversionista %",
    realtorInput: "Comisión Realtor % (Fix&List)",
    sectionBank: "Términos del Banco (Tú)",
    pricePremiumInput: "Precio de Venta (% del ARV)",
    downPaymentInput: "Enganche Requerido",
    sectionReturns: "Retornos Financieros",
    interestInput: "Tasa de Interés a Cobrar %",
    termInput: "Plazo del Préstamo (Años)",
    compsTitle: "Propiedades Comparables"
  },
  en: {
    title: "Discover Your Property's True Potential",
    placeholder: "Enter full address...",
    analyzeBtn: "See My Options",
    analyzing: "Analyzing...",
    beds: "Beds",
    baths: "Baths",
    sqft: "SqFt",
    switchToMoney: "Switch to $",
    switchToPercent: "Switch to %",
    backedByComps: "Backed by {n} recent sales",
    rangeTitle: "Your Profit Potential",
    rangeDesc: "As an owner, you have multiple ways to capitalize on your property. Sell it fast as-is, invest in repairs for top market dollar, or become the bank and generate monthly passive income.",
    transparencyTitle: "🧠 How did we calculate this?",
    transparencyArv: "The After Repair Value (ARV) was estimated by analyzing {n} recently sold comparable properties in your area.",
    transparencyRehab: "Repairs were estimated at {price}/SqFt based on the size ({sqft} SqFt) and age of your property.",
    cashBuyerTitle: "Fast Cash Sale",
    cashBuyerSub: "(Sell to Cash Buyer)",
    cashBuyerDesc: "Sell 'as-is' without spending on repairs. Close in days, not months.",
    arvLabel: "After Repair Value (ARV):",
    investorDiscountLabel: "Investor Discount:",
    rehabSavingsLabel: "Rehab Savings:",
    cashInPocketLabel: "Cash in Your Pocket:",
    fixListTitle: "Fix & List",
    fixListSub: "(Rehab & Sell)",
    fixListDesc: "Invest your money in repairing the house to sell it for maximum price on the traditional market.",
    marketSaleLabel: "Market Value Sale:",
    yourInvestmentLabel: "Your Rehab Investment:",
    realtorFeeLabel: "Realtor Fees ({n}%):",
    netProfitLabel: "Final Net Profit:",
    sellerFinanceTitle: "Be The Bank",
    sellerFinanceSub: "(Seller Financing)",
    sellerFinanceDesc: "Sell on terms. Receive a down payment today and generate monthly income without dealing with tenants.",
    downPaymentReceivedLabel: "Down Payment Received:",
    monthlyIncomeLabel: "Monthly Income (P&I):",
    termLabel: "Contract Term:",
    termValue: "{years} years at {rate}%",
    totalYieldLabel: "Total Yield:",
    fineTuneBtn: "⚙️ Fine Tune My Property Numbers",
    hide: "▲ Hide",
    show: "▼ Show Controls",
    sectionCondition: "Current Condition",
    arvInput: "After Repair Value (ARV $)",
    rehabInput: "Cost to Repair ($)",
    sectionCosts: "Selling Costs",
    discountInput: "Investor Discount %",
    realtorInput: "Realtor Fee % (Fix&List)",
    sectionBank: "The Bank's Terms (You)",
    pricePremiumInput: "Sale Price (% of ARV)",
    downPaymentInput: "Required Down Payment",
    sectionReturns: "Financial Returns",
    interestInput: "Interest Rate to Charge %",
    termInput: "Loan Term (Years)",
    compsTitle: "Comparable Properties"
  }
};

export default function CashOfferWidget({ lang = 'es' }: CashOfferWidgetProps) {
  const t = i18n[lang];
  
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComps, setShowComps] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  
  const [isDpPercent, setIsDpPercent] = useState(true);

  const [inputs, setInputs] = useState<DealInputs>({
    arv: 250000,
    rehabCosts: 25000,
    investorDiscountPercent: 30, 
    realtorFeePercent: 6,
    sfPricePremiumPercent: 100, 
    sfDownPaymentPercent: 10,
    sfDownPaymentFlat: 25000,
    sfInterestRate: 6.5,
    sfTermYears: 30,
  });

  const [strategies, setStrategies] = useState({
    cashBuyer: { offer: 0 },
    fixAndList: { grossSale: 0, costToSell: 0, netProfit: 0 },
    sellerFinance: { salePrice: 0, downPayment: 0, monthlyIncome: 0, totalYield: 0 }
  });

  const handleInputChange = (field: keyof DealInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  useEffect(() => {
    const calc = () => {
      const { 
        arv, rehabCosts, investorDiscountPercent, realtorFeePercent,
        sfPricePremiumPercent, sfDownPaymentPercent, sfDownPaymentFlat, sfInterestRate, sfTermYears
      } = inputs;

      const cashOfferValue = (arv * ((100 - investorDiscountPercent) / 100)) - rehabCosts;
      const finalCashOffer = cashOfferValue > 0 ? cashOfferValue : 0;
      
      const realtorFee = arv * (realtorFeePercent / 100);
      const fixListNet = arv - rehabCosts - realtorFee;

      const sfPrice = arv * (sfPricePremiumPercent / 100);
      const sfDownPayment = isDpPercent ? sfPrice * (sfDownPaymentPercent / 100) : sfDownPaymentFlat;
      const sfLoanAmount = sfPrice - sfDownPayment;
      
      const monthlyRate = (sfInterestRate / 100) / 12;
      const numPayments = sfTermYears * 12;
      let sfMonthlyIncome = 0;
      if (monthlyRate > 0 && sfLoanAmount > 0) {
        sfMonthlyIncome = sfLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
      } else if (sfLoanAmount > 0) {
        sfMonthlyIncome = sfLoanAmount / numPayments; 
      }

      const totalYield = sfDownPayment + (sfMonthlyIncome * numPayments);

      setStrategies({
        cashBuyer: { offer: finalCashOffer },
        fixAndList: { grossSale: arv, costToSell: rehabCosts + realtorFee, netProfit: fixListNet },
        sellerFinance: { salePrice: sfPrice, downPayment: sfDownPayment, monthlyIncome: sfMonthlyIncome, totalYield: totalYield }
      });
    };

    calc();
  }, [inputs, isDpPercent]);

  const analyzeProperty = async () => {
    if (!address) return;
    setLoading(true);
    setError('');
    setPropertyDetails(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error.');

      setPropertyDetails(data);

      setInputs(prev => ({
        ...prev,
        arv: data.arv || prev.arv,
        rehabCosts: data.repairCosts || prev.rehabCosts,
        sfDownPaymentFlat: (data.arv || prev.arv) * (prev.sfDownPaymentPercent / 100)
      }));
      
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const lowestNet = strategies.cashBuyer.offer;
  const highestNet = strategies.sellerFinance.totalYield;

return (
    <div className="w-full bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden text-white">
      
      {/* HEADER BUSCADOR */}
      <div className="p-6 border-b border-white/10 bg-white/5 relative z-20">
        <h2 className="text-xl font-bold mb-4 text-white">{t.title}</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder={t.placeholder} 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyzeProperty()}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#529e14] focus:ring-1 focus:ring-[#529e14] text-white placeholder-gray-500 transition-all"
          />
          <button 
            onClick={analyzeProperty}
            disabled={loading}
            className="bg-[#529e14] text-[#0a0f1c] font-bold px-8 py-3 rounded-lg hover:bg-[#459e10] disabled:opacity-50 transition-all shadow-lg shadow-[#529e14]/20"
          >
            {loading ? t.analyzing : t.analyzeBtn}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        
        {propertyDetails && (
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">🛏️ {propertyDetails.bedrooms} {t.beds}</span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">🚿 {propertyDetails.bathrooms} {t.baths}</span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">📐 {propertyDetails.sqft} {t.sqft}</span>
            
            {propertyDetails.salesCompsCount > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setShowComps(!showComps)}
                  className="bg-[#529e14]/10 text-[#529e14] border border-[#529e14]/30 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 hover:bg-[#529e14]/20 transition-colors focus:outline-none"
                >
                  📊 {t.backedByComps.replace('{n}', propertyDetails.salesCompsCount)}
                </button>
                
                {showComps && propertyDetails.recentSales && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 p-4 text-left">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-white text-sm font-bold">{t.compsTitle}</h4>
                      <button onClick={() => setShowComps(false)} className="text-gray-400 hover:text-white">✕</button>
                    </div>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {propertyDetails.recentSales.map((comp: any, i: number) => (
                        <li key={i} className="text-xs flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="text-gray-400 truncate pr-2 max-w-[65%]" title={comp.address}>
                            {comp.address}
                          </span>
                          <span className="text-[#529e14] font-semibold">
                            {formatMoney(comp.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {propertyDetails && (
        <div className="animate-fadeIn relative z-10">
          
          <div className="py-10 px-6 text-center bg-gradient-to-b from-white/5 to-transparent border-b border-white/10">
            <p className="text-gray-400 uppercase tracking-widest text-sm font-semibold mb-2">{t.rangeTitle}</p>
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#529e14] to-[#f8ed1a]">
              {formatMoney(lowestNet)} - {formatMoney(highestNet)}
            </h1>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-sm leading-relaxed">
              {t.rangeDesc}
            </p>

            {propertyDetails.sqft > 0 && (
              <div className="mt-8 max-w-2xl mx-auto bg-black/20 border border-white/10 rounded-lg p-4 text-left backdrop-blur-sm">
                <h4 className="text-sm font-bold text-gray-300 mb-2">{t.transparencyTitle}</h4>
                <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                  {propertyDetails.salesCompsCount > 0 && (
                    <li>{t.transparencyArv.replace('{n}', propertyDetails.salesCompsCount)}</li>
                  )}
                  <li>
                    {t.transparencyRehab
                      .replace('{price}', formatMoney(inputs.rehabCosts / propertyDetails.sqft))
                      .replace('{sqft}', propertyDetails.sqft)}
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
            
            {/* OPCION 1: CASH BUYER */}
            <div className="p-6 bg-transparent hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg font-bold text-white">{t.cashBuyerTitle} <br/><span className="text-xs text-gray-400 font-normal">{t.cashBuyerSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-[#529e14] transition-colors">
                {formatMoney(strategies.cashBuyer.offer)}
              </div>
              <p className="text-xs text-gray-400 mb-6 min-h-[32px]">{t.cashBuyerDesc}</p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex justify-between"><span>{t.arvLabel}</span> <span>{formatMoney(inputs.arv)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.investorDiscountLabel}</span> <span>-{inputs.investorDiscountPercent}%</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.rehabSavingsLabel}</span> <span>-{formatMoney(inputs.rehabCosts)}</span></li>
                <li className="flex justify-between pt-3 border-t border-white/10 font-semibold text-[#529e14]">
                  <span>{t.cashInPocketLabel}</span> <span>{formatMoney(strategies.cashBuyer.offer)}</span>
                </li>
              </ul>
            </div>

            {/* OPCION 2: FIX & LIST */}
            <div className="p-6 bg-black/20 hover:bg-white/5 transition-colors group relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#529e14]"></div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔨</span>
                <h3 className="text-lg font-bold text-white">{t.fixListTitle} <br/><span className="text-xs text-gray-400 font-normal">{t.fixListSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-[#529e14] transition-colors">
                {formatMoney(strategies.fixAndList.netProfit)}
              </div>
              <p className="text-xs text-gray-400 mb-6 min-h-[32px]">{t.fixListDesc}</p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex justify-between"><span>{t.marketSaleLabel}</span> <span>{formatMoney(strategies.fixAndList.grossSale)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.yourInvestmentLabel}</span> <span>-{formatMoney(inputs.rehabCosts)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.realtorFeeLabel.replace('{n}', inputs.realtorFeePercent.toString())}</span> <span>-{formatMoney(strategies.fixAndList.grossSale * (inputs.realtorFeePercent / 100))}</span></li>
                <li className="flex justify-between pt-3 border-t border-white/10 font-semibold text-[#529e14]">
                  <span>{t.netProfitLabel}</span> <span>{formatMoney(strategies.fixAndList.netProfit)}</span>
                </li>
              </ul>
            </div>

            {/* OPCION 3: SELLER FINANCE */}
            <div className="p-6 bg-transparent hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏦</span>
                <h3 className="text-lg font-bold text-white">{t.sellerFinanceTitle} <br/><span className="text-xs text-gray-400 font-normal">{t.sellerFinanceSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-[#529e14] transition-colors">
                {formatMoney(strategies.sellerFinance.totalYield)}
              </div>
              <p className="text-xs text-gray-400 mb-6 min-h-[32px]">{t.sellerFinanceDesc}</p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex justify-between"><span>{t.downPaymentReceivedLabel}</span> <span className="text-blue-400">{formatMoney(strategies.sellerFinance.downPayment)}</span></li>
                <li className="flex justify-between"><span>{t.monthlyIncomeLabel}</span> <span className="text-[#529e14]">+{formatMoney(strategies.sellerFinance.monthlyIncome)}/mes</span></li>
                <li className="flex justify-between"><span>{t.termLabel}</span> <span>{t.termValue.replace('{years}', inputs.sfTermYears.toString()).replace('{rate}', inputs.sfInterestRate.toString())}</span></li>
                <li className="flex justify-between pt-3 border-t border-white/10 font-semibold text-[#529e14]">
                  <span>{t.totalYieldLabel}</span> <span>{formatMoney(strategies.sellerFinance.totalYield)}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* AJUSTES AVANZADOS */}
          <div className="border-t border-white/10">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="w-full p-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors focus:outline-none"
            >
              <span className="font-bold text-gray-300">{t.fineTuneBtn}</span>
              <span className="text-gray-400">{showSettings ? t.hide : t.show}</span>
            </button>
            
            {showSettings && (
              <div className="p-6 bg-black/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/10 pb-2">{t.sectionCondition}</h4>
                  <InputGroup label={t.arvInput} value={inputs.arv} onChange={(v) => handleInputChange('arv', v)} />
                  <InputGroup label={t.rehabInput} value={inputs.rehabCosts} onChange={(v) => handleInputChange('rehabCosts', v)} />
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/10 pb-2">{t.sectionCosts}</h4>
                  <InputGroup label={t.discountInput} value={inputs.investorDiscountPercent} onChange={(v) => handleInputChange('investorDiscountPercent', v)} />
                  <InputGroup label={t.realtorInput} value={inputs.realtorFeePercent} onChange={(v) => handleInputChange('realtorFeePercent', v)} />
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/10 pb-2">{t.sectionBank}</h4>
                  <InputGroup label={t.pricePremiumInput} value={inputs.sfPricePremiumPercent} onChange={(v) => handleInputChange('sfPricePremiumPercent', v)} />
                  
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] text-gray-400 uppercase font-semibold">{t.downPaymentInput}</label>
                      <button 
                        onClick={() => setIsDpPercent(!isDpPercent)}
                        className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded hover:bg-white/20 hover:text-white transition-colors"
                      >
                        {isDpPercent ? t.switchToMoney : t.switchToPercent}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500 text-sm">{isDpPercent ? '%' : '$'}</span>
                      <input 
                        type="number" 
                        value={isDpPercent ? inputs.sfDownPaymentPercent : inputs.sfDownPaymentFlat} 
                        onChange={(e) => isDpPercent ? handleInputChange('sfDownPaymentPercent', e.target.value) : handleInputChange('sfDownPaymentFlat', e.target.value)}
                        className="bg-black/40 border border-white/10 text-white rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-[#529e14] focus:ring-1 focus:ring-[#529e14] transition-all w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/10 pb-2">{t.sectionReturns}</h4>
                  <InputGroup label={t.interestInput} value={inputs.sfInterestRate} onChange={(v) => handleInputChange('sfInterestRate', v)} />
                  <InputGroup label={t.termInput} value={inputs.sfTermYears} onChange={(v) => handleInputChange('sfTermYears', v)} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function InputGroup({ label, value, onChange }: { label: string, value: number, onChange: (val: string) => void }) {
  return (
    <div className="flex flex-col">
      <label className="text-[11px] text-gray-400 uppercase mb-1 font-semibold">{label}</label>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="bg-black/40 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#529e14] focus:ring-1 focus:ring-[#529e14] transition-all w-full"
      />
    </div>
  );
}