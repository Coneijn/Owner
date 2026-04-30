"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function processContractImport(data: any) {
  try {
    const { propertyId, clientInfo, loanInfo, payments } = data;

    // 1. Preparar la contraseña (el teléfono es el password inicial)
    const cleanPhone = clientInfo.phone.replace(/\D/g, ""); // Solo números para la contraseña
    
    // Generar formato E.164 estricto para la base de datos
    let e164Phone = `+${cleanPhone}`;
    if (cleanPhone.length === 10) {
      e164Phone = `+1${cleanPhone}`;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith("1")) {
      e164Phone = `+${cleanPhone}`;
    }

    const hashedPassword = await bcrypt.hash(cleanPhone, 10);

    // 2. Usar una transacción para asegurar la integridad de los datos
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Crear o actualizar el Usuario (correo)
      const user = await tx.user.upsert({
        where: { email: clientInfo.email },
        update: {}, // Si ya existe, no actualizamos su password aquí por seguridad
        create: {
          email: clientInfo.email,
          password: hashedPassword,
          name: clientInfo.name,
          role: "USER",
          forcePasswordChange: true, // Obliga a cambiar clave en el primer login
          buyerProfile: {
            create: {
              firstName: clientInfo.firstName,
              lastName: clientInfo.lastName,
              phone: e164Phone, // Guardado estrictamente como E.164 (+1901...)
            },
          },
        },
      });

      // B. Obtener el BuyerProfileId
      const buyerProfile = await tx.buyerProfile.findUnique({
        where: { userId: user.id },
      });

      if (!buyerProfile) throw new Error("No se pudo obtener el perfil de comprador.");

      // C. Crear el Contrato principal
      // CORRECCIÓN APLICADA AQUÍ: Se usa 'buyers: { connect: ... }' en lugar de 'buyerProfileId'
      const contract = await tx.contract.create({
        data: {
          propertyId,
          buyers: {
            connect: { id: buyerProfile.id }
          },
          type: "LOAN",
          totalAmount: loanInfo.totalAmount,
          downPayment: loanInfo.downPayment,
          principalAmount: loanInfo.principalAmount,
          interestRate: loanInfo.interestRate,
          termInYears: loanInfo.termInYears,
          startDate: new Date(loanInfo.startDate),
          monthlyTaxes: loanInfo.monthlyTaxes,
          monthlyInsurance: loanInfo.monthlyInsurance,
          monthlyServFee: loanInfo.monthlyServFee,
        },
      });

      // D. Crear la tabla de amortización (Pagos)
      // Filtramos filas vacías por seguridad y mapeamos al esquema de Prisma
      const paymentRecords = payments
        .filter((p: any) => p.paymentDate && p.remainingBalance) 
        .map((p: any) => ({
          contractId: contract.id,
          paymentDate: new Date(p.paymentDate),
          totalDue: p.totalDue,
          principal: p.principal || 0,
          interest: p.interest || 0,
          taxes: loanInfo.monthlyTaxes,
          insurance: loanInfo.monthlyInsurance,
          serviceFee: loanInfo.monthlyServFee,
          remainingBalance: p.remainingBalance,
          status: p.status || "PENDING", // <-- Tomamos el status que calculamos en el frontend
          paidAt: p.paidAt ? new Date(p.paidAt) : null, // <-- Guardamos la fecha de pago
        }));

      await tx.payment.createMany({
        data: paymentRecords,
      });

      return contract;
    });

    return { success: true, contractId: result.id };
  } catch (error: any) {
    console.error("Error importando contrato:", error);
    return { success: false, error: error.message };
  }
}