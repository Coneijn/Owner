'use client'; 

import { useState } from 'react';

export default function PropertyImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => {
        setImgSrc('https://placehold.co/600x400?text=No+Image');
      }}
    />
  );
}