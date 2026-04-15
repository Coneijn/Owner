import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import AssignClientForm from '@/app/components/AssignClientForm';

export default async function AssignPropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // 1. Fetch the property using the resolved ID (changed titleEs to titleEn)
  const property = await prisma.property.findUnique({
    where: { id: resolvedParams.id },
    select: { id: true, titleEn: true, address: true, sellerProfileId: true }
  });

  if (!property) notFound();

  // 2. Verify basic permissions
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user?.id },
    include: { sellerProfile: true }
  });

  if (dbUser?.role !== 'ADMIN') {
    const isSeller = !!dbUser?.sellerProfile;
    if (!isSeller || property.sellerProfileId !== dbUser?.sellerProfile?.id) {
      redirect('/admin'); 
    }
  }

  // 3. Use resolved searchParams and set English roles
  const clientType = resolvedSearchParams.type === 'RENTED' ? 'RENTER' : 'BUYER';
  const displayRole = clientType === 'RENTER' ? 'Tenant' : 'Buyer';

  return (
    <div className="min-h-screen bg-[#0a0f1c] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Contenedor estilo tarjeta oscura para mantener coherencia visual */}
      <div className="w-full max-w-2xl bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800 p-8">
        
        <div className="mb-8 border-b border-gray-800 pb-6">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">
            Assign <span className="text-[#f8ed1a]">{displayRole}</span>
          </h1>
          <p className="text-gray-300 text-lg">
            You are assigning a {displayRole.toLowerCase()} to the property:{' '}
            <span className="font-bold text-white">
              {property.titleEn || property.address}
            </span>
          </p>
        </div>

        <AssignClientForm 
          propertyId={property.id} 
          clientType={clientType} 
          successRedirect="/admin" 
        />
        
      </div>
    </div>
  );
}