"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAgentReferral(prevState: any, formData: FormData) {
  const agentId = formData.get("agentId") as string;
  const propertyId = formData.get("propertyId") as string;
  const clientName = formData.get("clientName") as string;
  const clientPhone = formData.get("clientPhone") as string;
  const clientEmail = formData.get("clientEmail") as string;

  if (!agentId || !propertyId || !clientName) {
    return { error: "Missing required fields." };
  }

  try {
    await prisma.agentReferral.create({
      data: {
        agentId,
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