'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom'; 
import { registerWebUser } from '@/lib/user-actions';
import { useSearchParams } from 'next/navigation'; // Importamos para leer la URL
import Link from 'next/link';

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/login'; // Default al login si no hay destino
  
  const [state, dispatch, isPending] = useActionState(registerWebUser, undefined);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (state?.success) {
      setSuccessMsg(state.message || 'Cuenta creada. Ya puedes iniciar sesión.');
    }
  }, [state]);

  // Si se crea con éxito, mostramos un mensaje en lugar del formulario
  if (successMsg) {
    return (
      <div className="flex-1 rounded-xl bg-[#1a1a1a] border border-green-500/50 px-8 py-10 shadow-[0_0_40px_rgba(82,158,20,0.1)] text-center">
        <h3 className="text-2xl font-bold text-white mb-4">¡Registro Exitoso!</h3>
        <p className="text-gray-300 mb-6">{successMsg}</p>
        <Link 
          href={callbackUrl}
          className="inline-block bg-[#f8ed1a] text-[#1a1a1a] font-black py-3 px-8 rounded-lg uppercase tracking-wider hover:bg-yellow-400 transition-colors"
        >
          Continuar para Mensajear
        </Link>
      </div>
    );
  }

  return (
    <form action={dispatch} className="space-y-3 w-full max-w-md mx-auto">
      <div className="flex-1 rounded-xl bg-[#1a1a1a] border border-gray-800 px-8 py-10 shadow-[0_0_40px_rgba(248,237,26,0.05)] relative overflow-hidden">
        
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider" htmlFor="name">
              Nombre Completo
            </label>
            <input
              className="peer block w-full rounded-md border border-gray-700 bg-black/50 py-[10px] pl-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] transition-all"
              id="name" type="text" name="name" placeholder="Ej. Juan Pérez" required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              className="peer block w-full rounded-md border border-gray-700 bg-black/50 py-[10px] pl-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] transition-all"
              id="email" type="email" name="email" placeholder="correo@ejemplo.com" required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider" htmlFor="phone">
              Teléfono
            </label>
            <input
              className="peer block w-full rounded-md border border-gray-700 bg-black/50 py-[10px] pl-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] transition-all"
              id="phone" type="tel" name="phone" placeholder="Ej. 555 123 4567" required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider" htmlFor="password">
              Contraseña
            </label>
            <input
              className="peer block w-full rounded-md border border-gray-700 bg-black/50 py-[10px] pl-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] transition-all"
              id="password" type="password" name="password" placeholder="Mínimo 6 caracteres" required minLength={6}
            />
          </div>
        </div>

        <div className="mt-8">
          <SubmitButton />
        </div>

        {state?.error && (
          <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">{state.error}</p>
          </div>
        )}
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      className="w-full justify-center rounded-md bg-[#f8ed1a] px-3 py-3 text-sm font-black uppercase tracking-wide text-[#1a1a1a] shadow-lg hover:bg-yellow-400 hover:shadow-yellow-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={pending}
    >
      {pending ? 'Procesando...' : 'Crear Cuenta'}
    </button>
  );
}