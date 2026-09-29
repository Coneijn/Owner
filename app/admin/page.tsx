import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardClient from './dashboard-client';
import AdminShell from './_components/AdminShell';
import AlertBanner from './_components/AlertBanner';
import ActiveBuyers from './_components/active-buyers';
import UpcomingPayments from './_components/upcoming-payments';
import RecentActivity from './_components/recent-activity';
import { calculateEstimatedPayment } from '@/lib/utils';

const DAY_MS = 86_400_000;

const formatMoney = (amount: number | unknown) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));

export default async function AdminDashboard() {
  /* ---------- Properties ---------- */
  const rawProperties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: { sellerProfile: true },
  });

  const properties = rawProperties.map((p) => {
    const { sellerProfile, ...rest } = p;
    return {
      ...rest,
      price: p.price ? Number(p.price) : 0,
      previousPrice: p.previousPrice ? Number(p.previousPrice) : null,
      downPayment: p.downPayment ? Number(p.downPayment) : 0,
      interestRate: p.interestRate ? Number(p.interestRate) : 0,
      taxes: p.taxes ? Number(p.taxes) : 0,
      insurance: p.insurance ? Number(p.insurance) : 0,
      commissionPct: p.commissionPct ? Number(p.commissionPct) : null,
      commissionAmt: p.commissionAmt ? Number(p.commissionAmt) : null,
      monthlyRent: p.monthlyRent ? Number(p.monthlyRent) : 0,
      securityDeposit: p.securityDeposit ? Number(p.securityDeposit) : 0,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      availableDate: p.availableDate ? p.availableDate.toISOString() : null,
      lastPriceChangeAt: p.lastPriceChangeAt
        ? p.lastPriceChangeAt.toISOString()
        : null,
      sellerName: sellerProfile?.sellerName || null,
      sellerType: sellerProfile?.sellerType || null,
      sellerImage: sellerProfile?.sellerImage || null,
      sellerProfile: sellerProfile
        ? {
            ...sellerProfile,
            createdAt: sellerProfile.createdAt.toISOString(),
            updatedAt: sellerProfile.updatedAt.toISOString(),
          }
        : null,
    };
  });

  /* ---------- Contracts ---------- */
  const rawContracts = await prisma.contract.findMany({
    include: {
      property: { include: { sellerProfile: true } },
      buyers: { include: { user: true } },
      payments: { orderBy: { paymentDate: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedContracts = rawContracts.map((c) => ({
    ...c,
    type: 'LOAN',
    totalAmount: c.totalAmount ? Number(c.totalAmount) : 0,
    downPayment: c.downPayment ? Number(c.downPayment) : 0,
    principalAmount: c.principalAmount ? Number(c.principalAmount) : 0,
    interestRate: c.interestRate ? Number(c.interestRate) : null,
    property: c.property
      ? {
          ...c.property,
          price: c.property.price ? Number(c.property.price) : 0,
        }
      : null,
  }));

  /* ---------- Leases ---------- */
  const rawLeases = await prisma.leaseAgreement.findMany({
    include: {
      property: { include: { sellerProfile: true } },
      renters: { include: { user: true } },
      payments: { orderBy: { paymentDate: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedLeases = rawLeases.map((l) => ({
    ...l,
    type: 'LEASE',
    monthlyRent: l.monthlyRent ? Number(l.monthlyRent) : 0,
    securityDeposit: l.securityDeposit ? Number(l.securityDeposit) : null,
    totalAmount: l.monthlyRent ? Number(l.monthlyRent) : 0,
    property: l.property
      ? { ...l.property, price: l.property.price ? Number(l.property.price) : 0 }
      : null,
  }));

  const contracts = [...formattedContracts, ...formattedLeases].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  /* ---------- Stats ---------- */
  const totalProperties = properties.length;
  const soldProperties = properties.filter(
    (p) => p.status === 'SOLD' || p.status === 'UNDER_CONTRACT'
  ).length;

  const totalInventoryValue = properties
    .filter((p) => p.status === 'AVAILABLE' && p.isForSale)
    .reduce((acc, curr) => acc + curr.price, 0);

  const soldOnly = properties.filter((p) => p.status === 'SOLD');
  const downPaymentsCollected = soldOnly.reduce(
    (acc, curr) => acc + curr.downPayment,
    0
  );

  const monthlyIncomeGenerated = soldOnly.reduce((acc, curr) => {
    let income = 0;
    if (curr.isForRent) income = curr.monthlyRent;
    else if (curr.isForSale) {
      income = calculateEstimatedPayment(
        curr.price,
        curr.downPayment,
        curr.taxes,
        curr.insurance,
        curr.interestRate
      );
    }
    return acc + income;
  }, 0);

  /* ---------- Alerts (derivadas de Payment) ---------- */
  const now = new Date();
  const in14 = new Date(now.getTime() + 14 * DAY_MS);
  const ago30 = new Date(now.getTime() - 30 * DAY_MS);

  const [latePayments, dueSoonPayments] = await Promise.all([
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

  if (latePayments.length) {
    const total = latePayments.reduce((a, p) => a + Number(p.totalDue), 0);
    const names = latePayments
      .slice(0, 3)
      .map((p) => {
        const b = p.contract.buyers[0];
        return `${b?.firstName ?? ''} ${b?.lastName ?? ''}`.trim();
      })
      .filter(Boolean)
      .join(' · ');
    alerts.push({
      tone: 'red',
      icon: '🔴',
      title: `${latePayments.length} payment${
        latePayments.length > 1 ? 's' : ''
      } overdue${names ? ` — ${names}` : ''}`,
      sub: `Total: ${formatMoney(total)} · Contact immediately`,
    });
  }

  if (dueSoonPayments.length) {
    const total = dueSoonPayments.reduce((a, p) => a + Number(p.totalDue), 0);
    const names = dueSoonPayments
      .slice(0, 3)
      .map((p) => {
        const b = p.contract.buyers[0];
        return `${b?.firstName ?? ''} ${b?.lastName ?? ''}`.trim();
      })
      .filter(Boolean)
      .join(' · ');
    alerts.push({
      tone: 'yellow',
      icon: '⚠️',
      title: `${dueSoonPayments.length} payment${
        dueSoonPayments.length > 1 ? 's' : ''
      } due within 14 days${names ? ` — ${names}` : ''}`,
      sub: `Total: ${formatMoney(total)} · Send reminders now`,
    });
  }

  /* ---------- Sanitize ---------- */
  const safeProperties = JSON.parse(JSON.stringify(properties));
  const safeContracts = JSON.parse(JSON.stringify(contracts));

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-[21px] font-black text-white uppercase tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-[12px] text-[#8892a4] mt-1">
            Portfolio overview ·{' '}
            {new Intl.DateTimeFormat('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }).format(now)}
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="bg-[#F8ED1A] hover:bg-[#e6dc10] text-black px-4 py-2.5 rounded-lg font-bold uppercase tracking-wide text-[12px] transition-all shrink-0"
        >
          + New Property
        </Link>
      </div>

      {/* Alerts */}
      <AlertBanner alerts={alerts} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          title="Monthly Revenue"
          value={formatMoney(monthlyIncomeGenerated)}
          icon="📈"
          accent="bg-[#F8ED1A]"
          color="text-[#F8ED1A]"
        />
        <StatCard
          title="Down Payments"
          value={formatMoney(downPaymentsCollected)}
          icon="💵"
          accent="bg-[#34d399]"
          color="text-[#34d399]"
        />
        <StatCard
          title="Inventory Value"
          value={formatMoney(totalInventoryValue)}
          icon="💰"
          accent="bg-[#60a5fa]"
          color="text-[#60a5fa]"
        />
        <StatCard
          title="Properties"
          value={totalProperties}
          icon="🏠"
          accent="bg-[#a78bfa]"
        />
        <StatCard
          title="Sold / Contract"
          value={soldProperties}
          icon="🤝"
          accent="bg-[#fb923c]"
        />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-4 mb-6">
        <ActiveBuyers />
        <div className="flex flex-col gap-4">
          <UpcomingPayments limit={5} />
          <RecentActivity limit={6} />
        </div>
      </div>

      {/* Tabla de propiedades / contratos */}
      <DashboardClient properties={safeProperties} contracts={safeContracts} />
    </AdminShell>
  );
}

/* =========================================================
   STAT CARD (local al page)
   ========================================================= */
function StatCard({
  title,
  value,
  icon,
  color = 'text-white',
  accent = 'bg-[#F8ED1A]',
}: {
  title: string;
  value: React.ReactNode;
  icon: string;
  color?: string;
  accent?: string;
}) {
  return (
    <div className="bg-[#1c2030] border border-[#2e3340] rounded-xl p-4 relative overflow-hidden hover:border-[#3a4050] transition-colors">
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accent}`} />
      <div className="flex items-center gap-3">
        <div className="text-2xl opacity-80 flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <dt className="text-[9px] font-bold text-[#8892a4] uppercase tracking-[0.8px]">
            {title}
          </dt>
          <dd className={`mt-1 text-xl font-black truncate ${color}`}>{value}</dd>
        </div>
      </div>
    </div>
  );
}