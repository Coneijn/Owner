import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Consultamos el contrato con todas sus relaciones, incluyendo los pagos (Payment)
  const contract = await prisma.contract.findUnique({
    where: { id: id },
    include: {
      buyer: true,
      property: true,
      payments: {
        orderBy: { paymentDate: 'asc' } // Ordenamos los pagos por fecha de vencimiento
      }
    }
  });

  if (!contract) {
    notFound();
  }

  // Helpers para formatear datos
  const formatMoney = (amount: any) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount));
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] p-4 sm:p-8 font-sans text-gray-200">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-gray-800 pb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">
                Contract <span className="text-[#f8ed1a]">Details</span>
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                contract.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
              }`}>
                {contract.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-mono">ID: {contract.id}</p>
          </div>
          <Link
            href="/admin/creditos"
            className="px-6 py-3 rounded-lg text-sm font-bold text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-800 transition-colors uppercase tracking-wide inline-block text-center"
          >
            Back to List
          </Link>
        </div>

        {/* --- TARJETAS DE INFORMACIÓN (GRID) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Tarjeta: Comprador */}
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Buyer Info</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-400">Name:</span> <span className="text-white font-bold ml-2">{contract.buyer.firstName} {contract.buyer.lastName}</span></p>
              <p><span className="text-gray-400">Phone:</span> <span className="text-white ml-2">{contract.buyer.phone || 'N/A'}</span></p>
            </div>
          </div>

          {/* Tarjeta: Propiedad */}
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Property Info</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-gray-400">Title:</span> <span className="text-white font-bold ml-2">{contract.property?.titleEn || 'N/A'}</span></p>
              <p><span className="text-gray-400">Address:</span> <span className="text-white ml-2">{contract.property?.address || 'N/A'}</span></p>
            </div>
          </div>

          {/* Tarjeta: Términos del Contrato */}
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Contract Terms ({contract.type})</h2>
            <div className="space-y-3 text-sm grid grid-cols-2 gap-x-4 gap-y-1">
              <p className="col-span-2"><span className="text-gray-400">Total Amount:</span> <span className="text-[#f8ed1a] font-bold text-lg ml-2">{formatMoney(contract.totalAmount)}</span></p>
              <p><span className="text-gray-400">Down Payment:</span> <span className="text-white ml-1">{formatMoney(contract.downPayment)}</span></p>
              <p><span className="text-gray-400">Principal:</span> <span className="text-white ml-1">{formatMoney(contract.principalAmount)}</span></p>
              <p><span className="text-gray-400">Interest Rate:</span> <span className="text-white ml-1">{contract.interestRate ? `${contract.interestRate}%` : '0%'}</span></p>
              <p><span className="text-gray-400">Start Date:</span> <span className="text-white ml-1">{formatDate(contract.startDate)}</span></p>
            </div>
          </div>

        </div>

        {/* --- TABLA DE AMORTIZACIÓN (PAGOS) --- */}
        <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
             <h2 className="text-lg font-black text-white uppercase tracking-wider">Amortization Schedule</h2>
             <p className="text-xs text-gray-400 mt-1">Detailed breakdown of all monthly payments.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400 whitespace-nowrap">
              <thead className="bg-gray-900 text-xs uppercase text-gray-500 font-black tracking-wider border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Payment</th>
                  <th className="px-6 py-4 text-right">Principal</th>
                  <th className="px-6 py-4 text-right">Interest</th>
                  <th className="px-6 py-4 text-right">Taxes & Ins.</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {contract.payments && contract.payments.length > 0 ? (
                  contract.payments.map((payment: any, index: number) => {
                    // Calculamos el total de impuestos, seguros y tarifas para agruparlo en la tabla
                    const extraFees = Number(payment.taxes || 0) + Number(payment.insurance || 0) + Number(payment.serviceFee || 0);
                    
                    return (
                      <tr key={payment.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-500">{index + 1}</td>
                        <td className="px-6 py-4 font-medium text-white">{formatDate(payment.paymentDate)}</td>
                        <td className="px-6 py-4 text-right text-[#f8ed1a] font-bold">{formatMoney(payment.totalDue)}</td>
                        <td className="px-6 py-4 text-right">{formatMoney(payment.principal)}</td>
                        <td className="px-6 py-4 text-right">{formatMoney(payment.interest)}</td>
                        <td className="px-6 py-4 text-right text-xs text-gray-500">{formatMoney(extraFees)}</td>
                        <td className="px-6 py-4 text-right font-mono text-gray-300">{formatMoney(payment.remainingBalance)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${
                            payment.status === 'PAID' ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-orange-900/30 text-orange-400 border border-orange-800/50'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 italic">
                      No payments found for this contract.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}