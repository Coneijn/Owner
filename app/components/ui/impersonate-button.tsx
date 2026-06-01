'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getImpersonationData } from '@/app/actions/impersonate';

export default function ImpersonateButton({ targetUserId, targetUserName }: { targetUserId: string, targetUserName?: string }) {
  const { update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleImpersonate = async () => {
    try {
      setIsLoading(true);
      
      // 1. Obtener la información del usuario objetivo validada por el servidor
      const newData = await getImpersonationData(targetUserId);
      
      // 2. Inyectar la nueva información en la sesión activa del cliente
      await update({ user: newData });
      
      // 3. Determinar el dashboard correcto según los perfiles del usuario
      let redirectUrl = '/';
      if (newData.role === 'ADMIN') {
        redirectUrl = '/admin';
      } else if (newData.profiles.includes('AGENT')) {
        redirectUrl = '/agentsDashboard';
      } else if (newData.profiles.includes('SELLER')) {
        redirectUrl = '/sellerDashboard';
      } else if (newData.profiles.includes('BUYER')) {
        redirectUrl = '/buyersDashboard';
      } else if (newData.profiles.includes('RENTER')) {
        redirectUrl = '/rentersDashboard';
      }

      // 4. Redirigir al dashboard específico
      router.push(redirectUrl);
      router.refresh();
      
    } catch (error) {
      console.error('Error al impersonar:', error);
      alert('No tienes permisos o el usuario no existe.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleImpersonate}
      disabled={isLoading}
      title={targetUserName ? `Ver la plataforma como ${targetUserName}` : 'Ver como este usuario'}
      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? 'Cambiando...' : 'Ver cómo'}
    </button>
  );
}