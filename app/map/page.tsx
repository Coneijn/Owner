// app/map/page.tsx
import MapLoader from './MapLoader'; // Importación normal (sin dynamic)

export default async function MapaPage() {
  
  // --- DATOS DE PRUEBA (MOCK) ---
  const propertiesMock = [
    { id: '1', title: 'Casa en Midtown', address: '123 Main St', price: 250000, lat: 35.1495, lng: -90.0490 },
    { id: '2', title: 'Casa en Cordova', address: '456 Second St', price: 320000, lat: 35.1700, lng: -89.8000 },
  ];

  return (
    <main className="flex flex-col h-screen">
       <div className="p-4 bg-white shadow-md z-10 relative">
          <h1 className="text-2xl font-black uppercase text-gray-800">Mapa de Propiedades</h1>
          <p className="text-sm text-gray-500">Explora las casas disponibles en Memphis.</p>
       </div>
       
       <div className="flex-1">
          {/* Usamos el Loader intermedio */}
          <MapLoader properties={propertiesMock} />
       </div>
    </main>
  );
}