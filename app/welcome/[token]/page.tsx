// app/welcome/[token]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SetPasswordForm from './SetPasswordForm'; // Componente de cliente que crearemos

export const dynamic = 'force-dynamic';

export default async function SellerWelcomePage({ 
  params 
}: { 
  params: { token: string } 
}) {
  const { token } = await params;

  // 1. Validar el token de verificación (Magic Link)
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8">
          <span className="text-5xl mb-4 block">❌</span>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Enlace Inválido o Expirado</h1>
          <p className="text-gray-400">Este enlace de acceso ya fue utilizado o ha expirado por seguridad. Por favor, contacta a tu agente para solicitar uno nuevo.</p>
        </div>
      </div>
    );
  }

  // 2. Buscar al usuario asociado a este token
  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier }
  });

  if (!user) {
    return notFound();
  }

  // 3. Mostrar la interfaz de Bienvenida y Configuración de Contraseña
  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Barra decorativa */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#f8ed1a]"></div>

        <h2 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2 mt-2">
          Configuración de Cuenta
        </h2>
        
        <h1 className="text-xl md:text-2xl font-black text-white mb-4">
          ¡Bienvenido, {user.name?.split(' ')[0]}!
        </h1>

        <p className="text-gray-400 text-sm mb-6">
          Para acceder a tu panel de vendedor y gestionar tus propiedades, por favor establece una contraseña segura.
        </p>

        {/* Formulario Cliente para establecer la contraseña y hacer el Login */}
        <SetPasswordForm token={token} email={user.email} />

      </div>
    </div>
  );
}