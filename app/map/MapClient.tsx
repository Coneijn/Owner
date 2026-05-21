'use client';
import { useState, useCallback, useEffect, Fragment, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, OverlayView } from '@react-google-maps/api';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import Link from 'next/link';
import { calculateEstimatedPayment, formatMoney } from '@/lib/utils';

// --- CONFIGURACIÓN ---
const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 35.1495,
  lng: -89.9890
};
// Datos de coordenadas aproximadas para los Zip Codes proporcionados
export const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  "38119": { lat: 35.1042, lng: -89.8428 },
  "38116": { lat: 35.0354, lng: -90.0101 },
  "38118": { lat: 35.0573, lng: -89.9234 },
  "38117": { lat: 35.1158, lng: -89.9004 },
  "38135": { lat: 35.2444, lng: -89.8242 },
  "38111": { lat: 35.1092, lng: -89.9431 },
  "38122": { lat: 35.1554, lng: -89.9142 },
  "38125": { lat: 35.0396, lng: -89.7891 },
  "38018": { lat: 35.1500, lng: -89.7845 },
  "38305": { lat: 35.6698, lng: -88.8502 },
  "38127": { lat: 35.2285, lng: -90.0076 },
  "38114": { lat: 35.1082, lng: -89.9926 },
  "37130": { lat: 35.8456, lng: -86.3903 },
  "38115": { lat: 35.0487, lng: -89.8454 },
  "38053": { lat: 35.3524, lng: -89.8973 },
  "38134": { lat: 35.1953, lng: -89.8514 },
  "38141": { lat: 35.0322, lng: -89.7865 },
  "38016": { lat: 35.1663, lng: -89.7364 },
  "38120": { lat: 35.1165, lng: -89.8598 },
  "38130": { lat: 35.1221, lng: -89.9705 },
  "38112": { lat: 35.1481, lng: -89.9768 },
  "38107": { lat: 35.1678, lng: -90.0151 },
  "38128": { lat: 35.2132, lng: -89.9231 },
  "38133": { lat: 35.2127, lng: -89.8329 },
  "38108": { lat: 35.1760, lng: -89.9678 },
  "38126": { lat: 35.1328, lng: -90.0401 },
  "38109": { lat: 35.0354, lng: -90.0712 },
  "38654": { lat: 34.9458, lng: -89.8130 },
  "38103": { lat: 35.1487, lng: -90.0519 },
  "38138": { lat: 35.0935, lng: -89.7915 },
  "38104": { lat: 35.1311, lng: -89.9961 },
  "38671": { lat: 34.9542, lng: -90.0039 },
  "38017": { lat: 35.0454, lng: -89.6806 },
  "38637": { lat: 34.9398, lng: -90.0336 },
  "38106": { lat: 35.1091, lng: -90.0381 },
  "38058": { lat: 35.2447, lng: -89.3621 },
  "38060": { lat: 35.4526, lng: -89.4005 },
  "38002": { lat: 35.2979, lng: -89.6558 },
  "35221": { lat: 33.4735, lng: -86.9142 },
  "55448": { lat: 45.1614, lng: -93.3005 },
  "10102": { lat: 40.7639, lng: -73.9865 },
  "33133": { lat: 25.7276, lng: -80.2458 },
  "28610": { lat: 35.7171, lng: -81.1448 },
  "74115": { lat: 36.1951, lng: -95.9189 },
  "32809": { lat: 28.4608, lng: -81.3916 },
  "28075": { lat: 35.3159, lng: -80.6625 },
  "34142": { lat: 26.4172, lng: -81.4237 },
  "28671": { lat: 35.7485, lng: -81.5360 },
  "37804": { lat: 35.7565, lng: -83.9705 },
  "75061": { lat: 32.8197, lng: -96.9634 },
  "95407": { lat: 38.4187, lng: -122.7354 },
  "52501": { lat: 41.0188, lng: -92.4093 },
  "37311": { lat: 35.1587, lng: -84.8769 },
  "68850": { lat: 40.7801, lng: -99.7397 },
  "10028": { lat: 40.7768, lng: -73.9515 },
  "37210": { lat: 36.1443, lng: -86.7380 },
  "37814": { lat: 36.2166, lng: -83.2988 },
  "37402": { lat: 35.0487, lng: -85.3106 },
  "38166": { lat: 35.1497, lng: -90.0487 },
  "38237": { lat: 36.3424, lng: -88.8504 },
  "38611": { lat: 34.8687, lng: -89.6645 },
  "38632": { lat: 34.8192, lng: -89.9912 },
  "38651": { lat: 34.8966, lng: -89.9928 },
  "30125": { lat: 34.0135, lng: -85.2530 },
  "37211": { lat: 36.0827, lng: -86.7279 },
  "38012": { lat: 35.5947, lng: -89.2618 },
  "54143": { lat: 45.0991, lng: -87.6309 },
  "18800": { lat: 41.8333, lng: -75.8750 }, 
  "38668": { lat: 34.6135, lng: -89.9669 },
  "38066": { lat: 35.1517, lng: -89.4754 }
};

const sellerData: Record<string, number> = {
  "38115": 82,
  "38118": 64,
  "38122": 61,
  "38116": 45,
  "38141": 45,
  "38125": 36,
  "38111": 27,
  "38135": 28,
  "38128": 18,
  "38117": 16,
  "38133": 16,
  "38120": 14,
  "38134": 12,
  "38127": 10,
  "38119": 9,
  "38107": 8,
  "38108": 7,
  "38126": 6,
  "38109": 5,
  "38018": 4,
  "38114": 4,
  "38016": 4,
  "38305": 3,
  "38654": 3,
  "38112": 3,
  "38103": 2,
  "38138": 2,
  "38104": 2,
  "38671": 2,
  "38017": 2,
  "38053": 2,
  "38637": 2,
  "38106": 2,
  "38058": 1,
  "38060": 1,
  "38002": 1,
  "35221": 1,
  "55448": 1,
  "10102": 1,
  "33133": 1,
  "28610": 1,
  "74115": 1,
  "32809": 1,
  "28075": 1,
  "34142": 1,
  "28671": 1,
  "37804": 1,
  "75061": 1,
  "95407": 1,
  "52501": 1,
  "37311": 1,
  "68850": 1,
  "10028": 1,
  "37210": 1,
  "37814": 1,
  "37402": 1,
  "38166": 1,
  "38237": 1,
  "38611": 1,
  "38632": 1,
  "38651": 1,
  "30125": 1,
  "37211": 1,
  "38012": 1,
  "54143": 1,
  "37130": 1,
  "18800": 1,
  "38668": 1,
  "38066": 1
};
const libraries: ("places" | "visualization")[] = ["places", "visualization"];
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
  
  // Campos de fecha para lógica de Pin
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

const smoothZoom = (mapInstance: google.maps.Map, targetZoom: number) => {
  let currentZoom = mapInstance.getZoom();
  if (currentZoom === undefined || currentZoom === targetZoom) return;

  const step = currentZoom > targetZoom ? -1 : 1;
  
  const zoomInterval = setInterval(() => {
    currentZoom! += step;
    mapInstance.setZoom(currentZoom!);

    if (currentZoom === targetZoom) {
      clearInterval(zoomInterval);
    }
  }, 100); 
};

export default function MapClient({ properties, lang, highlightedProperty, onMarkerClick, searchType }: MapClientProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyProps | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
const [clickedZip, setClickedZip] = useState<{zip: string, count: number, lat: number, lng: number} | null>(null);  // Estado para controlar el Zoom
  const [currentZoom, setCurrentZoom] = useState(12); // Inicializado en 12 para coincidir con el mapa
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [heatmapFailed, setHeatmapFailed] = useState(false);
  
  // 1. RECARGA DE IMÁGENES PARA EVITAR PARPADEO
  useEffect(() => {
    const preloadImages = [
        '/frog-pin.png',
        '/frog-pin2.png',
        '/frog-sign.png',
        '/pinNewEdited.png' 
    ];

    preloadImages.forEach((src) => {
        const img = new Image();
        img.src = src;
    });
  }, []); 
// Dentro de MapClient.tsx
useEffect(() => {
  // Limpiamos el tooltip para que no quede "flotando" 
  // en las coordenadas donde antes había un punto de calor
  setClickedZip(null);
  
  // Si tienes un estado de propiedad seleccionada, también es sano limpiarlo
  setSelectedProperty(null);
}, [searchType]); // Se dispara cada vez que cambias de BUY / RENT / SOLD
  // 2. LÓGICA UNIFICADA DE SELECCIÓN Y ZOOM DEL MAPA
  useEffect(() => {
    if (!map) return; // Esperar a que el mapa esté listo

    if (highlightedProperty) {
      map.panTo({ lat: highlightedProperty.lat, lng: highlightedProperty.lng });
      map.setZoom(16); // Hacemos un zoom in a 16 cuando se selecciona una propiedad
      setSelectedProperty(highlightedProperty);
    } else {
      setSelectedProperty(null);
      
      // Regresar paulatinamente al zoom inicial (12)
      const currentMapZoom = map.getZoom();
      if (currentMapZoom !== undefined && currentMapZoom !== 12) {
        smoothZoom(map, 12);
      }
    }
  }, [highlightedProperty, map]);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries // IMPORTANTE: Cargar librería de visualización
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

  const handleMarkerClick = (property: PropertyProps) => {
    setSelectedProperty(property);
    if (onMarkerClick) {
      onMarkerClick(property);
    }
  };
  const heatmapData = useMemo(() => {
    return Object.entries(sellerData).map(([zip, count]) => {
      const coords = ZIP_COORDS[zip];
      if (!coords) return null;
      return {
        position: [coords.lng, coords.lat], // Deck.gl usa un simple arreglo [Longitud, Latitud]
        weight: count
      };
    }).filter(Boolean);
  }, []); 

  const activeHeatmapData = useMemo(() => {
    if (searchType !== 'sold') return [];
    return heatmapData;
  }, [searchType, heatmapData]);

  // --- INTEGRACIÓN DE DECK.GL (CON ERROR BOUNDARY) ---
  useEffect(() => {
    // Si no hay mapa o si el heatmap ya falló previamente, no intentamos dibujarlo
    if (!map || heatmapFailed) return;

    const overlay = new GoogleMapsOverlay({
      // El "Error Boundary" interno de deck.gl
      onError: (error: Error) => {
        console.warn("Error de WebGPU/Shader detectado. Desactivando mapa de calor para este dispositivo:", error.message);
        setHeatmapFailed(true); // Actualizamos el estado para no volver a intentar
        overlay.setMap(null);   // Retiramos la capa rota del mapa
      },
      layers: [
        new HeatmapLayer({
          id: 'heatmap-layer',
          data: activeHeatmapData as any,
          getPosition: (d: any) => d.position,
          getWeight: (d: any) => d.weight,
          radiusPixels: 40,
          intensity: 1,
          threshold: 0.05,
          colorRange: [
            [248, 237, 26, 0],
            [184, 176, 19, 76],
            [218, 208, 22, 127],
            [248, 237, 26, 178],
            [248, 237, 26, 230],
            [255, 255, 200, 255]
          ]
        })
      ]
    });

    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [map, activeHeatmapData, heatmapFailed]);
  // Lógica para determinar si es Nuevo o Editado
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
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onZoomChanged={handleZoomChanged}
        onClick={() => {
            setSelectedProperty(null);
            setClickedZip(null); // Limpiar el tooltip de calor al hacer clic en el mapa
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
            const isSpecial = checkSpecialStatus(property);
            const showSign = currentZoom >= 17; 
            
            const markerAnimation = (isSpecial && !isSelected && !showSign) 
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
                iconSize = new window.google.maps.Size(90, 90); 
            } else if (showSign) {
                // PRIORIDAD 2: Zoom alto (Muestra precio)
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
            } else if (isSpecial) {
                // PRIORIDAD 3: Nuevo o Editado 
                iconUrl = '/pinNewEdited.png';
                iconSize = new window.google.maps.Size(70, 70); 
            }

            return (
                <Fragment key={property.id}>
                    <Marker
                        position={{ lat: property.lat, lng: property.lng }}
                        onClick={() => handleMarkerClick(property)}

                        // Eventos del hover
                        onMouseOver={() => setHoveredProperty(property.id)}
                        onMouseOut={() => setHoveredProperty(null)}

                        zIndex={isSelected ? 999 : (isSpecial ? 800 : 1)}
                        animation={markerAnimation as any} 
                        icon={{
                            url: iconUrl,
                            scaledSize: iconSize,
                            labelOrigin: labelOrigin
                        }}
                        label={labelConfig as any} 
                    />

                    {hoveredProperty === property.id && isSpecial && (
                        <OverlayView
                            position={{ lat: property.lat, lng: property.lng }}
                            mapPaneName={OverlayView.FLOAT_PANE}
                            getPixelPositionOffset={(width, height) => ({
                                x: -(width / 2),
                                y: -80
                            })}
                        >
                            <div className="w-max bg-orange-500 text-[#f8ed1a] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded shadow-[0_0_12px_rgba(239,68,68,0.6)] border-2 border-red-600 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in duration-200">
                              {lang === 'en' ? 'Hot property' : 'Gran oportunidad'}
                          </div>
                        </OverlayView>
                    )}
                </Fragment>
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
{/* La capa de Heatmap de deck.gl ahora se inyecta de forma invisible mediante GoogleMapsOverlay en el useEffect de arriba, por lo que borramos la etiqueta nativa de Google Maps. */}

    {/* Los marcadores de detección SÍ se condicionan por searchType */}
    {searchType === 'sold' && Object.entries(sellerData).map(([zip, count]) => {
      const coords = ZIP_COORDS[zip];
      if (!coords) return null;
      return (
        <Marker
          key={`heat-detect-${zip}`}
          position={coords}
          onClick={()=>{
            if (clickedZip?.zip === zip) {
                setClickedZip(null);
            } else {
                setClickedZip({ zip, count, ...coords });
            }
          }}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillOpacity: 0,
            strokeWeight: 0
          }}
        />
      );
    })}

      {/* TOOLTIP DE FRECUENCIA */}
{clickedZip && (  // <-- CAMBIA hoveredZip por clickedZip
  <OverlayView
    position={{ lat: clickedZip.lat, lng: clickedZip.lng }} 
    mapPaneName={OverlayView.FLOAT_PANE}
    getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -20 })}
  >
    <div 
      className={`
        text-white font-black text-xl uppercase tracking-tighter 
        pointer-events-none whitespace-nowrap animate-in fade-in zoom-in duration-150
        [text-shadow:-2px_-2px_0_#000,2px_-2px_0_#000,-2px_2px_0_#000,2px_2px_0_#000,0px_4px_10px_rgba(0,0,0,0.8)]
      `}
    >
      
      {clickedZip.zip}: {clickedZip.count} {lang === 'en' ? 'Interested Buyers' : 'Compradores Interesados'}
    </div>
  </OverlayView>
)}
      </GoogleMap>
    </div>
  );
}