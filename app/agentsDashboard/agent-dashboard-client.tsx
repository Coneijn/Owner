"use client";
import {signOut } from "@/auth";
import React, { useState, useMemo } from 'react';
import { Search, Home, Flame, Clock, DollarSign, X, ExternalLink, Info, Target, Megaphone, MapPin } from 'lucide-react';

export default function AgentDashboardClient({ initialProps }: { initialProps: any[] }) {
  const [selectedProp, setSelectedProp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredProps = useMemo(() => {
    return initialProps.filter(p => 
      (p.city.toLowerCase().includes(searchTerm.toLowerCase()) || p.address.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || p.status === statusFilter)
    );
  }, [searchTerm, statusFilter, initialProps]);

  const totalCommission = useMemo(() => {
    const total = filteredProps.reduce((sum, p) => {
      if (p.commAmt && p.commAmt !== "N/A") {
        const numStr = p.commAmt.replace(/[^0-9.-]+/g,"");
        return sum + (Number(numStr) || 0);
      }
      return sum;
    }, 0);
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(total);
  }, [filteredProps]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-gray-200 font-sans">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 bg-[#1a1a1a] border-b border-gray-800 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-white text-xl font-black uppercase tracking-tight leading-none">
            Owner To <span className="text-[#f8ed1a]">Dueño</span>
          </span>
        </div>
        <div className="text-xs font-bold tracking-widest uppercase text-gray-500">
          Local Rep: <strong className="text-white">Test</strong>
        </div>
         
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Active Listings', value: filteredProps.length, icon: Home },
            { label: 'Hot Deals', value: filteredProps.filter(p => p.status === 'Hot').length, icon: Flame },
            { label: 'Available Comm.', value: totalCommission, icon: DollarSign },
            { label: 'Your Cut', value: '70%', icon: Target },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-900 overflow-hidden shadow-lg rounded-xl border border-gray-800 p-6 relative group hover:border-gray-700 transition-colors">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                  <div className="mt-1 text-3xl font-black text-[#f8ed1a]">{stat.value}</div>
                </div>
                <stat.icon size={24} className="text-gray-500 opacity-80" />
              </div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            Available <span className="text-[#f8ed1a]">Properties</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search city or address..." 
                value={searchTerm || ''} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] transition-all shadow-lg text-sm"
              />
            </div>
            <select 
              value={statusFilter || ''} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#1a1a1a] border border-gray-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-[#f8ed1a] focus:ring-1 focus:ring-[#f8ed1a] transition-all shadow-lg text-sm font-bold uppercase w-full sm:w-auto"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="Hot">Hot</option>
            </select>
          </div>
        </div>

        {/* PROPERTY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProps.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedProp(p)}
              className="group bg-[#242424] rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-[#f8ed1a] transition-all duration-300 hover:shadow-[0_0_20px_rgba(248,237,26,0.15)] flex flex-col cursor-pointer"
            >
              {/* CONTENEDOR DE LA IMAGEN */}
              <div className="h-48 w-full bg-gray-900 relative overflow-hidden border-b border-gray-800">
                {p.mainImage ? (
                  <img 
                    src={p.mainImage} 
                    alt={p.address} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gray-800 text-6xl">
                    {p.emoji}
                  </div>
                )}
                
                {/* ETIQUETA DE STATUS FLOTANTE */}
                <span className={`absolute top-3 right-3 text-[10px] font-black px-3 py-1 rounded uppercase shadow-md ${
                  p.status === 'Available' ? 'bg-[#529e14] text-white' : 
                  p.status === 'Hot' ? 'bg-red-600 text-white' : 
                  'bg-orange-500 text-white'
                }`}>
                  {p.status}
                </span>
              </div>

              {/* INFORMACIÓN DE LA TARJETA */}
              <div className="p-6 relative flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-white text-2xl uppercase tracking-tight">{p.price}</h3>
                    <div className="text-xs text-gray-400 font-bold tracking-wide uppercase mt-1">{p.address}</div>
                    <div className="text-xs text-gray-500">{p.city}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-gray-300 border-y border-gray-800 py-3 my-4">
                  <div className="flex items-center gap-1"><span className="text-[#f8ed1a]">🛏</span> {p.beds} Beds</div>
                  <div className="flex items-center gap-1"><span className="text-[#f8ed1a]">🛁</span> {p.baths} Baths</div>
                  <div className="flex items-center gap-1"><span className="text-[#f8ed1a]">📏</span> {p.sqft} sqft</div>
                </div>

                <div className="mt-auto bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Your Commission</div>
                  <div className="text-[#529e14] font-black text-xl flex items-center justify-between">
                    {p.commAmt} 
                    <span className="text-sm font-bold text-gray-400">{p.commPct}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProps.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl bg-white/5 mt-8">
            <p className="text-gray-500 font-bold uppercase tracking-widest">No properties found</p>
          </div>
        )}

        {/* MODAL */}
        {selectedProp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1a1a1a] border border-gray-700 w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{selectedProp.emoji}</span>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedProp.address}</h2>
                  </div>
                  <div className="text-sm text-gray-400 font-bold uppercase tracking-wide">{selectedProp.city}</div>
                </div>
                <button 
                  onClick={() => setSelectedProp(null)}
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
                <div className="flex border-b border-gray-800 bg-gray-900/50 px-6 sticky top-0 z-10 backdrop-blur overflow-x-auto no-scrollbar">
                  {['overview', 'commission', 'showing', 'buyers', 'marketing'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-black uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab 
                          ? 'border-[#f8ed1a] text-[#f8ed1a]' 
                          : 'border-transparent text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="p-6 min-h-[300px]">
                  
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Key Details</h4>
                          <div className="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700">
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm font-bold uppercase">Price</span>
                              <span className="text-white font-bold">{selectedProp.price}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm font-bold uppercase">Type</span>
                              <span className="text-white font-bold">{selectedProp.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm font-bold uppercase">Year Built</span>
                              <span className="text-white font-bold">{selectedProp.year}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400 text-sm font-bold uppercase">Condition</span>
                              <span className="text-white font-bold">{selectedProp.condition}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Property Highlights</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProp.highlights?.map((h: string, i: number) => (
                              <span key={i} className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded text-xs font-bold uppercase">
                                {h}
                              </span>
                            ))}
                            {(!selectedProp.highlights || selectedProp.highlights.length === 0) && (
                              <span className="text-gray-500 text-sm italic">No highlights provided.</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COMMISSION TAB */}
                  {activeTab === 'commission' && (
                    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
                      <div>
                        <h4 className="text-xs font-bold text-[#529e14] uppercase tracking-widest mb-3 flex items-center gap-2">
                          <DollarSign size={16} /> Commission Structure
                        </h4>
                        <div className="bg-[#529e14]/10 border border-[#529e14]/20 rounded-xl p-5 shadow-inner">
                          <div className="text-4xl font-black text-[#529e14] mb-1">{selectedProp.commAmt}</div>
                          <div className="text-sm font-bold text-[#529e14]/80 mb-4 uppercase tracking-wide">{selectedProp.commPct} of Sale Price</div>
                          {selectedProp.commNote && (
                            <div className="mt-4">
                              <div className="text-[10px] uppercase tracking-widest text-[#529e14] mb-2 font-bold">Important Notes</div>
                              <p className="text-sm text-gray-300 bg-gray-900/50 p-4 rounded border border-gray-800/50 leading-relaxed font-medium">
                                {selectedProp.commNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SHOWING TAB */}
                  {activeTab === 'showing' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-inner">
                        <h4 className="text-sm font-black text-[#f8ed1a] uppercase tracking-wide mb-4 flex items-center gap-2">
                          <MapPin size={18} /> Showing Instructions
                        </h4>
                        <div className="space-y-4">
                          {selectedProp.showingSteps?.map((step: string, i: number) => (
                            <div key={i} className="flex gap-4 items-start">
                              <div className="w-6 h-6 rounded-full bg-gray-900 border border-[#f8ed1a] text-[#f8ed1a] flex items-center justify-center text-xs font-black shrink-0 shadow-lg">
                                {i + 1}
                              </div>
                              <p className="text-sm text-gray-300 pt-0.5 leading-relaxed">{step}</p>
                            </div>
                          ))}
                          {(!selectedProp.showingSteps || selectedProp.showingSteps.length === 0) && (
                            <p className="text-gray-500 italic text-sm">No instructions provided.</p>
                          )}
                        </div>
                        {selectedProp.showingNotes && (
                          <div className="mt-6 bg-red-900/10 border border-red-900/50 p-4 rounded-lg flex gap-3 text-red-400 text-sm">
                            <Info size={18} className="shrink-0" />
                            <p className="font-medium">{selectedProp.showingNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* BUYERS TAB */}
                  {activeTab === 'buyers' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Target Audience</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedProp.buyerTags?.map((tag: string, i: number) => (
                              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center gap-2 shadow-sm hover:border-[#f8ed1a]/50 transition-colors">
                                <Target size={16} className="text-[#f8ed1a]" />
                                <span className="text-xs font-bold text-white uppercase tracking-wide">{tag}</span>
                              </div>
                            ))}
                            {(!selectedProp.buyerTags || selectedProp.buyerTags.length === 0) && (
                              <span className="text-gray-500 italic text-sm">No specific tags.</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Financial Requirements</h4>
                          
                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                            <div className="text-[10px] uppercase font-bold text-gray-500">Target Income</div>
                            <div className="font-black text-white text-sm tracking-wide">{selectedProp.buyerIncome || "N/A"}</div>
                          </div>
                          
                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                            <div className="text-[10px] uppercase font-bold text-gray-500">Target Credit</div>
                            <div className="font-black text-white text-sm tracking-wide">{selectedProp.buyerCredit || "N/A"}</div>
                          </div>

                          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                            <div className="text-[10px] uppercase font-bold text-gray-500">Eligible Financing</div>
                            <div className="font-black text-[#f8ed1a] uppercase text-sm tracking-wide">{selectedProp.buyerFinancing || "N/A"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MARKETING TAB */}
                  {activeTab === 'marketing' && (
                    <div className="animate-in fade-in duration-300 space-y-6">
                      {selectedProp.marketing?.length > 0 ? selectedProp.marketing.map((m: any, i: number) => (
                        <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
                          <h4 className="font-black text-xl text-[#f8ed1a] uppercase tracking-tight mb-3 flex items-center gap-2">
                            <Megaphone size={20} /> {m.title}
                          </h4>
                          <p className="text-sm text-gray-300 mb-5 leading-relaxed">{m.body}</p>
                          {m.script && (
                            <div className="relative">
                              <div className="absolute top-0 left-0 w-1 h-full bg-[#529e14] rounded-l"></div>
                              <div className="bg-gray-900 border border-gray-800 rounded p-5 pl-6 text-sm font-mono text-gray-400 whitespace-pre-wrap shadow-inner overflow-x-auto">
                                {m.script}
                              </div>
                            </div>
                          )}
                        </div>
                      )) : (
                        <div className="text-gray-500 font-bold uppercase tracking-widest text-sm text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                          No marketing materials available.
                        </div>
                      )}
                    </div>
                  )}
                </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}