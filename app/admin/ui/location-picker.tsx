'use client';

import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// --- CONFIGURACIÓN ---
const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '0.5rem'
};

const defaultCenter = {
  lat: 35.1495,
  lng: -90.0490
};

// 1. DEFINIMOS LAS LIBRERÍAS FUERA (Igual que en el padre)
// Esto es vital para que coincida exactamente con la configuración de NewPropertyPage
const libraries: ("places")[] = ["places"];

interface LocationPickerProps {
  lat: number;
  lng: number;
  searchQuery?: string;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, searchQuery, onLocationChange }: LocationPickerProps) {
  // 2. AGREGAMOS 'libraries' AQUÍ
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libraries // <--- ESTA LÍNEA FALTABA Y CAUSABA EL ERROR
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  // Usamos coordenadas recibidas o el default
  const center = (lat && lng) ? { lat, lng } : defaultCenter;

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  // --- BUSCADOR DE DIRECCIONES (GEOCODING) ---
  useEffect(() => {
    if (isLoaded && map && searchQuery && searchQuery.length > 10) {
      const delayDebounceFn = setTimeout(() => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: searchQuery }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const newLat = location.lat();
            const newLng = location.lng();
            
            // Actualizamos mapa y estado padre
            map.panTo({ lat: newLat, lng: newLng });
            map.setZoom(16);
            onLocationChange(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
          }
        });
      }, 1500); // Esperar 1.5s después de que el usuario deje de escribir

      return () => clearTimeout(delayDebounceFn);
    }
  }, [isLoaded, map, searchQuery, onLocationChange]);

  // --- ARRASTRAR MARCADOR ---
  const onMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      onLocationChange(Number(newLat.toFixed(6)), Number(newLng.toFixed(6)));
    }
  };

  if (!isLoaded) {
    return (
        <div className="h-[300px] w-full bg-gray-800 animate-pulse rounded-lg flex items-center justify-center text-gray-500">
            Loading Google Maps...
        </div>
    );
  }

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-600 z-0 relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
            disableDefaultUI: false,
            streetViewControl: false,
            mapTypeControl: false,
        }}
      >
        <Marker
            position={center}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
            icon={{
                url: '/frog-pin.png',
                scaledSize: new window.google.maps.Size(50, 50),
                anchor: new window.google.maps.Point(25, 50)
            }}
        />
      </GoogleMap>
      
      {/* Overlay informativo */}
      <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs text-black font-bold z-[10] pointer-events-none shadow-lg">
        Drag 🐸 to adjust location
      </div>
    </div>
  );
}