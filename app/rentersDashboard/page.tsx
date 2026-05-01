import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardRenterClient from './dashboard-renter-client';
import { ChangePasswordForm, TwoFactorManager } from '@/app/components/ui/client-components';

export default async function RentersDashboard() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/');
  }

  // 1. Obtener usuario y su Perfil de Inquilino (RenterProfile)
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { renterProfile: true },
  });

  // 2. Control de Acceso: Bloquear si no existe o no es inquilino
  if (!currentUser || !currentUser.renterProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#111111] px-4">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#f8ed1a] mb-4">Acceso Denegado</h2>
          <p className="text-gray-300">
            Tu cuenta no tiene un perfil de inquilino (renter) asignado. Si crees que esto es un error, por favor contacta a soporte.
          </p>
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }} className="mt-6">
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
  // =========================================================================
  const needsPasswordChange = currentUser.forcePasswordChange === true;
  const needs2FA = currentUser.isTwoFactorEnabled === false;

  if (needsPasswordChange) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
         <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-xl shadow-2xl max-w-md w-full">
            <h2 className="text-[#f8ed1a] text-sm uppercase tracking-widest font-bold mb-2 text-center">
                Paso 1: Seguridad
            </h2>
            <p className="text-gray-400 text-sm mb-6 text-center font-medium">
                Por seguridad, debes crear una contraseña personal antes de ver tu portal de renta.
            </p>
            <ChangePasswordForm />
         </div>
      </div>
    );
  }

  if (needs2FA) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
         <div className="bg-[#1a1a1a] border border-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full">
            <h2 className="text-[#f8ed1a] text-sm uppercase tracking-widest font-bold mb-2 text-center">
                Paso 2: Doble Factor (2FA)
            </h2>
            <p className="text-gray-400 text-sm mb-8 text-center font-medium">
                Protege tu información vinculando una aplicación de autenticación (como Google Authenticator).
            </p>
            <TwoFactorManager isEnabled={false} email={currentUser.email} role={currentUser.role}/>
         </div>
      </div>
    );
  }

  // =========================================================================
  // 4. Consultas a Prisma para el Dashboard de Inquilino
  // =========================================================================

  // Buscamos el contrato activo (LeaseAgreement) del inquilino, 
  // incluyendo la propiedad y TODO el historial de pagos (RentalPayment) ordenado por fecha.
  const activeLease = await prisma.leaseAgreement.findFirst({
    where: {
      renters: {
        some: {
          id: currentUser.renterProfile.id
        }
      },
      isActive: true
    },
    include: {
      property: true,
      payments: {
        orderBy: {
          paymentDate: 'desc'
        }
      }
    }
  });

  const propertyInfo = activeLease?.property;

  // Mapeamos los pagos de la DB al formato que espera tu frontend para la tabla
  const mappedTransactions = activeLease?.payments.map((payment) => ({
    date: payment.paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
    type: 'Rent Payment', 
    amount: Number(payment.totalDue),
    status: payment.status
  })) || [];

  // Buscamos si hay algún pago pendiente para alimentar la tarjeta principal de pago
  const nextPendingPayment = activeLease?.payments.find(p => p.status === 'PENDING');

  // Empaquetamos los datos con la información real de la base de datos
  const realRenterData = {
    homeAddress: propertyInfo
       ? `${propertyInfo.address}, ${propertyInfo.city}, ${propertyInfo.state} ${propertyInfo.zipCode}`
       : 'Dirección pendiente de asignar',
    propertyDetails: {
      bedrooms: propertyInfo?.bedrooms || 0,
      bathrooms: propertyInfo?.bathrooms || 0,
      image: propertyInfo?.mainImage || '',
    },
    // Tomamos el depósito de seguridad del contrato (o de la propiedad como fallback)
    securityDeposit: Number(activeLease?.securityDeposit || propertyInfo?.securityDeposit || 0),
    
    // Si hay un pago pendiente, mostramos ese total, si no, mostramos la renta mensual base
    nextPayment: Number(nextPendingPayment?.totalDue || activeLease?.monthlyRent || propertyInfo?.monthlyRent || 0),
    dueDate: nextPendingPayment?.paymentDate.toISOString() || new Date().toISOString(),
    paymentId: nextPendingPayment?.id || null, // Pasamos el ID del pago real para Stripe
    
    // AQUÍ INYECTAMOS LOS HISTORIALES
    transactions: mappedTransactions, 
    
    paymentBreakdown: {
      rent: Number(activeLease?.monthlyRent || propertyInfo?.monthlyRent || 0),
      services: Number(nextPendingPayment?.serviceFee || 0),
      lateFee: Number(nextPendingPayment?.lateFee || 0)
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-10 font-sans">
      <main className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-gray-800 pb-8">
          <div>
            <h2 className="text-[#f8ed1a] uppercase tracking-widest text-xs font-bold mb-2">
              OwnerToDueño Renter Portal
            </h2>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight">
              Welcome, <span className="text-gray-400">{currentUser.renterProfile.RenterName || currentUser.name || 'Inquilino'}</span>!
            </h1>
            <p className="text-gray-400 font-medium flex items-center gap-2 mt-2">
              <span className="text-[#529e14]">📍</span> {realRenterData.homeAddress}
            </p>
          </div>
          <div className="flex gap-4">
            <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }); }}>
              <button className="bg-[#1a1a1a] border border-gray-700 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
                Sign Out
              </button>
            </form>
          </div>
        </header>
        
        {/* CONTENIDO DEL DASHBOARD EN CHIQUITO */}
        <DashboardRenterClient data={realRenterData} />
      </main>
    </div>
  );
}