'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';

// --- CONFIGURACIÓN ---
const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 35.1495,
  lng: -90.0490
};

// Estilo JSON para Google Maps (Tonos oscuros/azules)
const darkModeStyles = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#c4c4c4" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1626" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
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
}

interface MapClientProps {
  properties: PropertyProps[];
  lang: string;
  highlightedProperty?: PropertyProps | null;
  onMarkerClick?: (property: PropertyProps) => void;
}

export default function MapClient({ 
    properties, 
    lang, 
    highlightedProperty,
    onMarkerClick 
}: MapClientProps) {
  
  const [selectedProperty, setSelectedProperty] = useState<PropertyProps | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (highlightedProperty && map) {
        map.panTo({ lat: highlightedProperty.lat, lng: highlightedProperty.lng });
        map.setZoom(15);
        setSelectedProperty(highlightedProperty);
    } else if (!highlightedProperty) {
        setSelectedProperty(null);
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
        <div className="h-full w-full flex items-center justify-center bg-[#0a0f1c]">
            <p className="text-[#f8ed1a] font-bold animate-pulse uppercase tracking-widest text-xs">Loading Map...</p>
        </div>
    );
  }

  return (
    <div className="h-full w-full relative">
        {/* --- ESTILOS TRANSPARENTES PARA INFOWINDOW --- */}
        <style jsx global>{`
            .gm-style-iw-c { 
                background: rgba(18, 24, 38, 0.10) !important; /* Fondo semitransparente */
                backdrop-filter: blur(12px) !important;       /* Efecto Blur */
                padding: 0 !important; 
                border-radius: 16px !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
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
            onDragStart={() => {}}
            onClick={() => {
                setSelectedProperty(null);
                if (onMarkerClick) onMarkerClick(null as any); 
            }} 
            options={{
                disableDefaultUI: false,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                styles: darkModeStyles,
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
                    <div className="relative flex flex-col font-sans min-w-[260px] group">
                        {/* Header de imagen + precio (Sin bordes extraños) */}
                        <div className="relative h-28 w-full">
                             {selectedProperty.image ? (
                                <img 
                                    src={selectedProperty.image} 
                                    alt={selectedProperty.title} 
                                    className="object-cover w-full h-full"
                                />
                             ) : (
                                <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl">🏠</div>
                             )}
                             
                             <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0a0f1c] to-transparent p-3 pt-8">
                                <p className="text-[#f8ed1a] font-black text-xl leading-none drop-shadow-md">
                                    {formatPrice(selectedProperty.price)}
                                </p>
                             </div>
                        </div>

                        {/* Cuerpo de datos (Fondo transparente heredado) */}
                        <div className="p-3">
                            <h3 className="font-bold text-white text-xs uppercase truncate mb-2">
                                {selectedProperty.address}
                            </h3>
                            
                            <div className="flex justify-between items-center text-xs text-gray-300 font-bold mb-3 border-b border-white/10 pb-2">
                                <div className="flex items-center gap-1"><span>🛏</span>{selectedProperty.beds}</div>
                                <div className="flex items-center gap-1"><span>🚿</span>{selectedProperty.baths}</div>
                                <div className="flex items-center gap-1"><span>📐</span>{selectedProperty.sqft}</div>
                            </div>

                            <Link 
                                href={`/propiedades/${selectedProperty.slug}?lang=${lang}`}
                                className="block w-full bg-[#f8ed1a]/90 hover:bg-[#f8ed1a] text-black text-xs font-black py-2 rounded uppercase tracking-wide text-center transition-colors backdrop-blur-sm"
                            >
                                {detailsText}
                            </Link>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    </div>
  );
}