'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// ... (El código del fix de iconos por defecto déjalo igual, por si acaso)

// --- DEFINICIÓN DE TU ICONO DE RANA ---
const frogIcon = L.icon({
  iconUrl: '/frog-pin.png', // Ruta desde la carpeta public
  iconSize: [50, 50],     // Tamaño en pixeles (ajusta según necesites)
  iconAnchor: [25, 50],   // [X, Y] Punto del icono que toca el mapa (la punta de abajo)
                          // Si mide 50 de ancho, la mitad es 25. Si mide 50 de alto, el final es 50.
  popupAnchor: [0, -55]   // Donde se abre el globo de texto relativo al anchor
});

interface PropertyProps {
  id: string;
  title: string;
  address: string;
  price: number;
  lat?: number; 
  lng?: number; 
}

export default function MapClient({ properties }: { properties: PropertyProps[] }) {
  
  // ... (useEffect y posición inicial igual)
  const position: [number, number] = [35.1495, -90.0490];

  return (
    <div className="h-[calc(100vh-80px)] w-full z-0 relative">
      <MapContainer center={position} zoom={11} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => (
           (property.lat && property.lng) && (
            <Marker 
                key={property.id} 
                position={[property.lat, property.lng]}
                icon={frogIcon}  // <--- AQUÍ ASIGNAS TU ICONO PERSONALIZADO
            >
              <Popup>
                {/* ... contenido del popup ... */}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}