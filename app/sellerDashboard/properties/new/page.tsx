import { auth } from '@/auth'; 
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SellerNewPropertyForm from './new-form';

export default async function SellerNewPropertyServerPage() {
  const session = await auth();

  // Proteção de rota no lado do servidor
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Obtenção de dados
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { 
      userId: session.user.id 
    },
  });

  // Estado de erro / Perfil inexistente com o novo estilo visual
  if (!sellerProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
        <div className="bg-[#1a1a1a] p-8 md:p-12 rounded-xl border border-gray-700/50 shadow-2xl max-w-lg w-full flex flex-col items-center relative overflow-hidden">
          {/* Efeito de brilho subtil no topo */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f8ed1a] to-transparent opacity-70"></div>
          
          <span className="text-4xl mb-4">⚠️</span>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
            Perfil Incompleto
          </h2>
          
          <div className="w-16 h-1 bg-[#f8ed1a] rounded-full mb-6"></div>
          
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
            No tienes un perfil de vendedor asignado.
            <br/>
            <span className="text-gray-500 text-[10px] mt-2 block">
              Contacta con soporte o completa tu registro para continuar.
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Passamos o ID com o nome exato que espera Prisma: sellerProfileId
  return <SellerNewPropertyForm sellerProfileId={sellerProfile.id} />;
}