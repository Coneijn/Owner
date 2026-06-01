'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getRestoreAdminData } from '@/app/actions/impersonate';

export default function ImpersonationBanner() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Si NO estamos impersonando a nadie, el banner es completamente invisible
  if (!session?.user?.isImpersonating) return null;

  const handleRestore = async () => {
    try {
      setIsLoading(true);
      const originalUserId = session.user.originalUserId;
      
      if (!originalUserId) {
        throw new Error("No hay un ID de administrador para restaurar.");
      }

      // 1. Obtenemos los datos limpios de nuestro admin
      const adminData = await getRestoreAdminData(originalUserId);
      
      // 2. Sobreescribimos la sesión
      await update({ user: adminData });
      
      // 3. Volvemos al panel de control
      router.push('/admin');
      router.refresh();
    } catch (error) {
      console.error('Error al restaurar la sesión:', error);
      alert('Hubo un error al intentar volver a la cuenta de Admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sticky top-0 w-full z-[9999] bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-6 shadow-md">
      <span className="text-sm font-medium">
        ⚠️ Estás navegando la plataforma como otro usuario.
      </span>
      <button 
        onClick={handleRestore}
        disabled={isLoading}
        className="bg-white text-red-600 px-5 py-1.5 rounded-md text-sm font-black uppercase tracking-wide hover:bg-gray-100 transition-colors disabled:opacity-70"
      >
        {isLoading ? 'Volviendo...' : 'Volver a mi cuenta Admin'}
      </button>
    </div>
  );
}