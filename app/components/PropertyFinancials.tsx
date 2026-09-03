'use client';

import MortgageCalculator from './MortgageCalculator';
import RentInfo from './RentInfo';

interface PropertyFinancialsProps {
  property: {
    price?: number | null;
    downPayment?: number | null;
    interestRate?: number | null;
    taxes?: number | null;
    insurance?: number | null;
    isForSale?: boolean;
    isForRent?: boolean;
    monthlyRent?: number | null;
    securityDeposit?: number | null;
  };
  lang: 'es' | 'en';
  // NUEVO: Recibe la pestaña activa desde afuera (ej. desde la URL o un componente padre)
  activeTab?: 'SALE' | 'RENT';
}

export default function PropertyFinancials({ property, lang, activeTab }: PropertyFinancialsProps) {
  
  // Deducimos qué mostrar si no nos pasan la prop explícitamente.
  // Por defecto será SALE (si está a la venta), de lo contrario RENT.
  const currentMode = activeTab || (property.isForSale ? 'SALE' : 'RENT');

  return (
    <div className="space-y-6">
      
      {/* 
        LAS PESTAÑAS (TABS) SE ELIMINARON DE AQUÍ.
        Ahora se controlan desde arriba (debajo del título principal de la propiedad).
      */}

      {/* CASO: MOSTRAR VENTA */}
      {property.isForSale && currentMode === 'SALE' && (
        <div className="animate-in fade-in duration-300">
          <MortgageCalculator
            price={Number(property.price) || 0}
            defaultDownPayment={Number(property.downPayment) || 0}
            interestRate={Number(property.interestRate) || 0}
            taxes={Number(property.taxes) || 0}
            insurance={Number(property.insurance) || 0}
            lang={lang}
          />
        </div>
      )}

      {/* CASO: MOSTRAR RENTA */}
      {property.isForRent && currentMode === 'RENT' && (
        <div className="animate-in fade-in duration-300">
          <RentInfo
            monthlyRent={Number(property.monthlyRent)}
            securityDeposit={Number(property.securityDeposit)}
            lang={lang}
          />
        </div>
      )}

    </div>
  );
}