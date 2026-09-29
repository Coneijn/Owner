import { getRecentActivity } from '@/lib/recent-activity';
import Link from 'next/link';

const formatRelative = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
};

export default async function RecentActivity({ limit = 6 }: { limit?: number }) {
  const items = await getRecentActivity(limit);

  return (
    <div className="bg-[#1c2030] border border-[#2e3340] rounded-xl">
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#2e3340]">
        <h2 className="text-[10px] font-bold uppercase tracking-[1px] text-[#8892a4]">
          Recent Activity
        </h2>
      </div>

      <div className="px-5 py-1">
        {items.length === 0 && (
          <div className="py-8 text-center text-[#8892a4] text-[12px]">
            No recent activity.
          </div>
        )}

        {items.map((item) => {
          const Wrapper = item.href ? Link : 'div';
          const wrapperProps = item.href ? { href: item.href } : {};

          return (
            // @ts-expect-error — Wrapper polimórfico
            <Wrapper
              key={item.id}
              {...wrapperProps}
              className="flex gap-3 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors -mx-2 px-2 rounded"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] shrink-0"
                style={{ background: item.iconBg }}
              >
                {item.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-semibold text-white truncate">
                  {item.text}
                </div>
                {item.sub && (
                  <div className="text-[11px] text-[#8892a4] truncate">
                    {item.sub}
                  </div>
                )}
              </div>
              <div className="text-[10px] text-[#4b5563] whitespace-nowrap mt-0.5 shrink-0">
                {formatRelative(item.timestamp)}
              </div>
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}