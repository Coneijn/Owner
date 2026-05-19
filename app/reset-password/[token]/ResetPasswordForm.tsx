'use client';

import { useState, useRef, useEffect } from 'react';
import { updateRecoveredPassword } from './actions';
import { authenticate } from '@/lib/actions'; 

interface ResetPasswordFormProps {
  token: string;
  email: string;
}

export default function ResetPasswordForm({ token, email }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const codeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showTwoFactor && codeInputRef.current) codeInputRef.current.focus();
  }, [showTwoFactor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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

      const result = await updateRecoveredPassword(token, password);
      if (!result.success) {
        setError(result.error || 'Error al guardar la contraseña.');
        setIsLoading(false);
        return;
      }
    }

    // AUTO-LOGIN: Enviamos los datos al action original del sistema
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (showTwoFactor) formData.append('code', code);

    const authError = await authenticate(undefined, formData);

    if (authError) {
      if (authError === '2FA_REQUIRED') {
        setShowTwoFactor(true);
        setError('');
      } else {
        setError(authError);
      }
      setIsLoading(false);
      return;
    }
    
    // Si no devuelve error, `authenticate` se encargará de redirigir 
    // al usuario a su Dashboard correcto según su jerarquía de perfil.
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm text-center">{error}</div>}

      {!showTwoFactor ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nueva Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#f8ed1a]" required disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Contraseña</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-[#f8ed1a]" required disabled={isLoading} />
          </div>
        </>
      ) : (
        <>
          <div className="bg-blue-900/20 border border-blue-800 text-blue-200 px-4 py-3 rounded text-sm mb-4">🛡️ Tu cuenta tiene 2FA activo. Introduce el código de tu aplicación de autenticación.</div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 text-center">Código de Verificación (6 Dígitos)</label>
            <input ref={codeInputRef} type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg p-4 text-center text-2xl text-white font-mono tracking-[0.5em] focus:outline-none focus:border-[#f8ed1a]" placeholder="000000" maxLength={6} required disabled={isLoading} />
          </div>
        </>
      )}

      <button type="submit" disabled={isLoading} className="w-full bg-[#f8ed1a] hover:bg-[#d4ca12] text-black font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-50 mt-6">
        {isLoading ? <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span> : showTwoFactor ? 'Verificar y Entrar' : 'Actualizar y Entrar'}
      </button>
    </form>
  );
}