'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, OverlayView } from '@react-google-maps/api';
import Link from 'next/link';
import { calculateEstimatedPayment, formatMoney } from '@/lib/utils';

// --- CONFIGURACIÓN ---
const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 35.1495,
  lng: -90.0490
};

// Estilos oscuros limpios para el mapa
const cleanMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0a0f1c" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0f1c" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#a0a0a0" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d4d4d4" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1f2937" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#737373" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#262626" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#262626" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#333333" }] },
];

interface PropertyProps {
  id: string;
  title: string;
  address: string;
  price: number;
  slug: string;
  lat: number;
  lng: number;
  image?: string | null;
  beds: number;
  baths: number;
  sqft: number;
  // Financials
  downPayment: number;
  interestRate: number;
  taxes: number;
  insurance: number;
  monthlyRent: number;
  securityDeposit: number;
  
  // [NUEVO] Campos de fecha para lógica de Pin
  createdAt: string; 
  lastPriceChangeAt?: string | null;
}

interface MapClientProps {
  properties: PropertyProps[];
  lang: string;
  highlightedProperty?: PropertyProps | null;
  onMarkerClick?: (property: PropertyProps) => void;
  searchType: string;
}

// Helper para hacer precios cortos (ej. $250k) para el cartel de la rana
const formatShortPrice = (price: number) => {
  if (!price) return '';
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${Math.round(price / 1000)}k`;
  }
  return `$${price}`;
};

export default function MapClient({ properties, lang, highlightedProperty, onMarkerClick, searchType }: MapClientProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyProps | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Estado para controlar el Zoom
  const [currentZoom, setCurrentZoom] = useState(11);

  // RECARGA DE IMÁGENES PARA EVITAR PARPADEO ---
  useEffect(() => {
    const preloadImages = [
        '/frog-pin.png',
        '/frog-pin2.png',
        '/frog-sign.png',
        '/pinNewEdited.png' // [NUEVO] Agregamos el nuevo pin
    ];

    preloadImages.forEach((src) => {
        const img = new Image();
        img.src = src;
    });
  }, []); 

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const isRent = searchType === 'rent';

  // Helper interno para datos del popup
  const getPopupData = (p: PropertyProps) => {
    if (isRent) {
      return { 
        mainPrice: p.monthlyRent, 
        mainLabel: '/mo', 
        subPrice: p.securityDeposit, 
        subLabel: 'Dep:' 
      };
    } else {
      // Venta: Mostramos el precio total arriba y el estimado mensual abajo
      const monthly = calculateEstimatedPayment(
        p.price, 
        p.downPayment, 
        p.taxes, 
        p.insurance, 
        p.interestRate
      );
      return { 
        mainPrice: p.price, 
        mainLabel: '', 
        subPrice: monthly, 
        subLabel: '/mo est.' 
      };
    }
  };

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // Manejador del Zoom
  const handleZoomChanged = () => {
    if (map) {
      const newZoom = map.getZoom();
      if (newZoom !== undefined) {
        setCurrentZoom(newZoom);
      }
    }
  };

  useEffect(() => {
    if (highlightedProperty && map) {
      map.panTo({ lat: highlightedProperty.lat, lng: highlightedProperty.lng });
      map.setZoom(15);
      setSelectedProperty(highlightedProperty);
    } else if (!highlightedProperty && map) {
      setSelectedProperty(null);
    }
  }, [highlightedProperty, map]);

  const handleMarkerClick = (property: PropertyProps) => {
    setSelectedProperty(property);
    if (onMarkerClick) {
      onMarkerClick(property);
    }
  };

  // [NUEVO] Lógica para determinar si es Nuevo o Editado
  const checkSpecialStatus = (property: PropertyProps) => {
    const now = new Date();
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // 1. Verificar si es Nuevo (<= 7 días)
    const createdDate = new Date(property.createdAt);
    const diffNew = (now.getTime() - createdDate.getTime()) / MS_PER_DAY;
    if (diffNew <= 7) return true;

    // 2. Verificar si cambió precio (<= 10 días)
    if (property.lastPriceChangeAt) {
      const updatedDate = new Date(property.lastPriceChangeAt);
      const diffEdit = (now.getTime() - updatedDate.getTime()) / MS_PER_DAY;
      if (diffEdit <= 10) return true;
    }

    return false;
  };

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0a0f1c]">
        <p className="text-[#f8ed1a] font-bold animate-pulse uppercase tracking-widest text-xs">Loading Map...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
        {/* Estilos globales para InfoWindow (Popup oscuro) */}
        <style jsx global>{`
        .gm-style-iw-c {
          background: rgba(10, 15, 28, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          padding: 0 !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .gm-style-iw-tc { display: none !important; }
        .gm-ui-hover-effect { 
            filter: invert(1) !important; 
            opacity: 0.7 !important; 
        }
        .gm-style-iw-d { overflow: hidden !important; max-height: none !important; }
      `}</style>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={11}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onZoomChanged={handleZoomChanged}
        onClick={() => {
            setSelectedProperty(null);
            if (onMarkerClick) onMarkerClick(null as any);
        }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM, }, 
          streetViewControl: true,
          streetViewControlOptions: {position: google.maps.ControlPosition.LEFT_BOTTOM,},      
          mapTypeControl: false,
          fullscreenControl: false,
          styles: cleanMapStyles,
          backgroundColor: '#0a0f1c'
        }}
      >
        {properties.map((property) => {
            if (!property.lat || !property.lng) return null;

            // --- LÓGICA DE ICONOS Y PRIORIDAD ---
            const isSelected = selectedProperty?.id === property.id;
            const isSpecial = checkSpecialStatus(property); // [NUEVO] Checkeo de fecha
            const showSign = currentZoom >= 12; 
            
            const markerAnimation = (isSpecial && !isSelected) 
            ? google.maps.Animation.BOUNCE 
            : null;
            // Decidimos qué precio mostrar en el cartel
            const priceForLabel = isRent ? property.monthlyRent : property.price;
            const labelText = isRent 
                ? `$${new Intl.NumberFormat('en-US').format(priceForLabel)}`
                : formatShortPrice(priceForLabel);

            // Selección de URL del Icono y Configuración de Label
            let iconUrl = '/frog-pin.png'; // Base
            let labelConfig = null;
            let iconSize = new window.google.maps.Size(50, 50);
            let labelOrigin = new window.google.maps.Point(25, 25); // Ajuste default

            if (isSelected) {
                // PRIORIDAD 1: Seleccionado
                iconUrl = '/frog-pin2.png';
                iconSize = new window.google.maps.Size(80, 80); 
            } else if (isSpecial) {
                // PRIORIDAD 2: Nuevo o Editado (Sobrescribe al sign y al normal)
                iconUrl = '/pinNewEdited.png';
                // Ajusta el tamaño si tu pin nuevo tiene dimensiones diferentes
                iconSize = new window.google.maps.Size(80, 80); 
            } else if (showSign) {
                // PRIORIDAD 3: Zoom alto (Muestra precio)
                iconUrl = '/frog-sign.png';
                iconSize = new window.google.maps.Size(70, 70);
                labelOrigin = new window.google.maps.Point(35, 48);
                labelConfig = {
                    text: labelText,
                    color: "#000000",
                    fontWeight: "900",
                    fontSize: "11px",
                    className: "map-marker-label",
                };
            }

            return (
                <Marker
                    key={property.id}
                    position={{ lat: property.lat, lng: property.lng }}
                    onClick={() => handleMarkerClick(property)}
                    zIndex={isSelected ? 999 : (isSpecial ? 800 : 1)} // New/Edited encima de los normales
                    icon={{
                        url: iconUrl,
                        scaledSize: iconSize,
                        labelOrigin: labelOrigin
                    }}
                    label={labelConfig as any} 
                />
            );
        })}

        {/* --- POPUP (InfoWindow) --- */}
        {selectedProperty && (
          <InfoWindow
            position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
            onCloseClick={() => {
                setSelectedProperty(null);
                if (onMarkerClick) onMarkerClick(null as any);
            }}
            options={{ pixelOffset: new window.google.maps.Size(0, -50) }}
          >
            <div className="relative flex flex-col font-sans min-w-[260px] group">
               {(() => {
                 const data = getPopupData(selectedProperty);
                 return (
                   <>
                     {/* Foto Header */}
                     <div className="relative h-32 w-full">
                        {selectedProperty.image ? (
                            <img 
                                src={selectedProperty.image} 
                                alt={selectedProperty.title} 
                                className="object-cover w-full h-full" 
                            />
                        ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl">🏠</div>
                        )}
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0a0f1c] to-transparent p-3 pt-10">
                            <div className="flex items-baseline gap-1">
                                <p className="text-[#f8ed1a] font-black text-2xl leading-none drop-shadow-md">
                                    {formatMoney(data.mainPrice)}
                                </p>
                                {data.mainLabel && <span className="text-[#f8ed1a] text-xs font-bold uppercase">{data.mainLabel}</span>}
                            </div>
                        </div>
                     </div>

                     <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-[10px] font-bold uppercase">{data.subLabel}</span>
                            <span className="text-white font-bold text-sm">{formatMoney(data.subPrice)}</span>
                        </div>
                        
                        <h3 className="font-bold text-white text-xs uppercase truncate mb-2 border-t border-white/10 pt-2">
                            {selectedProperty.address}
                        </h3>

                        <div className="flex justify-between items-center text-xs text-gray-300 font-bold mb-3">
                            <div className="flex items-center gap-1"><span>🛏</span>{selectedProperty.beds}</div>
                            <div className="flex items-center gap-1"><span>🚿</span>{selectedProperty.baths}</div>
                            <div className="flex items-center gap-1"><span>📐</span>{selectedProperty.sqft}</div>
                        </div>

                        <Link 
                            href={`/propiedades/${selectedProperty.slug}?lang=${lang}`}
                            className="block w-full bg-[#f8ed1a]/90 hover:bg-[#f8ed1a] text-black text-xs font-black py-2 rounded uppercase tracking-wide text-center transition-colors backdrop-blur-sm"
                        >
                            {lang === 'en' ? 'View Details' : 'Ver Detalles'}
                        </Link>
                     </div>
                   </>
                 );
               })()}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}