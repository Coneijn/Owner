'use client';

import { useState } from 'react';
import Image from 'next/image'; 

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
        <Image
         
          key={activeImage} 
          src={activeImage}
          alt={title}
          fill
          priority 
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 800px"
        />
      </div>

      {/* Tira de Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img 
                  ? 'border-blue-600 opacity-100 ring-2 ring-blue-200' 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image 
                src={img} 
                alt={`Thumbnail ${idx}`} 
                fill
                className="object-cover"
                sizes="100px" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}