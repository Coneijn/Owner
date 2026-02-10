'use client';

import { useRef } from 'react';

interface GHLFormEmbedProps {
  src: string;
  height?: string;
}

export default function GHLFormEmbed({ src, height = "800px" }: GHLFormEmbedProps) {
  return (
    <div className="w-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      <iframe
        src={src}
        style={{
          width: '100%',
          height: height,
          border: 'none',
          overflow: 'hidden',
        }}
        id="ghl-form-iframe"
        title="Formulario GHL"
        scrolling="yes" 
      />
    </div>
  );
}