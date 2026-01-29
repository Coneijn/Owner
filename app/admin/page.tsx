import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import DeletePropertyButton from '@/app/admin/ui/delete-button';

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export default async function AdminDashboard() {
  const session = await auth();

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.status === 'AVAILABLE').length;
  const soldProperties = properties.filter((p) => p.status === 'SOLD' || p.status === 'UNDER_CONTRACT').length;
  
  const totalInventoryValue = properties
    .filter(p => p.status === 'AVAILABLE')
    .reduce((acc, curr) => acc + Number(curr.price), 0);

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-[#1a1a1a] shadow-lg border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo + Brand */}
            <div className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#f8ed1a]">
                  <Image src="/logo.png" alt="Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                  <span className="text-white text-lg font-black uppercase tracking-tight leading-none">
                    Admin <span className="text-[#f8ed1a]">Panel</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">v1.0 Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              
              {/* --- NUEVO: BOTÓN API/JSON PARA AGENTES --- */}
              {/* Es discreto, solo visible en desktop, útil para desarrolladores */}
              <Link 
                href="/api/agent/inventory" 
                target="_blank"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wide hover:text-[#f8ed1a] hover:border-[#f8ed1a] transition-all group"
                title="Abrir inventario en formato JSON para Agentes de IA"
              >
                  <span className="filter grayscale group-hover:grayscale-0 transition-all text-base">🤖</span> 
                  <span>AI JSON</span>
              </Link>
              {/* ------------------------------------------ */}

              <div className="text-right hidden sm:block border-l border-gray-800 pl-6">
                <p className="text-sm text-white font-bold">{session?.user?.name || 'Administrator'}</p>
                
                <Link 
                  href="/admin/user_settings" 
                  className="text-xs text-gray-500 hover:text-[#f8ed1a] transition-colors hover:underline underline-offset-2"
                  title="Configuración de usuario"
                >
                  {session?.user?.email}
                </Link>
              </div>
              
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button className="bg-white/5 hover:bg-red-900/30 text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-800 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER ACCIONES --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Properties</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your real estate inventory.</p>
          </div>
          <Link
            href="/admin/properties/new"
            className="bg-[#529e14] hover:bg-[#458510] text-white px-6 py-3 rounded-lg font-bold uppercase tracking-wide shadow-lg hover:shadow-[#529e14]/40 transition-all flex items-center gap-2 justify-center transform hover:-translate-y-0.5"
          >
            <span>+</span> New Property
          </Link>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Properties" value={totalProperties} icon="🏠" />
          <StatCard title="Available" value={availableProperties} icon="✅" color="text-[#529e14]" /> {/* Verde */}
          <StatCard title="Sold / Contract" value={soldProperties} icon="🤝" color="text-[#f8ed1a]" /> {/* Amarillo */}
          <StatCard title="Inventory Value" value={formatMoney(totalInventoryValue)} icon="💰" />
        </div>

        {/* --- TABLA DE PROPIEDADES --- */}
        <div className="bg-[#1a1a1a] shadow-2xl rounded-xl overflow-hidden border border-gray-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Property</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Specs</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-[#1a1a1a] divide-y divide-gray-800">
                {properties.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                       No properties registered yet. Create your first one!
                     </td>
                   </tr>
                ) : (
                  properties.map((property) => (
                    <tr key={property.id} className="hover:bg-white/5 transition-colors group">
                      {/* Columna: Casa (Imagen + Título) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                             {property.mainImage ? (
                               <img src={property.mainImage} alt="" className="h-full w-full object-cover" />
                             ) : (
                               <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs">N/A</div>
                             )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-white truncate max-w-[200px]" title={property.titleEn || property.titleEs}>
                              {property.titleEn || property.titleEs}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">
                              {property.address}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Columna: Precio */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#f8ed1a] font-bold">{formatMoney(property.price)}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Down: {formatMoney(property.downPayment)}</div>
                      </td>

                      {/* Columna: Estado */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black uppercase tracking-wider rounded-full 
                          ${property.status === 'AVAILABLE' ? 'bg-[#529e14]/20 text-[#529e14] border border-[#529e14]/30' : ''}
                          ${property.status === 'SOLD' ? 'bg-red-900/20 text-red-500 border border-red-900/30' : ''}
                          ${property.status === 'UNDER_CONTRACT' ? 'bg-yellow-900/20 text-[#f8ed1a] border border-[#f8ed1a]/30' : ''}
                          ${property.status === 'DRAFT' ? 'bg-orange-900/20 text-orange-400 border border-orange-400/30' : ''}
                        `}>
                          {property.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Columna: Specs */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-medium">
                        {property.bedrooms} beds • {property.bathrooms} baths
                      </td>

                      {/* Columna: Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-4">
                            <Link href={`/propiedades/${property.slug}`} target="_blank" className="text-gray-500 hover:text-white transition-colors" title="View on site">
                                👁️
                            </Link>
                            <Link href={`/admin/properties/${property.id}/edit`} className="text-blue-400 hover:text-blue-300 font-bold uppercase text-xs tracking-wide">
                                Edit
                            </Link>
                            
                           {/* Botón seguro de borrado */}
                           <DeletePropertyButton id={property.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'text-white' }: any) {
    return (
        <div className="bg-[#1a1a1a] overflow-hidden shadow-lg rounded-xl border border-gray-800 p-6 relative group hover:border-gray-700 transition-colors">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="flex items-center">
                <div className="flex-shrink-0 text-3xl mr-4 opacity-80">{icon}</div>
                <div>
                    <dt className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</dt>
                    <dd className={`mt-1 text-2xl font-black ${color}`}>{value}</dd>
                </div>
            </div>
        </div>
    )
}