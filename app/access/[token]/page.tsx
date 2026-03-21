// app/access/[token]/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

// Forzamos a que esta página no se guarde en caché para que la validación de tiempo sea exacta
export const dynamic = 'force-dynamic';

export default async function LockboxAccessPage({ 
  params 
}: { 
  params: { token: string } 
}) {
  const { token } = await params;

  // 1. Buscar el token en la base de datos
  const access = await prisma.lockboxAccess.findUnique({
    where: { token },
    include: {
      property: true, // Incluimos la propiedad para mostrar el nombre y el código
    }
  });

  // 2. Si no existe, mostramos error
  if (!access) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8">
          <span className="text-5xl mb-4 block">❌</span>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Invalid Link</h1>
          <p className="text-gray-400">This access link does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  // 3. Verificar si ya pasaron los 5 minutos
  const now = new Date();
  if (access.expiresAt < now) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8">
          <span className="text-5xl mb-4 block">⏱️</span>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Link Expired</h1>
          <p className="text-gray-400">This access code has expired (exceeded 5 minutes).</p>
          <p className="text-gray-500 mt-4 text-sm font-bold uppercase">Please request a new code via SMS.</p>
        </div>
      </div>
    );
  }

  // 4. (Opcional) Invalidar link después del primer uso
  // Si deseas que el enlace se destruya tan pronto lo abran, puedes habilitar esto.
  // Sin embargo, con un límite de 5 minutos suele ser suficiente y menos frustrante 
  // por si el agente recarga la página por accidente.
  /*
  if (!access.isUsed) {
    await prisma.lockboxAccess.update({
      where: { id: access.id },
      data: { isUsed: true }
    });
  }
  */

  // 5. Obtener el código de la caja (Asumiendo que tienes un campo `lockboxCode` en tu modelo Property)
  // Si tu campo en Prisma se llama diferente, cámbialo aquí abajo:
  const lockboxCode = (access.property as any).lockboxCode || 'NOT-SET';

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8 text-center relative overflow-hidden">
        
        {/* Barra superior decorativa */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#f8ed1a]"></div>

        <h2 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2 mt-2">
          Lockbox Access Granted
        </h2>
        
        <h1 className="text-xl md:text-2xl font-black text-white mb-6">
          {access.property.titleEn || 'Property Access'} 
        </h1>

        <div className="bg-black/80 border border-gray-700 rounded-lg p-6 mb-6 shadow-inner">
          <p className="text-xs text-gray-500 uppercase mb-3 font-bold">Your Access Code</p>
          <p className="text-5xl md:text-6xl font-black tracking-widest text-[#f8ed1a]">
            {lockboxCode}
          </p>
        </div>

        <div className="bg-red-900/10 border border-red-900/50 p-4 rounded text-left flex gap-3 items-start">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-xs text-red-400 font-bold uppercase mb-1">Confidential</p>
            <p className="text-xs text-gray-400">
              Do not share this code. This screen and link will permanently expire at <strong>{access.expiresAt.toLocaleTimeString()}</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}