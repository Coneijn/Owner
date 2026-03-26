// app/welcome/[token]/SetPasswordForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react'; // Importamos la función de login
import { setupNewPassword } from './actions';
import { useRouter } from 'next/navigation';
interface SetPasswordFormProps {
  token: string;
  email: string;
}

export default function SetPasswordForm({ token, email }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 1. Validaciones básicas en el cliente
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

    // 2. Llamar al Server Action para actualizar la base de datos
    const result = await setupNewPassword(token, password);

    // Cambiamos la validación para usar result.success
    if (!result.success) {
      setError(result.error || 'Ocurrió un error desconocido.');
      setIsLoading(false);
      return;
    }

    // 3. Si todo salió bien, iniciamos sesión automáticamente
    if (result.success) {
        const signInResult = await signIn('credentials', {
          email: email,
          password: password, 
          redirect: false, // <-- 3. CAMBIAR A FALSE
        });
  
        // Ahora TypeScript sí sabe que signInResult existe y tiene la propiedad error
        if (signInResult?.error) {
          setError('Contraseña guardada, pero hubo un error al iniciar sesión automáticamente. Por favor, ve a la página de login.');
          setIsLoading(false);
          return;
        }
  
        // Si no hay error, redirigimos manualmente
        if (signInResult?.ok) {
          router.push('/sellerDashboard');
          router.refresh(); // Refresca el estado de Next.js para asegurar que lea la sesión
        }
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#f8ed1a] hover:bg-[#d4ca12] text-black font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center mt-6 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span>
        ) : (
          'Guardar y Acceder'
        )}
      </button>
    </form>
  );
}