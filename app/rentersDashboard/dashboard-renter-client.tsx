'use client';

import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useSearchParams } from 'next/navigation';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function DashboardRenterClient({ data }: { data: any }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

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

  // Inicializar Chart.js para desglose de renta
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
            labels: ['Base Rent', 'Services/Fees', 'Late Fees'],
            datasets: [{
              data: [data.paymentBreakdown.rent, data.paymentBreakdown.services, data.paymentBreakdown.lateFee],
              backgroundColor: [
                '#529e14', // Verde para Renta Base
                '#f8ed1a', // Amarillo para Servicios
                '#ef4444'  // Rojo para Late Fees
              ],
              borderColor: '#1a1a1a', 
              borderWidth: 4,
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let label = context.label || '';
                    if (label) { label += ': '; }
                    if (context.parsed !== null) { label += formatMoney(context.parsed); }
                    return label;
                  }
                }
              }
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
        <div className="bg-[#529e14]/20 border border-[#529e14] text-white p-4 rounded-xl flex items-center gap-3 shadow-lg">
          <span className="text-[#529e14] text-xl">✅</span>
          <div>
            <h4 className="font-bold text-[#529e14]">¡Pago Exitoso!</h4>
            <p className="text-sm text-gray-300">Tu renta ha sido procesada correctamente. Gracias.</p>
          </div>
        </div>
      )}
      {canceled && (
        <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-xl flex items-center gap-3 shadow-lg">
          <span className="text-red-500 text-xl">❌</span>
          <div>
            <h4 className="font-bold text-red-500">Pago Cancelado</h4>
            <p className="text-sm text-gray-300">No se realizó ningún cargo a tu tarjeta en este momento.</p>
          </div>
        </div>
      )}

      {/* TARJETAS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Próximo Pago */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 shadow-xl relative overflow-hidden group hover:border-[#529e14]/50 transition-colors flex flex-col justify-between col-span-1 md:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest relative z-10">Next Rent Payment</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mt-3 relative z-10">{formatMoney(data.nextPayment)}</h2>
              <p className="text-[#f8ed1a] text-xs font-bold uppercase tracking-wide mt-2 flex items-center gap-1 relative z-10">
                ⏳ Due by {new Date(data.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
              </p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Status</p>
              <span className="bg-[#529e14]/20 text-[#529e14] border border-[#529e14]/50 px-3 py-1 text-xs font-bold rounded uppercase">PENDING</span>
            </div>
          </div>
          <button 
            onClick={handlePayment}
            disabled={isLoading || !data.paymentId || data.nextPayment <= 0}
            className="mt-6 w-full md:w-1/2 bg-[#529e14] disabled:bg-gray-700 disabled:text-gray-400 text-white py-4 rounded-lg font-black uppercase tracking-widest text-sm shadow-lg shadow-[#529e14]/20 hover:bg-[#438210] transition-colors flex items-center justify-center gap-2 relative z-10"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>💳 Pay Rent Now</>
            )}
          </button>
        </div>

        {/* Depósito de Garantía */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">Security Deposit</p>
            <h2 className="text-3xl font-black text-white mt-3">{formatMoney(data.securityDeposit)}</h2>
            <p className="text-xs text-gray-400 mt-2 font-mono leading-relaxed">
              This amount is securely held on file and will be evaluated at the end of your lease term.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">My Property</p>
            <div className="flex gap-4 text-sm font-bold text-gray-300">
              <span className="flex items-center gap-1">🛏️ {data.propertyDetails.bedrooms} Beds</span>
              <span className="flex items-center gap-1">🚿 {data.propertyDetails.bathrooms} Baths</span>
            </div>
          </div>
        </div>
      </div>
            <div className="lg:col-span-2 bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden shadow-xl flex flex-col">
          <div className="p-6 border-b border-gray-800 bg-[#111] flex justify-between items-center">
            <h3 className="font-black text-xl text-white uppercase tracking-wide">Payment History</h3>
            <button className="text-[#f8ed1a] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Download PDF</button>
          </div>
          <div className="overflow-x-auto">
            {data.transactions.length > 0 ? (
               <table className="min-w-full divide-y divide-gray-800">
               <thead className="bg-[#151515]">
                 <tr>
                   <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                   <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                   <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</th>
                   <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-800">
                 {data.transactions.map((tx: any, index: number) => (
                   <tr key={index} className="hover:bg-white/5 transition-colors">
                     <td className="px-6 py-4 text-gray-400 text-sm whitespace-nowrap font-mono">{tx.date}</td>
                     <td className="px-6 py-4 text-white text-sm font-bold whitespace-nowrap">{tx.type}</td>
                     <td className="px-6 py-4 text-right text-white text-sm font-bold whitespace-nowrap">{formatMoney(tx.amount)}</td>
                     <td className="px-6 py-4 text-right whitespace-nowrap">
                       <span className="bg-[#529e14]/10 text-[#529e14] px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                         {tx.status}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
            ) : (
              <div className="p-8 text-center text-gray-500 font-mono text-sm">
                No previous payments found.
              </div>
            )}
          </div>
        </div>
      
    </div>
  );
}