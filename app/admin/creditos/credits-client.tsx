'use client';

import Link from 'next/link';

// Tipos basados en tu Prisma Schema (serializados)
type Buyer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

type Property = {
  titleEn: string;
  address: string;
};

type Contract = {
  id: string;
  type: string;
  totalAmount: string;
  isActive: boolean;
  buyer: Buyer;
  property: Property;
};

export default function CreditsClient({ contracts }: { contracts: Contract[] }) {
  
  return (
    <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
      
      {/* --- TABLA DE CRÉDITOS --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-xs uppercase text-gray-500 font-black tracking-wider border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">Buyer</th>
              <th className="px-6 py-4">Property</th>
              <th className="px-6 py-4">Type & Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {contracts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  No contracts found. 
                </td>
              </tr>
            )}
            {contracts.map((contract) => (
              <tr key={contract.id} className="hover:bg-gray-800/50 transition-colors">
                
                {/* BUYER INFO */}
                <td className="px-6 py-4">
                  <div className="text-white font-bold text-base">
                    {contract.buyer.firstName} {contract.buyer.lastName}
                  </div>
                  {contract.buyer.phone && (
                     <div className="text-xs text-gray-500 font-mono mt-0.5">{contract.buyer.phone}</div>
                  )}
                </td>

                {/* PROPERTY INFO */}
                <td className="px-6 py-4">
                  <div className="text-gray-300 font-medium">
                    {contract.property.titleEn}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                    {contract.property.address}
                  </div>
                </td>

                {/* AMOUNT & TYPE */}
                <td className="px-6 py-4">
                  <div className="text-[#f8ed1a] font-bold text-base">
                    ${Number(contract.totalAmount).toLocaleString('en-US')}
                  </div>
                   <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                    contract.type === 'LOAN' ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'
                  }`}>
                    {contract.type}
                  </span>
                </td>

                {/* STATUS */}
                <td className="px-6 py-4 text-center">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                    contract.isActive ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {contract.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-4 text-right space-x-3">
                  <Link 
                    href={`/admin/creditos/${contract.id}`}
                    className="text-xs font-bold text-blue-400 hover:text-white uppercase tracking-wide transition-colors"
                  >
                    View Details
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}