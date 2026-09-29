'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SideItem = {
  label: string;
  icon: string;
  href: string;
  external?: boolean;
};

type SideSection = {
  title: string;
  items: SideItem[];
};

export default function AdminSidebar() {
  const pathname = usePathname();

  const sections: SideSection[] = [
    {
      title: 'Overview',
      items: [{ label: 'Dashboard', icon: '📊', href: '/admin' }],
    },
    {
      title: 'Platform',
      items: [
        { label: 'Community', icon: '💬', href: '/comunidad' },
        { label: 'Chat', icon: '💭', href: '/chat' },
        { label: 'Sellers', icon: '👥', href: '/admin/sellers' },
        { label: 'Blog', icon: '📰', href: '/admin/blog' },
        {
          label: 'AI JSON',
          icon: '🤖',
          href: '../api/agent/inventory',
          external: true,
        },
        {
          label: 'Alerts',
          icon: '🔔',
          href: '/admin/notificaciones',
          external: true,
        },
      ],
    },
    {
      title: 'Management',
      items: [
        { label: 'Settings', icon: '⚙️', href: '/admin/user_settings' },
      ],
    },
  ];

  const isActive = (href: string, external?: boolean) => {
    if (external) return false;
    if (href === '/admin') return pathname === '/admin';
    return pathname?.startsWith(href.split('?')[0]);
  };

  return (
    <aside className="w-[210px] shrink-0 bg-[#0d1117] border-r border-[#2a2d38] py-4 px-2.5 flex flex-col gap-0.5 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#4b5563] px-3 pt-3 pb-1.5">
            {section.title}
          </div>
          {section.items.map((item) => {
            const active = isActive(item.href, item.external);
            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                  active
                    ? 'text-[#F8ED1A] bg-[rgba(248,237,26,.08)]'
                    : 'text-[#8892a4] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span className="text-[14px] w-[18px] text-center shrink-0">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {item.external && (
                  <span className="ml-auto text-[10px] text-[#4b5563]">↗</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}