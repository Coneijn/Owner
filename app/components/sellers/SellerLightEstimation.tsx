'use client';

import { useState, useMemo, useRef } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

interface PropertyData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}

interface SellerFormData {
  name: string;
  email: string;
  phone: string;
  addressData: PropertyData;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  estimatedMonthlyPayment: number;
}

interface SellerLightEstimationProps {
  onSubmit: (data: SellerFormData) => Promise<void>;
  isSubmitting?: boolean;
  lang?: 'es' | 'en';
}

const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];

const translations = {
  es: {
    heading: 'Publica tu Propiedad como Dueño',
    subheading:
      'Sin comisiones de agentes ni cálculos engorrosos. Define tu valor y calcula tu ingreso pasivo.',
    fullNameLabel: 'Nombre Completo',
    fullNamePlaceholder: 'Ej. Carlos Mendoza',
    phoneLabel: 'Teléfono (WhatsApp/Móvil)',
    emailLabel: 'Correo Electrónico',
    emailPlaceholder: 'carlos@ejemplo.com',
    addressLabel: 'Dirección de la Propiedad',
    loadingMaps: 'Cargando Google Maps...',
    minPriceLabel: 'Precio Mínimo Deseado ($)',
    maxPriceLabel: 'Precio Máximo Sugerido ($)',
    estMonthlyLabel: 'Ingreso Mensual Estimado (P&I)',
    rateBadge: 'Tasa Fija 10% / 30 Años',
    perMonth: '/mes',
    avgPricePrefix: 'Basado en un precio medio de venta de ',
    avgPriceSuffix: ' financiado por el dueño.',
    disclaimerTitle: 'Nota sobre impuestos y seguros:',
    disclaimerBody:
      'Los impuestos prediales (Taxes) y seguro contra riesgos (Insurance) no están incluidos en este monto y se calcularán con precisión en tu borrador final.',
    submittingBtn: 'Creando tu Borrador...',
    submitBtn: 'Crear Borrador y Continuar →',
  },
  en: {
    heading: 'List Your Home as the Bank',
    subheading:
      'No agent commissions or complex repairs. Set your value and see your passive cashflow.',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g. John Doe',
    phoneLabel: 'Phone Number',
    emailLabel: 'Email Address',
    emailPlaceholder: 'john@example.com',
    addressLabel: 'Property Address',
    loadingMaps: 'Loading Google Maps...',
    minPriceLabel: 'Minimum Target Price ($)',
    maxPriceLabel: 'Maximum Suggested Price ($)',
    estMonthlyLabel: 'Est. Monthly Income (P&I)',
    rateBadge: '10% Fixed Rate / 30 Years',
    perMonth: '/mo',
    avgPricePrefix: 'Based on an average owner-financed sale price of ',
    avgPriceSuffix: '.',
    disclaimerTitle: 'Note on taxes and insurance:',
    disclaimerBody:
      'Property taxes and hazard insurance are not included in this amount and will be accurately calculated in your final draft.',
    submittingBtn: 'Generating Draft...',
    submitBtn: 'Create Draft & Continue →',
  },
};

export default function SellerLightEstimation({
  onSubmit,
  isSubmitting = false,
  lang = 'es',
}: SellerLightEstimationProps) {
  const t = translations[lang];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [addressData, setAddressData] = useState<PropertyData>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [priceMin, setPriceMin] = useState<number>(200000);
  const [priceMax, setPriceMax] = useState<number>(250000);
  const [annualRate] = useState<number>(0.10); // 10% fija por defecto (RF-08)

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: GOOGLE_MAPS_LIBRARIES,
    version: '3.64',
  });

  // Cálculo de amortización mensual P&I a 30 años (360 cuotas)
  const calculateMonthly = (price: number, rate: number): number => {
    if (!price || price <= 0) return 0;
    const monthlyRate = rate / 12;
    const totalMonths = 360;
    const payment = (price * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
    return Math.round(payment);
  };

  const avgPrice = useMemo(() => (priceMin + priceMax) / 2, [priceMin, priceMax]);
  const estimatedMonthly = useMemo(() => calculateMonthly(avgPrice, annualRate), [avgPrice, annualRate]);

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.address_components) return;

    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let zipCode = '';

    place.address_components.forEach((component) => {
      const types = component.types;
      if (types.includes('street_number')) streetNumber = component.long_name;
      if (types.includes('route')) route = component.long_name;
      if (types.includes('locality')) city = component.long_name;
      if (types.includes('administrative_area_level_1')) state = component.short_name;
      if (types.includes('postal_code')) zipCode = component.long_name;
    });

    const street = streetNumber && route ? `${streetNumber} ${route}` : place.name || addressInput;
    setAddressInput(place.formatted_address || street);
    setAddressData({
      address: street,
      city,
      state,
      zipCode,
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressData.address) return;

    await onSubmit({
      name,
      email,
      phone,
      addressData,
      suggestedPriceMin: priceMin,
      suggestedPriceMax: priceMax,
      estimatedMonthlyPayment: estimatedMonthly,
    });
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">{t.heading}</h2>
        <p className="text-gray-400 text-sm mt-1">{t.subheading}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Datos Personales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              {t.fullNameLabel} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.fullNamePlaceholder}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#529e14]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              {t.phoneLabel} *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#529e14]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
            {t.emailLabel} *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#529e14]"
          />
        </div>

        {/* Dirección con Autocomplete */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
            {t.addressLabel} *
          </label>
          {isLoaded ? (
            <Autocomplete
              onLoad={(auto) => (autocompleteRef.current = auto)}
              onPlaceChanged={onPlaceChanged}
              options={{ types: ['address'], componentRestrictions: { country: 'us' } }}
            >
              <input
                type="text"
                required
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="123 Main St, Houston, TX 77002"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#529e14]"
              />
            </Autocomplete>
          ) : (
            <input
              type="text"
              disabled
              placeholder={t.loadingMaps}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-gray-500 cursor-not-allowed"
            />
          )}
        </div>

        {/* Rango de Precios Sugeridos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              {t.minPriceLabel}
            </label>
            <input
              type="number"
              step="5000"
              value={priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#529e14]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              {t.maxPriceLabel}
            </label>
            <input
              type="number"
              step="5000"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#529e14]"
            />
          </div>
        </div>

        {/* Tarjeta de Estimación Financiera Ligera */}
        <div className="bg-black/50 border border-[#529e14]/40 rounded-xl p-5 my-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t.estMonthlyLabel}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#529e14]/20 text-[#529e14] font-semibold">
              {t.rateBadge}
            </span>
          </div>

          <div className="text-4xl font-black text-[#529e14]">
            {formatCurrency(estimatedMonthly)}
            <span className="text-sm font-normal text-gray-400 ml-1">{t.perMonth}</span>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            {t.avgPricePrefix}
            <strong className="text-white">{formatCurrency(avgPrice)}</strong>
            {t.avgPriceSuffix}
          </p>

          {/* Disclaimer (RF-09) */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] text-gray-400">
            <span className="text-amber-400 text-sm">ℹ️</span>
            <p>
              <strong>{t.disclaimerTitle}</strong> {t.disclaimerBody}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#529e14] hover:bg-[#459e10] text-[#0a0f1c] font-black uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#529e14]/20 disabled:opacity-50"
        >
          {isSubmitting ? t.submittingBtn : t.submitBtn}
        </button>
      </form>
    </div>
  );
}