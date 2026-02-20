import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import DashboardClient from './dashboard-client';

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export default async function AdminDashboard() {
  const session = await auth();

  // 1. Obtenemos los datos crudos de Prisma incluyendo el perfil del vendedor
  const rawProperties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      sellerProfile: true, 
    }
  });

  // 2. TRANSFORMACIÓN: Aseguramos que los tipos numéricos sean JS Numbers planos y las fechas Strings
  const properties = rawProperties.map((p) => {
    // Separamos el sellerProfile del resto para manejar sus fechas internamente
    const { sellerProfile, ...rest } = p;

    return {
      ...rest,
      // Venta
      price: p.price ? Number(p.price) : 0,
      previousPrice: p.previousPrice ? Number(p.previousPrice) : null, 
      downPayment: p.downPayment ? Number(p.downPayment) : 0,
      interestRate: p.interestRate ? Number(p.interestRate) : 0,
      taxes: p.taxes ? Number(p.taxes) : 0,
      insurance: p.insurance ? Number(p.insurance) : 0,
      
      // Renta
      monthlyRent: p.monthlyRent ? Number(p.monthlyRent) : 0,
      securityDeposit: p.securityDeposit ? Number(p.securityDeposit) : 0,
      
      // Fechas de la Propiedad
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      availableDate: p.availableDate ? p.availableDate.toISOString() : null,
      lastPriceChangeAt: p.lastPriceChangeAt ? p.lastPriceChangeAt.toISOString() : null,

      // --- COMPATIBILIDAD Y VENDEDOR ---
      sellerName: sellerProfile?.sellerName || null,
      sellerType: sellerProfile?.sellerType || null,
      sellerImage: sellerProfile?.sellerImage || null,

      sellerProfile: sellerProfile ? {
        ...sellerProfile,
        createdAt: sellerProfile.createdAt.toISOString(),
        updatedAt: sellerProfile.updatedAt.toISOString(),
      } : null,
    };
  });

  // Calculamos stats
  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.status === 'AVAILABLE').length;
  const soldProperties = properties.filter((p) => p.status === 'SOLD' || p.status === 'UNDER_CONTRACT').length;
  
  // Inventory Value solo debe sumar propiedades de VENTA
  const totalInventoryValue = properties
    .filter(p => p.status === 'AVAILABLE' && p.isForSale)
    .reduce((acc, curr) => acc + (curr.price), 0);

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
                  <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">v1.1 Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              
              {/* --- BOTÓN NUEVO: SELLERS ADMIN --- */}
              <Link 
                href="/admin/sellers" 
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wide hover:text-[#f8ed1a] hover:border-[#f8ed1a] transition-all group"
              >
                  <span className="filter grayscale group-hover:grayscale-0 transition-all text-base">👥</span> 
                  <span>Sellers</span>
              </Link>

              {/* BOTÓN: BLOG ADMIN */}
              <Link 
                href="/admin/blog" 
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wide hover:text-[#f8ed1a] hover:border-[#f8ed1a] transition-all group"
              >
                  <span className="filter grayscale group-hover:grayscale-0 transition-all text-base">📰</span> 
                  <span>Blog</span>
              </Link>

              {/* BOTÓN API/JSON */}
              <Link 
                href="../api/agent/inventory" 
                target="_blank"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-wide hover:text-[#f8ed1a] hover:border-[#f8ed1a] transition-all group"
              >
                  <span className="filter grayscale group-hover:grayscale-0 transition-all text-base">🤖</span> 
                  <span>AI JSON</span>
              </Link>

              <div className="text-right hidden sm:block border-l border-gray-800 pl-6">
                <p className="text-sm text-white font-bold">{session?.user?.name || 'Administrator'}</p>
                <Link 
                  href="/admin/user_settings" 
                  className="text-xs text-gray-500 hover:text-[#f8ed1a] transition-colors hover:underline underline-offset-2"
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

        {/* --- STATS CARDS (Resumen Superior) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Properties" value={totalProperties} icon="🏠" />
          <StatCard title="Available" value={availableProperties} icon="✅" color="text-[#529e14]" />
          <StatCard title="Sold / Contract" value={soldProperties} icon="🤝" color="text-[#f8ed1a]" />
          <StatCard title="Sale Inventory Value" value={formatMoney(totalInventoryValue)} icon="💰" />
        </div>

        {/* --- CLIENT DASHBOARD (Listas Colapsables y Paginación) --- */}
        <DashboardClient properties={properties} />

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