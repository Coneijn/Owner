'use client';

import { useState } from 'react';
import Link from 'next/link'; // <-- NUEVO: Importamos Link

// Utilidad para formatear moneda
const formatMoney = (amount: number | null | undefined) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardVendedorClient({ properties }: { properties: any[] }) {
  const [activeTab, setActiveTab] = useState('All');

  // --- LÓGICA DE PESTAÑAS Y FILTROS ---
  const tabs = [
    { id: 'All', label: `All (${properties.length})` },
    { id: 'Renting', label: `Renting (${properties.filter(p => p.isForRent && p.status !== 'AVAILABLE').length})` },
    { id: 'Available', label: `Available (${properties.filter(p => p.status === 'AVAILABLE').length})` },
    { id: 'Pending', label: `Pending (${properties.filter(p => p.status === 'UNDER_CONTRACT').length})` },
    { id: 'Sold', label: `Sold (${properties.filter(p => p.status === 'SOLD').length})` },
  ];

  const filteredProperties = properties.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Renting') return p.isForRent && p.status !== 'AVAILABLE';
    if (activeTab === 'Available') return p.status === 'AVAILABLE';
    if (activeTab === 'Pending') return p.status === 'UNDER_CONTRACT';
    if (activeTab === 'Sold') return p.status === 'SOLD';
    return true;
  });

  return (
    <div>
      {/* NAVEGACIÓN DE PESTAÑAS */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 border-b border-gray-800 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[#f8ed1a] text-black shadow-lg shadow-[#f8ed1a]/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* GRID DE PROPIEDADES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No properties found in this category.
          </div>
        ) : (
          filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))
        )}
      </div>
    </div>
  );
}

// --- COMPONENTE DE TARJETA INDIVIDUAL ---
function PropertyCard({ property }: { property: any }) {
  // Cálculos de la tarjeta
  const collected = property.downPayment || 0;
  const balance = (property.price || 0) - collected;
  const monthlyPmt = property.monthlyRent || 0;
  
  // Determinamos el color y etiqueta del estado
  let statusColor = 'bg-gray-800 text-gray-300';
  let statusText = property.status;

  if (property.status === 'AVAILABLE') {
    statusColor = 'bg-[#529e14]/20 text-[#529e14] border-[#529e14]/30';
    statusText = 'Available';
  } else if (property.status === 'UNDER_CONTRACT') {
    statusColor = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    statusText = 'Pending';
  } else if (property.status === 'SOLD') {
    statusColor = 'bg-[#f8ed1a]/20 text-[#f8ed1a] border-[#f8ed1a]/30';
    statusText = 'Sold';
  }

  if (property.isForRent && property.status !== 'AVAILABLE') {
    statusColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    statusText = 'Renting';
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6 flex flex-col justify-between hover:border-gray-700 transition-colors relative group">
      
      {/* Info Principal con el botón de edición */}
      <div className="mb-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-white truncate" title={property.address}>
              {property.address}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {property.city}, {property.state} {property.zipCode}
            </p>
          </div>
          
          {/* NUEVO: Botón de Editar */}
          <Link
            href={`/sellerDashboard/properties/${property.id}/edit`} // <-- Asegúrate de que esta ruta sea la correcta en tu app
            className="p-2 bg-gray-800/80 hover:bg-[#f8ed1a] text-gray-400 hover:text-black rounded-lg transition-all duration-200 border border-gray-700 hover:border-[#f8ed1a] flex-shrink-0"
            title="Editar Propiedad"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </Link>
        </div>
        
        {/* Placeholder para el Cliente */}
        <div className="flex items-center gap-2 bg-black/40 p-3 rounded border border-gray-800/50">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">👤</div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Client</p>
            <p className="text-sm font-medium text-gray-300">
              {property.status === 'AVAILABLE' ? '—' : 'Pending Assignment'}
            </p>
          </div>
        </div>
      </div>

      {/* Finanzas */}
      <div className="grid grid-cols-3 gap-2 mb-6 bg-black/50 p-4 rounded-lg border border-gray-800">
        {property.status === 'AVAILABLE' ? (
           <div className="col-span-3 text-center py-2">
             <p className="text-3xl font-black text-white">{formatMoney(property.price)}</p>
             <p className="text-xs text-gray-500 uppercase font-bold mt-1">Sale / List Price</p>
           </div>
        ) : (
           <>
            <div className="text-center">
              <p className="text-lg font-black text-white">{formatMoney(monthlyPmt)}<span className="text-xs font-normal text-gray-500">/mo</span></p>
              <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Monthly Pmt</p>
            </div>
            <div className="text-center border-l border-gray-800">
              <p className="text-lg font-black text-[#529e14]">{formatMoney(collected)}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Collected</p>
            </div>
            <div className="text-center border-l border-gray-800">
              <p className="text-lg font-black text-red-400">{formatMoney(balance)}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Balance</p>
            </div>
           </>
        )}
      </div>

      {/* Botón / Estado Inferior */}
      <button className={`w-full py-2 rounded font-bold text-sm uppercase tracking-wide border transition-colors flex justify-center items-center gap-2 ${statusColor} hover:bg-opacity-30`}>
        {statusText} <span>▼</span>
      </button>

    </div>
  );
}