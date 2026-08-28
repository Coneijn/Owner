'use client';

import { useState } from 'react';
import Link from 'next/link';

// Componente de tabla reutilizable adaptado a tu estilo
const PropertyImageTable = ({ items }: { items: any[] }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-[#1a1a1a] border border-dashed border-gray-700 rounded-xl mt-6">
        <p className="text-gray-500 text-lg">No properties found in this view.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-xl mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Property</th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-center text-[10px] font-black text-[#f8ed1a] uppercase tracking-widest">Image Count</th>
              <th className="px-6 py-3 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-[#1a1a1a]">
            {items.map((property) => {
              const imageCount = property.images ? property.images.length : 0;
              
              // Alerta visual si tiene muy pocas imágenes (opcional, puedes ajustarlo)
              const countColor = imageCount === 0 
                ? 'bg-red-900/30 text-red-400 border-red-800/50' 
                : imageCount < 5 
                  ? 'bg-orange-900/30 text-orange-400 border-orange-800/50'
                  : 'bg-[#529e14]/20 text-[#529e14] border-[#529e14]/30';

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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded text-[11px] font-black tracking-wider border ${countColor}`}>
                      {imageCount} Images
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/properties/${property.id}/edit`} className="text-blue-400 hover:text-blue-300 font-bold uppercase text-[10px] tracking-wide">
                      EDIT MEDIA
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ImageListClient({ properties }: { properties: any[] }) {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  // 1. ORDENAMIENTO GLOBAL: De menor a mayor cantidad de imágenes
  const sortedProperties = [...properties].sort((a, b) => {
    const countA = a.images ? a.images.length : 0;
    const countB = b.images ? b.images.length : 0;
    return countA - countB; // Orden ascendente
  });

  // 2. FILTRADO: Solo las activas (AVAILABLE) basadas en la lista ya ordenada
  const activeProperties = sortedProperties.filter((p) => p.status === 'AVAILABLE');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* NAVEGACIÓN DE VISTAS (TABS) */}
      <div className="flex border-b border-gray-800 gap-6 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${
            activeTab === 'active'
              ? 'text-[#f8ed1a] border-b-2 border-[#f8ed1a]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Active Properties
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-500'}`}>
            {activeProperties.length}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-sm font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${
            activeTab === 'all'
              ? 'text-[#f8ed1a] border-b-2 border-[#f8ed1a]'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          All Properties
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-900 text-gray-500'}`}>
            {sortedProperties.length}
          </span>
        </button>
      </div>

      {/* RENDERIZADO CONDICIONAL DE LA TABLA */}
      {activeTab === 'active' && (
        <div className="animate-in fade-in duration-300">
          <PropertyImageTable items={activeProperties} />
        </div>
      )}

      {activeTab === 'all' && (
        <div className="animate-in fade-in duration-300">
          <PropertyImageTable items={sortedProperties} />
        </div>
      )}

    </div>
  );
}