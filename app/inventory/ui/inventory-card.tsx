'use client';

import Image from 'next/image';

interface PropertyCardProps {
  property: any;
  isSelected: boolean;
  onToggle: (id: string) => void;
  lang: string;
  t: any;
}

export default function InventoryCard({ property, isSelected, onToggle, lang, t }: PropertyCardProps) {
  
  const isNew = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 14;
  };

  let badgeColor = 'bg-green-600 text-white'; 
  let badgeText = t.badges.available;
  let cardOpacity = 'opacity-100';

  if (property.status === 'SOLD') {
    badgeColor = 'bg-gray-600 text-gray-300';
    badgeText = t.badges.sold;
    cardOpacity = 'opacity-60 grayscale-[0.5]';
  } else if (isNew(property.createdAt) && property.status === 'AVAILABLE') {
    badgeColor = 'bg-blue-600 text-white';
    badgeText = t.badges.new;
  }

  const price = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    maximumFractionDigits: 0 
  }).format(Number(property.price));

  // Seleccionamos el título correcto
  const displayTitle = lang === 'es' ? property.titleEs : property.titleEn;

  return (
    <div 
      onClick={() => onToggle(property.id)}
      className={`group relative bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-[#f8ed1a] cursor-pointer ${isSelected ? 'ring-2 ring-[#f8ed1a]' : ''} ${cardOpacity}`}
    >
      <div className="absolute top-3 left-3 z-20">
        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#f8ed1a] border-[#f8ed1a]' : 'bg-black/50 border-white/50 group-hover:border-white'}`}>
          {isSelected && <span className="text-black font-bold text-sm">✓</span>}
        </div>
      </div>

      <div className={`absolute top-3 right-3 z-20 px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider shadow-sm ${badgeColor}`}>
        {badgeText}
      </div>

      <div className="relative h-48 w-full bg-gray-900">
        {property.mainImage ? (
          <Image src={property.mainImage} alt={displayTitle || 'Property image'} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 text-4xl">🏠</div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold truncate" title={displayTitle}>{displayTitle}</h3>
        <p className="text-gray-400 text-xs mt-1 truncate" title={property.address}>{property.address}</p>
        <p className="text-[#529e14] font-black text-lg mt-2">{price}</p>
      </div>
    </div>
  );
}