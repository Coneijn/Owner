import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChangePasswordForm, CreateUserForm, UserListTable } from '../ui/client-components';

export default async function UserSettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/');
  }

  // Obtener todos los usuarios
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true }, 
  });

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-sans text-gray-200 relative">
      
      {/* NAVBAR CORREGIDO */}
      {/* Se cambió z-10 a z-50 y se asegura el bg-[#1a1a1a] sólido */}
      <nav className="sticky top-0 z-50 w-full bg-[#1a1a1a] border-b border-gray-800 shadow-xl">
        <div className="max-w-4xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#f8ed1a] bg-black">
                  <Image src="/logo.png" alt="Logo" fill className="object-cover" />
              </div>
            <span className="text-white text-lg font-black uppercase tracking-tight">
              User <span className="text-[#f8ed1a]">Settings</span>
            </span>
          </div>
          <Link href="/admin" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
            Exit to Dashboard
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-3xl mx-auto py-12 px-4 space-y-12 relative z-0">
        
        {/* 1. SECCIÓN: SEGURIDAD PERSONAL */}
        <section className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            {/* Decoración */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f8ed1a] opacity-5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
                    🔒 Personal Security
                </h2>
                <p className="text-sm text-gray-400 mb-8 max-w-lg">
                    Change your current password to keep your account secure.
                </p>
                
                <div className="max-w-xl">
                    <ChangePasswordForm />
                </div>
            </div>
        </section>

        {/* 2. SECCIÓN: CREAR USUARIO */}
        <section className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-colors">
            {/* Decoración */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#529e14] opacity-5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-3">
                    👤 Add Administrator
                </h2>
                <p className="text-sm text-gray-400 mb-8 max-w-lg">
                    Create a new access credential for a team member. They will have full admin privileges.
                </p>
                
                <div className="max-w-xl">
                    <CreateUserForm />
                </div>
            </div>
        </section>

        {/* 3. SECCIÓN: LISTA DE USUARIOS */}
        <section className="pt-8 border-t border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Team Management</h2>
                    <p className="text-sm text-gray-400 mt-1">View active users and reset passwords if needed.</p>
                </div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
                    {users.length} Users Active
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-lg overflow-hidden">
                <UserListTable users={users} currentUserEmail={session.user.email} />
            </div>
            
            <div className="mt-4 flex gap-3 p-4 bg-gray-900/30 rounded-lg border border-gray-800">
                <span className="text-xl">ℹ️</span>
                <p className="text-xs text-gray-500 leading-relaxed">
                    <strong>Admin Note:</strong> Resetting a password generates a one-time random secure string. 
                    You must share this string with the user immediately via a secure channel (Slack, Signal, or in-person). 
                    It cannot be retrieved later from the database.
                </p>
            </div>
        </section>

      </main>
    </div>
  );
}