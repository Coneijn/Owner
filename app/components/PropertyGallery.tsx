'use client';

import { useState } from 'react';

interface GalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: GalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      {/* Imagen Principal Grande */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-xl overflow-hidden shadow-lg h-96 relative">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600?text=No+Image'; }}
        />
      </div>

      {/* Tira de Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img ? 'border-blue-600 opacity-100 ring-2 ring-blue-200' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}