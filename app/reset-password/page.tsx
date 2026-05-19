'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordRecovery } from '@/lib/password-recovery-actions'; 

export default function RequestResetPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Simulamos un FormData para re-utilizar la estructura de tu Server Action
    const formData = new FormData();
    formData.append('email', email);

    // Llama a la función que creaste en el Paso 1
    // IMPORTANTE: Asegúrate de importar requestPasswordRecovery desde donde la guardaste
    const result = await requestPasswordRecovery(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setMessage(result.message || 'Enlace enviado.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#f8ed1a]"></div>

        <h1 className="text-xl md:text-2xl font-black text-white mb-2">
          Recovery Password
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Enter your email address and we'll send you a  link to reset your password.
        </p>

        {message ? (
          <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-md text-sm text-center mb-6">
            ✅ {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                E-mail Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#f8ed1a]"
                placeholder="tu@correo.com"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#f8ed1a] hover:bg-[#d4ca12] text-black font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 mt-6"
            >
              {isLoading ? (
                <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            &larr; Go back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}