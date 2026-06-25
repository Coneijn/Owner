'use client';

import { useEffect, useState, useRef } from 'react';

export default function NotificacionesPage() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState('Desactivado');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializar el audio (asegúrate de tener este archivo en tu carpeta /public)
    audioRef.current = new Audio('/notification.mp3'); 
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setStatus('Desactivado');
      return;
    }

    setStatus('Conectando...');
    const eventSource = new EventSource('/api/webhoooks/ghl-notifications');

    eventSource.onopen = () => {
      setStatus('Listening for notifications...');
    };

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.type === 'new_message') {
        // Reproducir sonido al recibir el webhook
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.error("Error al reproducir audio (recuerda que el usuario debe interactuar con la página primero):", e));
        }
      }
    };

    eventSource.onerror = () => {
      setStatus('Reconectando...');
    };

    return () => {
      eventSource.close();
    };
  }, [isEnabled]);

  return (
    <div className="animate-in fade-in duration-300 max-w-3xl mx-auto mt-10">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-4xl">🔔</span>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              GoHighLevel Alerts
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Keep this tab open to hear a sound notification every time a new message arrives.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-[#111] border border-gray-700 rounded-lg">
          <div>
            <h3 className="text-lg font-bold text-white">Activate Sound</h3>
            <p className={`text-sm font-black mt-1 uppercase tracking-wider ${
                isEnabled 
                ? status === 'Listening for notifications...' ? 'text-[#529e14]' : 'text-[#f8ed1a]' 
                : 'text-gray-600'
            }`}>
              Status: {status}
            </p>
          </div>
          
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${
              isEnabled ? 'bg-[#529e14]' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
          <p className="text-blue-400 text-xs flex items-start gap-2">
            <span>ℹ️</span>
            <span>
              <strong>Important:</strong> The modern browsers block automatic audio playback unless you have interacted with the page. By clicking the switch to activate the service, you are already granting the necessary permission.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}