import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreateUserForm, UserListTable } from '../../components/ui/client-components';

export default async function TeamManagementPage(props: { searchParams: Promise<{ page?: string; tab?: string }> }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/');
  }

  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;
  const activeTab = searchParams.tab || 'ALL';
  const ITEMS_PER_PAGE = 10;

  // Construir filtro basado en la pestaña (categoría) según los perfiles del schema
  let whereClause: any = {};
  if (activeTab === 'ADMIN') whereClause.role = 'ADMIN';
  else if (activeTab === 'STAFF') whereClause.role = 'STAFF';
  else if (activeTab === 'SELLER') whereClause.sellerProfile = { isNot: null };
  else if (activeTab === 'BUYER') whereClause.buyerProfile = { isNot: null };
  else if (activeTab === 'RENTER') whereClause.renterProfile = { isNot: null };
  else if (activeTab === 'AGENT') whereClause.agentProfile = { isNot: null };

  // 1. Obtener total de usuarios para la paginación con el filtro aplicado
  const totalUsers = await prisma.user.count({ where: whereClause });
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  // 2. Obtener usuarios paginados con el filtro aplicado
  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
    select: { id: true, name: true, email: true, role: true, createdAt: true, isTwoFactorEnabled: true }, 
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200 relative">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-[#1a1a1a] border-b border-gray-800 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#f8ed1a] bg-black">
                  <Image src="/logo.png" alt="Logo" fill className="object-cover" />
              </div>
            <span className="text-white text-lg font-black uppercase tracking-tight">
              Team <span className="text-[#f8ed1a]">Management</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* INACTIVO: Personal Settings */}
            <Link href="/admin/user_settings" className="text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wide px-3 py-1.5 rounded-lg hover:bg-gray-800">
              🔒 Personal Settings
            </Link>
            
            {/* ACTIVO: Team Management */}
            <Link href="/admin/team_management" className="text-xs sm:text-sm font-bold text-[#f8ed1a] uppercase tracking-wide border border-[#f8ed1a]/50 bg-[#f8ed1a]/10 px-3 py-1.5 rounded-lg cursor-default pointer-events-none">
              👥 Team Management
            </Link>
            
            <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors ml-2 border-l border-gray-800 pl-4 sm:pl-6">
              Go to dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto py-12 px-4 space-y-12 relative z-0">
              

        {/* SECCIÓN: LISTA DE USUARIOS CON PAGINACIÓN */}
        <section className="pt-8 border-t border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Team Management</h2>
                    <p className="text-sm text-gray-400 mt-1">View active users and reset passwords if needed.</p>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                    {totalUsers} Users in category
                </div>
            </div>

            {/* PESTAÑAS (TABS) DE CATEGORÍAS */}
            <div className="flex border-b border-gray-800 gap-4 mb-6 overflow-x-auto whitespace-nowrap pb-2 custom-scrollbar">
                {[
                  { id: 'ALL', label: 'All Users' },
                  { id: 'ADMIN', label: 'Admins' },
                  { id: 'STAFF', label: 'Staff' },
                  { id: 'SELLER', label: 'Sellers' },
                  { id: 'BUYER', label: 'Buyers' },
                  { id: 'RENTER', label: 'Renters' },
                  { id: 'AGENT', label: 'Agents' }
                ].map(tab => (
                  <Link 
                    key={tab.id}
                    href={`/admin/team_management?tab=${tab.id}&page=1`}
                    className={`text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-t-lg transition-colors ${
                      activeTab === tab.id 
                        ? 'text-[#f8ed1a] bg-[#1a1a1a] border-b-2 border-[#f8ed1a]' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
                <UserListTable users={users} currentUserEmail={session.user.email} />
                
                {/* CONTROLES DE PAGINACIÓN */}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-900/50">
                    <div className="text-xs text-gray-400">
                      page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
                    </div>
                    <div className="flex gap-2">
                      {currentPage > 1 ? (
                        <Link 
                          href={`/admin/team_management?tab=${activeTab}&page=${currentPage - 1}`}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded transition-colors"
                        >
                          Previous
                        </Link>
                      ) : (
                        <button disabled className="px-3 py-1.5 bg-gray-900/50 text-gray-600 text-xs font-bold rounded cursor-not-allowed">
                          Previous
                        </button>
                      )}
                      
                      {currentPage < totalPages ? (
                        <Link 
                          href={`/admin/team_management?tab=${activeTab}&page=${currentPage + 1}`}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded transition-colors"
                        >
                          Next
                        </Link>
                      ) : (
                        <button disabled className="px-3 py-1.5 bg-gray-900/50 text-gray-600 text-xs font-bold rounded cursor-not-allowed">
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>
            
            <div className="mt-4 flex gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
                <span className="text-xl">ℹ️</span>
                <p className="text-xs text-gray-500 leading-relaxed">
                    <strong>Admin Note:</strong> When sending a Magic Link, the system will generate a unique token valid for 48 hours and send it automatically to the user's email through the CRM, allowing them to create a new password in a secure manner.
                </p>
            </div>
        </section>

        {/* SECCIÓN: CREAR USUARIO */}
        <section className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#529e14] opacity-5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
                    👤 Add User
                </h2>
                <p className="text-sm text-gray-400 mb-8 max-w-lg">
                    Create a new access credential for a team member. They will have full admin privileges.
                </p>
                
                <div className="max-w-xl">
                    <CreateUserForm />
                </div>
            </div>
        </section>

      </main>
    </div>
  );
}