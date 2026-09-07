'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SimpleProperty {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number | null;
  bedrooms: number;
  bathrooms: number;
  mainImage: string;
}

export default function PropertyTourScheduler({
  properties,
  lang,
}: {
  properties: SimpleProperty[];
  lang: 'es' | 'en';
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedProperty, setSelectedProperty] = useState<SimpleProperty | null>(null);

  // Estados del calendario y slots
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Formulario de contacto
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');

  const isEs = lang === 'es';

  // --- LÓGICA DEL CALENDARIO ---
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = isEs
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const weekDays = isEs
    ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    const now = new Date();
    if (year === now.getFullYear() && month <= now.getMonth()) return; // Evitar ir a meses pasados
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const isPastDay = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(year, month, day);
    return candidate < today;
  };

  // Consultar slots de la API al hacer clic en un día
  const handleSelectDay = async (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setSelectedSlot('');
    setLoadingSlots(true);
    setAvailableSlots([]);

    try {
      const res = await fetch(`/api/ghl/slots?date=${formattedDate}`);
      const data = await res.json();
      if (res.ok && data.slots) {
        setAvailableSlots(data.slots);
      } else {
        setAvailableSlots([]);
      }
    } catch (e) {
      console.error(e);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !selectedDate || !selectedSlot) return;

    setLoadingSubmit(true);
    setError('');

    try {
      const res = await fetch('/api/ghl/schedule-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          propertyTitle: selectedProperty.title,
          propertyAddress: `${selectedProperty.address}, ${selectedProperty.city}`,
          date: selectedDate,
          timeSlot: selectedSlot,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error();
      setStep(4);
    } catch {
      setError(
        isEs
          ? 'Hubo un error al confirmar la cita. Inténtalo de nuevo.'
          : 'Error booking your appointment. Please try again.'
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-[#141a29] border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl text-white">
      {/* Barra de progreso */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6 text-sm font-semibold">
        <span className={step >= 1 ? 'text-[#f8ed1a]' : 'text-gray-500'}>
          1. {isEs ? 'Elige tu casa' : 'Select Home'}
        </span>
        <span>→</span>
        <span className={step >= 2 ? 'text-[#f8ed1a]' : 'text-gray-500'}>
          2. {isEs ? 'Fecha y Hora' : 'Date & Time'}
        </span>
        <span>→</span>
        <span className={step >= 3 ? 'text-[#f8ed1a]' : 'text-gray-500'}>
          3. {isEs ? 'Tus Datos' : 'Your Info'}
        </span>
      </div>

      {/* PASO 1: SELECCIONAR PROPIEDAD */}
      {step === 1 && (
        <div>
          <h2 className="text-xl md:text-2xl font-black mb-4">
            {isEs ? '¿Qué casa te gustaría visitar?' : 'Which home would you like to visit?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {properties.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProperty(p)}
                className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  selectedProperty?.id === p.id
                    ? 'border-[#f8ed1a] bg-[#1f283d]'
                    : 'border-gray-700 bg-[#0d121f] hover:border-gray-500'
                }`}
              >
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image src={p.mainImage || '/placeholder.jpg'} alt={p.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-sm line-clamp-1">{p.title}</h3>
                  <p className="text-xs text-gray-400">{p.address}, {p.city}</p>
                  <p className="text-xs text-gray-300 mt-1">{p.bedrooms} Beds • {p.bathrooms} Baths</p>
                  {p.price && (
                    <p className="text-sm font-black text-[#f8ed1a] mt-1">${p.price.toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            disabled={!selectedProperty}
            onClick={() => setStep(2)}
            className="w-full mt-6 bg-[#f8ed1a] text-black font-black py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-yellow-400 transition cursor-pointer uppercase"
          >
            {isEs ? 'Continuar a Fecha y Hora' : 'Continue to Date & Time'}
          </button>
        </div>
      )}

      {/* PASO 2: CALENDARIO INTERACTIVO + HORARIOS VIA API */}
      {step === 2 && (
        <div>
          <h2 className="text-xl md:text-2xl font-black mb-4">
            {isEs ? 'Selecciona día y horario disponible' : 'Select an Available Date & Time'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cuadrícula del Calendario */}
            <div className="bg-[#0d121f] border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-200"
                >
                  ←
                </button>
                <span className="font-bold text-base">
                  {monthNames[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-200"
                >
                  →
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
                {weekDays.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dayStr;
                  const disabled = isPastDay(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(day)}
                      className={`h-9 w-full flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                        disabled
                          ? 'opacity-20 cursor-not-allowed text-gray-500'
                          : isSelected
                          ? 'bg-[#f8ed1a] text-black font-black'
                          : 'hover:bg-gray-800 text-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel de Horarios desde la API */}
            <div className="bg-[#0d121f] border border-gray-800 rounded-xl p-4 flex flex-col">
              <h3 className="text-sm font-bold text-gray-300 mb-3">
                {isEs ? 'Horarios disponibles' : 'Available Slots'}
                {selectedDate && <span className="text-[#f8ed1a] block mt-0.5 text-xs">{selectedDate}</span>}
              </h3>

              {!selectedDate && (
                <p className="text-gray-500 text-sm my-auto text-center">
                  {isEs ? 'Selecciona un día en el calendario' : 'Select a date from the calendar'}
                </p>
              )}

              {loadingSlots && (
                <div className="my-auto flex flex-col items-center justify-center gap-2 text-gray-400">
                  <div className="w-6 h-6 border-2 border-[#f8ed1a] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">{isEs ? 'Consultando agenda en vivo...' : 'Checking live availability...'}</span>
                </div>
              )}

              {!loadingSlots && selectedDate && availableSlots.length === 0 && (
                <p className="text-yellow-400/80 text-sm my-auto text-center">
                  {isEs ? 'No hay citas libres en este día. Por favor elige otra fecha.' : 'No slots open on this date. Please pick another day.'}
                </p>
              )}

              {!loadingSlots && availableSlots.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                        selectedSlot === slot
                          ? 'bg-[#f8ed1a] text-black border-[#f8ed1a]'
                          : 'bg-[#141a29] border-gray-700 text-gray-200 hover:border-gray-500'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setStep(1)}
              className="w-1/3 border border-gray-700 py-3 rounded-xl hover:bg-gray-800 transition cursor-pointer"
            >
              {isEs ? 'Atrás' : 'Back'}
            </button>
            <button
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep(3)}
              className="w-2/3 bg-[#f8ed1a] text-black font-black py-3 rounded-xl disabled:opacity-40 hover:bg-yellow-400 transition cursor-pointer uppercase"
            >
              {isEs ? 'Continuar a Tus Datos' : 'Continue to Info'}
            </button>
          </div>
        </div>
      )}

      {/* PASO 3: TUS DATOS */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl md:text-2xl font-black mb-1">
            {isEs ? 'Tus Datos para el Acceso' : 'Your Contact Details'}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            {isEs
              ? `Visita para: ${selectedProperty?.address} el ${selectedDate} a las ${selectedSlot}`
              : `Showing for: ${selectedProperty?.address} on ${selectedDate} at ${selectedSlot}`}
          </p>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              {isEs ? 'Nombre completo' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#0d121f] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#f8ed1a] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              {isEs ? 'Teléfono (para confirmar el acceso)' : 'Phone (for access confirmation)'}
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-[#0d121f] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#f8ed1a] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              {isEs ? 'Correo Electrónico' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#0d121f] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-[#f8ed1a] outline-none"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-1/3 border border-gray-700 py-3 rounded-xl hover:bg-gray-800 transition cursor-pointer"
            >
              {isEs ? 'Atrás' : 'Back'}
            </button>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-2/3 bg-[#f8ed1a] text-black font-black py-3 rounded-xl disabled:opacity-40 hover:bg-yellow-400 transition cursor-pointer uppercase"
            >
              {loadingSubmit ? (isEs ? 'Agendando...' : 'Booking...') : isEs ? 'Confirmar Visita' : 'Confirm Tour'}
            </button>
          </div>
        </form>
      )}

      {/* PASO 4: CONFIRMACIÓN */}
      {step === 4 && (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-[#f8ed1a]/20 border border-[#f8ed1a] text-[#f8ed1a] text-3xl font-black rounded-full flex items-center justify-center mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-black mb-2">
            {isEs ? '¡Cita de visita confirmada!' : 'Tour Confirmed!'}
          </h2>
          <p className="text-gray-300 max-w-md mx-auto mb-6 text-sm">
            {isEs
              ? `Te enviamos la confirmación a tu teléfono y correo. Te esperamos el ${selectedDate} a las ${selectedSlot} en ${selectedProperty?.address}.`
              : `We sent a confirmation to your phone and email. See you on ${selectedDate} at ${selectedSlot} at ${selectedProperty?.address}.`}
          </p>
        </div>
      )}
    </div>
  );
}