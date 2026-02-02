'use client';

import { useState } from 'react';

// Función auxiliar para obtener ID de YouTube o Vimeo
function getEmbedUrl(url: string) {
  if (!url) return null;
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = url.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }

  // Vimeo
  const vimeoRegex = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return url; // Fallback por si es un link directo de mp4 u otro
}

export default function VideoModal({ videoUrl, label = "Watch Video Tour" }: { videoUrl: string, label?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const embedUrl = getEmbedUrl(videoUrl);

  if (!videoUrl) return null;

  return (
    <>
      {/* BOTÓN TRIGGER */}
      <button
        onClick={() => setIsOpen(true)}
        className="group relative inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg font-black uppercase tracking-wide shadow-lg transition-all transform hover:-translate-y-1"
      >
        <span className="text-xl">▶</span>
        <span>{label}</span>
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
        </span>
      </button>

      {/* MODAL OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            {/* Botón Cerrar */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors"
            >
              ✕
            </button>

            {/* IFRAME */}
            <iframe
              src={embedUrl || videoUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Property Video"
            ></iframe>
          </div>
          
          {/* Clic fuera para cerrar */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)}></div>
        </div>
      )}
    </>
  );
}