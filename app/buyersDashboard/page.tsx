import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardBuyerClient from './dashboard-buyer-client';

export default async function BuyersDashboard() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/');
  }

  // TODO: Conectar con tu modelo de Prisma (ej. prisma.loan.findUnique(...))
  // Por ahora, usamos datos simulados basados en tu prototipo HTML
  const mockBuyerData = {
    homeAddress: "5005 Wilburn Ave, Memphis, TN 38117",
    outstandingBalance: 278462.92,
    interestRate: 12,
    nextPayment: 3512.36,
    dueDate: "2026-12-28",
    equityBuilt: 20537.08,
    equityPercentage: 7,
    transactions: [
      { date: "Nov 28, 2025", type: "Monthly Payment", amount: 3512.36, principal: 214.50, interest: 2784.00 },
      { date: "Oct 28, 2025", type: "Monthly Payment", amount: 3512.36, principal: 212.15, interest: 2786.35 },
      { date: "Sep 28, 2025", type: "Monthly Payment", amount: 3512.36, principal: 209.80, interest: 2788.70 },
    ],
    paymentBreakdown: {
      interest: 2784,
      principal: 214,
      escrow: 501
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-10 font-sans">
      <main className="max-w-7xl mx-auto">
        
        {/* CABECERA ESTILO PORTAL */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-800 pb-8">
          <div>
            <h2 className="text-[#f8ed1a] uppercase tracking-widest text-xs font-bold mb-2">
              OwnerToDueño Buyer Portal
            </h2>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
              Welcome back, <span className="text-gray-400">{user.name || 'Carlos'}</span>!
            </h1>
            <p className="text-gray-400 font-medium flex items-center gap-2 mt-2">
              <span className="text-[#529e14]">📍</span> {mockBuyerData.homeAddress}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="bg-[#529e14] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-[#529e14]/20 hover:bg-[#438210] transition-colors flex items-center gap-2">
              💳 Make Payment
            </button>
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
              <button className="bg-[#1a1a1a] border border-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* CONTENIDO DEL DASHBOARD (CLIENT COMPONENT) */}
        <DashboardBuyerClient data={mockBuyerData} />

      </main>
    </div>
  );
}