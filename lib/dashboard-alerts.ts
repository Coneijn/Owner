// lib/dashboard-alerts.ts
import { prisma } from '@/lib/prisma';

const DAY_MS = 86_400_000;

export async function getDashboardAlerts() {
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * DAY_MS);
  const ago30 = new Date(now.getTime() - 30 * DAY_MS);

  const [late, dueSoon] = await Promise.all([
    prisma.payment.findMany({
      where: {
        OR: [
          { status: 'LATE' },
          { status: 'PENDING', paymentDate: { lt: ago30 } },
        ],
      },
      include: {
        contract: {
          include: {
            property: { select: { address: true } },
            buyers: { select: { firstName: true, lastName: true } },
          },
        },
      },
      take: 10,
    }),
    prisma.payment.findMany({
      where: {
        status: 'PENDING',
        paymentDate: { gte: now, lte: in14 },
      },
      include: {
        contract: {
          include: {
            property: { select: { address: true } },
            buyers: { select: { firstName: true, lastName: true } },
          },
        },
      },
      take: 10,
    }),
  ]);

  const alerts: {
    tone: 'red' | 'yellow';
    icon: string;
    title: string;
    sub: string;
  }[] = [];

  if (late.length) {
    const total = late.reduce((a, p) => a + Number(p.totalDue), 0);
    const names = late
      .slice(0, 3)
      .map((p) => {
        const b = p.contract.buyers[0];
        return `${b?.firstName ?? ''} ${b?.lastName ?? ''}`.trim();
      })
      .join(' · ');
    alerts.push({
      tone: 'red',
      icon: '🔴',
      title: `${late.length} payment${late.length > 1 ? 's' : ''} overdue — ${names}`,
      sub: `Total: $${total.toLocaleString()} · Contact immediately`,
    });
  }

  if (dueSoon.length) {
    const total = dueSoon.reduce((a, p) => a + Number(p.totalDue), 0);
    const names = dueSoon
      .slice(0, 3)
      .map((p) => {
        const b = p.contract.buyers[0];
        return `${b?.firstName ?? ''} ${b?.lastName ?? ''}`.trim();
      })
      .join(' · ');
    alerts.push({
      tone: 'yellow',
      icon: '⚠️',
      title: `${dueSoon.length} payment${dueSoon.length > 1 ? 's' : ''} due within 14 days — ${names}`,
      sub: `Total: $${total.toLocaleString()} · Send reminders now`,
    });
  }

  return alerts;
}