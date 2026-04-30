import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CreditsClient from './credits-client';

export const dynamic = 'force-dynamic';

export default async function CreditsManagerPage() {
  // Obtenemos los contratos con la información del comprador y la propiedad
  const contracts = await prisma.contract.findMany({
    include: {
      buyers: true, // <-- CORRECCIÓN: Cambiado 'buyer' por 'buyers'
      property: {
        select: {
          titleEn: true,
          address: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Serializamos las fechas para evitar errores al pasarlo al Client Component
  const serializedContracts = contracts.map(contract => {
    // Tomamos el primer comprador como principal, o null si no hay
    const primaryBuyer = contract.buyers && contract.buyers.length > 0 ? contract.buyers[0] : null;

    return {
      ...contract,
      totalAmount: contract.totalAmount.toString(),
      downPayment: contract.downPayment.toString(),
      principalAmount: contract.principalAmount.toString(),
      interestRate: contract.interestRate?.toString() || null,
      monthlyTaxes: contract.monthlyTaxes?.toString() || null,
      monthlyInsurance: contract.monthlyInsurance?.toString() || null,
      monthlyServFee: contract.monthlyServFee?.toString() || null,
      startDate: contract.startDate.toISOString(),
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
      
      // Mantenemos la estructura 'buyer' para que el CreditsClient no se rompa,
      // pasando solo el comprador principal.
      buyer: primaryBuyer ? {
          ...primaryBuyer,
          createdAt: primaryBuyer.createdAt.toISOString(),
          updatedAt: primaryBuyer.updatedAt.toISOString(),
      } : null,
      
      // Opcional: También pasamos el arreglo completo serializado por si el Client lo necesita
      buyers: contract.buyers.map(b => ({
          ...b,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
      }))
    };
  });

  return (
    <div className="min-h-screen bg-[#0a0f1c] p-4 sm:p-8 font-sans text-gray-200">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              Credits / Contracts <span className="text-[#f8ed1a]">Manager</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage loan and lease contracts imported from CSV.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-lg text-sm font-bold text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Back
            </Link>
          </div>
        </div>

        {/* --- COMPONENTE INTERACTIVO --- */}
        <CreditsClient contracts={serializedContracts} />

      </div>
    </div>
  );
}