import { prisma } from '@/lib/prisma';

export type ActivityItem = {
  id: string;
  icon: string;
  iconBg: string;
  text: string;
  sub: string;
  timestamp: Date;
  href?: string;
};

const DAY_MS = 86_400_000;

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

export async function getRecentActivity(limit = 6): Promise<ActivityItem[]> {
  const since = new Date(Date.now() - 7 * DAY_MS);

  const [payments, contracts, audits] = await Promise.all([
    // 1. Pagos recibidos
    prisma.payment.findMany({
      where: { status: 'PAID', paidAt: { gte: since } },
      include: {
        contract: {
          include: {
            property: { select: { address: true } },
            buyers: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
      take: limit,
    }),

    // 2. Contratos nuevos (proxy de "new buyer added")
    prisma.contract.findMany({
      where: { createdAt: { gte: since } },
      include: {
        property: { select: { address: true } },
        buyers: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),

    // 3. AuditLog (si está poblado; si no, devuelve [])
    prisma.auditLog
      .findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      .catch(() => []),
  ]);

  const items: ActivityItem[] = [];

  for (const p of payments) {
    const b = p.contract.buyers[0];
    const name = `${b?.firstName ?? ''} ${b?.lastName ?? ''}`.trim() || 'Buyer';
    items.push({
      id: `pay-${p.id}`,
      icon: '💵',
      iconBg: 'rgba(52,211,153,.1)',
      text: `Payment received — ${name}`,
      sub: `${formatMoney(Number(p.totalDue))} · ${
        p.contract.property.address
      } · ${p.stripePaymentIntentID ? 'Stripe' : 'Manual'}`,
      timestamp: p.paidAt ?? p.updatedAt,
      href: `/admin/agreements/${p.contractId}?type=LOAN`,
    });
  }

  for (const c of contracts) {
    const b = c.buyers[0];
    const name = `${b?.firstName ?? ''} ${b?.lastName ?? ''}`.trim() || 'Buyer';
    items.push({
      id: `con-${c.id}`,
      icon: '📋',
      iconBg: 'rgba(96,165,250,.1)',
      text: `New contract — ${name}`,
      sub: `${c.property.address} · ${formatMoney(Number(c.totalAmount))}`,
      timestamp: c.createdAt,
      href: `/admin/agreements/${c.id}?type=LOAN`,
    });
  }

  for (const a of audits) {
    const meta = mapAuditAction(a.action);
    if (!meta) continue;
    items.push({
      id: `aud-${a.id}`,
      icon: meta.icon,
      iconBg: meta.iconBg,
      text: meta.label(a.contactName ?? 'System'),
      sub: a.address ?? a.entityType ?? '',
      timestamp: a.createdAt,
    });
  }

  return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

/** Mapea acciones de AuditLog a iconos. Extiende según lo que realmente escribas. */
function mapAuditAction(action: string) {
  const map: Record<
    string,
    { icon: string; iconBg: string; label: (who: string) => string }
  > = {
    MAGIC_LINK_GENERATED: {
      icon: '🔑',
      iconBg: 'rgba(248,237,26,.1)',
      label: (w) => `Lockbox access — ${w}`,
    },
    PROPERTY_UPDATED: {
      icon: '✏️',
      iconBg: 'rgba(96,165,250,.1)',
      label: () => 'Property updated',
    },
    PROPERTY_DELETED: {
      icon: '🗑️',
      iconBg: 'rgba(248,113,113,.1)',
      label: () => 'Property deleted',
    },
  };
  return map[action];
}