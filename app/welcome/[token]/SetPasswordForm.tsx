// app/welcome/[token]/SetPasswordForm.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { setupNewPassword } from './actions';
import { useRouter } from 'next/navigation';
import { authenticate } from '@/lib/actions'; // <-- Importamos tu Server Action (el mismo del login)

interface SetPasswordFormProps {
  token: string;
  email: string;
}

export default function SetPasswordForm({ token, email }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Nuevos estados para controlar la fase 2FA
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [code, setCode] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Hacer auto-focus en el input 2FA cuando aparece
  useEffect(() => {
    if (showTwoFactor && codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, [showTwoFactor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. Fase de guardar contraseña (se salta si ya estamos introduciendo el 2FA)
    if (!showTwoFactor) {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setIsLoading(false);
        return;
      }

      const result = await setupNewPassword(token, password);

      if (!result.success) {
        setError(result.error || 'Ocurrió un error desconocido al guardar la contraseña.');
        setIsLoading(false);
        return;
      }
    }

    // 2. Fase de Auto-Login (Usando el Server Action para manejar el 2FA correctamente)
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (showTwoFactor) formData.append('code', code); // Se envía el código si ya fue introducido

    const authError = await authenticate(undefined, formData);

    if (authError) {
      // Si el action nos dice que requiere 2FA, abrimos la vista del código
      if (authError === '2FA_REQUIRED') {
        setShowTwoFactor(true);
        setError('');
      } else {
        // Puede ser "Código inválido" u otro error general
        setError(authError);
      }
      setIsLoading(false);
      return;
    }

    // 3. Si no hay error, el inicio de sesión fue un éxito
    router.push('/sellerDashboard');
    router.refresh(); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      {!showTwoFactor ? (
        <>
          {/* VISTA 1: CREAR CONTRASEÑA */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Elige una Nueva Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#f8ed1a] transition-colors"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confirma tu Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#f8ed1a] transition-colors"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
        </>
      ) : (
        <>
          {/* VISTA 2: CÓDIGO 2FA */}
          <div className="bg-blue-900/20 border border-blue-800 text-blue-200 px-4 py-3 rounded text-sm mb-4">
            ℹ️ Tienes la verificación en 2 pasos activa. Por favor, verifica tu identidad.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 text-center">
              Código de Autenticador (6 Dígitos)
            </label>
            <input
              ref={codeInputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 text-center text-2xl text-white font-mono tracking-[0.5em] focus:outline-none focus:border-[#f8ed1a] transition-colors"
              placeholder="000000"
              maxLength={6}
              pattern="\d{6}"
              inputMode="numeric"
              required
              disabled={isLoading}
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#f8ed1a] hover:bg-[#d4ca12] text-black font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center mt-6 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
        ) : showTwoFactor ? (
          'Verificar y Acceder'
        ) : (
          'Guardar y Acceder'
        )}
      </button>
    </form>
  );
}