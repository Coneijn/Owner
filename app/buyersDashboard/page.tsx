import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardBuyerClient from './dashboard-buyer-client';

// Importamos tus componentes reales de seguridad
import { ChangePasswordForm, TwoFactorManager } from '@/app/components/ui/client-components'; 

export default async function BuyersDashboard() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // 1. Obtener usuario y su Perfil de Comprador
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { buyerProfile: true },
  });

  // 2. Control de Acceso: Bloquear si no existe o no es comprador
  if (!currentUser || !currentUser.buyerProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#111111] px-4">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#f8ed1a] mb-4">Acceso Denegado</h2>
          <p className="text-gray-300">
            Tu cuenta no tiene un perfil de comprador asignado. Si crees que esto es un error, por favor contacta a soporte.
          </p>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }} className="mt-6">
            <button className="w-full bg-[#1a1a1a] border border-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. Lógica de Onboarding Secuencial (Contraseña -> 2FA)
  // Sin foto de perfil
  // =========================================================================
  
  const needsPasswordChange = currentUser.forcePasswordChange === true;
  const needs2FA = currentUser.isTwoFactorEnabled === false;

  // PASO 1: CAMBIO DE CONTRASEÑA
  if (needsPasswordChange) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
         <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-[#f8ed1a] text-sm uppercase tracking-widest font-bold mb-2 text-center">
                Paso 1: Seguridad
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center font-medium">
                Por seguridad, debes crear una contraseña personal antes de ver tu contrato.
            </p>
            <ChangePasswordForm />
         </div>
      </div>
    );
  }

  // PASO 2: CONFIGURACIÓN DE 2FA
  if (needs2FA) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
         <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full">
            <h2 className="text-[#f8ed1a] text-sm uppercase tracking-widest font-bold mb-2 text-center">
                Paso 2: Doble Factor (2FA)
            </h2>
            <p className="text-gray-400 text-sm mb-8 text-center font-medium">
                Protege tu información financiera vinculando una aplicación de autenticación (como Google Authenticator).
            </p>
            <TwoFactorManager isEnabled={false} email={currentUser.email} role={currentUser.role}/>
         </div>
      </div>
    );
  }

  // =========================================================================
  // 4. Flujo Normal: Consultas a Prisma para el Dashboard
  // =========================================================================

  // Buscamos el contrato principal activo del comprador
  const contract = await prisma.contract.findFirst({
    where: { 
      buyerProfileId: currentUser.buyerProfile.id,
      isActive: true
    },
    include: {
      property: true,
      payments: {
        orderBy: { paymentDate: 'desc' },
      }
    }
  });

  if (!contract) {
    return (
      <div className="min-h-screen bg-[#111111] text-white p-10 text-center flex flex-col items-center justify-center">
        <h1 className="text-3xl font-black mb-4">Aún no tienes un contrato activo.</h1>
        <p className="text-gray-400">Tus datos de financiamiento aparecerán aquí una vez que se firme el contrato.</p>
        <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }} className="mt-8">
            <button className="bg-[#f8ed1a] text-black px-8 py-3 rounded-full font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors">
              Salir
            </button>
        </form>
      </div>
    );
  }

  // Lógica para separar el pago pendiente actual y los pagos históricos
  const pendingPayment = contract.payments.find(p => p.status === 'PENDING') || contract.payments[0];
  const paidTransactions = contract.payments.filter(p => p.status === 'PAID').slice(0, 3); // Últimos 3 pagos

  // Cálculos financieros
  const outstandingBalance = pendingPayment ? Number(pendingPayment.remainingBalance) : Number(contract.principalAmount);
  const totalPropertyValue = Number(contract.totalAmount);
  
  // Equity = Valor total - Deuda actual
  const equityBuilt = Math.max(totalPropertyValue - outstandingBalance, 0); 
  const equityPercentage = totalPropertyValue > 0 ? (equityBuilt / totalPropertyValue) * 100 : 0;

  // Empaquetamos todo para enviarlo a tu Client Component
  const realBuyerData = {
    homeAddress: `${contract.property.address}, ${contract.property.city}, ${contract.property.state} ${contract.property.zipCode}`,
    outstandingBalance: outstandingBalance,
    interestRate: Number(contract.interestRate || 0),
    nextPayment: pendingPayment ? Number(pendingPayment.totalDue) : 0,
    dueDate: pendingPayment ? pendingPayment.paymentDate.toISOString() : contract.startDate.toISOString(),
    paymentId: pendingPayment ? pendingPayment.id : null,
    equityBuilt: equityBuilt,
    equityPercentage: Math.round(equityPercentage),
    transactions: paidTransactions.map(tx => ({
      date: tx.paidAt ? tx.paidAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : '',
      type: "Monthly Payment",
      amount: Number(tx.totalDue),
      principal: Number(tx.principal),
      interest: Number(tx.interest),
    })),
    paymentBreakdown: {
      interest: pendingPayment ? Number(pendingPayment.interest) : 0,
      principal: pendingPayment ? Number(pendingPayment.principal) : 0,
      escrow: pendingPayment ? (Number(pendingPayment.taxes || 0) + Number(pendingPayment.insurance || 0) + Number(pendingPayment.serviceFee || 0)) : 0
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-10 font-sans">
      <main className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-800 pb-8">
          <div>
            <h2 className="text-[#f8ed1a] uppercase tracking-widest text-xs font-bold mb-2">
              OwnerToDueño Buyer Portal
            </h2>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
              Welcome back, <span className="text-gray-400">{currentUser.buyerProfile.firstName || currentUser.name || 'Comprador'}</span>!
            </h1>
            <p className="text-gray-400 font-medium flex items-center gap-2 mt-2">
              <span className="text-[#529e14]">📍</span> {realBuyerData.homeAddress}
            </p>
          </div>
          <div className="flex gap-4">
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
              <button className="bg-[#1a1a1a] border border-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* CONTENIDO DEL DASHBOARD CON DATOS DE PRISMA */}
        <DashboardBuyerClient data={realBuyerData} />

      </main>
    </div>
  );
}