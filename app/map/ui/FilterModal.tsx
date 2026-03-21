'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    beds: searchParams.get('beds') || '',
    baths: searchParams.get('baths') || '',
    sqft: searchParams.get('sqft') || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.replace(`?${params.toString()}`);
    onClose();
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['minPrice', 'maxPrice', 'beds', 'baths', 'sqft'].forEach(k => params.delete(k));
    setFilters({ minPrice: '', maxPrice: '', beds: '', baths: '', sqft: '' });
    router.replace(`?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121826] border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0a0f1c]">
          <h3 className="text-white font-black uppercase tracking-wide">Filters</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl">✕</button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold text-[#f8ed1a] uppercase mb-3">Price Range</label>
            <div className="flex gap-4 items-center">
              <input type="number" name="minPrice" placeholder="Min $" value={filters.minPrice} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-[#f8ed1a] outline-none" />
              <span className="text-gray-500">-</span>
              <input type="number" name="maxPrice" placeholder="Max $" value={filters.maxPrice} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-[#f8ed1a] outline-none" />
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Bedrooms (Min)</label>
              <select name="beds" value={filters.beds} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-[#f8ed1a] outline-none">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Bathrooms (Min)</label>
              <select name="baths" value={filters.baths} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-[#f8ed1a] outline-none">
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </div>
          </div>

          {/* Sqft */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Square Feet (Min)</label>
            <input type="number" name="sqft" placeholder="e.g. 1000" value={filters.sqft} onChange={handleChange} className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-white text-sm focus:border-[#f8ed1a] outline-none" />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-[#0a0f1c] flex gap-3">
          <button onClick={clearFilters} className="flex-1 py-3 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase text-xs">Clear All</button>
          <button onClick={applyFilters} className="flex-1 py-3 bg-[#f8ed1a] hover:bg-[#e6db15] text-black rounded-lg font-black uppercase text-xs tracking-wide shadow-lg transition-transform hover:scale-105">Show Results</button>
        </div>
      </div>
    </div>
  );
}