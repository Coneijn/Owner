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
}


export default function StaticPropertyMap({ lat, lng }: StaticPropertyMapProps) {
  // Cargamos la API de Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-[350px] bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-[#529e14] font-bold uppercase tracking-widest text-xs">
          Loading Map...
        </p>
      </div>
    );
  }

  const center = { lat, lng };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13} // Un zoom de 15 o 16 suele ser ideal para propiedades a nivel de calle
      options={{
        disableDefaultUI: true,   // Oculta los botones de satélite, zoom, street view, etc.
        gestureHandling: 'none',  // Bloquea por completo el scroll, el arrastre y el zoom con dos dedos
        keyboardShortcuts: false, // Evita que se mueva con las flechas del teclado
        clickableIcons: false,    // Evita que los negocios cercanos en el mapa sean clickeables
        styles: cleanMapStyles,   // 👈 Aplica el tema oscuro
        backgroundColor: '#0a0f1c'// 👈 Fondo oscuro mientras el mapa termina de cargar
      }}
    >
      <Marker
        position={center}
        icon={{
          url: '/frog-pin.png', // Tu pin personalizado
          scaledSize: new window.google.maps.Size(40, 40), // Ajusta el tamaño si es necesario
        }}
      />
    </GoogleMap>
  );
}