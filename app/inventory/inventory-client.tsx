'use client';
import { toJpeg } from 'html-to-image';
import { useState, useMemo, useRef } from 'react';
import InventoryCard from './ui/inventory-card';
import { PdfTemplate } from './ui/pdf-template';
// 1. Nuevas importaciones para descarga directa
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function InventoryClient({ properties, lang, t }: { properties: any[], lang: string, t: any }) {
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'AVAILABLE' | 'SOLD'>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Estado para mostrar un "Cargando..." mientras se dibuja el PDF
  const [isGenerating, setIsGenerating] = useState(false);

  const componentRef = useRef<HTMLDivElement>(null);

  // 2. FUNCIÓN DE DESCARGA DIRECTA
  const handleDownloadDirectPDF = async () => {
    const element = componentRef.current;
    if (!element) return;

    setIsGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pages = element.querySelectorAll('.pdf-page');

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Usamos html-to-image en lugar de html2canvas
        const dataUrl = await toJpeg(page, { 
            quality: 0.95, 
            pixelRatio: 2, // Mantiene la alta resolución para el PDF
            cacheBust: true // Ayuda a forzar la carga de imágenes frescas
        });
        
        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297);
      }

      const fileName = lang === 'en' ? 'Selected_Properties.pdf' : 'Propiedades_Seleccionadas.pdf';
      pdf.save(fileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF. Revisa la consola para más detalles.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const filteredProperties = useMemo(() => {
    const isNew = (dateString: string) => {
        const diff = new Date().getTime() - new Date(dateString).getTime();
        return Math.ceil(diff / (1000 * 3600 * 24)) <= 14;
    };

    switch (filter) {
      case 'SOLD':
        return properties.filter(p => p.status === 'SOLD');
      case 'AVAILABLE':
        return properties.filter(p => p.status === 'AVAILABLE');
      case 'NEW':
        return properties.filter(p => p.status === 'AVAILABLE' && isNew(p.createdAt));
      default:
        return properties;
    }
  }, [filter, properties]);

  const selectedPropertiesData = useMemo(() => {
    return properties.filter(p => selectedIds.includes(p.id));
  }, [selectedIds, properties]);

  return (
    <div className="relative min-h-screen pb-24">
      
      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-800 pb-6">
        {[
            { key: 'ALL', label: t.tabs.all },
            { key: 'NEW', label: t.tabs.new },
            { key: 'AVAILABLE', label: t.tabs.available },
            { key: 'SOLD', label: t.tabs.sold }
        ].map((tab) => (
            <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                    filter === tab.key 
                    ? 'bg-[#f8ed1a] text-black shadow-[0_0_15px_rgba(248,237,26,0.3)]' 
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
                <InventoryCard 
                    key={property.id} 
                    property={property} 
                    isSelected={selectedIds.includes(property.id)}
                    onToggle={toggleSelection}
                    lang={lang}
                    t={t}
                />
            ))
        ) : (
            <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl">
                <p className="text-xl">{t.empty}</p>
            </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1a] border border-[#f8ed1a] shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-full px-8 py-4 flex items-center gap-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2">
                <span className="bg-[#f8ed1a] text-black w-6 h-6 rounded-full flex items-center justify-center font-black text-xs">
                    {selectedIds.length}
                </span>
                <span className="text-white font-bold uppercase text-sm">{t.selected}</span>
            </div>

            <div className="h-4 w-px bg-gray-600"></div>

            <button 
                onClick={clearSelection}
                className="text-xs font-bold text-gray-400 hover:text-white uppercase"
            >
                {t.clear}
            </button>

            {/* BOTÓN CON ESTADO DE CARGA */}
            <button 
              onClick={handleDownloadDirectPDF}
              disabled={isGenerating}
              className="bg-[#529e14] hover:bg-green-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
            >
                {isGenerating 
                  ? '⏳ Procesando...' 
                  : `📄 ${lang === 'en' ? 'Download PDF' : 'Descargar PDF'}`
                }
            </button>
        </div>
      )}

      {/* PLANTILLA DE PDF OCULTA */}
      <PdfTemplate 
        ref={componentRef} 
        properties={selectedPropertiesData} 
        lang={lang} 
      />

    </div>
  );
}