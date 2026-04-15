import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import AssignClientForm from '@/app/components/AssignClientForm';

export default async function SellerAssignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  // 👇 RESOLVEMOS LAS PROMESAS AQUÍ 👇
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Buscamos la propiedad y el perfil usando el ID resuelto
  // Cambiamos titleEs por titleEn para el idioma inglés
  const [property, dbUser] = await Promise.all([
    prisma.property.findUnique({
      where: { id: resolvedParams.id },
      select: { id: true, titleEn: true, address: true, sellerProfileId: true }
    }),
    prisma.user.findUnique({
      where: { id: session.user?.id },
      include: { sellerProfile: true }
    })
  ]);

  if (!property) notFound();

  // VALIDACIÓN DE SEGURIDAD
  const sellerId = dbUser?.sellerProfile?.id;
  if (!sellerId || property.sellerProfileId !== sellerId) {
    redirect('/sellerDashboard'); 
  }

  // Usamos el searchParams resuelto
  const clientType = resolvedSearchParams.type === 'RENTED' ? 'RENTER' : 'BUYER';
  const displayRole = clientType === 'RENTER' ? 'Tenant' : 'Buyer';

  return (
    /* Usamos bg-brand-dark como fondo de toda la pantalla */
    <div className="min-h-screen bg-brand-dark py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      /* Usamos bg-brand-header para la tarjeta del formulario */
      <div className="w-full max-w-2xl bg-brand-header rounded-2xl shadow-2xl border border-gray-800 p-8">
        
        <div className="mb-8 border-b border-gray-800 pb-6">
          {/* Usamos text-brand-accent en lugar del orange-600 antiguo */}
          <h2 className="text-brand-accent font-bold text-sm uppercase tracking-wider mb-1">
            Seller Dashboard
          </h2>
          
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Assign {displayRole}
          </h1>
          
          <p className="text-gray-300 mt-2 text-lg">
            Property:{' '}
            <span className="font-bold text-white">
              {property.titleEn || property.address}
            </span>
          </p>
        </div>

        <AssignClientForm 
          propertyId={property.id} 
          clientType={clientType} 
          successRedirect="/sellerDashboard" 
        />
        
      </div>
    </div>
  );
}