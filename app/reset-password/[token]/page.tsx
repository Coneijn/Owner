import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ResetPasswordForm from './ResetPasswordForm'; 
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({ 
  params 
}: { 
  params: { token: string } 
}) {
  const { token } = await params;

  // 1. Validar el token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8">
          <span className="text-5xl mb-4 block">❌</span>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Enlace Expirado o Inválido</h1>
          <p className="text-gray-400">Por motivos de seguridad, este enlace de recuperación ya caducó o ya fue utilizado.</p>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier }
  });

  if (!user) return notFound();

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#f8ed1a]"></div>

        <h2 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2 mt-2">
          Seguridad de la Cuenta
        </h2>
        <h1 className="text-xl md:text-2xl font-black text-white mb-4">
          Restablecer Contraseña
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Hola, {user.name?.split(' ')[0]}. Ingresa tu nueva contraseña para recuperar el acceso a la plataforma.
        </p>

        <ResetPasswordForm token={token} email={user.email} />
      </div>
    </div>
  );
}