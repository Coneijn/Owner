import { auth } from '@/auth';
import AdminTopNav from './AdminTopNav';
import AdminSidebar from './AdminSidebar';

export default async function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#111318] font-sans text-gray-200">
      <AdminTopNav session={session} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 px-6 py-6 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  );
}