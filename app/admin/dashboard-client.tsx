'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeletePropertyButton from '@/app/components/ui/delete-button';

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
        className="w-full flex items-center justify-between p-4 bg-gray-900 hover:bg-gray-800 transition-colors border-b border-gray-800"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className={`text-lg font-black uppercase tracking-wide ${colorClass}`}>
            {title} <span className="text-gray-500 text-sm ml-2">({items.length})</span>
          </h2>
        </div>
        <span className={`text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-[#111]">
                <tr>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Property</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type & Price</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Seller</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-[#f8ed1a] uppercase tracking-widest">Lockbox</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Specs</th>
                  <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
                {currentItems.map((property: any) => {
                    const isRent = property.isForRent;
                    const isSale = property.isForSale;
                    
                    return (
                      <tr key={property.id} className="hover:bg-white/5 transition-colors group">
                        
                        {/* Property Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-800 rounded overflow-hidden border border-gray-700 relative">
                               {property.mainImage ? (
                                 <img src={property.mainImage} alt="" className="h-full w-full object-cover" />
                               ) : (
                                 <div className="h-full w-full flex items-center justify-center text-gray-600 text-[10px]">N/A</div>
                               )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-white truncate max-w-[180px]" title={property.titleEn || property.titleEs}>
                                {property.titleEn || property.titleEs}
                              </div>
                              <div className="text-xs text-gray-500">{property.address}</div>
                            </div>
                          </div>
                        </td>

                        {/* Prices */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {isSale && (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-[#f8ed1a] text-black text-[9px] font-black px-1.5 py-0.5 rounded uppercase">SALE</span>
                                        <span className="text-sm text-[#f8ed1a] font-bold">{formatMoney(property.price)}</span>
                                    </div>
                                    <div className="text-[9px] text-gray-500 ml-1">Down: {formatMoney(property.downPayment)}</div>
                                </div>
                            )}
                            {isRent && (
                                <div className={`${isSale ? 'mt-1 border-t border-gray-700 pt-1' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">RENT</span>
                                        <span className="text-sm text-blue-400 font-bold">{formatMoney(property.monthlyRent)}/mo</span>
                                    </div>
                                    <div className="text-[9px] text-gray-500 ml-1">Dep: {formatMoney(property.securityDeposit)}</div>
                                </div>
                            )}
                            {!isSale && !isRent && (
                                <span className="text-gray-600 text-xs italic">Not configured</span>
                            )}
                          </div>
                        </td>

                        {/* Seller Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                             {property.sellerImage && (
                                 <img src={property.sellerImage} className="w-5 h-5 rounded-full object-cover border border-gray-600" alt="Seller" />
                             )}
                             <div>
                                 <div className="text-sm text-white font-medium">
                                   {property.sellerName || <span className="text-gray-600 italic text-xs">Dueño a Dueño Team</span>}
                                 </div>
                                 <div className="text-[9px] text-gray-500 uppercase">{property.sellerType}</div>
                             </div>
                          </div>
                        </td>

                        {/* Lockbox Code */}
                        <td className="px-6 py-4 whitespace-nowrap">
                            {property.lockboxCode ? (
                                <span className="px-2 py-1 rounded bg-gray-800 border border-gray-600 text-[#f8ed1a] font-mono font-bold text-xs tracking-wider">
                                    {property.lockboxCode}
                                </span>
                            ) : (
                                <span className="text-gray-600 text-xs">-</span>
                            )}
                        </td>

                        {/* Specs */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-medium">
                          {property.bedrooms} bd • {property.bathrooms} ba • {property.sqft} sqft
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end items-center gap-3">
                              <Link href={`/propiedades/${property.slug}`} target="_blank" className="text-gray-500 hover:text-white transition-colors" title="View">
                                  👁️
                              </Link>
                              <Link href={`/admin/properties/${property.id}/edit`} className="text-blue-400 hover:text-blue-300 font-bold uppercase text-[10px] tracking-wide">
                                  EDIT
                              </Link>
                              <DeletePropertyButton id={property.id} />
                          </div>
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-800 bg-gray-900/50">
                <span className="text-xs text-gray-500">
                    Showing <span className="font-bold text-white">{startIndex + 1}</span> to <span className="font-bold text-white">{Math.min(startIndex + itemsPerPage, items.length)}</span> of {items.length}
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
      )}
    </div>
  );
};

export default function DashboardClient({ properties }: { properties: any[] }) {
  // 1. Estado para el input de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Filtramos la lista maestra de propiedades según la búsqueda (Título en/es, dirección, código postal)
  const filteredProperties = properties.filter((p) => {
    if (!searchTerm) return true;
    
    const query = searchTerm.toLowerCase();
    return (
      p.titleEn?.toLowerCase().includes(query) ||
      p.titleEs?.toLowerCase().includes(query) ||
      p.address?.toLowerCase().includes(query) ||
      p.zipCode?.toLowerCase().includes(query)
    );
  });

  // 3. Ahora las listas por estado usan las propiedades filtradas
  const availableProps = filteredProperties.filter(p => p.status === 'AVAILABLE');
  const underContractProps = filteredProperties.filter(p => p.status === 'UNDER_CONTRACT');
  const soldProps = filteredProperties.filter(p => p.status === 'SOLD');
  const rentedProps = filteredProperties.filter(p => p.status === 'RENTED');
  const draftProps = filteredProperties.filter(p => p.status === 'DRAFT');
  const comingSoonProps = filteredProperties.filter(p => p.status === 'COMING_SOON');

  return (
    <div className="space-y-8">
      
      {/* BARRA DE BÚSQUEDA */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-500 text-lg">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search properties by title, address, or zip code..."
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

      {/* Listas por Categoría */}
      <PropertySection 
        title="Available Properties" 
        items={availableProps} 
        icon="✅" 
        colorClass="text-[#529e14]" 
      />
      
      <PropertySection 
        title="Coming Soon" 
        items={comingSoonProps} 
        icon="⏳" 
        colorClass="text-blue-400" 
      />

      <PropertySection 
        title="Under Contract" 
        items={underContractProps} 
        icon="📝" 
        colorClass="text-[#f8ed1a]" 
      />

      <PropertySection 
        title="Sold History" 
        items={soldProps} 
        icon="💰" 
        colorClass="text-red-500" 
      />

      <PropertySection 
        title="Rented History" 
        items={rentedProps} 
        icon="🏠" 
        colorClass="text-purple-400" 
      />

      <PropertySection 
        title="Drafts" 
        items={draftProps} 
        icon="✏️" 
        colorClass="text-orange-400" 
      />
    </div>
  );
}