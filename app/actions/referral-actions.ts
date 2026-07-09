"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAgentReferral(prevState: any, formData: FormData) {
  // El "agentId" que viene del frontend es en realidad el userId de la sesión
  const userId = formData.get("agentId") as string;
  const propertyId = formData.get("propertyId") as string;
  const clientName = formData.get("clientName") as string;
  const clientPhone = formData.get("clientPhone") as string;
  const clientEmail = formData.get("clientEmail") as string;

  if (!userId || !propertyId || !clientName) {
    return { error: "Missing required fields." };
  }

  try {
    // 1. Buscar el perfil de agente asociado a este usuario
    const agentProfile = await prisma.agentProfile.findUnique({
      where: { userId: userId },
    });

    if (!agentProfile) {
      return { error: "Agent profile not found for this user. Please ensure your agent profile is set up." };
    }

    // 2. Crear el referido usando el ID real del AgentProfile
    await prisma.agentReferral.create({
      data: {
        agentId: agentProfile.id,
        propertyId,
        clientName,
        clientPhone,
        clientEmail,
        status: "PENDING",
      },
    });
    
    revalidatePath("/agentsDashboard");
    return { success: true, message: "Referral registered successfully!" };
  } catch (error) {
    console.error("Error creating referral:", error);
    return { error: "Failed to register referral." };
  }
}