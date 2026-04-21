'use client';

import { useState } from 'react';
import { createTestUser, UserProfileType } from './actions';

export default function UserCreatorPage() {
  const [testCode, setTestCode] = useState('');
  const [userType, setUserType] = useState<UserProfileType>('SELLER');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; email?: string; password?: string; error?: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    const res = await createTestUser(testCode, userType);
    setResult(res);
    setLoading(false);
  };

  // Lógica para formatear la previsualización
  const typeLower = userType.toLowerCase();
  const typeCapitalized = typeLower.charAt(0).toUpperCase() + typeLower.slice(1);

  const emailPreview = testCode 
    ? `tester-${typeLower}-${testCode.toLowerCase()}@testmail.com` 
    : `tester-${typeLower}-___@testmail.com`;
    
  const passPreview = testCode 
    ? `Testing${typeCapitalized}${testCode}` 
    : `Testing${typeCapitalized}___`;

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 text-gray-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black text-[#f8ed1a] mb-6 tracking-wide text-center">
          Test User Creator
        </h1>

        <form onSubmit={handleCreate} className="space-y-6">
          
          {/* NUEVO DROPDOWN */}
          <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">
              Tipo de Usuario
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserProfileType)}
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#f8ed1a] outline-none transition-colors cursor-pointer"
            >
              <option value="SELLER">Vendedor (Seller)</option>
              <option value="BUYER">Comprador (Buyer)</option>
              <option value="RENTER">Rentero (Renter)</option>
              <option value="AGENT">Agente (Agent)</option>
              <option value="ADMIN">Administrador (Admin)</option>
              <option value="STAFF">Equipo (Staff)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-2">
              Identificador (Texto o Número)
            </label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.replace(/\s+/g, ''))} // Evitar espacios
              placeholder="Ej. 01, Alexis, Beta..."
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#f8ed1a] outline-none transition-colors"
              required
            />
          </div>

          <div className="bg-black/50 border border-gray-800 rounded-lg p-4 font-mono text-sm space-y-2">
            <p className="text-gray-400">Previsualización:</p>
            <p><span className="text-gray-500">Email:</span> <span className="text-white">{emailPreview}</span></p>
            <p><span className="text-gray-500">Pass:</span> <span className="text-white">{passPreview}</span></p>
          </div>

          <button
            type="submit"
            disabled={loading || !testCode}
            className="w-full py-4 bg-[#529e14] text-white font-black uppercase tracking-wide rounded-lg shadow-lg hover:bg-[#458510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Generar Usuario ->'}
          </button>
        </form>

        {result?.success && (
          <div className="mt-6 p-4 bg-green-900/30 border border-green-800 rounded-lg text-center">
            <p className="text-green-400 font-bold mb-2">¡Usuario Creado Exitosamente!</p>
            <a 
              href="/login" 
              target="_blank"
              className="text-[#f8ed1a] underline text-sm font-semibold hover:text-white"
            >
              Ir a la página de Login
            </a>
          </div>
        )}

        {result?.error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-center">
            <p className="text-red-400 font-bold">{result.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}