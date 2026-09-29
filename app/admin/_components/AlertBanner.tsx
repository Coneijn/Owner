type AlertTone = 'red' | 'yellow';

type Alert = {
  tone: AlertTone;
  icon: string;
  title: string;
  sub: string;
};

const toneClass: Record<AlertTone, string> = {
  red: 'bg-[rgba(248,113,113,.08)] border border-[rgba(248,113,113,.2)]',
  yellow: 'bg-[rgba(248,237,26,.06)] border border-[rgba(248,237,26,.15)]',
};

export default function AlertBanner({ alerts }: { alerts: Alert[] }) {
  if (!alerts.length) return null;

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((a, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg ${toneClass[a.tone]}`}
        >
          <span className="text-[16px] shrink-0">{a.icon}</span>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-white">{a.title}</div>
            <div className="text-[11px] text-[#8892a4] mt-0.5">{a.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}