'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeletePropertyButton from '@/app/admin/ui/delete-button';

const formatMoney = (amount: number | unknown) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const PropertySection = ({ title, items, icon, colorClass }: any) => {
  const [isOpen, setIsOpen] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (items.length === 0) return null; 

  return (
    <div className="mb-6 bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-900/50 hover:bg-gray-800/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <span className="bg-gray-800 text-gray-300 text-xs py-1 px-3 rounded-full font-bold">
            {items.length}
          </span>
        </div>
        <span className="text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-gray-800">
                <th className="pb-3 font-medium">Property</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Down Pmt</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((property: any) => (
                <tr key={property.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors group">
                  <td className="py-4">
                    <p className={`font-bold ${colorClass}`}>{property.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[200px] md:max-w-sm">{property.address}</p>
                  </td>
                  <td className="py-4 font-medium">{formatMoney(property.price)}</td>
                  <td className="py-4 text-gray-400">{formatMoney(property.downPayment)}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {/* En el futuro: Cambiaremos esto a /dashboard-vendedor/properties/... */}
                      <Link href={`/admin/properties/${property.id}/edit`} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                        Edit
                      </Link>
                      <DeletePropertyButton id={property.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
             <div className="flex justify-between items-center mt-6 text-sm text-gray-400">
                <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, items.length)} of {items.length}</span>
                <div className="flex gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50">Prev</button>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-50">Next</button>
                </div>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function DashboardVendedorClient({ properties }: { properties: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.zipCode?.includes(searchTerm)
  );

  const availableProps = filteredProperties.filter(p => p.status === 'AVAILABLE');
  const comingSoonProps = filteredProperties.filter(p => p.status === 'COMING_SOON');
  const underContractProps = filteredProperties.filter(p => p.status === 'UNDER_CONTRACT');
  const soldProps = filteredProperties.filter(p => p.status === 'SOLD');

  return (
    <div className="w-full">
      <div className="mb-8 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
        <input 
          type="text" 
          placeholder="Search my properties by title, address, or zip code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] transition-all shadow-lg"
        />
      </div>

      {filteredProperties.length === 0 && (
          <div className="text-center py-20 bg-[#1a1a1a] border border-dashed border-gray-700 rounded-xl">
              <p className="text-gray-500 text-lg">No properties found matching "{searchTerm}".</p>
          </div>
      )}

      <PropertySection title="Available Properties" items={availableProps} icon="✅" colorClass="text-[#529e14]" />
      <PropertySection title="Coming Soon" items={comingSoonProps} icon="⏳" colorClass="text-blue-400" />
      <PropertySection title="Under Contract" items={underContractProps} icon="📝" colorClass="text-[#f8ed1a]" />
      <PropertySection title="Sold Properties" items={soldProps} icon="🤝" colorClass="text-gray-400" />
    </div>
  );
}