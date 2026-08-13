import React, { useState, useMemo } from 'react';
import { Conduce, Cliente } from '../types';
import {
  BarChart3,
  Tractor,
  Truck,
  TrendingUp,
  Clock,
  Layers,
  Calendar,
  Filter,
  PlusCircle,
  Briefcase
} from 'lucide-react';

interface ProduccionDashboardProps {
  conduces: Conduce[];
  clientes: Cliente[];
  onNavigate: (tab: any) => void;
}

export const ProduccionDashboard: React.FC<ProduccionDashboardProps> = ({
  conduces,
  clientes,
  onNavigate
}) => {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [clienteFiltro, setClienteFiltro] = useState<string>('');

  // Filtrado de Conduces para el Dashboard
  const conducesFiltrados = useMemo(() => {
    return conduces.filter((c) => {
      if (fechaInicio && c.fecha < fechaInicio) return false;
      if (fechaFin && c.fecha > fechaFin) return false;
      if (clienteFiltro && c.clienteId !== clienteFiltro) return false;
      return true;
    });
  }, [conduces, fechaInicio, fechaFin, clienteFiltro]);

  // Cálculos estadísticos
  const stats = useMemo(() => {
    let totalHoras = 0;
    let totalMetros = 0;
    let totalViajes = 0;
    let totalMontoMatenimientoObras = 0;

    let conducesEquiposCount = 0;
    let conducesMaterialesCount = 0;

    conducesFiltrados.forEach((c) => {
      if (c.tipo === 'equipo_pesado') {
        conducesEquiposCount++;
        totalHoras += c.totalHorasPagar;
        totalMontoMatenimientoObras += c.montoTotal;
      } else {
        conducesMaterialesCount++;
        c.detalles.forEach((det) => {
          if (det.unidad === 'metro') totalMetros += det.cantidad;
          if (det.unidad === 'viaje') totalViajes += det.cantidad;
          if (det.unidad === 'hora') totalHoras += det.cantidad;
        });
        totalMontoMatenimientoObras += c.montoTotal;
      }
    });

    return {
      totalHoras,
      totalMetros,
      totalViajes,
      totalMontoMatenimientoObras,
      conducesEquiposCount,
      conducesMaterialesCount,
      totalConduces: conducesFiltrados.length
    };
  }, [conducesFiltrados]);

  // Resumen por Cliente
  const produccionPorCliente = useMemo(() => {
    const map = new Map<string, { clienteNombre: string; horas: number; metros: number; viajes: number; total: number; conduces: number }>();

    conducesFiltrados.forEach((c) => {
      const key = c.clienteNombre;
      const actual = map.get(key) || { clienteNombre: key, horas: 0, metros: 0, viajes: 0, total: 0, conduces: 0 };
      
      if (c.tipo === 'equipo_pesado') {
        actual.horas += c.totalHorasPagar;
      } else {
        c.detalles.forEach((det) => {
          if (det.unidad === 'metro') actual.metros += det.cantidad;
          if (det.unidad === 'viaje') actual.viajes += det.cantidad;
          if (det.unidad === 'hora') actual.horas += det.cantidad;
        });
      }
      actual.total += c.montoTotal;
      actual.conduces += 1;

      map.set(key, actual);
    });

    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [conducesFiltrados]);

  return (
    <div className="space-y-6">
      
      {/* Banner de Bienvenida y Filtros Rpidos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-400" />
              Monitor de Producción de Trabajos — EQUIPROCI
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Consolidado en tiempo real de conduces de equipos pesados, volumen de materiales y horas trabajadas.
            </p>
          </div>

          {/* Botones de Acción Directa */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('registro_equipos')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Tractor className="w-4 h-4" /> Nuevo Conduce Equipos
            </button>
            <button
              onClick={() => onNavigate('registro_materiales')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4 text-amber-400" /> Nuevo Conduce E (Material)
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="pt-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filtrar Producción:
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400">Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400">Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400">Cliente:</label>
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500 max-w-xs"
            >
              <option value="">Todos los Clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {(fechaInicio || fechaFin || clienteFiltro) && (
            <button
              onClick={() => {
                setFechaInicio('');
                setFechaFin('');
                setClienteFiltro('');
              }}
              className="text-amber-400 hover:underline text-xs"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid de KPIs / Tarjetas Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Horas Trabajadas */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Horas Equipos (H.T.)
            </span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats.totalHoras.toLocaleString('es-DO')}
            </span>
            <span className="text-xs text-slate-400 ml-1">hrs pagadas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Tractor className="w-3.5 h-3.5 text-amber-400" />
            {stats.conducesEquiposCount} conduces de equipos pesados
          </p>
        </div>

        {/* KPI 2: Volumen de Materiales (m³) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Volumen Acarreado
            </span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats.totalMetros.toLocaleString('es-DO')}
            </span>
            <span className="text-xs text-slate-400 ml-1">m³ de material</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            {stats.totalViajes} viajes registrados
          </p>
        </div>

        {/* KPI 3: Cantidad Total Conduces */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Conduces Procesados
            </span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white font-mono">
              {stats.totalConduces}
            </span>
            <span className="text-xs text-slate-400 ml-1">registros validados</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            Actualización automática
          </p>
        </div>

        {/* KPI 4: Importe Estimado Producción */}
        <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 to-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
              Monto Producción Total
            </span>
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-400 font-mono">
              ${stats.totalMontoMatenimientoObras.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Base acumulada lista para facturación externa
          </p>
        </div>

      </div>

      {/* Tabla de Desglose de Producción por Cliente */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              Resumen de Producción por Cliente
            </h2>
            <p className="text-xs text-slate-400">
              Acumulados estructurados para generación de reportes y envío al sistema externo de facturación.
            </p>
          </div>
        </div>

        {produccionPorCliente.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No hay trabajos registrados que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3 text-center">Conduces</th>
                  <th className="p-3 text-right">Horas Equipos</th>
                  <th className="p-3 text-right">Viajes Camión</th>
                  <th className="p-3 text-right">Volumen (m³)</th>
                  <th className="p-3 text-right">Valor Producción ($)</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {produccionPorCliente.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-semibold text-white">{item.clienteNombre}</td>
                    <td className="p-3 text-center font-mono">{item.conduces}</td>
                    <td className="p-3 text-right font-mono text-amber-400 font-bold">
                      {item.horas > 0 ? `${item.horas} hrs` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-blue-400">
                      {item.viajes > 0 ? `${item.viajes} vj` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-400">
                      {item.metros > 0 ? `${item.metros} m³` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      ${item.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onNavigate('reporte_clientes')}
                        className="text-xs text-amber-400 hover:text-amber-300 font-medium underline cursor-pointer"
                      >
                        Ver Reporte
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
