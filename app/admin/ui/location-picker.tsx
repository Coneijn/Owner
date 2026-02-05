'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- CONFIGURACIÓN DEL ICONO DE LA RANITA 🐸 ---
const frogIcon = L.icon({
  iconUrl: '/frog-pin.png',       // Tu imagen en la carpeta public
  iconRetinaUrl: '/frog-pin.png', // Usamos la misma para pantallas HD
  iconSize: [50, 50],             // TAMAÑO: Ajusta esto si se ve muy grande o chico (ancho, alto)
  iconAnchor: [25, 50],           // EL PICO: [mitad del ancho, alto total] para que la punta toque el mapa
  popupAnchor: [0, -50],          // Donde saldría el texto si le pones popup
  // shadowUrl: null,             // Sin sombra para que se vea limpio
});

// Componente auxiliar para volar a la nueva ubicación
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16); // Zoom 16 para ver calles bien
  }, [center, map]);
  return null;
}

interface LocationPickerProps {
  lat: number;
  lng: number;
  searchQuery?: string;
  onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ lat, lng, searchQuery, onLocationChange }: LocationPickerProps) {
  // Coordenadas: Si vienen vacías o 0, usa Memphis por defecto
  const position: [number, number] = [lat || 35.1495, lng || -90.0490];
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onLocationChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        }
      },
    }),
    [onLocationChange]
  );

  // Efecto: Buscar dirección completa cuando cambia el searchQuery
  useEffect(() => {
    if (searchQuery && searchQuery.length > 10) {
      const fetchCoords = async () => {
        try {
          // Buscamos en OpenStreetMap
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
          );
          const data = await response.json();
          if (data && data.length > 0) {
            const newLat = parseFloat(data[0].lat);
            const newLng = parseFloat(data[0].lon);
            onLocationChange(newLat, newLng);
          }
        } catch (error) {
          console.error("Error buscando dirección:", error);
        }
      };
      
      // Esperamos 1.5s después de que dejes de escribir para buscar
      const timeoutId = setTimeout(fetchCoords, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, onLocationChange]);

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-600 z-0 relative">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="h-full w-full" 
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          draggable={true} 
          eventHandlers={eventHandlers} 
          position={position} 
          ref={markerRef} 
          icon={frogIcon} // <--- AQUÍ USAMOS TU ICONO
        />
        <MapUpdater center={position} />
      </MapContainer>
      
      {/* Overlay informativo */}
      <div className="absolute bottom-2 left-2 bg-white/90 p-2 rounded text-xs text-black font-bold z-[1000] pointer-events-none shadow-lg">
        Drag 🐸 to adjust location
      </div>
    </div>
  );
}