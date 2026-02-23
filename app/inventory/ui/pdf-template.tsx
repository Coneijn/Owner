'use client';

import { forwardRef } from 'react';

interface PdfTemplateProps {
  properties: any[];
  lang: string;
}

const calculateEstimatedPayment = (price: any, downPayment: any, annualTaxes: any, annualInsurance: any, interestRate: any) => {
    const safePrice = Number(price) || 0;
    const safeDown = Number(downPayment) || 0;
    const safeTaxes = Number(annualTaxes) || 0;
    const safeInsurance = Number(annualInsurance) || 0;
    const safeInterest = Number(interestRate) || 0;

    const loanAmount = safePrice - safeDown;
    const monthlyRate = safeInterest / 100 / 12;
    const numberOfPayments = 30 * 12; 
  
    let principalAndInterest = 0;
    if (monthlyRate > 0 && loanAmount > 0) {
      principalAndInterest = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    } else if (loanAmount > 0) {
      principalAndInterest = loanAmount / numberOfPayments;
    }
  
    return principalAndInterest + (safeTaxes / 12) + (safeInsurance / 12) + 39; 
};

const chunkArray = (array: any[], size: number) => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

// TRUCO MAESTRO: Variamos la calidad (q) entre 70 y 89 usando el índice.
// Next.js lo acepta, y la librería creerá que son imágenes distintas, evitando la duplicación.
const getProxiedUrl = (url: string, indexOffset: number = 0, width: number = 1080) => {
  if (!url) return null;
  if (url.startsWith('/')) return url;
  const q = 70 + (indexOffset % 20); 
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${q}`;
};

export const PdfTemplate = forwardRef<HTMLDivElement, PdfTemplateProps>(
  ({ properties, lang }, ref) => {
    
    const today = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const t = {
        title: lang === 'en' ? 'Selected Inventory' : 'Inventario Seleccionado',
        price: lang === 'en' ? 'Total Price' : 'Precio Total',
        down: lang === 'en' ? 'Down Pmt' : 'Enganche',
        monthly: lang === 'en' ? 'Est. Monthly' : 'Mensualidad',
        beds: lang === 'en' ? 'Beds' : 'Hab',
        baths: lang === 'en' ? 'Baths' : 'Baños',
        contact: lang === 'en' ? 'Contact' : 'Contacto',
    };

    const pages = chunkArray(properties, 4);

    return (
      <div className="absolute left-[-9999px] top-0 bg-gray-100" ref={ref}>
        {pages.map((pageProperties, pageIndex) => {
          
          const count = pageProperties.length;
          let gridClass = "grid-cols-2 grid-rows-2";
          if (count === 1) gridClass = "grid-cols-1 grid-rows-1";
          if (count === 2) gridClass = "grid-cols-1 grid-rows-2";

          return (
            <div 
              key={pageIndex} 
              className="pdf-page bg-white flex flex-col"
              style={{ width: '794px', height: '1123px', padding: '40px', boxSizing: 'border-box' }}
            >
              
              <div className="flex justify-between items-end border-b-4 border-[#529e14] pb-4 mb-6 shrink-0 h-[80px]">
                <div className="flex items-center gap-3">
                  <div className="w-[50px] h-[50px] bg-black rounded-full flex items-center justify-center border-[3px] border-[#f8ed1a]">
                    <span className="text-[#f8ed1a] font-black text-[14px] leading-none text-center">D2D</span>
                  </div>
                  <h1 className="text-[32px] font-black uppercase tracking-tighter text-black">
                    Dueño a <span className="text-[#f8ed1a] px-1 bg-black">Dueño</span>
                  </h1>
                </div>
                <div className="text-right">
                  <h2 className="text-[20px] font-bold text-gray-800 uppercase tracking-widest leading-none mb-1">
                    {t.title}
                  </h2>
                  <p className="text-[14px] text-gray-500 font-medium">{today}</p>
                </div>
              </div>

              <div className={`flex-1 grid ${gridClass} gap-[24px] min-h-0`}>
                {pageProperties.map((property, index) => {
                  const displayTitle = lang === 'es' ? property.titleEs : property.titleEn;
                  const formatMoney = (val: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(val) || 0);
                  
                  const monthlyPayment = calculateEstimatedPayment(property.price, property.downPayment, property.taxes, property.insurance, property.interestRate);
                  const sellerName = property.sellerProfile?.sellerName || "Dueño a Dueño Team";
                  const sellerPhone = property.phoneNumber || "901-660-4115";

                  const isTopHalfInThree = count === 3 && index === 0;
                  const isWide = count === 1 || count === 2 || isTopHalfInThree;
                  
                  const spanClass = isTopHalfInThree ? "col-span-2 row-span-1" : "col-span-1 row-span-1";
                  
                  // Ya NO hacemos la imagen más grande en tarjetas anchas. Mantenemos 38% para asegurar el espacio de texto.
                  const imgHeightClass = "h-[38%]"; 
                  const titleSize = isWide ? "text-[22px]" : "text-[18px]";

                  return (
                    <div key={property.id} className={`border-[2px] border-gray-200 rounded-[12px] overflow-hidden shadow-sm flex flex-col h-full bg-white ${spanClass}`}>
                      
                      <div className={`relative ${imgHeightClass} w-full bg-gray-100 border-b-[4px] border-[#f8ed1a] shrink-0`}>
                        {property.mainImage ? (
                          <img 
                            key={`main-${property.id}`} 
                            src={getProxiedUrl(property.mainImage, index)!} 
                            alt={displayTitle} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[40px]">🏠</div>
                        )}
                        <div className="absolute bottom-[10px] left-[15px] bg-black/80 text-white px-[12px] py-[4px] rounded font-black text-[22px] shadow-lg">
                          {formatMoney(property.price)}
                        </div>
                      </div>
                      
                      {/* Reducimos ligeramente el padding interno para asegurar que nada rebase */}
                      <div className="p-[16px] flex flex-col flex-1 min-h-0 justify-between">
                        
                        <div className="shrink-0 mb-[8px]">
                          <h3 className={`font-black text-gray-900 ${titleSize} line-clamp-1 uppercase tracking-tight leading-tight`}>{displayTitle}</h3>
                          <p className="text-[13px] text-gray-600 mt-[4px] font-medium truncate">{property.address}</p>
                        </div>
                        
                        <div className="bg-gray-50 border-[1px] border-gray-200 rounded-[8px] p-[8px] flex justify-between items-center shrink-0 mb-[8px]">
                            <div className="text-center w-1/3">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">{t.price}</p>
                                <p className="text-[15px] font-black text-gray-900 leading-tight">{formatMoney(property.price)}</p>
                            </div>
                            <div className="text-center w-1/3 border-x-[1px] border-gray-200">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">{t.down}</p>
                                <p className="text-[15px] font-black text-[#529e14] leading-tight">{formatMoney(property.downPayment)}</p>
                            </div>
                            <div className="text-center w-1/3">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">{t.monthly}</p>
                                <p className="text-[15px] font-black text-blue-600 leading-tight">{formatMoney(monthlyPayment)}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center border-b-[1px] border-gray-200 pb-[8px] text-[16px] font-bold text-gray-800 px-[10px] shrink-0">
                          <div className="flex items-center gap-[4px]">
                            <span>🛏️ {property.bedrooms}</span>
                            <span className="text-[10px] uppercase text-gray-500">{t.beds}</span>
                          </div>
                          <div className="flex items-center gap-[4px]">
                            <span>🛁 {property.bathrooms}</span>
                            <span className="text-[10px] uppercase text-gray-500">{t.baths}</span>
                          </div>
                          <div className="flex items-center gap-[4px]">
                            <span>📐 {property.sqft}</span>
                            <span className="text-[10px] uppercase text-gray-500">Sqft</span>
                          </div>
                        </div>

                        {/* Contacto del Propietario (Ahora con espacio garantizado y offset para la foto) */}
                        <div className="mt-auto flex items-center gap-[12px] pt-[8px] shrink-0">
                          <div className="w-[36px] h-[36px] rounded-full overflow-hidden bg-white border-[1px] border-gray-300 flex-shrink-0">
                            {property.sellerProfile?.sellerImage ? (
                              <img 
                                key={`seller-${property.id}`} 
                                src={getProxiedUrl(property.sellerProfile.sellerImage, index + 20, 96)!} 
                                alt="Seller" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[18px]">👤</div>
                            )}
                          </div>
                          <div className="flex flex-col justify-center">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-[4px]">{t.contact}</p>
                            <p className="text-[15px] font-black text-gray-900 leading-none">{sellerName}</p>
                            <p className="text-[13px] text-[#529e14] font-bold mt-[4px] leading-none">📞 {sellerPhone}</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-3 border-t-2 border-gray-200 text-center text-[12px] font-bold text-gray-400 uppercase tracking-widest shrink-0 h-[30px] flex items-center justify-center">
                  www.ownertodueno.com • Memphis, TN
              </div>

            </div>
          );
        })}
      </div>
    );
  }
);

PdfTemplate.displayName = 'PdfTemplate';