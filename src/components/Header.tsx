import React, { useState } from 'react';
import { HardHat, RefreshCw, AlertTriangle, X } from 'lucide-react';

interface HeaderProps {
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onResetData }) => {
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [confirmInput, setConfirmInput] = useState<string>('');

  const fechaActual = new Date().toLocaleDateString('es-DO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput.trim().toUpperCase() === 'RESTABLECER') {
      onResetData();
      setShowResetModal(false);
      setConfirmInput('');
    }
  };

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
            onClick={() => setShowResetModal(true)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors cursor-pointer text-xs flex items-center gap-1 border border-slate-700/60"
            title="Restablecer datos demo de fábrica"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline">Restablecer Demo</span>
          </button>
        </div>

      </div>

      {/* Modal Seguro de Confirmación para Restablecimiento */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left">
            
            <button
              onClick={() => {
                setShowResetModal(false);
                setConfirmInput('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-red-400 font-bold text-base border-b border-slate-800 pb-3">
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <span>Restablecer Base de Datos</span>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs leading-relaxed space-y-1">
              <p className="font-bold">¡ADVERTENCIA DE SEGURIDAD!</p>
              <p>
                Esta acción eliminará permanentemente todos los conduces reales, clientes, servicios y tarifas personalizadas registradas en el sistema. Los datos serán reemplazados por la plantilla demo de fábrica.
              </p>
            </div>

            <form onSubmit={handleConfirmReset} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Para confirmar, escriba la palabra <strong className="text-amber-400 font-mono uppercase">RESTABLECER</strong> a continuación:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Escriba RESTABLECER para autorizar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold focus:border-red-500"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setConfirmInput('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={confirmInput.trim().toUpperCase() !== 'RESTABLECER'}
                  className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                    confirmInput.trim().toUpperCase() === 'RESTABLECER'
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  Confirmar Restablecimiento
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </header>
  );
};

