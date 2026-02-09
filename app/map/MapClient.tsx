'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useState } from 'react';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const defaultIcon = L.icon({
  iconUrl: '/frog-pin.png', 
  iconSize: [70, 70],     
  iconAnchor: [35, 70],   
  popupAnchor: [0, -75]    
});

const selectedIcon = L.icon({
  iconUrl: '/frog-pin2.png', 
  iconSize: [80, 80],     
  iconAnchor: [40, 80],   
  popupAnchor: [0, -85]   
});

interface PropertyProps {
  id: string;
  title: string;
  address: string;
  price: number;
  slug: string;
  lat: number; 
  lng: number;
  image?: string; 
  beds: number;
  baths: number;
  sqft: number;
}

export default function MapClient({ properties }: { properties: PropertyProps[] }) {
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const position: [number, number] = [35.1495, -90.0490]; 

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const bubbleStyle = "bg-[#fdfae7] border-2 border-[#529e14] rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] text-center";

  return (
    <div className="h-full w-full z-0 relative">
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0;
        }
        .leaflet-popup-tip-container { display: none; }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
          overflow: visible !important;
        }
        .leaflet-popup-close-button { display: none; }
        .leaflet-container a { text-decoration: none; }
      `}</style>

      <MapContainer 
        center={position} 
        zoom={11} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => (
           (property.lat && property.lng) && (
            <Marker 
                key={property.id} 
                position={[property.lat, property.lng]}
                icon={selectedId === property.id ? selectedIcon : defaultIcon}
                eventHandlers={{
                    click: () => setSelectedId(property.id),
                    popupopen: () => setSelectedId(property.id),
                    popupclose: () => setSelectedId(null)
                }}
            >
              <Popup closeButton={false}>
                {/* CAMBIO PRINCIPAL:
                   Usamos 'flex-col' para el contenedor principal.
                   Arriba: Fila con Texto e Imagen.
                   Abajo: Botón a todo lo ancho.
                */}
                <div className="flex flex-col gap-2 font-sans" style={{ fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif' }}>
                    
                    {/* FILA SUPERIOR: Info + Imagen */}
                    <div className="flex flex-row items-start gap-3">
                        
                        {/* COLUMNA IZQUIERDA: Textos */}
                        <div className="flex flex-col space-y-2 w-[180px]">
                            <div className={`${bubbleStyle} px-3 py-2`}>
                                <h3 className="font-bold text-[#1a1a1a] text-xs uppercase leading-tight truncate">
                                    {property.title}
                                </h3>
                            </div>

                            <div className={`${bubbleStyle} px-2 py-0 scale-105 origin-left`}>
                                <p className="text-[#529e14] font-black text-lg leading-none">
                                    {formatPrice(property.price)}
                                </p>
                            </div>
                            
                            <div className={`${bubbleStyle} !rounded-full px-2 py-1`}>
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-bold">
                                    <div className="flex items-center gap-1"><span>🛏</span>{property.beds}</div>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <div className="flex items-center gap-1"><span>🚿</span>{property.baths}</div>
                                    <div className="w-px h-3 bg-gray-300"></div>
                                    <div className="flex items-center gap-1"><span>📐</span>{property.sqft}</div>
                                </div>
                            </div>
                        </div>

                        {/* COLUMNA DERECHA: Imagen */}
                        <div className={`${bubbleStyle} p-1 w-[130px] h-[130px] flex-shrink-0 flex items-center justify-center bg-gray-100`}>
                            {property.image ? (
                                <img 
                                    src={property.image} 
                                    alt={property.title} 
                                    className="rounded-xl object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-4xl">🏠</span>
                            )}
                        </div>
                    </div>

                    {/* BOTÓN: Ahora está afuera de las columnas, ocupando todo el ancho */}
                    <Link 
                        href={`/propiedades/${property.slug}`}
                        className="
                            block w-full
                            bg-[#f8ed1a] 
                            border-2 border-[#529e14] 
                            text-black text-xs font-black 
                            py-2 px-3 rounded-full 
                            uppercase tracking-wide text-center
                            hover:bg-[#529e14] hover:text-white
                            transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.1)]
                        "
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