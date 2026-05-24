'use client';
import { useState } from 'react';

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
};

const formatDate = (date: any) => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return '-';
  }
};

export default function PaymentHistoryClient({ payments, isLease }: { payments: any[], isLease: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const displayedPayments = showAll 
    ? payments.slice(startIndex, startIndex + itemsPerPage) 
    : payments.slice(0, 10);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
        <h2 className="text-sm font-black text-white uppercase tracking-widest">Payment Schedule & History</h2>
        <div className="flex items-center gap-4">
          {!showAll && payments.length > 3 && (
            <button 
              onClick={() => setShowAll(true)}
              className="text-[#f8ed1a] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              View All
            </button>
          )}
          <span className="text-xs text-gray-400 font-bold">{payments.length} Records</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-[#f8ed1a] uppercase tracking-widest">Total Due</th>
              {!isLease && (
                <>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Principal</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Interest</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest hidden lg:table-cell">Escrow</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Remaining</th>
                </>
              )}
              {isLease && (
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:table-cell">Late Fee</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-gray-500 text-sm italic">
                  No payments recorded yet.
                </td>
              </tr>
            ) : (
              displayedPayments.map((payment: any) => {
                const principal = Number(payment.principal || 0);
                const interest = Number(payment.interest || 0);
                const taxes = Number(payment.taxes || 0);
                const insurance = Number(payment.insurance || 0);
                
                const serviceFee = Number(payment.serviceFee || 0);
                const escrow = taxes + insurance + serviceFee;
                const totalDue = Number(payment.totalDue || 0);
                
                const remaining = Number(payment.remainingBalance || 0);
                const lateFee = Number(payment.lateFee || 0);
                
                return (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.status === 'PAID' && <span className="bg-[#529e14]/20 text-[#529e14] px-2 py-1 rounded text-[10px] font-black uppercase">Paid</span>}
                      {payment.status === 'PENDING' && <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-[10px] font-black uppercase">Pending</span>}
                      {payment.status === 'LATE' && <span className="bg-red-900/20 text-red-500 px-2 py-1 rounded text-[10px] font-black uppercase">Late</span>}
                      {payment.status === 'PARTIAL' && <span className="bg-orange-900/20 text-orange-400 px-2 py-1 rounded text-[10px] font-black uppercase">Partial</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-[#f8ed1a]">
                      {formatMoney(totalDue)}
                    </td>
                    
                    {!isLease && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300 hidden sm:table-cell">
                          {formatMoney(principal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400 hidden md:table-cell">
                          {formatMoney(interest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 hidden lg:table-cell">
                          {formatMoney(escrow)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-white">
                          {formatMoney(remaining)}
                        </td>
                      </>
                    )}
                    {isLease && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-400 hidden sm:table-cell">
                        {lateFee > 0 ? formatMoney(lateFee) : '-'}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CONTROLES DE PAGINACIÓN */}
      {showAll && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800 bg-gray-900/50">
          <span className="text-xs text-gray-500">
            Showing <span className="font-bold text-white">{startIndex + 1}</span> to <span className="font-bold text-white">{Math.min(startIndex + itemsPerPage, payments.length)}</span> of {payments.length}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs font-bold uppercase rounded bg-gray-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Prev
            </button>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs font-bold uppercase rounded bg-gray-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}