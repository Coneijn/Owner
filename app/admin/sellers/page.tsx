import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SellersClient from '@/app/admin/sellers/sellers-client';

export const dynamic = 'force-dynamic';
export default async function SellersManagerPage() {
  // 1. Obtenemos los vendedores y contamos cuántas propiedades tienen asignadas
  const sellers = await prisma.sellerProfile.findMany({
    include: {
      _count: {
        select: { properties: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  // 2. Obtenemos las propiedades para poblar los dropdowns
  // Traemos el título y la dirección para que el staff sepa cuál es
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      titleEn: true,
      address: true,
      sellerProfileId: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Serializamos las fechas para evitar errores de Client Components
  const serializedSellers = sellers.map(seller => ({
    ...seller,
    createdAt: seller.createdAt.toISOString(),
    updatedAt: seller.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-[#0a0f1c] p-4 sm:p-8 font-sans text-gray-200">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Seller Profiles <span className="text-[#f8ed1a]">Manager</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage owners and agents, and assign them to properties.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-lg text-sm font-bold text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Back
            </Link>
            <Link
              href="/admin/sellers/new"
              className="bg-[#529e14] hover:bg-[#458510] text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide shadow-lg transition-all flex items-center gap-2"
            >
              <span>+</span> New Profile
            </Link>
          </div>
        </div>

        {/* --- COMPONENTE INTERACTIVO --- */}
        <SellersClient sellers={serializedSellers} properties={properties} />

      </div>
    </div>
  );
}