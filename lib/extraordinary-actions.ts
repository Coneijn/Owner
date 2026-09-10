'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

export interface RecordExtraordinaryPaymentInput {
  agreementId: string;
  agreementType: 'LOAN' | 'LEASE';
  totalDue: number;
  principal: number;
  interest: number;
  escrow: number; // taxes + insurance + serviceFee si aplica
  paymentDate: string;
}

export async function recordExtraordinaryPayment(input: RecordExtraordinaryPaymentInput) {
  // 1. Verificar sesión de usuario autenticado
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized. Please log in.' };
  }

  const { agreementId, agreementType, totalDue, principal, interest, escrow, paymentDate } = input;

  if (!agreementId || !totalDue || totalDue <= 0) {
    return { success: false, error: 'A valid payment amount is required.' };
  }

  // Desglose de Escrow (puedes ajustar esta distribución según tus reglas de negocio)
  const taxesPart = Number((escrow / 2).toFixed(2));
  const insurancePart = Number((escrow - taxesPart).toFixed(2));
  const parsedPaymentDate = new Date(paymentDate || new Date());

  try {
    if (agreementType === 'LOAN') {
      // Usar transacción interactiva para evitar condiciones de carrera en el balance
      const newPayment = await prisma.$transaction(async (tx) => {
        const contract = await tx.contract.findUnique({
          where: { id: agreementId },
          include: {
            payments: {
              orderBy: { paymentDate: 'desc' },
              take: 1,
            },
          },
        });

        if (!contract) {
          throw new Error('Contract not found.');
        }

        // Determinar el balance previo: si hay un pago anterior usamos su remainingBalance;
        // si no, tomamos el principalAmount inicial del contrato.
        let previousBalance = new Prisma.Decimal(contract.principalAmount);
        if (contract.payments.length > 0 && contract.payments[0].remainingBalance !== null) {
          previousBalance = new Prisma.Decimal(contract.payments[0].remainingBalance);
        }

        // Calcular nuevo saldo restante restando el capital amortizado
        const principalDecimal = new Prisma.Decimal(principal || 0);
        const newRemainingBalance = Prisma.Decimal.max(0, previousBalance.minus(principalDecimal));

        return await tx.payment.create({
          data: {
            contractId: contract.id,
            paymentDate: parsedPaymentDate,
            totalDue: new Prisma.Decimal(totalDue),
            principal: principalDecimal,
            interest: new Prisma.Decimal(interest || 0),
            taxes: new Prisma.Decimal(taxesPart),
            insurance: new Prisma.Decimal(insurancePart),
            serviceFee: new Prisma.Decimal(0),
            lateFee: new Prisma.Decimal(0),
            remainingBalance: newRemainingBalance,
            status: 'PAID',
            paidAt: new Date(),
          },
        });
      });

      revalidatePath(`/admin/agreements/${agreementId}`);
      return { success: true, paymentId: newPayment.id };
    } else {
      // Caso LEASE
      const lease = await prisma.leaseAgreement.findUnique({
        where: { id: agreementId },
      });

      if (!lease) {
        return { success: false, error: 'Lease agreement not found.' };
      }

      const newRentalPayment = await prisma.rentalPayment.create({
        data: {
          leaseId: lease.id,
          paymentDate: parsedPaymentDate,
          totalDue: new Prisma.Decimal(totalDue),
          serviceFee: new Prisma.Decimal(0),
          lateFee: new Prisma.Decimal(0),
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      revalidatePath(`/admin/agreements/${agreementId}`);
      return { success: true, paymentId: newRentalPayment.id };
    }
  } catch (error: any) {
    console.error('Error recording extraordinary payment:', error);
    return {
      success: false,
      error: error.message || 'Failed to process payment in the database.',
    };
  }
}