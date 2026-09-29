'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { BuyerStatus, ContractSnapshot } from '@/lib/contract-snapshot';

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const formatShortDate = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() === now.getFullYear()
      ? { month: 'short', day: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Intl.DateTimeFormat('en-US', opts).format(d);
};

const STATUS_META: Record<
  BuyerStatus,
  { label: string; dot: string; pill: string }
> = {
  ACTIVE: {
    label: 'Active',
    dot: 'bg-[#34d399]',
    pill: 'bg-[rgba(52,211,153,.1)] text-[#34d399]',
  },
  DUE: {
    label: 'Due',
    dot: 'bg-[#F8ED1A]',
    pill: 'bg-[rgba(248,237,26,.1)] text-[#F8ED1A]',
  },
  LATE: {
    label: 'Late',
    dot: 'bg-[#f87171]',
    pill: 'bg-[rgba(248,113,113,.1)] text-[#f87171]',
  },
  NEW: {
    label: 'New',
    dot: 'bg-[#60a5fa]',
    pill: 'bg-[rgba(96,165,250,.1)] text-[#60a5fa]',
  },
};

type FilterKey = 'ALL' | 'DUE' | 'LATE' | 'NEW';

export default function ActiveBuyersClient({
  contracts,
}: {
  contracts: ContractSnapshot[];
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const counts = useMemo(() => {
    return {
      ALL: contracts.length,
      DUE: contracts.filter((c) => c.status === 'DUE').length,
      LATE: contracts.filter((c) => c.status === 'LATE').length,
      NEW: contracts.filter((c) => c.status === 'NEW').length,
    };
  }, [contracts]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contracts.filter((c) => {
      if (filter !== 'ALL' && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.buyer.name.toLowerCase().includes(q) ||
        (c.buyer.phone ?? '').toLowerCase().includes(q) ||
        (c.buyer.email ?? '').toLowerCase().includes(q) ||
        (c.property?.address ?? '').toLowerCase().includes(q) ||
        (c.property?.zipCode ?? '').toLowerCase().includes(q)
      );
    });
  }, [contracts, search, filter]);

  return (
    <div className="bg-[#1c2030] border border-[#2e3340] rounded-xl">
      {/* Header */}
<div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2e3340]">
  <h2 className="text-[12px] font-bold uppercase tracking-[1px] text-[#8892a4]">
    Active Buyers
  </h2>
  <span className="text-[11px] text-[#4b5563] font-semibold">
    {contracts.length} shown
  </span>
</div>

      {/* Toolbar */}
      <div className="px-5 py-3 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b5563] text-sm">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, address, or phone..."
            className="w-full bg-[#111318] border border-[#2e3340] rounded-lg py-2 pl-9 pr-3 text-[13px] text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#F8ED1A] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <FilterPill
            active={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
            label="All"
            count={counts.ALL}
          />
          <FilterPill
            active={filter === 'DUE'}
            onClick={() => setFilter('DUE')}
            label="Due"
            count={counts.DUE}
          />
          <FilterPill
            active={filter === 'LATE'}
            onClick={() => setFilter('LATE')}
            label="Late"
            count={counts.LATE}
          />
          <FilterPill
            active={filter === 'NEW'}
            onClick={() => setFilter('NEW')}
            label="New"
            count={counts.NEW}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-t border-[#2e3340]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[
                'Buyer',
                'Property',
                'Balance',
                'Monthly Pmt',
                'Next Due',
                'Status',
                '',
              ].map((h, i) => (
                <th
                  key={i}
                  className={`text-${
                    i === 6 ? 'right' : 'left'
                  } text-[9px] font-bold uppercase tracking-[0.6px] text-[#8892a4] py-2.5 px-4 border-b border-[#2e3340]`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-[#8892a4] text-[12px]"
                >
                  No buyers match the current search or filter.
                </td>
              </tr>
            )}
            {rows.map((c) => {
              const meta = STATUS_META[c.status];
              const dueSoon = c.status === 'DUE';
              const late = c.status === 'LATE';

              return (
                <tr
                  key={c.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Buyer */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#529E14] text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                        {c.buyer.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-white truncate">
                          {c.buyer.name}
                        </div>
                        {c.buyer.phone && (
                          <div className="text-[11px] text-[#8892a4] truncate">
                            📞 {c.buyer.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Property */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                    {c.property ? (
                      <>
                        <div className="text-[12px] font-bold text-white">
                          {c.property.address}
                        </div>
                        <div className="text-[11px] text-[#8892a4]">
                          {c.property.zipCode} · {c.property.bedrooms}bd/
                          {c.property.bathrooms}ba
                        </div>
                      </>
                    ) : (
                      <span className="text-[#4b5563] text-xs italic">
                        No property
                      </span>
                    )}
                  </td>

                  {/* Balance */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap text-[13px] font-bold text-[#F8ED1A]">
                    {formatMoney(c.balance)}
                  </td>

                  {/* Monthly Pmt */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap text-[13px] font-bold text-white">
                    {formatMoney(c.monthlyPayment)}
                  </td>

                  {/* Next Due */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap text-[12px] font-bold">
                    {late ? (
                      <span className="text-[#f87171]">
                        {formatShortDate(c.nextDueDate)} ({c.daysLate}d late)
                      </span>
                    ) : dueSoon ? (
                      <span className="text-[#F8ED1A]">
                        {formatShortDate(c.nextDueDate)}
                      </span>
                    ) : (
                      <span className="text-[#34d399]">
                        {formatShortDate(c.nextDueDate)}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${meta.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 border-b border-white/[0.04] align-middle text-right whitespace-nowrap">
                    <Link
                      href={`/admin/agreements/${c.id}?type=LOAN`}
                      className="inline-block bg-transparent border border-[#2e3340] text-[#8892a4] hover:border-[#F8ED1A] hover:text-[#F8ED1A] text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors"
                    >
                      {late ? 'Contact' : 'View'}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors border ${
        active
          ? 'border-[#F8ED1A] text-[#F8ED1A] bg-[rgba(248,237,26,.05)]'
          : 'border-[#2e3340] text-[#8892a4] hover:text-white'
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`ml-1.5 text-[10px] font-bold ${
            active ? 'text-[#F8ED1A]' : 'text-[#4b5563]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}