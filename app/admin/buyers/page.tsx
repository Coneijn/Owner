// buyers/page.tsx
import AdminShell from '../_components/AdminShell';
import ActiveBuyers from '../_components/active-buyers';
import UpcomingPayments from '../_components/upcoming-payments';
import RecentActivity from '../_components/recent-activity';

export const dynamic = 'force-dynamic';

export default function BuyersPage() {
  return (
    <AdminShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-[21px] font-black text-white uppercase tracking-tight">
            Buyers Dashboard
          </h1>
          <p className="text-[12px] text-[#8892a4] mt-1">
            Manage active buyers, track upcoming payments, and monitor recent activity.
          </p>
        </div>
      </div>

      {/* Grid principal transferido desde el dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-4 mb-6">
        <ActiveBuyers />
        <div className="flex flex-col gap-4">
          <UpcomingPayments limit={10} />
          <RecentActivity limit={10} />
        </div>
      </div>
    </AdminShell>
  );
}