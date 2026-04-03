'use client';

import { useState, useEffect, useRef } from 'react';
import { useJsApiLoader, Autocomplete, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import RehabConditionWheel from './RehabConditionWheel';

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
  sfLoanServicingFee: number;
  taxesAnnual: number;
  insuranceAnnual: number;
  adminFeeMonthly: number;
  maintannaceMonthly: number;
}

interface CashOfferWidgetProps {
  lang?: 'es' | 'en';
  onSelectOption?: (option: string, data: any) => void; 
  allProperties?: any[]; 
}

const libraries: ("places" | "visualization")[] = ["places", "visualization"];

const i18n = {
  es: {
    title: "Descubre el Verdadero Potencial de tu Propiedad",
    placeholder: "Ingresa la dirección completa...",
    conditionLabel: "Nivel de Reparaciones Necesarias:",
    cond0: "0 - Sin arreglos",
    cond5: "5 - Remodelación total",
    analyzeBtn: "Listar mi casa",
    analyzing: "Analizando...",
    beds: "Camas", baths: "Baños", sqft: "Pies²",
    switchToMoney: "Cambiar a $", switchToPercent: "Cambiar a %",
    backedByComps: "Respaldado por {n} ventas recientes",
    rangeTitle: "Tu Potencial de Ganancia",
    rangeDesc: "Como dueño, tienes múltiples formas de capitalizar tu propiedad. Sé el banco, véndela en el mercado, obtén efectivo rápido o réntala.",
    transparencyTitle: "🧠 ¿Cómo calculamos esto?",
    transparencyArv: "El Valor Remodelado (ARV) se estimó analizando {n} propiedades comparables vendidas recientemente.",
    transparencyRehab: "Las reparaciones se estimaron a {price}/SqFt basándonos en tu indicación de condición, tamaño y edad.",
    backedByRentComps: "Respaldado por {n} rentas",
selectRentCompsTitle: "Selecciona propiedades en renta",
selectRentCompsDesc: "Usaremos la renta mensual promedio de estas casas para afinar tu estimación.",
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
    rentGrossLabel: "Ingreso Bruto Mensual:",
    rentExpensesLabel: "Gastos Mensuales Est.:",
    rentTaxesLabel: "• Impuestos",
    rentInsuranceLabel: "• Seguro",
    rentAdminLabel: "• Administración",
    rentMaintLabel: "• Mantenimiento",
    rentMonthlyLabel: "Renta Mensual Estimada:", rentAnnualLabel: "Flujo de Caja Anual Neto:",
    netCashflowLabel: "Flujo de Caja Neto",
    
    chooseBtn: "Elegir esta opción ->",
    
    fineTuneBtn: "⚙️ Trabajar los Números Aquí", hide: "▲ Ocultar", show: "▼ Mostrar Controles",
    sectionCondition: "Condición Actual", arvInput: "Valor Remodelada (ARV $)", rehabInput: "Costo para Reparar ($)", rentInput: "Renta Mensual ($)",
    sectionCosts: "Costos de Venta", discountInput: "Descuento Inversionista %", realtorInput: "Comisión Realtor %",
    sectionBank: "Términos del Banco (Tú)", pricePremiumInput: "Precio de Venta (% del ARV)", downPaymentInput: "Enganche Requerido",
    sectionReturns: "Retornos Financieros", interestInput: "Tasa de Interés a Cobrar %", termInput: "Plazo del Préstamo (Años)",
    compsTitle: "Propiedades Comparables",
    selectCompsTitle: "Selecciona de 3 a 5 propiedades",
    selectCompsDesc: "Usaremos el precio de venta promedio de estas casas para afinar el valor de la tuya.",
    selectedText: "Seleccionada",
    selectText: "Elegir",
    closeBtn: "Guardar y Calcular"
  },
  en: {
    title: "Discover Your Property's True Potential",
    placeholder: "Enter full address...",
    conditionLabel: "Repairs Needed Level:",
    cond0: "0 - Move-in ready",
    cond5: "5 - Full gut rehab",
    analyzeBtn: "List my home",
    analyzing: "Analyzing...",
    beds: "Beds", baths: "Baths", sqft: "SqFt",
    switchToMoney: "Switch to $", switchToPercent: "Switch to %",
    backedByComps: "Backed by {n} recent sales",
    rangeTitle: "Your Profit Potential",
    rangeDesc: "As an owner, you have multiple ways to capitalize on your property. Become the bank, list it, sell for fast cash, or rent it out.",
    transparencyTitle: "🧠 How did we calculate this?",
    transparencyArv: "The After Repair Value (ARV) was estimated by analyzing {n} recently sold comparable properties.",
    transparencyRehab: "Repairs were estimated at {price}/SqFt based on your condition input, property size, and age.",
    backedByRentComps: "Backed by {n} recent rents",
selectRentCompsTitle: "Select similar rental properties",
selectRentCompsDesc: "We will use the average monthly rent of these homes to fine-tune your estimate.",
    sellerFinanceTitle: "Become The Bank", sellerFinanceSub: "(Seller Financing)",
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
    rentGrossLabel: "Gross Monthly Rent:",
    rentExpensesLabel: "Est. Monthly Expenses:",
    rentTaxesLabel: "• Property Taxes",
    rentInsuranceLabel: "• Insurance",
    rentAdminLabel: "• Property Mgmt",
    rentMaintLabel: "• Maintenance",
    rentMonthlyLabel: "Estimated Monthly Rent:", rentAnnualLabel: "Net Annual Cashflow:",
    netCashflowLabel: "Net Cashflow",
    
    chooseBtn: "Choose this option ->",
    
    fineTuneBtn: "⚙️ Work the Numbers Here", hide: "▲ Hide", show: "▼ Show Controls",
    sectionCondition: "Current Condition", arvInput: "After Repair Value (ARV $)", rehabInput: "Cost to Repair ($)", rentInput: "Monthly Rent ($)",
    sectionCosts: "Selling Costs", discountInput: "Investor Discount %", realtorInput: "Realtor Fee %",
    sectionBank: "The Bank's Terms (You)", pricePremiumInput: "Sale Price (% of ARV)", downPaymentInput: "Required Down Payment",
    sectionReturns: "Financial Returns", interestInput: "Interest Rate %", termInput: "Loan Term (Years)",
    compsTitle: "Comparable Properties",
    selectCompsTitle: "Select 3 to 5 similar properties",
    selectCompsDesc: "We will use the average sale price of these homes to fine-tune your home's value.",
    selectedText: "Selected",
    selectText: "Select",
    closeBtn: "Save & Calculate"
  }
};

export default function CashOfferWidget({ lang = 'es', onSelectOption, allProperties }: CashOfferWidgetProps) {
  const t = i18n[lang];
  
  const [address, setAddress] = useState('');
  const [conditionScale, setConditionScale] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
// Reemplazar showComps por activeModal
const [activeModal, setActiveModal] = useState<'sales' | 'rent' | null>(null);
const [selectedComps, setSelectedComps] = useState<any[]>([]);
const [selectedRentComps, setSelectedRentComps] = useState<any[]>([]); 
const [showSettings, setShowSettings] = useState(false);
const [propertyDetails, setPropertyDetails] = useState<any>(null);
const [isWheelExpanded, setIsWheelExpanded] = useState(false);
  
  // Nuevo estado para controlar porcentaje vs dinero en el enganche
  const [isDpPercent, setIsDpPercent] = useState(false); 
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries 
  });

  const [parsedAddress, setParsedAddress] = useState({ street: '', city: '', state: '', zip: '', lat: 0, lng: 0 });
  const [mapFilter, setMapFilter] = useState<'available' | 'sold'>('available'); 
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place && place.formatted_address) {
        setAddress(place.formatted_address);

        const lat = place.geometry?.location?.lat() || 0;
        const lng = place.geometry?.location?.lng() || 0;

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
            zip: newZip,
            lat, 
            lng  
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
    sfDownPaymentFlat: 10000,
    sfInterestRate: 12,
    sfTermYears: 30,
    sfLoanServicingFee: 39,
    taxesAnnual: 3000,
    insuranceAnnual: 1200,
    adminFeeMonthly: 150,
    maintannaceMonthly: 100
  });

  const [strategies, setStrategies] = useState({
    cashBuyer: { offer: 0 },
    fixAndList: { grossSale: 0, costToSell: 0, netProfit: 0 },
    sellerFinance: { salePrice: 0, downPayment: 0, monthlyIncome: 0, totalYield: 0, taxesMonthly: 0, insuranceMonthly: 0, servicingFee: 39, totalMonthlyPayment: 0 },
    rent: { monthly: 0, netMonthly : 0, annual: 0 }
  });

  const handleInputChange = (field: keyof DealInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  // Actualizar ARV cuando cambian las ventas seleccionadas
  useEffect(() => {
    if (selectedComps.length > 0) {
      const avgPrice = selectedComps.reduce((sum, comp) => sum + comp.price, 0) / selectedComps.length;
      setInputs(prev => ({ ...prev, arv: Math.round(avgPrice) }));
    }
  }, [selectedComps]);

  // 👇 NUEVO: Actualizar Renta cuando cambian las rentas seleccionadas 👇
  useEffect(() => {
    if (selectedRentComps.length > 0) {
      const avgRent = selectedRentComps.reduce((sum, comp) => sum + comp.price, 0) / selectedRentComps.length;
      setInputs(prev => ({ ...prev, estimatedRent: Math.round(avgRent) }));
    }
  }, [selectedRentComps]);

  useEffect(() => {
    const calc = () => {
      const { 
        arv, rehabCosts, estimatedRent, investorDiscountPercent, realtorFeePercent,
        sfPricePremiumPercent, sfDownPaymentPercent, sfDownPaymentFlat, sfInterestRate, sfTermYears,
        taxesAnnual, insuranceAnnual, adminFeeMonthly, maintannaceMonthly
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
      
      if (numPayments > 0) { 
        if (monthlyRate > 0 && sfLoanAmount > 0) {
          sfMonthlyIncome = sfLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        } else if (sfLoanAmount > 0) {
          sfMonthlyIncome = sfLoanAmount / numPayments; 
        }
      }
      const sfTaxesMonthly = taxesAnnual / 12;
      const sfInsuranceMonthly = insuranceAnnual / 12;
      const sfTotalMonthlyPayment = sfMonthlyIncome + sfTaxesMonthly + sfInsuranceMonthly + inputs.sfLoanServicingFee;
      const rentDeductionsMonthly = (taxesAnnual / 12) + (insuranceAnnual / 12) + adminFeeMonthly + maintannaceMonthly;
      const netMonthlyRent = estimatedRent - rentDeductionsMonthly;
      
      setStrategies({
        cashBuyer: { offer: finalCashOffer },
        fixAndList: { grossSale: arv, costToSell: rehabCosts + realtorFee, netProfit: fixListNet },
        sellerFinance: { salePrice: sfPrice, downPayment: sfDownPayment, monthlyIncome: sfMonthlyIncome, totalYield: sfDownPayment + (sfMonthlyIncome * numPayments), taxesMonthly: sfTaxesMonthly,
          insuranceMonthly: sfInsuranceMonthly,
          servicingFee: inputs.sfLoanServicingFee,
          totalMonthlyPayment: sfTotalMonthlyPayment},
        rent: { monthly: estimatedRent, netMonthly: netMonthlyRent, annual: netMonthlyRent * 12 }
      });
    };

    calc();
  }, [inputs, isDpPercent]);

  const analyzeProperty = async (overrideCondition?: number) => {
    if (!address) return;
    const currentCondition = overrideCondition !== undefined ? overrideCondition : conditionScale;
    setLoading(true); setError('');
    if (overrideCondition === undefined) setPropertyDetails(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), conditionScale: currentCondition }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error.');

      const sortedComps = (data.recentSales || []).sort((a: any, b: any) => b.price - a.price).slice(0, 5);
      const initialSelected = sortedComps.slice(0, 3);
      const sortedRents = (data.recentRents || []).sort((a: any, b: any) => b.price - a.price).slice(0, 5);
      const initialSelectedRents = sortedRents.slice(0, 3);
      setPropertyDetails({ ...data, recentSales: sortedComps });
      setSelectedComps(initialSelected);
      setSelectedRentComps(initialSelectedRents);

      setInputs(prev => ({
        ...prev,
        arv: data.arv || prev.arv, 
        rehabCosts: data.repairCosts !== undefined ? data.repairCosts : prev.rehabCosts,
        estimatedRent: data.estimatedRent || prev.estimatedRent,
        taxesAnnual: data.annualTaxes !== undefined ? parseFloat(Number(data.annualTaxes).toFixed(2)) : prev.taxesAnnual,
        insuranceAnnual: data.insuranceAnnual !== undefined ? parseFloat(Number(data.insuranceAnnual).toFixed(2)) : prev.insuranceAnnual
      }));
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (strategyName: string) => {
    if (onSelectOption) {
      onSelectOption(strategyName, { address, parsedAddress, propertyDetails, inputs, strategies });
    } else {
      console.log(`Seleccionaste: ${strategyName}`, { address, propertyDetails, inputs, strategies });
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden text-white">
      
      <style>{`
        @keyframes ping-custom {
          75%, 100% { transform: scale(1.35); opacity: 0; }
        }
        .animate-ping-custom {
          animation: ping-custom 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* HEADER BUSCADOR Y SLIDER DE CONDICIÓN */}
      <div className="p-6 border-b border-white/10 bg-white/5 relative z-20">
        <h2 className="text-xl font-bold mb-4 text-white">{t.title}</h2>
        
        {!propertyDetails && (
          <div className="flex flex-col gap-4 mb-4">
            {isLoaded ? (
              <Autocomplete
                onLoad={(auto) => (autocompleteRef.current = auto)}
                onPlaceChanged={onPlaceChanged}
                options={{
                  types: ["address"],
                  componentRestrictions: { country: "us" },
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
          </div>
        )}

        <div className={`bg-black/20 rounded-lg border border-white/5 transition-all mb-4 ${propertyDetails ? 'p-3 mt-4' : 'p-4'}`}>
          <div 
            className={`flex justify-between items-center ${propertyDetails ? 'cursor-pointer' : ''}`}
            onClick={() => propertyDetails && setIsWheelExpanded(!isWheelExpanded)}
          >
            <label className={`text-sm font-semibold text-gray-300 ${propertyDetails ? 'cursor-pointer' : ''}`}>
              {t.conditionLabel} <span className="text-[#529e14] font-bold text-lg">{conditionScale}</span>
            </label>
            {propertyDetails && (
              <span className="text-gray-400 text-xs font-bold px-2 py-1 bg-white/5 rounded hover:text-white transition-colors">
                {isWheelExpanded ? t.hide : '▼ Editar'}
              </span>
            )}
          </div>

          {(!propertyDetails || isWheelExpanded) && (
            <div className="mt-4">
              <RehabConditionWheel 
                value={conditionScale} 
                onChange={(newVal) => {
                  setConditionScale(newVal);
                  if (propertyDetails) {
                    setIsWheelExpanded(false);
                    analyzeProperty(newVal);
                  }
                }} 
                lang={lang}
              />
            </div>
          )}
        </div>

        {!propertyDetails && (
          <div className="flex flex-col gap-4 mb-4">
            <button 
              onClick={() => analyzeProperty()}
              disabled={loading}
              className="relative w-full bg-[#529e14] text-[#0a0f1c] font-black uppercase tracking-wide px-8 py-4 rounded-lg hover:bg-[#459e10] disabled:opacity-50 transition-all shadow-lg shadow-[#529e14]/20 group"
            >
              {!loading && <span className="absolute inset-0 rounded-lg bg-[#529e14] animate-ping opacity-20 group-hover:hidden"></span>}
              <span className="relative z-10">{loading ? t.analyzing : t.analyzeBtn}</span>
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        
        {propertyDetails && (
          <div className="mt-5 flex flex-nowrap overflow-x-auto items-center gap-3 text-sm text-gray-400 relative py-4 px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">🛏️ {propertyDetails.bedrooms} {t.beds}</span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">🚿 {propertyDetails.bathrooms} {t.baths}</span>
            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-md">📐 {propertyDetails.sqft} {t.sqft}</span>
            <span className="bg-red-600/20 border border-red-500/40 text-red-200 px-3 py-1 rounded-md flex flex-col items-center leading-tight">
              <span className="font-bold text-xs">{propertyDetails.ownerName}</span>
              <span className="text-[9px]">Últ. Venta: {propertyDetails.lastSalePrice ? formatMoney(propertyDetails.lastSalePrice) : 'N/A'}</span>
            </span>

            <span className="bg-red-600/20 border border-red-500/40 text-red-200 px-3 py-1 rounded-md flex flex-col items-center leading-tight">
              <span className="font-bold text-xs">{lang === 'en' ? 'Lot:' : 'Lote:'} {propertyDetails.lotSize} SqFt</span>
              <span className="text-[9px]">Parking: {propertyDetails.garage}</span>
            </span>

            <span className="bg-red-600/20 border border-red-500/40 text-red-200 px-3 py-1 rounded-md flex flex-col items-center leading-tight">
              <span className="font-bold text-xs">Taxes</span>
              <span className="text-[9px] uppercase">{formatMoney(inputs.taxesAnnual)} / {lang === 'en' ? 'yr' : 'año'}</span>
            </span>
            {/* BOTÓN DE COMPARABLES DE VENTA */}
            {propertyDetails.recentSales && propertyDetails.recentSales.length > 0 && (
              <button 
                onClick={() => setActiveModal('sales')}
                className="relative bg-[#529e14]/10 border border-[#529e14]/30 text-[#529e14] px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-[#529e14]/20 hover:text-white hover:border-[#529e14]/60 hover:shadow-[0_0_15px_rgba(82,158,20,0.4)] transform hover:scale-105 transition-all duration-300 font-bold group"
              >
                <span className="absolute inset-0 rounded-md bg-[#529e14] animate-ping-custom opacity-40"></span>
                <span className="relative z-10 flex items-center gap-2 pointer-events-none">📊 {t.backedByComps.replace('{n}', propertyDetails.recentSales.length.toString())}</span>
              </button>
            )}

            {/* BOTÓN DE COMPARABLES DE RENTA */}
            {propertyDetails.recentRents && propertyDetails.recentRents.length > 0 && (
              <button 
                onClick={() => setActiveModal('rent')}
                className="relative bg-purple-600/10 border border-purple-500/30 text-purple-400 px-3 py-1.5 rounded-md flex items-center gap-2 hover:bg-purple-600/20 hover:text-white hover:border-purple-500/60 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transform hover:scale-105 transition-all duration-300 font-bold group"
              >
                <span 
                  className="absolute inset-0 rounded-md bg-purple-600 animate-ping-custom opacity-40"
                  style={{ animationDelay: '0.75s' }}
                ></span>
                <span className="relative z-10 flex items-center gap-2 pointer-events-none">🔑 {t.backedByRentComps.replace('{n}', propertyDetails.recentRents.length.toString())}</span>
              </button>
            )}

            {/* MODAL DINÁMICO (Ventas o Rentas) */}
            {activeModal && (() => {
              const isSales = activeModal === 'sales';
              const modalTitle = isSales ? t.selectCompsTitle : t.selectRentCompsTitle;
              const modalDesc = isSales ? t.selectCompsDesc : t.selectRentCompsDesc;
              const compsList = isSales ? propertyDetails.recentSales : propertyDetails.recentRents;
              const selectedList = isSales ? selectedComps : selectedRentComps;
              const setSelected = isSales ? setSelectedComps : setSelectedRentComps;
              const themeColor = isSales ? '#529e14' : '#a855f7'; // Verde para ventas, Morado para rentas

              return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                    
                    <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1a1a1a] z-10 rounded-t-2xl">
                      <div>
                        <h3 className="text-xl font-black text-white">{modalTitle}</h3>
                        <p className="text-sm text-gray-400 mt-1">{modalDesc}</p>
                      </div>
                      <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-white text-2xl font-bold">✕</button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {compsList.map((comp: any, idx: number) => {
                          const isSelected = selectedList.some(c => c.address === comp.address);
                          const sqft = comp.sqft || 1;
                          const ppsf = comp.price / sqft;
                          
                          return (
                            <div 
                              key={idx} 
                              onClick={() => {
                                if (isSelected) {
                                  setSelected(selectedList.filter(c => c.address !== comp.address));
                                } else {
                                  if (selectedList.length < 5) setSelected([...selectedList, comp]);
                                }
                              }}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-2 bg-black/40`}
                              style={{ borderColor: isSelected ? themeColor : 'rgba(255,255,255,0.05)', backgroundColor: isSelected ? `${themeColor}1A` : undefined }}
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-xs text-gray-300 font-medium leading-tight w-2/3">{comp.address}</span>
                                <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${isSelected ? 'text-white' : 'bg-white/10 text-gray-400'}`} style={{ backgroundColor: isSelected ? themeColor : undefined }}>
                                  {isSelected ? '✓ ' + t.selectedText : '+ ' + t.selectText}
                                </span>
                              </div>
                              <div className="mt-2">
                                <p className="text-2xl font-black text-white">{formatMoney(comp.price)}{!isSales && <span className="text-sm text-gray-400">/mo</span>}</p>
                                {isSales && <p className="text-xs font-bold mt-1" style={{ color: themeColor }}>{formatMoney(ppsf)} / sqft</p>}
                              </div>
                              <div className="flex gap-3 text-[11px] text-gray-500 mt-2 border-t border-white/5 pt-2">
                                <span>🛏️ {comp.bedrooms || '-'}</span>
                                <span>🚿 {comp.bathrooms || '-'}</span>
                                <span>📐 {sqft > 1 ? sqft : '-'} sqft</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="p-6 border-t border-white/10 bg-black/20 flex justify-between items-center rounded-b-2xl">
                      <span className="text-sm font-bold text-gray-300">
                        {selectedList.length} {lang === 'en' ? 'Selected' : 'Seleccionadas'}
                      </span>
                      <button 
                        onClick={() => setActiveModal(null)}
                        className="text-white px-8 py-3 rounded-lg font-black uppercase tracking-wide transition-colors"
                        style={{ backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}33` }}
                      >
                        {t.closeBtn}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      {propertyDetails && (
        <div className="animate-fadeIn relative z-10">
          
          {/* CORRECCIÓN: Validación isLoaded para el mapa */}
          {isLoaded && parsedAddress.lat !== 0 && parsedAddress.lng !== 0 && (
            <div className="border-t border-b border-white/10 bg-black/40">
              <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  📍 {lang === 'en' ? 'Location & Market Context' : 'Ubicación y Mercado'}
                </h3>
                <div className="flex bg-black/60 rounded-lg p-1 border border-white/10">
                  <button 
                    onClick={() => setMapFilter('available')}
                    className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all border flex items-center justify-center gap-1.5 ${
                      mapFilter === 'available' 
                        ? 'bg-[#1a1a1a] border-gray-600 shadow-lg' 
                        : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-300'
                    }`}
                  >
                    {lang === 'en' ? (
                      <>
                        <img src="/frog-pin.png" alt="Sale" className="w-5 h-5 object-contain" />
                        <span className={mapFilter === 'available' ? 'text-[#f8ed1a]' : ''}>For Sale</span>
                        <span className={mapFilter === 'available' ? 'text-white mx-0.5' : 'mx-0.5'}>&</span>
                        <img src="/frog-pin-renta.png" alt="Rent" className="w-5 h-5 object-contain" />
                        <span className={mapFilter === 'available' ? 'text-blue-400' : ''}>Rent</span>
                      </>
                    ) : (
                      <>
                        <span className={mapFilter === 'available' ? 'text-white' : ''}>En</span>
                        <img src="/frog-pin.png" alt="Sale" className="w-5 h-5 object-contain" />
                        <span className={mapFilter === 'available' ? 'text-[#f8ed1a]' : ''}>Venta</span>
                        <span className={mapFilter === 'available' ? 'text-white mx-0.5' : 'mx-0.5'}>y</span>
                        <img src="/frog-pin-renta.png" alt="Rent" className="w-5 h-5 object-contain" />
                        <span className={mapFilter === 'available' ? 'text-blue-400' : ''}>Renta</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setMapFilter('sold')}
                    className={`px-4 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${mapFilter === 'sold' ? 'bg-[#529e14] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    {lang === 'en' ? 'Recently Sold Properties In Your Area' : 'Vendidos en tu área'}
                  </button>
                </div>
              </div>

              <div className="w-full h-[350px] relative">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={{ lat: parsedAddress.lat, lng: parsedAddress.lng }}
                  zoom={14}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    gestureHandling: 'cooperative', 
                    styles: [
                      { elementType: "geometry", stylers: [{ color: "#0a0f1c" }] },
                      { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f1c" }] },
                      { elementType: "labels.text.fill", stylers: [{ color: "#a0a0a0" }] },
                      { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
                      { featureType: "poi", stylers: [{ visibility: "off" }] }, 
                      { featureType: "transit", stylers: [{ visibility: "off" }] }
                    ]
                  }}
                >
                  <Marker 
                    position={{ lat: parsedAddress.lat, lng: parsedAddress.lng }}
                    zIndex={999}
                    icon={{
                      url: '/sellers-frog-pin.png',
                      scaledSize: new window.google.maps.Size(70, 70)
                    }}
                  />
                  {mapFilter === 'sold' && propertyDetails?.recentSales?.map((comp: any, idx: number) => {
                    if (!comp.lat || !comp.lng) return null; 
                    return (
                      <Marker 
                        key={`sold-${idx}`}
                        position={{ lat: comp.lat, lng: comp.lng }}
                        icon={{
                          url: '/frog-pin-vendida.png', 
                          scaledSize: new window.google.maps.Size(40, 40)
                        }}
                        onClick={() => setSelectedPin(comp)} 
                      />
                    );
                  })}

                  {selectedPin && (
                    <InfoWindow
                      position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
                      options={{ pixelOffset: new window.google.maps.Size(0, -40) }} 
                      onCloseClick={() => setSelectedPin(null)}
                    >
                      <div className="p-2 text-[green] min-w-[150px] font-sans">
                        <p className="font-bold text-xs mb-1 border-b border-gray-200 pb-1">{selectedPin.address}</p>
                        <p className="text-[#529e14] font-black text-lg">{formatMoney(selectedPin.price)}</p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">
                          {selectedPin.saleDate 
                            ? `${lang === 'en' ? 'Sold' : 'Vendida'}: ${new Date(selectedPin.saleDate).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` 
                            : `${lang === 'en' ? 'Date unavailable' : 'Fecha no disponible'}`
                          }
                        </p>
                      </div>
                    </InfoWindow>
                  )}
                  {mapFilter === 'available' && allProperties?.map((prop: any, idx: number) => {
                    if (!prop.latitude || !prop.longitude) return null;
                    const isRentOnly = !prop.isForSale && prop.isForRent;
                    const pinIcon = isRentOnly ? '/frog-pin-renta.png' : '/frog-pin.png';

                    return (
                      <Marker 
                        key={`prop-${prop.id || idx}`}
                        position={{ lat: prop.latitude, lng: prop.longitude }}
                        icon={{
                          url: pinIcon, 
                          scaledSize: new window.google.maps.Size(40, 40)
                        }}
                      />
                    );
                  })}

                </GoogleMap>
              </div>
            </div>
          )}

          {/* BOTÓN Y PANEL DE AJUSTES AVANZADOS (MOVIDO ARRIBA) */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-full p-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors focus:outline-none"
          >
            <span className="font-bold text-yellow-400">{t.fineTuneBtn}</span>
            <span className="text-gray-400">{showSettings ? t.hide : t.show}</span>
          </button>

          <div className="border-t border-white/10">
            {showSettings && (
              <div className="p-6 bg-black/20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
                <div className="space-y-4">
                  <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-white/10 pb-2">{t.sectionCondition}</h4>
                  <InputGroup label={t.arvInput} value={inputs.arv} onChange={(v) => handleInputChange('arv', v)} />
                  <InputGroup label={t.rehabInput} value={inputs.rehabCosts} onChange={(v) => handleInputChange('rehabCosts', v)} />
                  <InputGroup label={t.rentInput} value={inputs.estimatedRent} onChange={(v) => handleInputChange('estimatedRent', v)} />
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
                        className="text-[10px] text-[#529e14] hover:text-white font-bold bg-white/5 px-2 py-0.5 rounded transition-colors"
                      >
                        {isDpPercent ? t.switchToMoney : t.switchToPercent}
                      </button>
                    </div>
                    <input 
                      type="number" 
                      value={isDpPercent ? inputs.sfDownPaymentPercent : inputs.sfDownPaymentFlat} 
                      onChange={(e) => handleInputChange(isDpPercent ? 'sfDownPaymentPercent' : 'sfDownPaymentFlat', e.target.value)}
                      className="bg-black/40 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#529e14] focus:ring-1 focus:ring-[#529e14] transition-all w-full"
                    />
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

          {/* GRID DE 4 COLUMNAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x border-t border-white/10 divide-white/10">
            
            <div className="p-6 bg-black/20 hover:bg-white/5 transition-colors group flex flex-col relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#529e14]"></div>
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🏦</span>
                <h3 className="text-lg font-bold text-white">{t.sellerFinanceTitle} <br/><span className="text-xm text-gray-400 font-normal">{t.sellerFinanceSub}</span></h3>
              </div>

              <div className="text-3xl leading-relaxed font-black text-[#529e14] mb-2">
                {formatMoney(strategies.sellerFinance.totalMonthlyPayment)}<span className="text-lg text-[#529e14]/70 font-normal">/mo</span>
              </div>

              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
                {lang === 'es' ? 'Pago Total del Comprador' : 'Total Buyer Payment'}
              </p>

              <p className="text-xs leading-relaxed text-gray-400 mb-6 flex-grow">{t.sellerFinanceDesc}</p>
              
              <ul className="space-y-2 text-[15px] text-gray-300 mb-6">
                {/* ENGANCHE */}
                <li className="flex justify-between mb-3 text-sm border-b border-white/10 pb-2">
                  <span>{t.downPaymentReceivedLabel}</span> 
                  <span className="text-blue-400 font-bold">{formatMoney(strategies.sellerFinance.downPayment)}</span>
                </li>
                
                {/* DESGLOSE DEL PAGO MENSUAL */}
                <li className="flex justify-between text-[11px] text-gray-500 pl-2">
                  <span>• P&I</span> 
                  <span className="text-[#529e14] font-bold">+{formatMoney(strategies.sellerFinance.monthlyIncome)}</span>
                </li>
                <li className="flex justify-between text-[11px] text-gray-500 pl-2">
                  <span>• {lang === 'es' ? 'Impuestos (Est.)' : 'Taxes (Est.)'}</span> 
                  <span>+{formatMoney(strategies.sellerFinance.taxesMonthly)}</span>
                </li>
                <li className="flex justify-between text-[11px] text-gray-500 pl-2">
                  <span>• {lang === 'es' ? 'Seguro (Est.)' : 'Insurance (Est.)'}</span> 
                  <span>+{formatMoney(strategies.sellerFinance.insuranceMonthly)}</span>
                </li>
                <li className="flex justify-between text-[11px] text-gray-500 pl-2 pb-2">
                  <span>• {lang === 'es' ? 'Tarifa (Fee)' : 'Servicing Fee'}</span> 
                  <span>+{formatMoney(strategies.sellerFinance.servicingFee)}</span>
                </li>

                {/* YIELD / RENDIMIENTO TOTAL */}
                <li className="flex justify-between pt-3 border-t border-white/10 font-bold text-[18px]">
                  <span>{t.totalYieldLabel}</span> 
                  <span className="text-white">{formatMoney(strategies.sellerFinance.totalYield)}</span>
                </li>
              </ul>

              <button onClick={() => handleSelect('owner_finance')} className="w-full py-3 border-2 border-[#529e14] text-[#529e14] hover:bg-[#529e14] hover:text-white font-bold rounded-lg transition-colors mt-auto">
                {t.chooseBtn}
              </button>
            </div>

            <div className="p-6 bg-transparent hover:bg-white/5 transition-colors group flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🔨</span>
                <h3 className="text-lg leading-relaxed font-bold text-white">{t.fixListTitle} <br/><span className="text-xm text-gray-400 font-normal">{t.fixListSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">
                {formatMoney(strategies.fixAndList.netProfit)}
              </div>
              <p className="text-xs leading-relaxed text-gray-400 mb-6 flex-grow">{t.fixListDesc}</p>
              <ul className="space-y-6 text-[18px] text-gray-300 mb-10">
                <li className="flex justify-between"><span>{t.marketSaleLabel}</span> <span>{formatMoney(strategies.fixAndList.grossSale)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.yourInvestmentLabel}</span> <span>-{formatMoney(inputs.rehabCosts)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.realtorFeeLabel.replace('{n}', inputs.realtorFeePercent.toString())}</span> <span>-{formatMoney(strategies.fixAndList.grossSale * (inputs.realtorFeePercent / 100))}</span></li>
              </ul>
              <button onClick={() => handleSelect('fix_list')} className="w-full py-3 border border-gray-600 text-gray-300 hover:bg-white/10 font-bold rounded-lg transition-colors mt-auto">
                {t.chooseBtn}
              </button>
            </div>

            <div className="p-6 bg-transparent hover:bg-white/5 transition-colors group flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg leading-relaxed font-bold text-white">{t.cashBuyerTitle} <br/><span className="text-xm text-gray-400 font-normal">{t.cashBuyerSub}</span></h3>
              </div>
              <div className="text-3xl font-black text-white mb-2 group-hover:text-yellow-400 transition-colors">
                {formatMoney(strategies.cashBuyer.offer)}
              </div>
              <p className="text-xs leading-relaxed text-gray-400 mb-6 flex-grow">{t.cashBuyerDesc}</p>
              <ul className="space-y-6 text-[18px] text-gray-300 mb-10">
                <li className="flex justify-between"><span>{t.arvLabel}</span> <span>{formatMoney(inputs.arv)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.rehabSavingsLabel}</span> <span>-{formatMoney(inputs.rehabCosts)}</span></li>
                <li className="flex justify-between text-red-400/90"><span>{t.investorDiscountLabel}</span> <span>-{inputs.investorDiscountPercent}%</span></li>
              </ul>
              <button onClick={() => handleSelect('cash_sale')} className="w-full py-3 border border-gray-600 text-gray-300 hover:bg-white/10 font-bold rounded-lg transition-colors mt-auto">
                {t.chooseBtn}
              </button>
            </div>

            <div className="p-6 bg-transparent hover:bg-white/5 transition-colors group flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔑</span>
                <h3 className="text-lg font-bold text-white">{t.rentTitle} <br/><span className="text-xm text-gray-400 font-normal">{t.rentSub}</span></h3>
              </div>

              <div className="text-3xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">
                {formatMoney(strategies.rent.monthly)}<span className="text-lg text-gray-500 font-normal">/mo</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">{t.rentGrossLabel.replace(':', '')}</p>
              <p className="text-xs text-gray-400 mb-6 flex-grow">{t.rentDesc}</p>
             
              <ul className="space-y-2 text-sm text-gray-300 mb-6">
                <li className="flex justify-between mb-3 border-b border-white/10 pb-2">
                  <span className="font-semibold text-purple-400">{t.netCashflowLabel}</span> 
                  <span className="font-bold text-white">{formatMoney(strategies.rent.netMonthly)}</span>
                </li>
                
                <li className="flex justify-between text-red-400/90 pt-1">
                  <span>{t.rentExpensesLabel}</span> 
                  <span className="font-bold">-{formatMoney(strategies.rent.monthly - strategies.rent.netMonthly)}</span>
                </li>
                
                <li className="flex justify-between text-[11px] text-gray-500 pl-2"><span>{t.rentTaxesLabel}</span> <span>-{formatMoney(inputs.taxesAnnual / 12)}</span></li>
                <li className="flex justify-between text-[11px] text-gray-500 pl-2"><span>{t.rentInsuranceLabel}</span> <span>-{formatMoney(inputs.insuranceAnnual / 12)}</span></li>
                <li className="flex justify-between text-[11px] text-gray-500 pl-2"><span>{t.rentAdminLabel}</span> <span>-{formatMoney(inputs.adminFeeMonthly)}</span></li>
                <li className="flex justify-between text-[11px] text-gray-500 pl-2 pb-2"><span>{t.rentMaintLabel}</span> <span>-{formatMoney(inputs.maintannaceMonthly)}</span></li>

                <li className="flex justify-between pt-3 border-t border-white/10 font-semibold text-purple-400">
                  <span>{t.rentAnnualLabel}</span> <span>{formatMoney(strategies.rent.annual)}</span>
                </li>
              </ul>
              <button onClick={() => handleSelect('rent')} className="w-full py-3 border border-gray-600 text-gray-300 hover:bg-white/10 font-bold rounded-lg transition-colors mt-auto">
                {t.chooseBtn}
              </button>
            </div>

          </div>

         {/* "¿Cómo calculamos esto?" */}
          <div className="bg-black/40 border border-white/5 p-5 rounded-xl max-w-4xl mx-auto text-left shadow-inner mt-4">
            <h4 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
              {t.transparencyTitle}
            </h4>
            <ul className="list-disc list-inside text-xs text-gray-400 space-y-2 leading-relaxed">
              <li>
                {t.transparencyArv.replace('{n}', selectedComps.length.toString() || '0')}
              </li>
              <li>
                {t.transparencyRehab.replace(
                  '{price}', 
                  formatMoney(inputs.rehabCosts / (propertyDetails.sqft || 1))
                )}
              </li>
            </ul>
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