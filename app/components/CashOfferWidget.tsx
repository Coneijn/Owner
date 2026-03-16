'use client';

import { useState,useEffect,useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

interface DealInputs {
  arv: number;
  rehabCosts: number;
  estimatedRent: number;
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
  onSelectOption?: (option: string, data: any) => void; // Preparado para conectar con el Modal
}
const libraries : ("places" | "visualization")[] = ["places", "visualization"]; // Necesario para el Autocomplete de Google Maps
const i18n = {
  es: {
    title: "Descubre el Verdadero Potencial de tu Propiedad",
    placeholder: "Ingresa la dirección completa...",
    conditionLabel: "Nivel de Reparaciones Necesarias:",
    cond0: "0 - Sin arreglos",
    cond5: "5 - Remodelación total",
    analyzeBtn: "Ver mis Opciones",
    analyzing: "Analizando...",
    beds: "Camas", baths: "Baños", sqft: "Pies²",
    switchToMoney: "Cambiar a $", switchToPercent: "Cambiar a %",
    backedByComps: "Respaldado por {n} ventas recientes",
    rangeTitle: "Tu Potencial de Ganancia",
    rangeDesc: "Como dueño, tienes múltiples formas de capitalizar tu propiedad. Sé el banco, véndela en el mercado, obtén efectivo rápido o réntala.",
    transparencyTitle: "🧠 ¿Cómo calculamos esto?",
    transparencyArv: "El Valor Remodelado (ARV) se estimó analizando {n} propiedades comparables vendidas recientemente.",
    transparencyRehab: "Las reparaciones se estimaron a {price}/SqFt basándonos en tu indicación de condición, tamaño y edad.",
    
    // Opciones
    sellerFinanceTitle: "Sé el Banco", sellerFinanceSub: "(Dueño a Dueño)",
    sellerFinanceDesc: "Vende a plazos. Recibe un pago inicial hoy y genera ingresos mensuales sin lidiar con inquilinos.",
    downPaymentReceivedLabel: "Pago Inicial:", monthlyIncomeLabel: "Ingreso Mensual (P&I):", termLabel: "Plazo:", termValue: "{years} años al {rate}%", totalYieldLabel: "Rendimiento Total:",
    
    fixListTitle: "Fix & List", fixListSub: "(Remodela y Vende)",
    fixListDesc: "Invierte tu dinero en reparar la casa para venderla al precio máximo en el mercado tradicional.",
    marketSaleLabel: "Venta a Precio Mercado:", yourInvestmentLabel: "Tu Inversión en Arreglos:", realtorFeeLabel: "Comisiones Reales ({n}%):", netProfitLabel: "Ganancia Neta Final:",
    
    cashBuyerTitle: "Venta Rápida", cashBuyerSub: "(Pago en Efectivo)",
    cashBuyerDesc: "Vende \"tal como está\" sin gastar en reparaciones. Cierre en días, no en meses.",
    arvLabel: "Valor Remodelado (ARV):", investorDiscountLabel: "Descuento Inversionista:", rehabSavingsLabel: "Costo de Reparaciones:", cashInPocketLabel: "Efectivo en tu Bolsillo:",
    
    rentTitle: "Rentar", rentSub: "(Alquiler Tradicional)",
    rentDesc: "Conserva la propiedad, lidia con inquilinos y genera ingresos mensuales de alquiler.",
    rentMonthlyLabel: "Renta Mensual Estimada:", rentAnnualLabel: "Ingreso Anual Bruto:",
    
    chooseBtn: "Elegir esta opción ->",
    
    // Ajustes
    fineTuneBtn: "⚙️ Ajustar los Números de mi Propiedad", hide: "▲ Ocultar", show: "▼ Mostrar Controles",
    sectionCondition: "Condición Actual", arvInput: "Valor Remodelada (ARV $)", rehabInput: "Costo para Reparar ($)", rentInput: "Renta Mensual ($)",
    sectionCosts: "Costos de Venta", discountInput: "Descuento Inversionista %", realtorInput: "Comisión Realtor %",
    sectionBank: "Términos del Banco (Tú)", pricePremiumInput: "Precio de Venta (% del ARV)", downPaymentInput: "Enganche Requerido",
    sectionReturns: "Retornos Financieros", interestInput: "Tasa de Interés a Cobrar %", termInput: "Plazo del Préstamo (Años)",
    compsTitle: "Propiedades Comparables"
  },
  en: {
    title: "Discover Your Property's True Potential",
    placeholder: "Enter full address...",
    conditionLabel: "Repairs Needed Level:",
    cond0: "0 - Move-in ready",
    cond5: "5 - Full gut rehab",
    analyzeBtn: "See My Options",
    analyzing: "Analyzing...",
    beds: "Beds", baths: "Baths", sqft: "SqFt",
    switchToMoney: "Switch to $", switchToPercent: "Switch to %",
    backedByComps: "Backed by {n} recent sales",
    rangeTitle: "Your Profit Potential",
    rangeDesc: "As an owner, you have multiple ways to capitalize on your property. Be the bank, list it, sell for fast cash, or rent it out.",
    transparencyTitle: "🧠 How did we calculate this?",
    transparencyArv: "The After Repair Value (ARV) was estimated by analyzing {n} recently sold comparable properties.",
    transparencyRehab: "Repairs were estimated at {price}/SqFt based on your condition input, property size, and age.",
    
    // Opciones
    sellerFinanceTitle: "Be The Bank", sellerFinanceSub: "(Seller Financing)",
    sellerFinanceDesc: "Sell on terms. Receive a down payment today and generate monthly income without dealing with tenants.",
    downPaymentReceivedLabel: "Down Payment:", monthlyIncomeLabel: "Monthly Income (P&I):", termLabel: "Term:", termValue: "{years} yrs at {rate}%", totalYieldLabel: "Total Yield:",
    
    fixListTitle: "Fix & List", fixListSub: "(Rehab & Sell)",
    fixListDesc: "Invest your money in repairing the house to sell it for maximum price on the traditional market.",
    marketSaleLabel: "Market Value Sale:", yourInvestmentLabel: "Your Rehab Investment:", realtorFeeLabel: "Realtor Fees ({n}%):", netProfitLabel: "Final Net Profit:",
    
    cashBuyerTitle: "Fast Cash Sale", cashBuyerSub: "(Sell to Cash Buyer)",
    cashBuyerDesc: "Sell 'as-is' without spending on repairs. Close in days, not months.",
    arvLabel: "After Repair Value (ARV):", investorDiscountLabel: "Investor Discount:", rehabSavingsLabel: "Rehab Cost:", cashInPocketLabel: "Cash in Your Pocket:",
    
    rentTitle: "Rent It Out", rentSub: "(Traditional Rental)",
    rentDesc: "Keep the property, deal with tenants, and generate monthly rental income.",
    rentMonthlyLabel: "Estimated Monthly Rent:", rentAnnualLabel: "Gross Annual Income:",
    
    chooseBtn: "Choose this option ->",
    
    // Ajustes
    fineTuneBtn: "⚙️ Fine Tune My Property Numbers", hide: "▲ Hide", show: "▼ Show Controls",
    sectionCondition: "Current Condition", arvInput: "After Repair Value (ARV $)", rehabInput: "Cost to Repair ($)", rentInput: "Monthly Rent ($)",
    sectionCosts: "Selling Costs", discountInput: "Investor Discount %", realtorInput: "Realtor Fee %",
    sectionBank: "The Bank's Terms (You)", pricePremiumInput: "Sale Price (% of ARV)", downPaymentInput: "Required Down Payment",
    sectionReturns: "Financial Returns", interestInput: "Interest Rate %", termInput: "Loan Term (Years)",
    compsTitle: "Comparable Properties"
  }
};

export default function CashOfferWidget({ lang = 'es', onSelectOption }: CashOfferWidgetProps) {
  const t = i18n[lang];
  
  const [address, setAddress] = useState('');
  const [conditionScale, setConditionScale] = useState(3); // Estado para la escala 0-5
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showComps, setShowComps] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<any>(null);
  const [isDpPercent, setIsDpPercent] = useState(true);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries 
  });

  const [parsedAddress, setParsedAddress] = useState({ street: '', city: '', state: '', zip: '' });

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place && place.formatted_address) {
        setAddress(place.formatted_address);

        // NUEVO: Desglosar los componentes de la dirección de Google
        let streetNumber = ""; let route = ""; let newCity = ""; let newState = ""; let newZip = "";
        place.address_components?.forEach((component: google.maps.GeocoderAddressComponent) => {
            const types = component.types;
            if (types.includes("street_number")) streetNumber = component.long_name;
            if (types.includes("route")) route = component.long_name;
            if (types.includes("locality")) newCity = component.long_name;
            if (types.includes("administrative_area_level_1")) newState = component.short_name;
            if (types.includes("postal_code")) newZip = component.long_name;
        });
        
        setParsedAddress({
            street: (streetNumber && route) ? `${streetNumber} ${route}` : place.name || place.formatted_address,
            city: newCity,
            state: newState,
            zip: newZip
        });
      }
    }
  };
  const [inputs, setInputs] = useState<DealInputs>({
    arv: 250000,
    rehabCosts: 25000,
    estimatedRent: 1500,
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
    sellerFinance: { salePrice: 0, downPayment: 0, monthlyIncome: 0, totalYield: 0 },
    rent: { monthly: 0, annual: 0 }
  });

  const handleInputChange = (field: keyof DealInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  useEffect(() => {
    const calc = () => {
      const { 
        arv, rehabCosts, estimatedRent, investorDiscountPercent, realtorFeePercent,
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

      setStrategies({
        cashBuyer: { offer: finalCashOffer },
        fixAndList: { grossSale: arv, costToSell: rehabCosts + realtorFee, netProfit: fixListNet },
        sellerFinance: { salePrice: sfPrice, downPayment: sfDownPayment, monthlyIncome: sfMonthlyIncome, totalYield: sfDownPayment + (sfMonthlyIncome * numPayments) },
        rent: { monthly: estimatedRent, annual: estimatedRent * 12 }
      });
    };
    calc();
  }, [inputs, isDpPercent]);

  const analyzeProperty = async () => {
    if (!address) return;
    setLoading(true); setError(''); setPropertyDetails(null);
    
    try {
      // Enviamos address y conditionScale al endpoint
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), conditionScale }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error.');

      setPropertyDetails(data);

      setInputs(prev => ({
        ...prev,
        arv: data.arv || prev.arv,
        rehabCosts: data.repairCosts !== undefined ? data.repairCosts : prev.rehabCosts,
        estimatedRent: data.estimatedRent || prev.estimatedRent,
        sfDownPaymentFlat: (data.arv || prev.arv) * (prev.sfDownPaymentPercent / 100)
      }));
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (strategyName: string) => {
    if (onSelectOption) {
      // NUEVO: Pasamos el parsedAddress al modal
      onSelectOption(strategyName, { address, parsedAddress, propertyDetails, inputs, strategies });
    } else {
      console.log(`Seleccionaste: ${strategyName}`, { address, propertyDetails, inputs, strategies });
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

return (
    <div className="w-full bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden text-white">
      
      {/* HEADER BUSCADOR Y SLIDER DE CONDICIÓN */}
      <div className="p-6 border-b border-white/10 bg-white/5 relative z-20">
        <h2 className="text-xl font-bold mb-4 text-white">{t.title}</h2>
        
        <div className="flex flex-col gap-4 mb-4">
          {isLoaded ? (
            <Autocomplete
              onLoad={(auto) => (autocompleteRef.current = auto)}
              onPlaceChanged={onPlaceChanged}
              options={{
                types: ["address"],
                componentRestrictions: { country: "us" }, // Limitar a USA si aplica
              }}
            >
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.placeholder}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#529e14] focus:ring-1 focus:ring-[#529e14] text-white placeholder-gray-500 transition-all"
              />
            </Autocomplete>
          ) : (
            <input 
              type="text" 
              disabled
              placeholder="Cargando mapa..."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed transition-all"
            />
          )}
          
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-300">{t.conditionLabel} <span className="text-[#529e14] font-bold text-lg">{conditionScale}</span></label>
            </div>
            <input 
              type="range" min="0" max="5" step="1"
              value={conditionScale}
              onChange={(e) => setConditionScale(Number(e.target.value))}
              className="w-full accent-[#529e14] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
              <span>{t.cond0}</span>
              <span>{t.cond5}</span>
            </div>
          </div>
          
          <button 
            onClick={analyzeProperty}
            disabled={loading}
            className="w-full bg-[#529e14] text-[#0a0f1c] font-black uppercase tracking-wide px-8 py-4 rounded-lg hover:bg-[#459e10] disabled:opacity-50 transition-all shadow-lg shadow-[#529e14]/20"
          >
            {loading ? t.analyzing : t.analyzeBtn}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        
        {propertyDetails && (
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-400 relative">
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">🛏️ {propertyDetails.bedrooms} {t.beds}</span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">🚿 {propertyDetails.bathrooms} {t.baths}</span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">📐 {propertyDetails.sqft} {t.sqft}</span>
            
            {/* BOTÓN DE COMPARABLES */}
            {propertyDetails.recentSales && propertyDetails.recentSales.length > 0 && (
              <div className="relative">
                <button 
                  onClick={() => setShowComps(!showComps)}
                  className="bg-[#529e14]/10 border border-[#529e14]/30 text-[#529e14] px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-[#529e14]/20 transition-all font-bold"
                >
                  📊 {t.backedByComps.replace('{n}', propertyDetails.recentSales.length.toString())}
                </button>

                {/* MODAL FLOTANTE DE COMPARABLES */}
                {showComps && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[100] p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">{t.compsTitle}</h4>
                      <button onClick={() => setShowComps(false)} className="text-gray-500 hover:text-white">✕</button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {propertyDetails.recentSales.map((comp: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start gap-2 border-b border-white/5 pb-2 last:border-0">
                          <span className="text-[11px] text-gray-300 leading-tight">{comp.address}</span>
                          <span className="text-xs font-bold text-[#529e14] whitespace-nowrap">{formatMoney(comp.price)}</span>
                        </div>
                      ))}
                    </div>
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
          
          <div className="py-8 px-6 text-center bg-gradient-to-b from-white/5 to-transparent border-b border-white/10">
            <p className="text-gray-400 uppercase tracking-widest text-sm font-semibold mb-2">{t.rangeTitle}</p>
            {/* NUEVO: Rango de Precios Gigante */}
            <div className="text-5xl md:text-6xl font-black text-[#c6ea21] mb-6 drop-shadow-md tracking-tighter">
              {formatMoney(strategies.cashBuyer.offer)} - {formatMoney(strategies.sellerFinance.totalYield)}
            </div>
            <p className="text-gray-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
              {t.rangeDesc}
            </p>
          </div>
          {/* "¿Cómo calculamos esto?" */}
            <div className="bg-black/40 border border-white/5 p-5 rounded-xl max-w-4xl mx-auto text-left shadow-inner">
              <h4 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
                {t.transparencyTitle}
              </h4>
              <ul className="list-disc list-inside text-xs text-gray-400 space-y-2 leading-relaxed">
                <li>
                  {t.transparencyArv.replace('{n}', propertyDetails.recentSales?.length?.toString() || '0')}
                </li>
                <li>
                  {t.transparencyRehab.replace(
                    '{price}', 
                    formatMoney(inputs.rehabCosts / (propertyDetails.sqft || 1))
                  )}
                </li>
              </ul>
            </div>
          

          {/* GRID DE 4 COLUMNAS CON EL NUEVO ORDEN */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            
            {/* OPCION 1: SELLER FINANCE */}
            <div className="p-6 bg-black/20 hover:bg-white/5 transition-colors group flex flex-col relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#529e14]"></div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🏦</span>
                <h3 className="text-lg font-bold text-white">{t.sellerFinanceTitle} <br/><span className="text-xs text-gray-400 font-normal">{t.sellerFinanceSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-[#529e14] mb-2">
                {formatMoney(strategies.sellerFinance.totalYield)}
              </div>
              <p className="text-xs text-gray-400 mb-6 flex-grow">{t.sellerFinanceDesc}</p>
              <ul className="space-y-3 text-sm text-gray-300 mb-6">
                <li className="flex justify-between"><span>{t.downPaymentReceivedLabel}</span> <span className="text-blue-400">{formatMoney(strategies.sellerFinance.downPayment)}</span></li>
                <li className="flex justify-between"><span>{t.monthlyIncomeLabel}</span> <span className="text-[#529e14]">+{formatMoney(strategies.sellerFinance.monthlyIncome)}/mo</span></li>
                <li className="flex justify-between"><span>{t.termLabel}</span> <span>{t.termValue.replace('{years}', inputs.sfTermYears.toString()).replace('{rate}', inputs.sfInterestRate.toString())}</span></li>
              </ul>
              <button onClick={() => handleSelect('owner_finance')} className="w-full py-3 border-2 border-[#529e14] text-[#529e14] hover:bg-[#529e14] hover:text-white font-bold rounded-lg transition-colors mt-auto">
                {t.chooseBtn}
              </button>
            </div>

            {/* OPCION 2: FIX & LIST */}
            <div className="p-6 bg-transparent hover:bg-white/5 transition-colors group flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔨</span>
                <h3 className="text-lg font-bold text-white">{t.fixListTitle} <br/><span className="text-xs text-gray-400 font-normal">{t.fixListSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">
                {formatMoney(strategies.fixAndList.netProfit)}
              </div>
              <p className="text-xs text-gray-400 mb-6 flex-grow">{t.fixListDesc}</p>
              <ul className="space-y-3 text-sm text-gray-300 mb-6">
                <li className="flex justify-between"><span>{t.marketSaleLabel}</span> <span>{formatMoney(strategies.fixAndList.grossSale)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.yourInvestmentLabel}</span> <span>-{formatMoney(inputs.rehabCosts)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.realtorFeeLabel.replace('{n}', inputs.realtorFeePercent.toString())}</span> <span>-{formatMoney(strategies.fixAndList.grossSale * (inputs.realtorFeePercent / 100))}</span></li>
              </ul>
              <button onClick={() => handleSelect('fix_list')} className="w-full py-3 border border-gray-600 text-gray-300 hover:bg-white/10 font-bold rounded-lg transition-colors mt-auto">
                {t.chooseBtn}
              </button>
            </div>

            {/* OPCION 3: CASH BUYER */}
            <div className="p-6 bg-transparent hover:bg-white/5 transition-colors group flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg font-bold text-white">{t.cashBuyerTitle} <br/><span className="text-xs text-gray-400 font-normal">{t.cashBuyerSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-yellow-400 transition-colors">
                {formatMoney(strategies.cashBuyer.offer)}
              </div>
              <p className="text-xs text-gray-400 mb-6 flex-grow">{t.cashBuyerDesc}</p>
              <ul className="space-y-3 text-sm text-gray-300 mb-6">
                <li className="flex justify-between"><span>{t.arvLabel}</span> <span>{formatMoney(inputs.arv)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.rehabSavingsLabel}</span> <span>-{formatMoney(inputs.rehabCosts)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.investorDiscountLabel}</span> <span>-{inputs.investorDiscountPercent}%</span></li>
              </ul>
              <button onClick={() => handleSelect('cash_sale')} className="w-full py-3 border border-gray-600 text-gray-300 hover:bg-white/10 font-bold rounded-lg transition-colors mt-auto">
                {t.chooseBtn}
              </button>
            </div>

            {/* OPCION 4: RENT (NUEVO) */}
            <div className="p-6 bg-transparent hover:bg-white/5 transition-colors group flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔑</span>
                <h3 className="text-lg font-bold text-white">{t.rentTitle} <br/><span className="text-xs text-gray-400 font-normal">{t.rentSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">
                {formatMoney(strategies.rent.monthly)}<span className="text-lg text-gray-500 font-normal">/mo</span>
              </div>
              <p className="text-xs text-gray-400 mb-6 flex-grow">{t.rentDesc}</p>
              <ul className="space-y-3 text-sm text-gray-300 mb-6">
                <li className="flex justify-between pt-3 border-t border-white/10 font-semibold text-purple-400">
                  <span>{t.rentAnnualLabel}</span> <span>{formatMoney(strategies.rent.annual)}</span>
                </li>
              </ul>
              <button onClick={() => handleSelect('rent')} className="w-full py-3 border border-gray-600 text-gray-300 hover:bg-white/10 font-bold rounded-lg transition-colors mt-auto">
                {t.chooseBtn}
              </button>
            </div>

          </div>

          {/* AJUSTES AVANZADOS (Se actualizó para incluir input de renta) */}
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
                  <InputGroup label={t.rentInput} value={inputs.estimatedRent} onChange={(v) => handleInputChange('estimatedRent', v)} />
                </div>
                {/* ... (Las secciones de costos y bancos se mantienen igual que tu código original) */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/10 pb-2">{t.sectionCosts}</h4>
                  <InputGroup label={t.discountInput} value={inputs.investorDiscountPercent} onChange={(v) => handleInputChange('investorDiscountPercent', v)} />
                  <InputGroup label={t.realtorInput} value={inputs.realtorFeePercent} onChange={(v) => handleInputChange('realtorFeePercent', v)} />
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/10 pb-2">{t.sectionBank}</h4>
                  <InputGroup label={t.pricePremiumInput} value={inputs.sfPricePremiumPercent} onChange={(v) => handleInputChange('sfPricePremiumPercent', v)} />
                  {/* ... (Input del down payment) */}
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