import type { Prisma } from '@prisma/client';

const DAY_MS = 1000 * 60 * 60 * 24;

export type BuyerStatus = 'ACTIVE' | 'DUE' | 'LATE' | 'NEW';

export type ContractSnapshot = {
  id: string;
  status: BuyerStatus;
  balance: number;
  monthlyPayment: number;
  nextDueDate: string | null;
  daysLate: number;
  startDate: string;
  property: {
    address: string;
    city: string;
    zipCode: string;
    bedrooms: number;
    bathrooms: number;
  } | null;
  buyer: {
    name: string;
    phone: string | null;
    email: string | null;
    initials: string;
  };
};

export type ContractWithRelations = Prisma.ContractGetPayload<{
  include: {
    property: true;
    buyers: { include: { user: true } };
    payments: true;
  };
}>;

/**
 * Deriva el snapshot de un contrato a partir de sus Payments.
 * Reglas:
 *  - LATE: existe un Payment LATE, o el PENDING más antiguo está vencido >5 días.
 *  - NEW:  contrato iniciado hace ≤30 días y sin pagos registrados.
 *  - DUE:  el próximo Payment vence dentro de 14 días.
 *  - ACTIVE: en cualquier otro caso.
 */
export function buildContractSnapshot(c: ContractWithRelations): ContractSnapshot {
  const now = Date.now();

  const payments = [...(c.payments ?? [])].sort(
    (a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
  );

  const paid = payments.filter((p) => p.status === 'PAID' || p.status === 'PARTIAL');
  const pending = payments.filter((p) => p.status === 'PENDING' || p.status === 'LATE');
  const nextDue = pending[0] ?? null;
  const lastPaid = paid[paid.length - 1] ?? null;

  const balance = Number(lastPaid?.remainingBalance ?? c.principalAmount ?? 0);
  const monthlyPayment = Number(nextDue?.totalDue ?? 0);

  const nextDueMs = nextDue ? new Date(nextDue.paymentDate).getTime() : null;
  const daysLate =
    nextDueMs !== null && nextDueMs < now
      ? Math.floor((now - nextDueMs) / DAY_MS)
      : 0;

  const hasLate = payments.some((p) => p.status === 'LATE');
  const overdue = daysLate > 5;

  const daysSinceStart = Math.floor(
    (now - new Date(c.startDate).getTime()) / DAY_MS
  );
  const isNew = daysSinceStart <= 30 && paid.length === 0;

  const diffToNext = nextDueMs !== null ? nextDueMs - now : Infinity;
  const dueSoon = diffToNext >= 0 && diffToNext <= 14 * DAY_MS;

  let status: BuyerStatus = 'ACTIVE';
  if (hasLate || overdue) status = 'LATE';
  else if (isNew) status = 'NEW';
  else if (dueSoon) status = 'DUE';

  const buyerProfile = c.buyers?.[0];
  const firstName = buyerProfile?.firstName ?? '';
  const lastName = buyerProfile?.lastName ?? '';
  const name = `${firstName} ${lastName}`.trim() || 'Unknown Buyer';
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '??';

  return {
    id: c.id,
    status,
    balance,
    monthlyPayment,
    nextDueDate: nextDue ? new Date(nextDue.paymentDate).toISOString() : null,
    daysLate,
    startDate: new Date(c.startDate).toISOString(),
    property: c.property
      ? {
          address: c.property.address,
          city: c.property.city,
          zipCode: c.property.zipCode,
          bedrooms: c.property.bedrooms,
          bathrooms: c.property.bathrooms,
        }
      : null,
    buyer: {
      name,
      phone: buyerProfile?.phone ?? null,
      email: buyerProfile?.user?.email ?? null,
      initials,
    },
  };
}

/** Ordena por urgencia: LATE → DUE → NEW → ACTIVE, y dentro por fecha de vencimiento. */
export function sortByUrgency(a: ContractSnapshot, b: ContractSnapshot) {
  const order: Record<BuyerStatus, number> = { LATE: 0, DUE: 1, NEW: 2, ACTIVE: 3 };
  const diff = order[a.status] - order[b.status];
  if (diff !== 0) return diff;
  const aMs = a.nextDueDate ? new Date(a.nextDueDate).getTime() : Infinity;
  const bMs = b.nextDueDate ? new Date(b.nextDueDate).getTime() : Infinity;
  return aMs - bMs;
}