import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChangePasswordForm, TwoFactorManager } from '../../components/ui/client-components';

export default async function UserSettingsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/');
  }

  // 1. Obtener datos del usuario ACTUAL para ver estado de 2FA
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isTwoFactorEnabled: true, email: true, role:true }
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
              User <span className="text-[#f8ed1a]">Settings</span>
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* ACTIVO: Personal Settings */}
            <Link href="/admin/user_settings" className="text-xs sm:text-sm font-bold text-[#f8ed1a] uppercase tracking-wide border border-[#f8ed1a]/50 bg-[#f8ed1a]/10 px-3 py-1.5 rounded-lg cursor-default pointer-events-none">
              🔒 Personal Settings
            </Link>
            
            {/* INACTIVO: Team Management */}
            <Link href="/admin/team_management" className="text-xs sm:text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wide px-3 py-1.5 rounded-lg hover:bg-gray-800">
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
        
        {/* 1. SECCIÓN: SEGURIDAD PERSONAL (PASSWORD) */}
        <section className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-colors">
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

        {/* 1.5. SECCIÓN NUEVA: TWO-FACTOR AUTHENTICATION */}
        <section className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-2xl relative overflow-hidden group hover:border-[#f8ed1a] transition-colors">
            {/* Decoración Azul/Cyan para diferenciar seguridad avanzada */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        🛡️ Two-Factor Auth (2FA)
                    </h2>
                    {currentUser?.isTwoFactorEnabled && (
                        <span className="bg-green-900 text-green-300 text-[10px] px-2 py-0.5 rounded border border-green-700 font-bold uppercase tracking-wider">
                            Active
                        </span>
                    )}
                </div>
                
                <p className="text-sm text-gray-400 mb-8 max-w-lg">
                    Add an extra layer of security. Use an app like Google Authenticator or Authy to scan the QR code.
                </p>

                <div className="max-w-xl">
                    <TwoFactorManager 
                        isEnabled={currentUser?.isTwoFactorEnabled || false} 
                        email={currentUser?.email || ''} 
                        role={currentUser?.role || ''}
                    />
                </div>
            </div>
        </section>

        </main>
    </div>
  );
}