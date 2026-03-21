'use client'

import { useState } from 'react';
import { processPropertySelection } from '@/app/actions/lockbox';

type Property = {
  id: string;
  address: string;
  titleEs: string;
};

export default function PropertyForm({ 
  properties, 
  sessionToken
}: { 
  properties: Property[], 
  sessionToken: string
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const result = await processPropertySelection(formData);

    if (result?.error) {
      setMessage(`❌ Error: ${result.error}`);
    } else {
      setMessage('✅ ¡Listo! Revisa tu WhatsApp/SMS para ver tu llave de acceso de 5 minutos.');
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2">Selecciona la Propiedad</h2>
      
      {/* Solo enviamos el token de la sesión al servidor */}
      <input type="hidden" name="sessionToken" value={sessionToken} />

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Dirección o Nombre de la Propiedad</span>
        <select 
          name="propertyId" 
          required
          defaultValue=""
          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="" disabled>-- Elige una opción --</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.address} {prop.titleEs ? `(${prop.titleEs})` : ''}
            </option>
          ))}
        </select>
      </label>

      <button 
        type="submit" 
        disabled={loading}
        className="mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {loading ? 'Generando acceso...' : 'Obtener Llave Virtual'}
      </button>

      {message && (
        <div className={`mt-2 p-3 rounded text-sm ${message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </form>
  );
}