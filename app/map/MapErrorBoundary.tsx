'use client';
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error atrapado por el límite del Mapa:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Si el mapa explota, mostramos esto en lugar de la pantalla blanca
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1c] text-white p-6 text-center">
          <span className="text-4xl mb-4">⚠️</span>
          <p className="text-red-500 font-bold mb-2">Tu navegador o dispositivo no soporta los gráficos avanzados 3D de este mapa.</p>
          <p className="text-gray-400 text-sm mb-6">Por favor, recarga la página o intenta desde otro dispositivo.</p>
          <button 
            className="px-6 py-2 bg-[#f8ed1a] text-black font-black uppercase tracking-wider rounded-full"
            onClick={() => window.location.reload()}
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}