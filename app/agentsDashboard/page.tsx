import { auth, signOut } from '@/auth';
import prisma from '@/lib/prisma';
import AgentDashboardClient from './agent-dashboard-client';
import { redirect } from 'next/navigation'; // <-- Agregamos esto

// Componentes de Onboarding de Seguridad
import { 
  ChangePasswordForm, 
  TwoFactorManager 
} from '@/app/components/ui/client-components';

import AgentProfileForm from './agent-profile-form';

export const metadata = {
  title: "Rep Portal — Owner To Dueño",
  description: "Panel de control para representantes locales",
};

export default async function AgentDashboardPage() {
  const session = await auth();

  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { agentProfile: true }
  });

  const agentProfile = user?.agentProfile;

  if (!agentProfile) {
    redirect('/');
  }

  // ==========================================
  // 2. EVALUACIÓN DE PRIMER LOGIN (ONBOARDING)
  // ==========================================
  
  // Usamos `(user as any)` temporalmente si TypeScript marca error por forcePasswordChange
  const needsPasswordChange = (user as any).forcePasswordChange === true; 
  const needs2FA = !user.isTwoFactorEnabled; 
  const needsProfileCompletion = !agentProfile.agentImage; // Requiere subir foto
  
  const isFirstLogin = needsPasswordChange || needs2FA || needsProfileCompletion;

  if (isFirstLogin) {
    return (
      <div className="min-h-screen bg-[#111111] text-white p-4 md:p-10 font-sans flex flex-col items-center pb-20">
        <div className="max-w-3xl w-full bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-2xl p-8 mt-10">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#f8ed1a] mb-2">
            Agent Account Setup
          </h1>
          <p className="text-gray-400 mb-8">
            Before accessing your dashboard, please complete your initial setup.
          </p>

          <div className="space-y-10">
            {/* LÓGICA SECUENCIAL: Solo muestra el paso que toca */}
            
            {needsPasswordChange ? (
              <section className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Step 1: Change Temporary Password</h2>
                <ChangePasswordForm />
              </section>
            
            ) : needs2FA ? (
              <section className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Step 2: Setup Two-Factor Authentication (2FA)</h2>
                <TwoFactorManager 
                  isEnabled={user.isTwoFactorEnabled} 
                  email={session.user.email} 
                />
              </section>
            
            ) : needsProfileCompletion ? (
              <section className="bg-black/50 p-6 rounded-lg border border-gray-800">
                <h2 className="text-xl font-bold text-white mb-4">Step 3: Complete Agent Profile</h2>
                <AgentProfileForm 
                  initialData={{
                    id: agentProfile.id,
                    agentName: agentProfile.agentName || '',
                    agentImage: agentProfile.agentImage || ''
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
  // 3. FLUJO NORMAL: DASHBOARD DEL AGENTE
  // ==========================================
  const propertiesData = await prisma.property.findMany({
    where: {
      isOffMarket: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      marketingMaterials: true,
    },
  });

  const serializedProps = propertiesData.map((p) => {
    const numericPrice = p.price ? Number(p.price) : 0;
    
    return {
      id: p.id,
      address: p.address,
      city: `${p.city}, ${p.state}`,
      mainImage: p.mainImage,
      emoji: p.emoji || "🏡",
      beds: p.bedrooms,
      baths: Number(p.bathrooms),
      sqft: p.sqft ? p.sqft.toLocaleString() : "0",
      price: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(numericPrice),
      year: p.yearBuilt?.toString() || "N/A",
      type: p.isForSale ? "Single Family" : "Rental",
      condition: p.condition || "Standard",
      commAmt: p.commissionAmt ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(Number(p.commissionAmt)) : "N/A",
      commPct: p.commissionPct ? `${p.commissionPct}%` : "N/A",
      status: p.status === "AVAILABLE" ? "Available" : p.status === "UNDER_CONTRACT" ? "Pending" : "Hot",
      highlights: p.features || [],
      commNote: p.commissionNote || "",
      showingSteps: p.showingSteps || [],
      showingNotes: p.showingNotes || "",
      buyerTags: p.buyerTags || [],
      buyerIncome: p.buyerIncome || "",          
      buyerCredit: p.buyerCredit || "",
      buyerFinancing: p.buyerFinancing || "Cash, Owner Finance",
      marketing: p.marketingMaterials || [],
    };
  });

  return (
    <div>
      {/* Botón de Logout Global oculto o integrado según lo requieras en el Dashboard */}
      {/* Aquí podrías inyectar el AgentProfile si deseas usar la foto en el navbar del cliente */}
      <AgentDashboardClient initialProps={serializedProps} />
    </div>
  );
}