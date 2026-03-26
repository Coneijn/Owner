import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
// Asegúrate de importar tu método de autenticación (NextAuth, Clerk, Supabase, etc.)
// Ajusta la ruta de importación según tu configuración
import { auth } from "@/auth"; 

import AgentDashboardClient from "./agent-dashboard-client";
import { ChangePasswordForm, TwoFactorManager } from "../components/ui/client-components";


export const metadata = {
  title: "Rep Portal — Owner To Dueño",
  description: "Panel de control para representantes locales",
};

export default async function AgentDashboardPage() {
  // 1. Verificación de Autenticación
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Obtener el usuario de la DB y su Perfil de Agente asociado
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { agentProfile: true },
  });

  // 3. Control de Acceso Estricto: Si no hay usuario o no tiene perfil de agente, bloqueamos.
  if (!currentUser || !currentUser.agentProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#111111] px-4">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg shadow-xl text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-[#f8ed1a] mb-4">Acceso Denegado</h2>
          <p className="text-gray-300">
            Tu cuenta no tiene un perfil de representante local asignado. Si crees que esto es un error, por favor contacta al administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  // 4. Lógica de Onboarding Secuencial (Sin el parche de 'any')
  const needsPasswordChange = currentUser.forcePasswordChange === true;
  const needs2FA = currentUser.isTwoFactorEnabled === false;
  // Determinamos que el perfil está incompleto si falta el nombre o la imagen
  const needsProfileCompletion = !currentUser.agentProfile.agentName || !currentUser.agentProfile.agentImage;

  // Renderizamos las vistas en orden estricto. El usuario no ve las propiedades hasta pasar esto.
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
            <TwoFactorManager isEnabled={false} email={currentUser.email} />
         </div>
      </div>
    );
  }

  
  // =========================================================================
  // 5. Flujo Normal: Si pasó todo el onboarding, cargamos su Dashboard
  // =========================================================================

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
      mainImage: p.mainImage ,
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

  // Le pasamos las propiedades y opcionalmente los datos del agente al cliente
  return (
    
    <AgentDashboardClient 
    
      initialProps={serializedProps} 
      // Si en el futuro AgentDashboardClient necesita mostrar la foto del agente, 
      // puedes pasárselo así: agentData={currentUser.agentProfile}
    />
  );
}