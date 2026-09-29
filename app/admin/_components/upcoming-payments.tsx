import { prisma } from '@/lib/prisma';
import Link from 'next/link';

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);

const DAY_MS = 86_400_000;

export default async function UpcomingPayments({ limit = 5 }: { limit?: number }) {
  const now = new Date();
  const lookback = new Date(now.getTime() - 30 * DAY_MS); // incluye levemente vencidos

  const rows = await prisma.payment.findMany({
    where: {
      status: { in: ['PENDING', 'LATE'] },
      paymentDate: { gte: lookback },
    },
    include: {
      contract: {
        include: {
          property: { select: { address: true, city: true } },
          buyers: { include: { user: true } },
        },
      },
    },
    orderBy: { paymentDate: 'asc' },
    distinct: ['contractId'], // un solo pago pendiente por contrato
    take: limit,
  });

  return (
    <div className="bg-[#1c2030] border border-[#2e3340] rounded-xl">
<div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2e3340]">
  <h2 className="text-[10px] font-bold uppercase tracking-[1px] text-[#8892a4]">
    Upcoming Payments
  </h2>
</div>

      <div className="px-5 py-1">
        {rows.length === 0 && (
          <div className="py-8 text-center text-[#8892a4] text-[12px]">
            No upcoming payments.
          </div>
        )}

        {rows.map((p) => {
          const buyer = p.contract.buyers[0];
          const firstName = buyer?.firstName ?? '';
          const lastName = buyer?.lastName ?? '';
          const name = `${firstName} ${lastName}`.trim() || 'Unknown Buyer';
          const initials =
            `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '??';
          const isLate = p.status === 'LATE' || p.paymentDate < now;

          return (
            <div
              key={p.id}
              className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-b-0"
            >
              <div className="w-7 h-7 rounded-full bg-[#1a3a1a] text-[#34d399] font-bold text-[11px] flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-white truncate">
                  {name}
                </div>
                <div className="text-[10px] text-[#8892a4] truncate">
                  {p.contract.property.address}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-black text-[#F8ED1A]">
                  {formatMoney(Number(p.totalDue))}
                </div>
                <div
                  className={`text-[10px] ${
                    isLate ? 'text-[#f87171] font-bold' : 'text-[#8892a4]'
                  }`}
                >
                  {formatShortDate(new Date(p.paymentDate))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}