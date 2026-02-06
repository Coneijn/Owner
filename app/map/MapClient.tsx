'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useState } from 'react';

// --- SOLUCIÓN ERROR TYPESCRIPT Y ICONOS ---
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- DEFINICIÓN DE ICONOS ---

// Icono Normal (Reposo)
const defaultIcon = L.icon({
  iconUrl: '/frog-pin.png', 
  iconSize: [85, 85],     
  iconAnchor: [25, 50],   
  popupAnchor: [0, -55]   // Ajustado para que la burbuja salga bien encima
});

// Icono Seleccionado (Activo)
const selectedIcon = L.icon({
  iconUrl: '/frog-pin2.png', 
  iconSize: [85, 85],     
  iconAnchor: [25, 50],   
  popupAnchor: [0, -55]   
});

interface PropertyProps {
  id: string;
  title: string;
  address: string;
  price: number;
  slug: string;
  lat: number; 
  lng: number; 
}

export default function MapClient({ properties }: { properties: PropertyProps[] }) {
  
  // Estado para controlar qué marcador está activo
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const position: [number, number] = [35.1495, -90.0490]; // Memphis

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="h-full w-full z-0 relative">
      {/* ESTILOS PERSONALIZADOS PARA LEAFLET 
         Sobrescribimos las clases internas de Leaflet para dar el look de "Burbuja"
      */}
      <style jsx global>{`
        /* Caja principal del popup */
        .comic-popup .leaflet-popup-content-wrapper {
          background-color: #fdfae7; /* Fondo Crema */
          border: 3px solid #529e14; /* Borde Verde */
          border-radius: 24px;       /* Muy redondeado */
          box-shadow: 4px 4px 0px rgba(0,0,0,0.2); /* Sombra dura estilo cómic */
          padding: 0;
          overflow: hidden;
        }
        
        /* Contenedor interno del texto */
        .comic-popup .leaflet-popup-content {
          margin: 14px;
          line-height: 1.4;
        }

        /* La flechita (tip) de abajo */
        .comic-popup .leaflet-popup-tip {
          background-color: #fdfae7; /* Que coincida con el fondo */
          border: 1px solid #529e14; /* Un borde fino para que no se pierda */
        }
        
        /* Botón de cerrar (X) personalizado */
        .comic-popup .leaflet-popup-close-button {
          color: #529e14 !important;
          font-weight: bold;
          font-size: 18px !important;
        }
      `}</style>

      <MapContainer 
        center={position} 
        zoom={11} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => (
           (property.lat && property.lng) && (
            <Marker 
                key={property.id} 
                position={[property.lat, property.lng]}
                // CAMBIO DE ICONO: Si es el seleccionado, usa frog-pin2
                icon={selectedId === property.id ? selectedIcon : defaultIcon}
                
                eventHandlers={{
                    click: () => setSelectedId(property.id),
                    popupopen: () => setSelectedId(property.id),
                    popupclose: () => setSelectedId(null)
                }}
            >
              {/* Agregamos la clase "comic-popup" para aplicar nuestros estilos */}
              <Popup className="comic-popup" closeButton={true}>
                <div className="min-w-[200px] text-center" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", sans-serif' }}>
                    
                    {/* TÍTULO */}
                    <h3 className="font-bold text-[#1a1a1a] text-sm uppercase mb-1 tracking-wide">
                        {property.title}
                    </h3>
                    
                    {/* DIRECCIÓN */}
                    <p className="text-xs text-gray-600 mb-3 italic">
                        {property.address}
                    </p>
                    
                    {/* PRECIO (Estilo destacado) */}
                    <div className="bg-white rounded-lg border-2 border-[#529e14] py-1 px-2 mb-3 inline-block shadow-sm">
                        <p className="text-[#529e14] font-black text-lg">
                            {formatPrice(property.price)}
                        </p>
                    </div>

                    {/* BOTÓN */}
                    <Link 
                        href={`/propiedades/${property.slug}`}
                        className="block w-full bg-[#f8ed1a] hover:bg-[#ffe600] text-[#1a1a1a] text-xs font-black py-3 px-2 rounded-xl border-b-4 border-[#e1d600] active:border-b-0 active:mt-1 transition-all uppercase"
                    >
                        Ver Detalles
                    </Link>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}