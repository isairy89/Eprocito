import React from 'react';
import { HardHat, FileSpreadsheet, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetData }) => {
  const fechaActual = new Date().toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-lg text-slate-950 font-black shadow-inner flex items-center justify-center">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wide text-amber-400">EQUIPROCI</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                v1.0 Administrative Desktop
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Equipos y Proyectos Civiles, S.R.L. — Sistema de Conduces y Control de Producción
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right mr-2">
            <span className="text-xs text-slate-400 capitalize">{fechaActual}</span>
            <span className="text-xs text-amber-400 font-medium">Modo Administrativo</span>
          </div>

          {/* Data Reset / Demo Refresh */}
          <button
            onClick={onResetData}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer text-xs flex items-center gap-1"
            title="Restablecer datos demo de fábrica"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden xl:inline">Datos Demo</span>
          </button>
        </div>

      </div>
    </header>
  );
};
