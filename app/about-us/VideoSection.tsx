// app/about-us/VideoSection.tsx
'use client';

import { useState } from 'react';

// Actualizamos la interfaz del estado para que acepte modalTitle
type VideoItem = {
  title: string;
  modalTitle: string;
  url: string;
};

const VIDEOS: Record<'en' | 'es', VideoItem[]> = {
  en: [
    { 
      title: "About the house", 
      modalTitle: "The condition of the house (Why it's sold as-is)",
      url: "https://drive.google.com/file/d/1kSPmyUgKSldw_iaQ2FVzeb0JvhpQyu9C/preview" 
    },
    { 
      title: "The Down Payment", 
      modalTitle: 'The "High Down Payment" Objection',
      url: "https://drive.google.com/file/d/17qUcf_49Ko0hMfkSgRnfHOBt7zqRA7jy/preview" 
    },
    { 
      title: "Documents needed", 
      modalTitle: "What documents do I need to apply for one of your homes?",
      url: "https://drive.google.com/file/d/1EWiHg24qYlvYao3AKx46wZqmRrNZw9Z-/preview" 
    },
    { 
      title: "Payment terms differences", 
      modalTitle: "What's the difference between a 15, 20, or 30-year term?",
      url: "https://drive.google.com/file/d/1sRRsku_H9zzJzOlBifmOtryGWikuBc5F/preview" 
    },
    { 
      title: "Monthly payments", 
      modalTitle: "Why are the monthly payments higher than with a traditional bank?",
      url: "https://drive.google.com/file/d/1g8SdsNVyj1jF0bXcSMXRMPpgdnoSqp9C/preview" 
    },
    { 
      title: "Total price", 
      modalTitle: "Why the total price looks higher (and why that's not the real cost)",
      url: "https://drive.google.com/file/d/1OsGMS0Q_jSWaGDX1NQ-2N2_NKvoYNj5a/preview" 
    }
  ],
  es: [
    { 
      title: "Sobre los plazos", 
      modalTitle: "¿Cuál es la diferencia entre un plazo de 15, 20 o 30 años?",
      url: "https://drive.google.com/file/d/1TuHr_jQL1i5kzHQkcAnZSqBD3pID2M6s/preview" 
    },
    { 
      title: "Sobre las mensualidades", 
      modalTitle: "¿Por qué los pagos mensuales son más altos que con un banco tradicional?",
      url: "https://drive.google.com/file/d/18ywsTtYjnvblKvJEaXl2jHfFHcN8DW_0/preview" 
    },
    { 
      title: "Documentos necesarios para aplicar", 
      modalTitle: "¿Qué documentos necesito para aplicar a una de sus casas?",
      url: "https://drive.google.com/file/d/100irHuhXFa6_8rlt5_kTPLcv1asaffWw/preview" 
    },
    { 
      title: "Sobre las casas", 
      modalTitle: "La condición de la casa (por qué se vende tal como está)",
      url: "https://drive.google.com/file/d/1Vx31NlL8WC0Y1oDqt1E5dY8KTwRkp5NZ/preview" 
    },
    { 
      title: "El enganche", 
      modalTitle: 'La objeción del "enganche alto"',
      url: "https://drive.google.com/file/d/1AoWpxtbcDLpy6cxOrvu3zWyKJoZc0_FW/preview" 
    },
    { 
      title: "Sobre el precio", 
      modalTitle: "Por qué el precio total se ve más alto (y lo que realmente significa)",
      url: "https://drive.google.com/file/d/1ok9f6FBCE5RIH3UC5biGBSMxKn_EyM3I/preview" 
    }
  ]
};

const TEXTS = {
  en: { title: "LEARN MORE ABOUT OUR PROCESS" },
  es: { title: "APRENDE MÁS SOBRE NUESTRO PROCESO" }
};

export default function VideoSection({ lang }: { lang: 'en' | 'es' }) {
  // Ahora el estado acepta el tipo VideoItem que incluye modalTitle
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const currentVideos = VIDEOS[lang];
  const t = TEXTS[lang];

  return (
    <>
      {/* SECCIÓN DE BOTONES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-black text-center text-white uppercase mb-12">
          {t.title}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {currentVideos.map((video, idx) => (
            <button
              key={idx}
              onClick={() => setActiveVideo(video)}
              className="group flex items-center justify-between p-5 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-[#f8ed1a] hover:bg-gray-800 transition-all shadow-lg text-left"
            >
              {/* Aquí seguimos mostrando el title corto para el botón */}
              <span className="text-sm font-bold text-white uppercase tracking-wide group-hover:text-[#f8ed1a] transition-colors pr-4">
                {video.title}
              </span>
              <div className="w-10 h-10 flex-shrink-0 bg-[#529e14] group-hover:bg-[#f8ed1a] rounded-full flex items-center justify-center transition-colors">
                {/* Icono de Play */}
                <svg className="w-4 h-4 text-white group-hover:text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* MODAL ÚNICO Y DINÁMICO */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          
          <div className="relative w-full max-w-5xl bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
              {/* CAMBIO: Aquí ahora mostramos el modalTitle para que sea el título largo */}
              <h3 className="text-[#f8ed1a] font-black uppercase tracking-wide">
                {activeVideo.modalTitle}
              </h3>
              <button 
                onClick={() => setActiveVideo(null)}
                className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                title="Cerrar video"
              >
                ✕
              </button>
            </div>

            {/* Contenedor del Iframe de Google Drive */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={activeVideo.url}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                // CAMBIO: Actualizamos el title del iframe también
                title={activeVideo.modalTitle}
              ></iframe>
            </div>
            
          </div>
          
          {/* Clic en el fondo oscuro para cerrar */}
          <div className="absolute inset-0 -z-10" onClick={() => setActiveVideo(null)}></div>
        </div>
      )}
    </>
  );
}