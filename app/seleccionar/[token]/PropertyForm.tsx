'use client'

import { useState, useMemo, useRef, useEffect } from 'react';
import { processPropertySelection } from '@/app/actions/lockbox';

type Property = {
  id: string;
  address: string;
  titleEs: string; 
  titleEn: string; 
};

export default function PropertyForm({ 
  properties, 
  sessionToken,
  contactName,
  contactPhone
}: { 
  properties: Property[], 
  sessionToken: string,
  contactName: string | null,
  contactPhone: string
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState<'es' | 'en'>('es');
  
  // Estados para el autocompletado
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const t = {
    greeting: lang === 'es' ? 'Hola' : 'Hello',
    visitor: lang === 'es' ? 'visitante' : 'visitor',
    requestText: lang === 'es' ? 'Estás solicitando acceso para el número:' : 'You are requesting access for the number:',
    formTitle: lang === 'es' ? 'Selecciona la Propiedad' : 'Select the Property',
    searchPlaceholder: lang === 'es' ? 'Buscar por dirección o nombre...' : 'Search by address or name...',
    selectLabel: lang === 'es' ? 'Dirección de la Propiedad' : 'Property Address',
    noResults: lang === 'es' ? 'No se encontraron propiedades' : 'No properties found',
    btnText: lang === 'es' ? 'Obtener Llave Virtual' : 'Get Virtual Key',
    btnLoading: lang === 'es' ? 'Generando acceso...' : 'Generating access...',
    successMsg: lang === 'es' ? '✅ ¡Listo! Revisa tu WhatsApp/SMS para ver tu llave.' : '✅ Done! Check your WhatsApp/SMS for your key.',
    errorPrefix: lang === 'es' ? '❌ Error:' : '❌ Error:',
    requiredError: lang === 'es' ? 'Por favor selecciona una propiedad de la lista.' : 'Please select a property from the list.',
  };

  const filteredProperties = useMemo(() => {
    if (!searchTerm) return properties;
    const lowerSearch = searchTerm.toLowerCase();
    return properties.filter(prop => 
      prop.address.toLowerCase().includes(lowerSearch) || 
      prop.titleEs.toLowerCase().includes(lowerSearch) ||
      prop.titleEn.toLowerCase().includes(lowerSearch)
    );
  }, [properties, searchTerm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    // Validación: Asegurarnos de que el usuario haya seleccionado una propiedad válida
    if (!selectedProperty) {
      setMessage(`${t.errorPrefix} ${t.requiredError}`);
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await processPropertySelection(formData);

    if (result?.error) {
      setMessage(`${t.errorPrefix} ${result.error}`);
    } else {
      setMessage(t.successMsg);
    }
    
    setLoading(false);
  };

  // Manejador para cuando se selecciona una opción de la lista
  const handleSelectOption = (prop: Property) => {
    setSelectedProperty(prop);
    const label = `${prop.address} (${lang === 'es' ? prop.titleEs : prop.titleEn})`;
    setSearchTerm(label);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button 
          type="button"
          onClick={() => {
            setLang(lang === 'es' ? 'en' : 'es');
            // Actualizar el texto del input si ya hay una propiedad seleccionada
            if (selectedProperty) {
              setSearchTerm(`${selectedProperty.address} (${lang === 'es' ? selectedProperty.titleEn : selectedProperty.titleEs})`);
            }
          }}
          className="px-3 py-1 bg-[#262626] text-[#f8ed1a] border border-[#f8ed1a] rounded text-sm hover:bg-[#f8ed1a] hover:text-[#1a1a1a] transition-colors"
        >
          {lang === 'es' ? '🇺🇸 English' : '🇲🇽 Español'}
        </button>
      </div>

      <div>
        <h1 className="text-center text-2xl font-bold mb-2 text-[#f8ed1a]">
          {t.greeting} {contactName || t.visitor} 👋
        </h1>
        <p className="text-center text-gray-300 text-sm">
          {t.requestText} <span className="font-semibold text-[#f8ed1a]">{contactPhone}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-[#262626] rounded-lg shadow-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-2 text-[#f8ed1a]">{t.formTitle}</h2>
        
        <input type="hidden" name="sessionToken" value={sessionToken} />
        {/* Campo oculto que enviará el ID de la propiedad al backend */}
        <input type="hidden" name="propertyId" value={selectedProperty?.id || ''} />

        <div className="flex flex-col gap-1 mt-2 relative">
          <label className="text-sm font-medium text-gray-300">
            {t.selectLabel}
          </label>
          
          <input 
            type="text" 
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedProperty(null); // Resetea la selección si el usuario vuelve a escribir
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Retraso para permitir el click en las opciones
            className="p-3 w-full border border-gray-600 rounded bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#f8ed1a] focus:border-transparent outline-none placeholder-gray-500"
          />

          {/* Menú desplegable de resultados */}
          {isOpen && (
            <ul className="absolute z-10 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#1a1a1a] border border-gray-600 rounded shadow-xl">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((prop) => (
                  <li 
                    key={prop.id} 
                    // Usamos onMouseDown en lugar de onClick porque mousedown se dispara antes que el onBlur del input
                    onMouseDown={() => handleSelectOption(prop)}
                    className="p-3 hover:bg-[#262626] cursor-pointer text-white border-b border-gray-800 last:border-b-0"
                  >
                    {prop.address} <span className="text-gray-400 text-sm">{lang === 'es' ? `(${prop.titleEs})` : `(${prop.titleEn})`}</span>
                  </li>
                ))
              ) : (
                <li className="p-3 text-gray-500 italic">
                  {t.noResults}
                </li>
              )}
            </ul>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 bg-[#f8ed1a] text-[#1a1a1a] font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 disabled:bg-gray-600 disabled:text-gray-300 transition-colors"
        >
          {loading ? t.btnLoading : t.btnText}
        </button>

        {message && (
          <div className={`mt-2 p-3 rounded text-sm ${message.includes('❌') ? 'bg-red-900/50 text-red-200 border border-red-800' : 'bg-green-900/50 text-green-200 border border-green-800'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}