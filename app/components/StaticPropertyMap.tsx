'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%', 
};

// Estilos oscuros idénticos a los del mapa interactivo principal
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

const libraries: ("places" | "visualization")[] = ["places", "visualization"];

interface StaticPropertyMapProps {
  lat: number;
  lng: number;
  isThumbnail?: boolean; // 👈 Nueva propiedad
}

export default function StaticPropertyMap({ lat, lng, isThumbnail = false }: StaticPropertyMapProps) {
  // Cargamos la API de Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    version: "3.64",
    libraries,
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-[#1a1a1a] animate-pulse flex flex-col items-center justify-center border border-gray-800 overflow-hidden">
        <span className={isThumbnail ? "text-2xl" : "text-4xl mb-2"}>🗺️</span>
        {!isThumbnail && ( // Ocultamos el texto si es una miniatura pequeña
            <p className="text-[#f8ed1a] font-bold uppercase tracking-widest text-xs">
              Loading Map...
            </p>
        )}
      </div>
    );
  }

  const center = { lat, lng };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={isThumbnail ? 13 : 16} // Zoom más lejano para la miniatura
      options={{
        disableDefaultUI: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: !isThumbnail, // Ocultar botones +/- si es miniatura
        zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
        gestureHandling: isThumbnail ? 'none' : 'cooperative', // Bloquear TODO el movimiento si es miniatura
        keyboardShortcuts: !isThumbnail,
        clickableIcons: false,
        styles: cleanMapStyles,
        backgroundColor: '#1a1a1a'
      }}
    >
      <Marker
        position={center}
        icon={{
          url: '/frog-pin.png', 
          scaledSize: new window.google.maps.Size(isThumbnail ? 30 : 60, isThumbnail ? 30 : 60), // Pin más pequeño en la miniatura
        }}
      />
    </GoogleMap>
  );
}