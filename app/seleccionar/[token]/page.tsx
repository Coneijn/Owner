import { prisma } from '@/lib/prisma';
import PropertyForm from './PropertyForm';
import { notFound } from 'next/navigation';

export default async function SelectionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1. Buscar la sesión en la base de datos
  const session = await prisma.selectionSession.findUnique({
    where: { token },
  });

  // 2. Validaciones de Seguridad 
  if (!session) {
    return notFound(); 
  }

  if (session.isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] p-4">
        <div className="bg-[#262626] border border-[#f8ed1a] p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#f8ed1a] mb-2">Enlace Utilizado / Link Used</h1>
          <p className="text-gray-300">Este enlace ya fue usado para seleccionar una propiedad. / This link has already been used.</p>
        </div>
      </div>
    );
  }

  if (session.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] p-4">
        <div className="bg-[#262626] border border-[#f8ed1a] p-8 rounded-lg shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#f8ed1a] mb-2">Enlace Expirado / Link Expired</h1>
          <p className="text-gray-300">Por seguridad, este enlace ha caducado. / For security reasons, this link has expired.</p>
        </div>
      </div>
    );
  }

  // 3. Obtener propiedades con status AVAILABLE y lockboxCode válido
  const properties = await prisma.property.findMany({
    where: {
      status: 'AVAILABLE',
      lockboxCode: {
        not: null, // Descartamos los valores nulos (String?)
      },
      NOT: {
        lockboxCode: '', // Descartamos cadenas de texto vacías
      }
    },
    select: {
      id: true,
      address: true,
      titleEs: true, // Ahora obligatorios en el select
      titleEn: true, 
    },
    orderBy: {
      address: 'asc',
    },
  });

  // 4. Renderizar la vista principal
  return (
    <main className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <PropertyForm 
          properties={properties} 
          sessionToken={session.token} 
          contactName={session.contactName}
          contactPhone={session.contactPhone}
        />
      </div>
    </main>
  );
}