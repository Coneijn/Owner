import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/auth'; // Asegúrate de que esta ruta apunte a tu NextAuth

// Nota: Igual que con la creación, necesitarás un formulario específico para sellers
// que no tenga el selector de vendedores. Lo llamaremos SellerEditForm.
import EditForm from '@/app/components/ui/edit-form';
import SellerEditForm from '@/app/components/ui/seller-edit-form';

export default async function SellerEditPropertyPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params; 

  // 1. Validar la sesión del usuario
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // 2. Obtener el perfil del vendedor logueado
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!sellerProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
        <p className="text-gray-400">No tienes un perfil de vendedor asignado.</p>
      </div>
    );
  }

  // 3. Obtener los detalles de la propiedad ASEGURANDO que le pertenezca a este vendedor
  // Usamos findFirst en lugar de findUnique porque estamos filtrando por dos campos
  const property = await prisma.property.findFirst({
    where: { 
      id: id,
      sellerProfileId: sellerProfile.id // <-- ESTO ES LA CLAVE DE SEGURIDAD
    },
    include: {
      images: {
        orderBy: { order: 'asc' }
      }, 
    },
  });

  // Si la propiedad no existe o es de otro vendedor, mostramos la página de "No encontrado"
  if (!property) {
    notFound();
  }

  // 4. Serializar objetos complejos (fechas y decimales) para React
  const plainProperty = {
    ...property,
    // Financieros
    price: property.price ? property.price.toNumber() : 0,
    previousPrice: property.previousPrice ? property.previousPrice.toNumber() : null,
    downPayment: property.downPayment ? property.downPayment.toNumber() : 0,
    interestRate: property.interestRate ? property.interestRate.toNumber() : 0,
    taxes: property.taxes ? property.taxes.toNumber() : 0,
    insurance: property.insurance ? property.insurance.toNumber() : 0,
    monthlyRent: property.monthlyRent ? property.monthlyRent.toNumber() : 0,
    securityDeposit: property.securityDeposit ? property.securityDeposit.toNumber() : 0,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER --- */}
        <div className="md:flex md:items-center md:justify-between mb-10 border-b border-gray-800 pb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-3xl font-black leading-7 text-white uppercase tracking-tight sm:truncate">
              Editar Propiedad
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Modificando detalles para: <span className="text-[#f8ed1a] font-bold">{property.titleEs || property.titleEn}</span>
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/sellerDashboard/" // <-- Actualizado al dashboard de seller
              className="inline-flex items-center rounded-lg bg-white/5 border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 shadow-sm hover:bg-white/10 hover:text-white transition-colors"
            >
              Volver
            </Link>
          </div>
        </div>
        
        <div className="bg-[#1a1a1a] p-8 shadow-2xl rounded-2xl border border-gray-800 relative">
            {/* Glow decorativo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-[#529e14] to-transparent opacity-50 blur-sm rounded-t-2xl"></div>
            
            {/* OJO: Aquí le pasamos solo la propiedad al formulario */}
            <SellerEditForm property={plainProperty} />
        </div>
      </div>
    </div>
  );
}