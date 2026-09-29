import Link from 'next/link';
import Image from 'next/image';
import { signOut } from '@/auth';

export default function AdminTopNav({ session }: { session: any }) {
  return (
    <nav className="bg-[#0d1117] border-b border-[#2a2d38] sticky top-0 z-50 h-[60px]">
      <div className="flex items-center h-full px-6">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 pr-4 border-r border-[#2a2d38] mr-4 shrink-0"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#F8ED1A]">
            <Image src="/logo.png" alt="Logo" fill className="object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-[15px] font-black uppercase tracking-tight">
              Admin <span className="text-[#F8ED1A]">Panel</span>
            </span>
            <span className="bg-[rgba(248,237,26,.12)] text-[#F8ED1A] text-[9px] font-bold px-2 py-1 rounded tracking-wider">
              ADMIN
            </span>
          </div>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-3 pl-4 border-l border-[#2a2d38] shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[12px] text-white font-bold leading-tight">
              {session?.user?.name || 'Administrator'}
            </div>
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
    </nav>
  );
}