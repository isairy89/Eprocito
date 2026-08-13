import React from 'react';
import {
  BarChart3,
  Truck,
  Tractor,
  FileText,
  DollarSign,
  Users,
  Briefcase,
  AlertTriangle,
  PlusCircle
} from 'lucide-react';

export type TabType =
  | 'produccion'
  | 'registro_equipos'
  | 'registro_materiales'
  | 'conduces_lista'
  | 'servicios_precios'
  | 'reporte_clientes'
  | 'reporte_nomina';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  totalConduces: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, totalConduces }) => {
  const menuGroup1 = [
    {
      id: 'produccion' as TabType,
      label: 'Control de Producción',
      icon: BarChart3,
      desc: 'Monitoreo acumulado'
    },
    {
      id: 'conduces_lista' as TabType,
      label: 'Registro de Conduces',
      icon: FileText,
      desc: 'Consulta y correcciones',
      badge: totalConduces
    }
  ];

  const menuGroupNuevo = [
    {
      id: 'registro_equipos' as TabType,
      label: 'Conduce Equipos Pesados',
      icon: Tractor,
      desc: 'Turnos y horas pagadas'
    },
    {
      id: 'registro_materiales' as TabType,
      label: 'Conduce E (Materiales)',
      icon: Truck,
      desc: 'Capacidad, viajes y m³'
    }
  ];

  const menuGroupReportes = [
    {
      id: 'reporte_clientes' as TabType,
      label: 'Reporte a Clientes',
      icon: Briefcase,
      desc: 'Información para facturación'
    },
    {
      id: 'reporte_nomina' as TabType,
      label: 'Reporte de Nómina',
      icon: Users,
      desc: 'Detalle choferes y H.T.'
    }
  ];

  const menuGroupConfig = [
    {
      id: 'servicios_precios' as TabType,
      label: 'Servicios y Precios',
      icon: DollarSign,
      desc: 'Tarifas dinámicas por cliente'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        
        {/* Acceso Rápido a Registro */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5" /> Registrar Conduce Campo
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setActiveTab('registro_equipos')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'registro_equipos'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-700/50 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Tractor className="w-4 h-4" /> Equipos Pesados
              </span>
              <span className="text-[10px] opacity-75">Horas</span>
            </button>

            <button
              onClick={() => setActiveTab('registro_materiales')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                activeTab === 'registro_materiales'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-700/50 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4" /> Materiales / Volteo
              </span>
              <span className="text-[10px] opacity-75">m³ / Viajes</span>
            </button>
          </div>
        </div>

        {/* Grupo Principal */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Operaciones y Producción
          </p>
          <nav className="space-y-1">
            {menuGroup1.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border border-slate-700 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                    </div>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded text-[10px] font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Grupo Reportes */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Módulo de Reportes
          </p>
          <nav className="space-y-1">
            {menuGroupReportes.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border border-slate-700 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Configuración */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Parámetros y Precios
          </p>
          <nav className="space-y-1">
            {menuGroupConfig.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 border border-slate-700 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <div>{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-slate-400 text-[11px] space-y-1">
        <p className="font-semibold text-slate-300">EQUIPROCI, S.R.L.</p>
        <p>Departamento de Operaciones</p>
        <p className="text-[10px] text-amber-500/80 font-mono">Sin emisión de facturas</p>
      </div>
    </aside>
  );
};
