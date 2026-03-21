'use client'; 

import { useState } from 'react';
import Image from 'next/image';

export default function PropertyImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill 
      className="object-cover" 
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onError={() => {
        setImgSrc('https://placehold.co/600x400?text=No+Image');
      }}
    />
  );
}