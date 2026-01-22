'use client';

import { useState } from 'react';
import Link from 'next/link';
import PropertyImage from './PropertyImage'; 

// --- CONSTANTES ---
const DEFAULT_TERM_YEARS = 30;
const SERVICE_FEE = 39;

// --- HELPERS ---
const calculateEstimatedPayment = (
  price: number,
  downPayment: number,
  annualTaxes: number,
  annualInsurance: number,
  interestRate: number
) => {
  const loanAmount = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = DEFAULT_TERM_YEARS * 12;

  let principalAndInterest = 0;
  if (monthlyRate > 0) {
    principalAndInterest =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  } else {
    principalAndInterest = loanAmount / numberOfPayments;
  }

  const monthlyTaxes = annualTaxes / 12;
  const monthlyInsurance = annualInsurance / 12;

  return principalAndInterest + monthlyTaxes + monthlyInsurance + SERVICE_FEE;
};

const formatMoney = (amount: number | unknown) => {
  const value = Number(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

interface PropertiesCarouselProps {
  properties: any[];
  t: any;
  lang: string;
}

export default function PropertiesCarousel({ properties, t, lang }: PropertiesCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3; // 2 filas de 3 columnas

  // Calcular número total de páginas
  const totalPages = Math.ceil(properties.length / itemsPerPage);

  // Obtener las propiedades visibles actuales
  const startIndex = currentPage * itemsPerPage;
  const currentProperties = properties.slice(startIndex, startIndex + itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-20 bg-black/10 rounded-xl border-2 border-dashed border-black/20">
        <p className="text-[#1a1a1a] text-xl font-bold">{t.noResults}</p>
      </div>
    );
  }

  return (
    <div>
      {/* GRID DE PROPIEDADES (Máximo 6) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]">
        {currentProperties.map((property) => {
          const estimatedPayment = calculateEstimatedPayment(
            Number(property.price),
            Number(property.downPayment),
            Number(property.taxes),
            Number(property.insurance),
            Number(property.interestRate)
          );

          return (
            <div
              key={property.id}
              className="bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full animate-fadeIn"
            >
              <div className="relative h-64 bg-gray-800">
                <PropertyImage
                  src={property.mainImage || ''}
                  alt={lang === 'en' ? property.titleEn : property.titleEs}
                />
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded text-xs font-black uppercase tracking-wider shadow-sm ${
                    property.isOffMarket
                      ? 'bg-[#f8ed1a] text-[#1a1a1a]'
                      : 'bg-[#529e14] text-white'
                  }`}
                >
                  {property.isOffMarket
                    ? lang === 'en'
                      ? t.offMarket
                      : t.offMarket
                    : lang === 'en'
                    ? t.availability
                    : t.availability}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <h3
                    className="text-xl font-bold text-white line-clamp-2 leading-tight"
                    title={lang === 'en' ? property.titleEn : property.titleEs}
                  >
                    {lang === 'en' ? property.titleEn : property.titleEs}
                  </h3>
                  <div className="text-gray-400 text-sm mt-1 uppercase font-semibold tracking-wide">
                    {property.city}, {property.state}
                  </div>
                </div>

                <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                  <p className="text-gray-400 text-xs uppercase font-bold mb-1">
                    {t.monthlyPayment}
                  </p>
                  <p className="text-[#f8ed1a] text-3xl font-black tracking-tight">
                    {formatMoney(estimatedPayment)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-gray-700 pt-4 mb-6 text-center text-white">
                  <div>
                    <span className="block text-lg font-bold">{property.bedrooms}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {t.beds}
                    </span>
                  </div>
                  <div className="border-l border-gray-700">
                    <span className="block text-lg font-bold">{property.bathrooms}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      {t.baths}
                    </span>
                  </div>
                  <div className="border-l border-gray-700">
                    <span className="block text-lg font-bold">{property.sqft}</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                      Sqft
                    </span>
                  </div>
                </div>
                <div className="mt-auto space-y-3">
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <span>{t.totalPrice}:</span>
                    <span className="font-bold text-white">{formatMoney(property.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <span>{t.downPayment}:</span>
                    <span className="font-bold text-[#f8ed1a]">
                      {formatMoney(property.downPayment)}
                    </span>
                  </div>
                  <Link
                    href={`/propiedades/${property.slug}?lang=${lang}`}
                    className="block w-full text-center bg-[#529e14] text-white py-3 rounded-lg font-bold uppercase tracking-wide hover:bg-[#458510] transition-colors mt-4"
                  >
                    {t.details}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTROLES DEL CARRUSEL (Sin dependencias externas) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-6">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`p-4 rounded-full border-2 transition-all flex items-center justify-center ${
              currentPage === 0
                ? 'border-gray-400 text-gray-400 opacity-50 cursor-not-allowed'
                : 'border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f8ed1a] cursor-pointer'
            }`}
            aria-label="Página anterior"
          >
            {/* Icono Izquierda SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <span className="font-bold text-[#1a1a1a] text-lg">
            {currentPage + 1} / {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`p-4 rounded-full border-2 transition-all flex items-center justify-center ${
              currentPage === totalPages - 1
                ? 'border-gray-400 text-gray-400 opacity-50 cursor-not-allowed'
                : 'border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f8ed1a] cursor-pointer'
            }`}
            aria-label="Página siguiente"
          >
            {/* Icono Derecha SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}