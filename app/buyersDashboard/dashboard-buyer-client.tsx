'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useSearchParams } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import AmortizationTemplate from './amortization-template';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
};
const SERVICE_FEE = 0;//se vuelve inecesario ya que se arreglo al crear el contrato

export default function DashboardBuyerClient({ data }: { data: any }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  
  // Mostramos 3 por defecto, o páginas de 10 si showAll es true
  const displayedTransactions = showAll 
    ? data.transactions.slice(startIndex, startIndex + itemsPerPage) 
    : data.transactions.slice(0, 3);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const totalNextPayment = data.nextPayment + SERVICE_FEE;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(<AmortizationTemplate data={data.fullAmortization} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Amortization_Table.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al generar tu tabla.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePayment = async () => {
    if (!data.paymentId) return;
    try {
      setIsLoading(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: data.paymentId }),
      });
      const result = await response.json();
      
      if (result.url) {
        window.location.href = result.url; // Redirigir a Stripe
      } else {
        console.error(result.error);
        alert('Hubo un error al generar el pago. Intenta de nuevo.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Hubo un error de conexión.');
      setIsLoading(false);
    }
  };

  // Inicializar Chart.js
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Interest', 'Principal', 'Escrow', 'Service Fee'],
            datasets: [{
              data: [data.paymentBreakdown.interest, data.paymentBreakdown.principal, data.paymentBreakdown.escrow, SERVICE_FEE],
              backgroundColor: [
                '#272727', // Gris oscuro para Intereses
                '#529e14', // Verde para Principal (Equity)
                '#f8ed1a', // Amarillo para Escrow
                '#6b7280'  // Gris para Service Fee
              ],
              borderColor: '#000000', // Borde del color de fondo de la app
              borderWidth: 3,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="space-y-8">
      
      {/* ALERTAS DE STRIPE */}
      {success && (
        <div className="bg-[#529e14]/20 border border-[#529e14] text-white p-4 rounded-xl flex items-center gap-3">
          <span className="text-[#529e14] text-xl">✅</span>
          <div>
            <h4 className="font-bold text-[#529e14]">¡Pago Exitoso!</h4>
            <p className="text-sm text-gray-300">Tu mensualidad ha sido procesada correctamente.</p>
          </div>
        </div>
      )}
      {canceled && (
        <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-xl flex items-center gap-3">
          <span className="text-red-500 text-xl">❌</span>
          <div>
            <h4 className="font-bold text-red-500">Pago Cancelado</h4>
            <p className="text-sm text-gray-300">No se realizó ningún cargo a tu tarjeta en este momento.</p>
          </div>
        </div>
      )}

      {/* TARJETAS SUPERIORES (METRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 shadow-xl relative overflow-hidden group hover:border-gray-700 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest relative z-10">Outstanding Balance</p>
            <h2 className="text-4xl font-black text-white mt-3 relative z-10">{formatMoney(data.outstandingBalance)}</h2>
          </div>
          <div className="mt-4 flex items-center text-sm relative z-10">
            <span className="bg-[#529e14]/20 text-[#529e14] border border-[#529e14]/50 px-2 py-0.5 text-xs font-bold mr-2 rounded uppercase">ACTIVE</span>
            <span className="font-mono text-xs text-gray-400">30 Year Fixed at {data.interestRate}%</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 shadow-xl relative overflow-hidden group hover:border-gray-700 transition-colors flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest relative z-10">Next Payment Due</p>
            <h2 className="text-4xl font-black text-white mt-3 relative z-10">{formatMoney(totalNextPayment)}</h2>
            <p className="text-[#f8ed1a] text-xs font-bold uppercase tracking-wide mt-2 flex items-center gap-1 relative z-10">
              ⏳ Due by {new Date(data.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
            </p>
          </div>
          <button 
            onClick={handlePayment}
            disabled={isLoading || !data.paymentId || totalNextPayment <= 0}
            className="mt-4 w-full bg-[#529e14] disabled:bg-gray-700 disabled:text-gray-400 text-white py-3 rounded-lg font-black uppercase tracking-widest text-xs shadow-lg shadow-[#529e14]/20 hover:bg-[#438210] transition-colors flex items-center justify-center gap-2 relative z-10"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>💳 Make Payment</>
            )}
          </button>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-gray-700 p-6 shadow-[0_0_20px_rgba(248,237,26,0.05)] relative overflow-hidden text-white">
          <p className="text-[#f8ed1a] font-bold text-xs uppercase tracking-widest">Equity Built</p>
          <h2 className="text-4xl font-black mt-3">{formatMoney(data.equityBuilt)}</h2>
          <div className="w-full bg-black h-3 mt-5 rounded-full overflow-hidden border border-gray-800">
            <div className="bg-[#529e14] h-full rounded-full" style={{ width: `${data.equityPercentage}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2 font-mono">You own {data.equityPercentage}% of your home!</p>
        </div>
      </div>

      {/* SECCIÓN INFERIOR DIVIDIDA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabla de Transacciones */}
        <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden shadow-xl flex flex-col">
          <div className="p-6 border-b border-gray-800 bg-[#111] flex justify-between items-center">
            <h3 className="font-black text-xl text-white uppercase tracking-wide">Recent Transactions</h3>
            {!showAll && data.transactions.length > 3 && (
              <button 
                onClick={() => setShowAll(true)}
                className="text-[#f8ed1a] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                View All
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-[#151515]">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-[#529e14] uppercase tracking-widest">Principal</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-[#f8ed1a] uppercase tracking-widest">Interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {displayedTransactions.map((tx: any, index: number) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-sm whitespace-nowrap font-mono">{tx.date}</td>
                    <td className="px-6 py-4 text-white text-sm font-bold whitespace-nowrap">{tx.type}</td>
                    <td className="px-6 py-4 text-right text-white text-sm font-bold whitespace-nowrap">{formatMoney(tx.amount)}</td>
                    <td className="px-6 py-4 text-right text-[#529e14] text-sm whitespace-nowrap">+{formatMoney(tx.principal)}</td>
                    <td className="px-6 py-4 text-right text-gray-400 text-sm whitespace-nowrap">{formatMoney(tx.interest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN */}
          {showAll && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800 bg-gray-900/50">
              <span className="text-xs text-gray-500">
                Showing <span className="font-bold text-white">{startIndex + 1}</span> to <span className="font-bold text-white">{Math.min(startIndex + itemsPerPage, data.transactions.length)}</span> of {data.transactions.length}
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
          <div className="p-4 bg-[#151515] border-t border-gray-800 text-xs flex items-center gap-2 text-gray-400 font-mono">
            <span className="text-[#f8ed1a]">ℹ️</span>
            <span>Note: {formatMoney(data.paymentBreakdown.escrow)} of each payment goes to Escrow (Taxes & Insurance).</span>
          </div>
        </div>

        {/* Gráfico de dona (Chart) */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 shadow-xl flex flex-col">
          <h3 className="font-black text-xl text-white uppercase tracking-wide mb-6">Where your money goes</h3>
          <div className="relative h-64 w-full flex-1">
            <canvas ref={chartRef}></canvas>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Monthly</span>
              <span className="text-2xl font-black text-white">{formatMoney(totalNextPayment)}</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            
            <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#222222] border border-gray-500 rounded-sm"></div>
                <span className="text-gray-300 font-bold">Interest ({data.interestRate}%)</span>
              </div>
              <span className="font-mono font-bold text-gray-400">
                {Math.round((data.paymentBreakdown.interest / totalNextPayment) * 100)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#529e14] rounded-sm shadow-[0_0_8px_rgba(82,158,20,0.5)]"></div>
                <span className="text-gray-300 font-bold">Principal (Equity)</span>
              </div>
              <span className="font-mono font-bold text-gray-400">
                {Math.round((data.paymentBreakdown.principal / totalNextPayment) * 100)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#f8ed1a] rounded-sm shadow-[0_0_8px_rgba(248,237,26,0.3)]"></div>
                <span className="text-gray-300 font-bold">Taxes & Insurance</span>
              </div>
              <span className="font-mono font-bold text-gray-400">
                {Math.round((data.paymentBreakdown.escrow / totalNextPayment) * 100)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
                <span className="text-gray-300 font-bold">Service Fee</span>
              </div>
              <span className="font-mono font-bold text-gray-400">
                {Math.round((SERVICE_FEE / totalNextPayment) * 100)}%
              </span>
            </div>

          </div>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="w-full mt-8 py-3 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-widest transition-colors duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? 'Generando PDF...' : 'Download Amortization Table'}
          </button>
        </div>

      </div>
    </div>
  );
}