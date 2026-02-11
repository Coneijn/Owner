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

// INTERFAZ CORREGIDA: Acepta null en image
interface PropertyProps {
  id: string;
  title: string;
  address: string;
  price: number;
  slug: string;
  lat: number;
  lng: number;
  image?: string | null; // <--- IMPORTANTE: | null
  beds: number;
  baths: number;
  sqft: number;
}

export default function MapClient({ 
    properties, 
    lang, 
    highlightedProperty 
}: { 
    properties: PropertyProps[], 
    lang: string, 
    highlightedProperty?: PropertyProps | null 
}) {
  
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

  // --- EFECTO: Mover mapa al seleccionar en la lista ---
  useEffect(() => {
    if (highlightedProperty && map) {
        map.panTo({ lat: highlightedProperty.lat, lng: highlightedProperty.lng });
        map.setZoom(15);
        setSelectedProperty(highlightedProperty);
    }
  }, [highlightedProperty, map]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const bubbleStyle = "bg-[#fdfae7] border-2 border-[#529e14] rounded-2xl shadow-[2px_2px_0px_rgba(0,0,0,0.1)] text-center";
  const detailsText = lang === 'en' ? 'View Details' : 'Ver Detalles';

  const handleMarkerClick = (property: PropertyProps) => {
    if (selectedProperty?.id === property.id) {
        setSelectedProperty(null);
    } else {
        setSelectedProperty(property);
    }
  };

  if (!isLoaded) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500 font-bold animate-pulse">Loading Google Maps...</p>
        </div>
    );
  }

  return (
    <div className="h-full w-full relative">
        <style jsx global>{`
            .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
            .gm-style-iw-tc { display: none !important; }
            .gm-ui-hover-effect { display: none !important; }
            .gm-style-iw-d { overflow: visible !important; max-height: none !important; }
        `}</style>

        <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={11}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onDragStart={() => setSelectedProperty(null)}
            onClick={() => setSelectedProperty(null)} 
            options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
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
                    onCloseClick={() => setSelectedProperty(null)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -50) }}
                >
                    <div className="relative flex flex-col gap-2 font-sans min-w-[300px] p-1 group">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProperty(null);
                            }}
                            className="absolute -top-2 -right-2 z-50 bg-white text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-gray-300 transition-colors font-bold leading-none"
                            title="Close"
                        >
                            ✕
                        </button>

                        <div className="flex flex-row items-start gap-3">
                            <div className="flex flex-col space-y-2 w-[160px]">
                                <div className={`${bubbleStyle} px-3 py-2`}>
                                    <h3 className="font-bold text-[#1a1a1a] text-xs uppercase leading-tight truncate">
                                        {selectedProperty.address}
                                    </h3>
                                </div>
                                <div className={`${bubbleStyle} px-2 py-0 scale-105 origin-left`}>
                                    <p className="text-[#529e14] font-black text-lg leading-none">
                                        {formatPrice(selectedProperty.price)}
                                    </p>
                                </div>
                                <div className={`${bubbleStyle} !rounded-full px-2 py-1`}>
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600 font-bold">
                                        <div className="flex items-center gap-1"><span>🛏</span>{selectedProperty.beds}</div>
                                        <div className="w-px h-3 bg-gray-300"></div>
                                        <div className="flex items-center gap-1"><span>🚿</span>{selectedProperty.baths}</div>
                                        <div className="w-px h-3 bg-gray-300"></div>
                                        <div className="flex items-center gap-1"><span>📐</span>{selectedProperty.sqft}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={`${bubbleStyle} p-1 w-[120px] h-[120px] flex-shrink-0 flex items-center justify-center bg-gray-100`}>
                                {selectedProperty.image ? (
                                    <img 
                                        src={selectedProperty.image} 
                                        alt={selectedProperty.title} 
                                        className="rounded-xl object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-4xl">🏠</span>
                                )}
                            </div>
                        </div>

                        <Link 
                            href={`/propiedades/${selectedProperty.slug}?lang=${lang}`}
                            className="block w-full bg-[#f8ed1a] border-2 border-[#529e14] text-black text-xs font-black py-2 px-3 rounded-full uppercase tracking-wide text-center hover:bg-[#529e14] hover:text-white transition-colors shadow-[2px_2px_0px_rgba(0,0,0,0.1)] mt-1 no-underline"
                        >
                            {detailsText}
                        </Link>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    </div>
  );
}