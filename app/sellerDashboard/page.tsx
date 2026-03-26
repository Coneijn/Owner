import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation'; // <-- Importación
import DashboardVendedorClient from './dashboard-seller-client';

import { 
  ChangePasswordForm, 
  TwoFactorManager 
} from '@/app/components/ui/client-components';

import SellerForm from '@/app/components/ui/seller-form';

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

  // 1. Buscamos al usuario logueado con su perfil
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { sellerProfile: true }
  });

  const sellerProfile = user?.sellerProfile;

  // 👇 Validación simplificada con redirección
  if (!sellerProfile) {
    redirect('/'); 
  }

  // ==========================================
  // 2. EVALUACIÓN DE PRIMER LOGIN (ONBOARDING SECUENCIAL)
  // ==========================================
  
  const needsPasswordChange = user.forcePasswordChange === true; 
  
  const needs2FA = !user.isTwoFactorEnabled; 
  const needsProfileCompletion = !sellerProfile.sellerImage; 
  
  const isFirstLogin = needsPasswordChange || needs2FA || needsProfileCompletion;

  if (isFirstLogin) {
    return (
      <div className="min-h-screen bg-[#111111] text-white p-4 md:p-10 font-sans flex flex-col items-center pb-20">
        <div className="max-w-3xl w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8 mt-10">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#f8ed1a] mb-2">
            Account Setup
          </h1>
          <p className="text-gray-400 mb-8">
            Before accessing your dashboard, please complete your initial setup.
          </p>

          <div className="space-y-10">
            {/* LÓGICA SECUENCIAL: Solo muestra el paso que toca */}
            
            { needs2FA ? (
              <section className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Step 2: Setup Two-Factor Authentication (2FA)</h2>
                <TwoFactorManager 
                  isEnabled={user.isTwoFactorEnabled} 
                  email={session.user.email} 
                  role={user.role}
                />
              </section>
            
            ) : needsProfileCompletion ? (
              <section className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Step 3: Complete Seller Profile</h2>
                <SellerForm 
                  initialData={{
                    id: sellerProfile.id,
                    sellerName: sellerProfile.sellerName,
                    sellerType: sellerProfile.sellerType || 'OWNER', 
                    sellerImage: sellerProfile.sellerImage
                  }} 
                />
              </section>
            
            ) : null}
          </div>

          <div className="mt-10 flex justify-between items-center pt-6 border-t border-gray-800">
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
              <button className="text-gray-400 font-bold uppercase hover:text-white transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. FLUJO NORMAL: DASHBOARD (PORTAFOLIO)
  // ==========================================
  const rawProperties = await prisma.property.findMany({
    where: {
      sellerProfileId: sellerProfile.id 
    },
    orderBy: { createdAt: 'desc' },
    include: {
      sellerProfile: true, 
    }
  });

  const properties = rawProperties.map((p) => {
    const { sellerProfile, ...rest } = p;
    return {
      ...rest,
      price: p.price ? Number(p.price) : 0,
      previousPrice: p.previousPrice ? Number(p.previousPrice) : null, 
      downPayment: p.downPayment ? Number(p.downPayment) : 0,
      interestRate: p.interestRate ? Number(p.interestRate) : 0,
      monthlyRent: p.monthlyRent ? Number(p.monthlyRent) : 0,
      taxes: p.taxes ? Number(p.taxes) : 0,
      insurance: p.insurance ? Number(p.insurance) : 0,
      securityDeposit: p.securityDeposit ? Number(p.securityDeposit) : null,
      commissionPct: p.commissionPct ? Number(p.commissionPct) : null,
      commissionAmt: p.commissionAmt ? Number(p.commissionAmt) : null,
    };
  });

  // --- NUEVAS MÉTRICAS DEL PORTAFOLIO (SIN LOANS) ---
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'AVAILABLE').length;
  const pendingProperties = properties.filter(p => p.status === 'UNDER_CONTRACT').length;
  const soldProperties = properties.filter(p => p.status === 'SOLD').length;
  
  // Valor total del portafolio sumando los precios de todas las propiedades
  const portfolioValue = properties.reduce((acc, p) => acc + (p.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-10 font-sans">
      <main className="max-w-7xl mx-auto">
        
        {/* CABECERA ESTILO PORTAL */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-800 pb-8">
          <div>
            <h2 className="text-[#f8ed1a] uppercase tracking-widest text-xs font-bold mb-2">
              OwnerToDueño Owner Portal
            </h2>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
              {sellerProfile.sellerName}'s <span className="text-gray-500">Portfolio</span>
            </h1>
            {/* DESCRIPCIÓN ACTUALIZADA */}
            <p className="text-gray-400 font-medium">
              Manage your properties and monitor your real estate portfolio.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/sellerDashboard/properties/new" className="bg-[#529e14] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#529e14]/20 hover:bg-[#438210] transition-colors">
              + New Listing
            </Link>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
              <button className="bg-[#1a1a1a] border border-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* MÉTRICAS (ACTUALIZADAS SIN PRÉSTAMOS) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatCard title="Total Properties" value={totalProperties} />
          <StatCard title="Available" value={availableProperties} color="text-[#529e14]" />
          <StatCard title="Pending" value={pendingProperties} color="text-[#f8ed1a]" />
          <StatCard title="Sold" value={soldProperties} color="text-blue-400" />
          <StatCard title="Portfolio Value" value={formatMoney(portfolioValue)} color="text-white" />
        </div>

        {/* TABLAS Y PESTAÑAS (COMPONENTE CLIENTE) */}
        <DashboardVendedorClient properties={properties} />

      </main>
    </div>
  );
}

// Tarjeta de estadística simplificada para encajar 5 en una fila
function StatCard({ title, value, color = 'text-white' }: any) {
    return (
        <div className="bg-[#1a1a1a] shadow-lg rounded-xl border border-gray-800 p-5 relative group hover:border-gray-700 transition-colors">
            <dt className="text-xs font-bold uppercase text-gray-500 mb-2">{title}</dt>
            <dd className={`text-2xl md:text-3xl font-black ${color}`}>{value}</dd>
        </div>
    );
}