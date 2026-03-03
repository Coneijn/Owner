import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardVendedorClient from './dashboard-seller-client';

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export default async function DashboardVendedor() {
  const session = await auth();

  if (!session?.user?.email) return null;

  // 1. Buscamos al usuario logueado para obtener su ID de perfil de vendedor
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { sellerProfile: true }
  });

  const sellerProfileId = user?.sellerProfile?.id;

  // Si por alguna razón entra aquí pero no tiene perfil, le mostramos un aviso
  if (!sellerProfileId) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center p-10">
        <h2 className="text-2xl">No tienes un perfil de vendedor asignado. Contacta al administrador.</h2>
      </div>
    );
  }

  // 2. MAGIA: Buscamos SOLAMENTE las propiedades que le pertenecen a este vendedor
  const rawProperties = await prisma.property.findMany({
    where: {
      sellerProfileId: sellerProfileId // <-- Este filtro hace todo el trabajo
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sellerProfile: true, 
    }
  });

  // 3. Formateamos los números como en el admin
  const properties = rawProperties.map((p) => {
    const { sellerProfile, ...rest } = p;
    return {
      ...rest,
      price: p.price ? Number(p.price) : 0,
      previousPrice: p.previousPrice ? Number(p.previousPrice) : null, 
      downPayment: p.downPayment ? Number(p.downPayment) : 0,
      interestRate: p.interestRate ? Number(p.interestRate) : 0,
      taxes: p.taxes ? Number(p.taxes) : 0,
      insurance: p.insurance ? Number(p.insurance) : 0,
      //monthlyPayment: p.monthlyPayment ? Number(p.monthlyPayment) : 0,
    };
  });

  // 4. Estadísticas (ahora calculadas SOLO con sus propiedades)
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'AVAILABLE').length;
  const soldProperties = properties.filter(p => p.status === 'UNDER_CONTRACT' || p.status === 'SOLD').length;
  const totalInventoryValue = properties.reduce((acc, p) => acc + (p.price || 0), 0);
  const downPaymentsCollected = properties.filter(p => p.status === 'SOLD').reduce((acc, p) => acc + (p.downPayment || 0), 0);
//  const monthlyIncomeGenerated = properties.filter(p => p.status === 'SOLD').reduce((acc, p) => acc + (p.monthlyPayment || 0), 0);

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-10 font-sans">
      <main className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-2">
              My <span className="text-[#f8ed1a]">Dashboard</span>
            </h1>
            <p className="text-gray-400 font-medium">Welcome back, {user.sellerProfile?.sellerName || 'Seller'}</p>
          </div>
          <div className="flex gap-4">
             {/* Nota: En el futuro cambiaremos esta ruta a /dashboard-vendedor/properties/new */}
            <Link href="/admin/properties/new" className="bg-[#529e14] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#529e14]/20 hover:bg-[#438210] transition-colors">
              + New Property
            </Link>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
              <button className="bg-[#1a1a1a] border border-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Total Properties" value={totalProperties} icon="🏢" />
          <StatCard title="Active Listings" value={activeProperties} icon="🟢" color="text-[#529e14]" />
          <StatCard title="Sold / Contract" value={soldProperties} icon="🤝" color="text-[#f8ed1a]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="My Inventory Value" value={formatMoney(totalInventoryValue)} icon="💰" />
          <StatCard title="Down Payments (Sold)" value={formatMoney(downPaymentsCollected)} icon="💵" color="text-[#529e14]" />
          {/*<StatCard title="Monthly Income" value={formatMoney(monthlyIncomeGenerated)} icon="📈" color="text-[#f8ed1a]" />*/}
        </div>

        <DashboardVendedorClient properties={properties} />

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
                    <dt className="text-sm font-medium text-gray-400 mb-1">{title}</dt>
                    <dd className={`text-2xl font-black ${color}`}>{value}</dd>
                </div>
            </div>
        </div>
    );
}