'use client';

import { useState, useEffect } from 'react';

// 1. Definimos la interfaz basada en tu JSON
interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
  owner_response?: string;
  owner_response_date?: string;
}

interface TestimonialsProps {
  reviews: Review[];
  lang?: 'en' | 'es';
}

const DICTIONARY = {
  en: {
    chip: "Real Seller Stories",
    title: "Don't just take our word for it",
    subtitle: "See what homeowners, investors, and landlords have to say about working with us.",
    ownerReply: "Response from the owner",
    readMore: "Read more",
    readLess: "Show less"
  },
  es: {
    chip: "Historias Reales de Vendedores",
    title: "No te quedes solo con nuestra palabra",
    subtitle: "Mira lo que dicen propietarios, inversionistas y arrendadores sobre trabajar con nosotros.",
    ownerReply: "Respuesta del propietario",
    readMore: "Leer más",
    readLess: "Mostrar menos"
  }
};

export default function Testimonials({ reviews, lang = 'en' }: TestimonialsProps) {
  const [randomReviews, setRandomReviews] = useState<Review[]>([]);
  const t = DICTIONARY[lang];

  // 2. Lógica para seleccionar 3 reseñas al azar de forma segura en el cliente
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      // Hacemos una copia del arreglo para no mutar el original
      const shuffled = [...reviews].sort(() => 0.5 - Math.random());
      // Tomamos los primeros 3 (o menos si el arreglo tiene menos de 3)
      setRandomReviews(shuffled.slice(0, 3));
    }
  }, [reviews]);

  // Función para renderizar las estrellas doradas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  // Función para limpiar etiquetas HTML (como <br>) del texto y limitar longitud
  const ReviewText = ({ text }: { text: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const cleanText = text.replace(/<br\s*\/?>/gi, '\n');
    const isLong = cleanText.length > 200;

    return (
      <div className="mb-6">
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
          {isExpanded || !isLong ? cleanText : `${cleanText.substring(0, 200)}...`}
        </p>
        {isLong && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-green-400 hover:text-green-300 text-xs font-bold mt-2 transition-colors"
          >
            {isExpanded ? t.readLess : t.readMore}
          </button>
        )}
      </div>
    );
  };

  if (randomReviews.length === 0) return null; // No renderizar si no hay datos

  return (
    <section className="py-20 bg-[#1a1a1a] relative z-10 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-yellow-900/30 border border-yellow-700/50 text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4">
            {t.chip}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            {t.title}
          </h2>
          <p className="text-lg text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Grid de Reseñas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {randomReviews.map((review, idx) => {
            // Formatear la fecha (ej: "Oct 12, 2025")
            const formattedDate = new Date(review.date).toLocaleDateString(
              lang === 'es' ? 'es-ES' : 'en-US', 
              { year: 'numeric', month: 'short', day: 'numeric' }
            );

            return (
              <div key={idx} className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8 flex flex-col hover:border-gray-700 transition-colors shadow-xl">
                
                {/* Cabecera de la reseña: Avatar, Nombre, Fecha */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-700">
                      {review.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-white font-bold">{review.author}</h4>
                      <p className="text-xs text-gray-500">{formattedDate}</p>
                    </div>
                  </div>
                  {/* Ícono de Google */}
                  <div className="w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                </div>

                {/* Estrellas */}
                <div className="flex mb-4">
                  {renderStars(review.rating)}
                </div>

                {/* Texto de la reseña */}
                <div className="flex-grow">
                  <ReviewText text={review.text} />
                </div>

                {/* Respuesta del Propietario (Opcional) */}
                {review.owner_response && (
                  <div className="mt-6 bg-[#232323] rounded-lg p-4 border border-gray-800 border-l-4 border-l-green-500">
                    <p className="text-xs font-bold text-gray-400 mb-2 uppercase">{t.ownerReply}</p>
                    <p className="text-xs text-gray-500 italic whitespace-pre-line">
                       "{review.owner_response.replace(/<br\s*\/?>/gi, '\n')}"
                    </p>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}