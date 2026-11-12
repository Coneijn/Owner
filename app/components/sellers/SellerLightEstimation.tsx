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

export default function SellerLightEstimation({
  onSubmit,
  isSubmitting = false,
  lang = 'es',
}: SellerLightEstimationProps) {
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
    id: 'google-map-autocomplete',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    version: "3.64",
    libraries: GOOGLE_MAPS_LIBRARIES,
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
        <h2 className="text-2xl font-black text-white">
          {lang === 'es' ? 'Publica tu Propiedad como Dueño' : 'List Your Home as the Bank'}
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          {lang === 'es'
            ? 'Sin comisiones de agentes ni cálculos engorrosos. Define tu valor y calcula tu ingreso pasivo.'
            : 'No agent commissions or complex repairs. Set your value and see your passive cashflow.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Datos Personales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              {lang === 'es' ? 'Nombre Completo' : 'Full Name'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Carlos Mendoza"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#529e14]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              {lang === 'es' ? 'Teléfono (WhatsApp/Móvil)' : 'Phone Number'} *
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
            {lang === 'es' ? 'Correo Electrónico' : 'Email Address'} *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="carlos@ejemplo.com"
            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#529e14]"
          />
        </div>

        {/* Dirección con Autocomplete */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
            {lang === 'es' ? 'Dirección de la Propiedad' : 'Property Address'} *
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
              placeholder="Cargando Google Maps..."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-gray-500 cursor-not-allowed"
            />
          )}
        </div>

        {/* Rango de Precios Sugeridos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
              {lang === 'es' ? 'Precio Mínimo Deseado ($)' : 'Minimum Target Price ($)'}
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
              {lang === 'es' ? 'Precio Máximo Sugerido ($)' : 'Maximum Suggested Price ($)'}
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
              {lang === 'es' ? 'Ingreso Mensual Estimado (P&I)' : 'Est. Monthly Income (P&I)'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#529e14]/20 text-[#529e14] font-semibold">
              Tasa Fija 10% / 30 Años
            </span>
          </div>

          <div className="text-4xl font-black text-[#529e14]">
            {formatCurrency(estimatedMonthly)}
            <span className="text-sm font-normal text-gray-400 ml-1">/mes</span>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Basado en un precio medio de venta de{' '}
            <strong className="text-white">{formatCurrency(avgPrice)}</strong> financiado por el dueño.
          </p>

          {/* Disclaimer (RF-09) */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-[11px] text-gray-400">
            <span className="text-amber-400 text-sm">ℹ️</span>
            <p>
              <strong>Nota sobre impuestos y seguros:</strong> Los impuestos prediales (Taxes) y seguro contra riesgos
              (Insurance) no están incluidos en este monto y se calcularán con precisión en tu borrador final.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#529e14] hover:bg-[#459e10] text-[#0a0f1c] font-black uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-[#529e14]/20 disabled:opacity-50"
        >
          {isSubmitting
            ? lang === 'es' ? 'Creando tu Borrador...' : 'Generating Draft...'
            : lang === 'es' ? 'Crear Borrador y Continuar →' : 'Create Draft & Continue →'}
        </button>
      </form>
    </div>
  );
}