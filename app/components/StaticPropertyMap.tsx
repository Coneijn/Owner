'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '350px', // Altura recomendada para la miniatura
};

interface StaticPropertyMapProps {
  lat: number;
  lng: number;
}

export default function StaticPropertyMap({ lat, lng }: StaticPropertyMapProps) {
  // Cargamos la API de Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
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
      zoom={16} // Un zoom de 15 o 16 suele ser ideal para propiedades a nivel de calle
      options={{
        disableDefaultUI: true,   // Oculta los botones de satélite, zoom, street view, etc.
        gestureHandling: 'none',  // Bloquea por completo el scroll, el arrastre y el zoom con dos dedos
        keyboardShortcuts: false, // Evita que se mueva con las flechas del teclado
        clickableIcons: false     // Evita que los negocios cercanos en el mapa sean clickeables
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