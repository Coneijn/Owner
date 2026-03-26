'use client'

import { useState, useEffect } from 'react';
import { generateTestSessionAction } from '@/app/actions/testing';

export default function GenerateTestLinkPage() {
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');

  // Necesitamos obtener el origen (dominio) en el cliente
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handleGenerateLink = async () => {
    setLoading(true);
    setError('');
    setGeneratedLink('');

    const result = await generateTestSessionAction();

    if (result.error) {
      setError(result.error);
    } else if (result.token) {
      // Construimos el enlace final usando el dominio actual y el token
      const finalUrl = `${origin}/${result.token}`;
      setGeneratedLink(finalUrl);
    }

    setLoading(false);
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#262626] border border-gray-800 p-8 rounded-lg shadow-xl text-center">
        
        <h1 className="text-3xl font-bold text-[#f8ed1a] mb-2">Panel de Pruebas de Lockbox</h1>
        <p className="text-gray-300 mb-8">
          Utiliza esta herramienta para generar enlaces temporales de acceso y probar el flujo de selección de propiedades.
        </p>

        {/* Sección del Botón */}
        <div className="mb-10">
          <button
            onClick={handleGenerateLink}
            disabled={loading}
            className="bg-[#f8ed1a] text-[#1a1a1a] font-bold py-4 px-8 rounded-full text-lg hover:bg-yellow-400 disabled:bg-gray-600 disabled:text-gray-300 transition-all shadow-lg hover:scale-105"
          >
            {loading ? 'Generando sesión...' : 'GENERAR ENLACE DE PRUEBA'}
          </button>
        </div>

        {/* Sección del Enlace Generado (se muestra solo cuando existe) */}
        {generatedLink && (
          <div className="bg-[#1a1a1a] border border-[#f8ed1a] p-6 rounded-lg text-left shadow-inner">
            <h2 className="text-xl font-semibold text-[#f8ed1a] mb-3">✅ Enlace Generado Exitosamente</h2>
            <p className="text-sm text-gray-400 mb-1">Este enlace expira en 1 hora y usa datos de prueba predefinidos.</p>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-900 p-3 rounded border border-gray-700">
              {/* Mostramos el enlace completo */}
              <span className="text-yellow-200 font-mono text-sm break-all flex-grow">
                {generatedLink}
              </span>
              
              {/* Botón para copiar */}
              <button 
                onClick={copyToClipboard}
                className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors shrink-0"
              >
                Copiar
              </button>
            </div>

            <div className="mt-5 text-center">
              <a 
                href={generatedLink} 
                className="text-[#f8ed1a] font-semibold hover:underline flex items-center justify-center gap-2"
              >
                Probar enlace generado ahora →
              </a>
            </div>
          </div>
        )}

        {/* Sección de Error */}
        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-800 p-4 rounded text-red-200 text-sm">
            ❌ {error}
          </div>
        )}

      </div>
    </main>
  );
}