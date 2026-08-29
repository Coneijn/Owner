'use client';

import { useState } from 'react';
import Link from 'next/link';

// Usando el mismo estilo colapsable de PropertySection en dashboard-client.tsx
const SeoPropertySection = ({ title, items, icon, colorClass }: any) => {
  const [isOpen, setIsOpen] = useState(true);

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
                  <th className="px-6 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Images</th>
                  <th className="px-6 py-3 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Missing Alt Text</th>
                  <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
                {items.map((property: any) => {
                  const totalImages = property.images.length;
                  const missingCount = property.images.filter((img: any) => !img.altText || img.altText.trim() === '').length;

                  return (
                    <tr key={property.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-white truncate max-w-[300px]">
                          {property.titleEn || 'Untitled Property'}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[300px]">
                          {property.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="font-mono text-gray-300">{totalImages}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {missingCount > 0 ? (
                          <span className="bg-red-900/30 text-red-400 border border-red-800/50 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            {missingCount} missing
                          </span>
                        ) : (
                          <span className="bg-[#529e14]/20 text-[#529e14] border border-[#529e14]/30 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            0 missing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/image-seo/${property.id}`} className="text-blue-400 hover:text-blue-300 font-bold uppercase text-[10px] tracking-wide">
                          EDIT SEO & MEDIA
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SeoImagesClient({ properties }: { properties: any[] }) {
  const [filter, setFilter] = useState<'AVAILABLE' | 'HISTORICAL'>('AVAILABLE');

  // 1. Primero filtramos por el estado de la propiedad
  const displayedProperties = properties.filter((p) => 
    filter === 'AVAILABLE' ? p.status === 'AVAILABLE' : p.status !== 'AVAILABLE'
  );

  // 2. Filtramos las incompletas sobre la lista ya reducida
  const missingAltProperties = displayedProperties
    .filter(
      (p) => p.images.length > 0 && p.images.some((img: any) => !img.altText || img.altText.trim() === '')
    )
    .sort((a, b) => {
      const missingA = a.images.filter((img: any) => !img.altText || img.altText.trim() === '').length;
      const missingB = b.images.filter((img: any) => !img.altText || img.altText.trim() === '').length;
      return missingA - missingB;
    });

  // 3. Filtramos las completas sobre la lista ya reducida
  const completeAltProperties = displayedProperties.filter(
    (p) => p.images.length > 0 && p.images.every((img: any) => img.altText && img.altText.trim() !== '')
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* TABS DE FILTRADO */}
      <div className="flex gap-6 border-b border-gray-800">
        <button
          onClick={() => setFilter('AVAILABLE')}
          className={`px-2 py-4 text-sm font-black uppercase tracking-wider transition-all duration-200 ${
            filter === 'AVAILABLE'
              ? 'text-[#f8ed1a] border-b-2 border-[#f8ed1a]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Available Properties
        </button>
        <button
          onClick={() => setFilter('HISTORICAL')}
          className={`px-2 py-4 text-sm font-black uppercase tracking-wider transition-all duration-200 ${
            filter === 'HISTORICAL'
              ? 'text-[#f8ed1a] border-b-2 border-[#f8ed1a]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Historical (Sold / Rented / Drafts)
        </button>
      </div>
      <SeoPropertySection 
        title="Action Required: Missing Alt Text" 
        items={missingAltProperties} 
        icon="⚠️" 
        colorClass="text-red-500" 
      />
      
      <SeoPropertySection 
        title="Fully Optimized Properties" 
        items={completeAltProperties} 
        icon="✅" 
        colorClass="text-[#529e14]" 
      />
    </div>
  );
}