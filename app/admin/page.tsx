import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import DashboardClient from './dashboard-client';
import { calculateEstimatedPayment } from '@/lib/utils';

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export default async function AdminDashboard() {
  const session = await auth();

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
      lastPriceChangeAt: p.lastPriceChangeAt ? p.lastPriceChangeAt.toISOString() : null,
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
      ? { ...c.property, price: c.property.price ? Number(c.property.price) : 0 }
      : null,
  }));

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

  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.status === 'AVAILABLE').length;
  const soldProperties = properties.filter(
    (p) => p.status === 'SOLD' || p.status === 'UNDER_CONTRACT'
  ).length;

  const totalInventoryValue = properties
    .filter((p) => p.status === 'AVAILABLE' && p.isForSale)
    .reduce((acc, curr) => acc + curr.price, 0);

  const soldOnly = properties.filter((p) => p.status === 'SOLD');
  const downPaymentsCollected = soldOnly.reduce((acc, curr) => acc + curr.downPayment, 0);

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

  const safeProperties = JSON.parse(JSON.stringify(properties));
  const safeContracts = JSON.parse(JSON.stringify(contracts));

  return (
    <div className="min-h-screen bg-[#111318] font-sans text-gray-200">
      {/* ===== NAV ===== */}
      <nav className="bg-[#0d1117] border-b border-[#2a2d38] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center h-[60px] gap-2">
            {/* Logo */}
            <div className="flex items-center gap-3 pr-4 border-r border-[#2a2d38] mr-2 shrink-0">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-[#F8ED1A]">
                <Image src="/logo.png" alt="Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white text-[15px] font-black uppercase tracking-tight">
                  Admin <span className="text-[#F8ED1A]">Panel</span>
                </span>
                <span className="text-[9px] text-[#4b5563] font-bold tracking-[1.5px] uppercase mt-1">
                  v1.1
                </span>
              </div>
            </div>

            {/* Nav links */}
            <div className="flex items-center flex-1 overflow-x-auto">
              <NavLink href="/comunidad">Community</NavLink>
              <NavLink href="/chat">Chat</NavLink>
              <NavLink href="/admin/sellers" hideOnMobile>
                Sellers
              </NavLink>
              <NavLink href="/admin/blog" hideOnMobile>
                Blog
              </NavLink>
              <NavLink href="../api/agent/inventory" hideOnMobile target="_blank">
                AI JSON
              </NavLink>
              <NavLink href="/admin/notificaciones" hideOnMobile target="_blank">
                Alerts
              </NavLink>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3 pl-4 border-l border-[#2a2d38] shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] text-white font-bold leading-tight">
                  {session?.user?.name || 'Administrator'}
                </p>
                <Link
                  href="/admin/user_settings"
                  className="text-[11px] text-[#8892a4] hover:text-[#F8ED1A] transition-colors"
                >
                  {session?.user?.email}
                </Link>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F8ED1A] text-black font-black text-[12px] flex items-center justify-center shrink-0">
                {(session?.user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button className="bg-transparent border border-[#2e3340] text-[#8892a4] hover:border-[#f87171] hover:text-[#f87171] px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wide transition-colors">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== MAIN ===== */}
      <main className="max-w-[1600px] mx-auto py-6 px-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-[21px] font-black text-white uppercase tracking-tight">
              Properties
            </h1>
            <p className="text-[12px] text-[#8892a4] mt-1">
              Manage your real estate inventory.
            </p>
          </div>
          <Link
            href="/admin/properties/new"
            className="bg-[#F8ED1A] hover:bg-[#e6dc10] text-black px-5 py-2.5 rounded-lg font-bold uppercase tracking-wide text-[13px] transition-all flex items-center gap-2 justify-center shrink-0"
          >
            + New Property
          </Link>
        </div>

        {/* Stats row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <StatCard
            title="Total Properties"
            value={totalProperties}
            icon="🏠"
            accent="bg-[#F8ED1A]"
          />
          <StatCard
            title="Available"
            value={availableProperties}
            icon="✅"
            accent="bg-[#34d399]"
            color="text-[#34d399]"
          />
          <StatCard
            title="Sold / Contract"
            value={soldProperties}
            icon="🤝"
            accent="bg-[#60a5fa]"
            color="text-[#60a5fa]"
          />
        </div>

        {/* Stats row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <StatCard
            title="Sale Inventory Value"
            value={formatMoney(totalInventoryValue)}
            icon="💰"
            accent="bg-[#a78bfa]"
          />
          <StatCard
            title="Down Payments Collected"
            value={formatMoney(downPaymentsCollected)}
            icon="💵"
            accent="bg-[#34d399]"
            color="text-[#34d399]"
          />
          <StatCard
            title="Monthly Income Generated"
            value={formatMoney(monthlyIncomeGenerated)}
            icon="📈"
            accent="bg-[#F8ED1A]"
            color="text-[#F8ED1A]"
          />
        </div>

        <DashboardClient properties={safeProperties} contracts={safeContracts} />
      </main>
    </div>
  );
}

/* ---------- Helpers ---------- */

function NavLink({
  href,
  children,
  hideOnMobile = false,
  target,
}: {
  href: string;
  children: React.ReactNode;
  hideOnMobile?: boolean;
  target?: string;
}) {
  return (
    <Link
      href={href}
      target={target}
      className={`${
        hideOnMobile ? 'hidden md:flex' : 'flex'
      } px-4 h-[60px] items-center text-[13px] font-semibold text-[#8892a4] hover:text-white border-b-[3px] border-transparent hover:border-[#F8ED1A] transition-colors uppercase tracking-wide whitespace-nowrap`}
    >
      {children}
    </Link>
  );
}

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