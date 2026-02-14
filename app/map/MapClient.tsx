'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { calculateEstimatedPayment, formatMoney } from '@/lib/utils';
// --- CONFIGURATION ---
const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 35.1495,
  lng: -90.0490
};

const cleanMapStyles = [
    {
      elementType: "geometry",
      stylers: [{ color: "#0a0f1c" }] // Matches your app's bg-[#0a0f1c]
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#0a0f1c" }] // Halo matches bg
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#a0a0a0" }] // Muted text color
    },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d4d4d4" }] // City names slightly brighter
    },
    {
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }] // Hides ALL icons (POIs, Bus stops, etc)
      },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#1f2937" }] // Dark gray roads (visible but subtle)
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2937" }]
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#737373" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#262626" }] // Highways slightly darker
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#262626" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#000000" }] // Deep black water for contrast
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#333333" }]
    },
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
  }

  interface MapClientProps {
    properties: PropertyProps[];
    lang: string;
    highlightedProperty?: PropertyProps | null;
    onMarkerClick?: (property: PropertyProps) => void;
    searchType: string; // Recibimos el tipo
  }

export default function MapClient({ 
    properties, 
    lang, 
    highlightedProperty,
    onMarkerClick,
    searchType 
}: MapClientProps) {
  
  const [selectedProperty, setSelectedProperty] = useState<PropertyProps | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });
  // Lógica de visualización dinámica
  const isRent = searchType === 'rent';

  // Helper interno para el popup seleccionado
  const getPopupData = (p: PropertyProps) => {
      if (isRent) {
          return {
              mainPrice: p.monthlyRent,
              mainLabel: '/mo',
              subPrice: p.securityDeposit,
              subLabel: 'Dep:'
          };
      } else {
          const monthly = calculateEstimatedPayment(p.price, p.downPayment, p.taxes, p.insurance, p.interestRate);
          return {
              mainPrice: p.price,
              mainLabel: '',
              subPrice: monthly,
              subLabel: '/mo est.'
          };
      }
  };
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (highlightedProperty && map) {
        // CASO 1: SELECCIÓN ACTIVA
        // Hacemos Zoom In a la propiedad
        map.panTo({ lat: highlightedProperty.lat, lng: highlightedProperty.lng });
        map.setZoom(15);
        setSelectedProperty(highlightedProperty);
    } else if (!highlightedProperty && map) {
        // CASO 2: DESELECCIÓN (Manual o Automática)
        // Limpiamos la tarjeta flotante
        setSelectedProperty(null);
        
        // --- AQUÍ ESTÁ LA MAGIA ---
        // Regresamos el mapa a la vista inicial (Zoom Out)
        map.panTo(defaultCenter); 
        map.setZoom(11); 
    }
  }, [highlightedProperty, map]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const detailsText = lang === 'en' ? 'View Details' : 'Ver Detalles';

  const handleMarkerClick = (property: PropertyProps) => {
    setSelectedProperty(property);
    if (onMarkerClick) {
        onMarkerClick(property);
    }
  };

  if (!isLoaded) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-white">
            <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Map...</p>
        </div>
    );
  }

  return (
    <div className="h-full w-full relative">
        {/* --- INFO WINDOW STYLES (Keep Dark for Contrast) --- */}
        <style jsx global>{`
            .gm-style-iw-c { 
                background: rgba(10, 15, 28, 0.95) !important; /* Dark Card */
                backdrop-filter: blur(12px) !important;       
                padding: 0 !important; 
                border-radius: 16px !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important; /* Stronger shadow for white map */
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            .gm-style-iw-tc { display: none !important; }
            .gm-ui-hover-effect { 
                filter: invert(1) !important; /* White X button */
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
            onDragStart={() => {}}
            onClick={() => {
                setSelectedProperty(null);
                if (onMarkerClick) onMarkerClick(null as any); 
            }} 
            options={{
                disableDefaultUI: false,
                // Controles personalizados zoom
                zoomControl: true,
                zoomControlOptions: {position:6},
                //streetViewControl,
                streetViewControl: true,
                streetViewControlOptions: { position: 6 },
                
                mapTypeControl: false,
                fullscreenControl: false,
                // APPLY WHITE STYLE
                styles: cleanMapStyles, 
                // Set div background to white
                backgroundColor: '#ffffff' 
            }}
        >
            {properties.map((property) => (
                (property.lat && property.lng) && (
                    <Marker
                        key={property.id}
                        position={{ lat: property.lat, lng: property.lng }}
                        onClick={() => handleMarkerClick(property)}
                        icon={{
                            url: selectedProperty?.id === property.id ? '/frog-pin2.png' : '/frog-pin.png',
                            scaledSize: new window.google.maps.Size(50, 50),
                            labelOrigin: new window.google.maps.Point(25, -10)
                        }}
                    />
                )
            ))}

            {selectedProperty && (
                <InfoWindow
                    position={{ lat: selectedProperty.lat, lng: selectedProperty.lng }}
                    onCloseClick={() => {
                        setSelectedProperty(null);
                        if (onMarkerClick) onMarkerClick(null as any);
                    }}
                    options={{ pixelOffset: new window.google.maps.Size(0, -50) }}
                >
                    {/* 3. CONTENIDO DEL POPUP DINÁMICO */}
                    <div className="relative flex flex-col font-sans min-w-[260px] group">
                        
                        {/* Calcular datos al vuelo */}
                        {(() => {
                            const data = getPopupData(selectedProperty);
                            return (
                                <>
                                    {/* Image Header */}
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
                                        
                                        {/* Overlay con Precio Principal (Grande) */}
                                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0a0f1c] to-transparent p-3 pt-10">
                                            <div className="flex items-baseline gap-1">
                                                <p className="text-[#f8ed1a] font-black text-2xl leading-none drop-shadow-md">
                                                    {formatMoney(data.mainPrice)}
                                                </p>
                                                {data.mainLabel && <span className="text-[#f8ed1a] text-xs font-bold uppercase">{data.mainLabel}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-3">
                                        {/* Precio Secundario (Pequeño) */}
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