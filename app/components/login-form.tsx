'use client';

import { useActionState } from 'react'; 
import { authenticate } from '@/lib/actions';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo Electrónico
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="admin@ejemplo.com"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="••••••"
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Mensaje de error si existe */}
      {errorMessage && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
          <p>{errorMessage}</p>
        </div>
      )}

    
      <button
        type="submit"
        disabled={isPending}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
          isPending ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isPending ? 'Entrando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}