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
    return notFound(); // Muestra la página 404 de Next.js
  }

  if (session.isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Enlace Utilizado</h1>
          <p className="text-gray-600">Este enlace ya fue usado para seleccionar una propiedad. Si necesitas ver otra, por favor solicita un nuevo acceso enviando un mensaje.</p>
        </div>
      </div>
    );
  }

  if (session.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Enlace Expirado</h1>
          <p className="text-gray-600">Por seguridad, este enlace ha caducado. Por favor solicita uno nuevo.</p>
        </div>
      </div>
    );
  }

  // 3. Obtener las propiedades disponibles para el Dropdown
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      address: true,
      titleEs: true,
    },
    orderBy: {
      address: 'asc',
    },
  });

  // 4. Renderizar la vista principal
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-bold mb-6 text-gray-800">
          Hola {session.contactName || 'visitante'} 👋
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Estás solicitando acceso para el número: <span className="font-semibold">{session.contactPhone}</span>
        </p>
        
        {/* Pasamos el token de la sesión al formulario */}
        <PropertyForm properties={properties} sessionToken={session.token} />
      </div>
    </main>
  );
}