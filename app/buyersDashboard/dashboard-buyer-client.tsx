'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const formatMoney = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function DashboardBuyerClient({ data }: { data: any }) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

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
            labels: ['Interest', 'Principal', 'Escrow'],
            datasets: [{
              data: [data.paymentBreakdown.interest, data.paymentBreakdown.principal, data.paymentBreakdown.escrow],
              backgroundColor: [
                '#272727', // Gris oscuro para Intereses
                '#529e14', // Verde para Principal (Equity)
                '#f8ed1a'  // Amarillo para Escrow
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
      
      {/* TARJETAS SUPERIORES (METRICS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 shadow-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest relative z-10">Outstanding Balance</p>
          <h2 className="text-4xl font-black text-white mt-3 relative z-10">{formatMoney(data.outstandingBalance)}</h2>
          <div className="mt-4 flex items-center text-sm relative z-10">
            <span className="bg-[#529e14]/20 text-[#529e14] border border-[#529e14]/50 px-2 py-0.5 text-xs font-bold mr-2 rounded uppercase">ACTIVE</span>
            <span className="font-mono text-xs text-gray-400">30 Year Fixed at {data.interestRate}%</span>
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 shadow-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest relative z-10">Next Payment Due</p>
          <h2 className="text-4xl font-black text-white mt-3 relative z-10">{formatMoney(data.nextPayment)}</h2>
          <p className="text-[#f8ed1a] text-xs font-bold uppercase tracking-wide mt-4 flex items-center gap-1 relative z-10">
            ⏳ Due by {new Date(data.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
          </p>
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
            <button className="text-[#f8ed1a] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">View All</button>
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
                {data.transactions.map((tx: any, index: number) => (
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
              <span className="text-2xl font-black text-white">{formatMoney(data.nextPayment)}</span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            
            <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#222222] border border-gray-500 rounded-sm"></div>
                <span className="text-gray-300 font-bold">Interest ({data.interestRate}%)</span>
              </div>
              <span className="font-mono font-bold text-gray-400">
                {Math.round((data.paymentBreakdown.interest / data.nextPayment) * 100)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#529e14] rounded-sm shadow-[0_0_8px_rgba(82,158,20,0.5)]"></div>
                <span className="text-gray-300 font-bold">Principal (Equity)</span>
              </div>
              <span className="font-mono font-bold text-gray-400">
                {Math.round((data.paymentBreakdown.principal / data.nextPayment) * 100)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#f8ed1a] rounded-sm shadow-[0_0_8px_rgba(248,237,26,0.3)]"></div>
                <span className="text-gray-300 font-bold">Taxes & Insurance</span>
              </div>
              <span className="font-mono font-bold text-gray-400">
                {Math.round((data.paymentBreakdown.escrow / data.nextPayment) * 100)}%
              </span>
            </div>

          </div>
          <button className="w-full mt-8 py-3 bg-transparent border border-gray-600 rounded-lg text-white hover:bg-white hover:text-black text-xs font-bold uppercase tracking-widest transition-colors duration-200">
            Download Amortization Table
          </button>
        </div>

      </div>
    </div>
  );
}