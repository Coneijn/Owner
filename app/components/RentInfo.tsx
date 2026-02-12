'use client';

interface RentInfoProps {
  monthlyRent: number | null;
  securityDeposit: number | null;
  lang?: 'es' | 'en';
}

const TEXTS = {
  es: {
    title: "Detalles de Renta",
    rent: "Renta Mensual",
    deposit: "Depósito de Seguridad",
    totalMoveIn: "Total Estimado para Entrar",
    note: "Incluye 1er mes de renta + depósito."
  },
  en: {
    title: "Rental Details",
    rent: "Monthly Rent",
    deposit: "Security Deposit",
    totalMoveIn: "Est. Total Move-In Cost",
    note: "Includes 1st month rent + deposit."
  }
};

export default function RentInfo({ 
  monthlyRent, 
  securityDeposit, 
  lang = 'es' 
}: RentInfoProps) {
  
  const t = TEXTS[lang];
  const rentVal = Number(monthlyRent) || 0;
  const depositVal = Number(securityDeposit) || 0;
  const totalMoveIn = rentVal + depositVal;

  const formatMoney = (val: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(val);

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-xl border border-gray-800 h-full flex flex-col justify-center">
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-2">
        <span className="text-2xl">🔑</span> {t.title}
      </h3>
      <div className="space-y-8">
        <div>
            <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-2">{t.rent}</p>
            <p className="text-5xl font-black text-[#f8ed1a] tracking-tight">{formatMoney(rentVal)}</p>
        </div>
        <div className="flex justify-between items-end border-b border-gray-700 pb-4">
            <span className="text-sm font-bold text-white uppercase tracking-wide">{t.deposit}</span>
            <span className="text-xl font-bold text-white">{formatMoney(depositVal)}</span>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[#529e14] font-black uppercase text-xs tracking-wider">{t.totalMoveIn}</span>
            </div>
            <span className="text-3xl font-black text-white block">{formatMoney(totalMoveIn)}</span>
            <p className="text-[10px] text-gray-500 mt-2 italic">* {t.note}</p>
        </div>
      </div>
    </div>
  );
}