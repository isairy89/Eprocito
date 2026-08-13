import React, { useState, useMemo } from 'react';
import { Conduce, Cliente, Empleado, FiltrosReporte } from '../types';
import { ExportService, ReporteClienteFila } from '../services/exportService';
import { Briefcase, Download, FileSpreadsheet, FileText, Filter, Printer } from 'lucide-react';

interface ReporteClientesProps {
  conduces: Conduce[];
  clientes: Cliente[];
  empleados: Empleado[];
}

export const ReporteClientes: React.FC<ReporteClientesProps> = ({
  conduces,
  clientes,
  empleados
}) => {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [clienteId, setClienteId] = useState<string>('');
  const [empleadoNombre, setEmpleadoNombre] = useState<string>('');

  // Filtrado de conduces
  const conducesFiltrados = useMemo(() => {
    return conduces.filter((c) => {
      if (fechaInicio && c.fecha < fechaInicio) return false;
      if (fechaFin && c.fecha > fechaFin) return false;
      if (clienteId && c.clienteId !== clienteId) return false;
      
      if (empleadoNombre) {
        const resp = c.tipo === 'equipo_pesado' ? c.operadorNombre : c.choferNombre;
        if (!resp.toLowerCase().includes(empleadoNombre.toLowerCase())) return false;
      }

      return true;
    });
  }, [conduces, fechaInicio, fechaFin, clienteId, empleadoNombre]);

  // Transformar a filas aplanadas de reporte
  const filasReporte = useMemo(() => {
    return ExportService.procesarFilasReporteCliente(conducesFiltrados);
  }, [conducesFiltrados]);

  // Agrupamiento por Cliente para vista previa estructurada
  const agrupadoPorCliente = useMemo(() => {
    const map = new Map<string, ReporteClienteFila[]>();
    filasReporte.forEach((f) => {
      const lista = map.get(f.clienteNombre) || [];
      lista.push(f);
      map.set(f.clienteNombre, lista);
    });
    return map;
  }, [filasReporte]);

  // Totales Generales
  const totalHoras = filasReporte.reduce((s, f) => s + f.horas, 0);
  const totalViajes = filasReporte.reduce((s, f) => s + f.viajes, 0);
  const totalMetros = filasReporte.reduce((s, f) => s + f.metros, 0);
  const totalMontoGeneral = filasReporte.reduce((s, f) => s + f.total, 0);

  // Nombre del cliente seleccionado para los reportes
  const clienteNombreSeleccionado = useMemo(() => {
    if (!clienteId) return 'Todos los Clientes';
    return clientes.find((c) => c.id === clienteId)?.nombre || 'Todos los Clientes';
  }, [clienteId, clientes]);

  const filtrosActuales: FiltrosReporte = {
    fechaInicio,
    fechaFin,
    clienteId,
    clienteNombre: clienteNombreSeleccionado,
    empleadoNombre
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filtros Obligatorios */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-amber-400" />
              Reporte de Trabajo y Producción a Clientes
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Estructura consolidada por cliente, proyecto y categoría lista para el sistema externo de facturación.
            </p>
          </div>

          {/* Botones de Exportación */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => ExportService.exportarClienteExcel(conducesFiltrados, filtrosActuales)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar Excel (.xlsx)
            </button>
            <button
              onClick={() => ExportService.exportarClientePDF(conducesFiltrados, filtrosActuales)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Exportar PDF (.pdf)
            </button>
          </div>
        </div>

        {/* Panel de Filtros Obligatorios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
          
          {/* Rango de Fechas */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Rango de Fechas (Desde - Hasta)</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-1/2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="">Todos los Clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Chofer / Operador */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Chofer / Operador</label>
            <input
              type="text"
              value={empleadoNombre}
              onChange={(e) => setEmpleadoNombre(e.target.value)}
              placeholder="Buscar por operador o chofer..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

          {/* Limpiar Filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFechaInicio('');
                setFechaFin('');
                setClienteId('');
                setEmpleadoNombre('');
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>

        </div>

        {/* Resumen de Filtros Aplicados */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Filtros Activos:
            </span>
            <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700/80">
              <strong className="text-slate-400">Rango:</strong> {fechaInicio || 'Inicio'} a {fechaFin || 'Hoy'}
            </span>
            <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700/80">
              <strong className="text-slate-400">Cliente:</strong> {clienteNombreSeleccionado}
            </span>
            <span className="bg-slate-900 px-2.5 py-1 rounded-md border border-slate-700/80">
              <strong className="text-slate-400">Chofer/Operador:</strong> {empleadoNombre || 'Todos'}
            </span>
          </div>
          <div className="text-amber-400 font-mono font-bold bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">
            {filasReporte.length} detalle(s) en {conducesFiltrados.length} conduce(s)
          </div>
        </div>
      </div>

      {/* Vista Previa del Reporte Agrupado */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Encabezado Imprimible */}
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wide">
              EQUIPOS Y PROYECTOS CIVILES, S.R.L. (EQUIPROCI)
            </h2>
            <p className="text-xs text-amber-400 font-semibold">Reporte Consolidado de Trabajos a Clientes</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Moneda: <strong className="text-white font-mono">DOP ($)</strong></p>
            <p>Registros: <strong className="text-white font-mono">{filasReporte.length}</strong></p>
          </div>
        </div>

        {agrupadoPorCliente.size === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No se encontraron conduces que coincidan con los filtros seleccionados.
          </div>
        ) : (
          Array.from(agrupadoPorCliente.entries()).map(([clienteNombre, filas]) => {
            const subtotalHoras = filas.reduce((s, f) => s + f.horas, 0);
            const subtotalViajes = filas.reduce((s, f) => s + f.viajes, 0);
            const subtotalMetros = filas.reduce((s, f) => s + f.metros, 0);
            const subtotalMonto = filas.reduce((s, f) => s + f.total, 0);

            return (
              <div key={clienteNombre} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                
                {/* Header del Grupo Cliente */}
                <div className="bg-slate-800/80 p-3 px-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> {clienteNombre}
                  </h3>
                  <span className="text-xs font-mono font-bold text-white">
                    Subtotal Cliente: ${subtotalMonto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Tabla de Detalle */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5">No. Conduce</th>
                        <th className="p-2.5">Proyecto / Ubicación</th>
                        <th className="p-2.5">Servicio / Material</th>
                        <th className="p-2.5">Equipo</th>
                        <th className="p-2.5">Placa</th>
                        <th className="p-2.5 text-right">Horas</th>
                        <th className="p-2.5 text-right">Viajes</th>
                        <th className="p-2.5 text-right">m³</th>
                        <th className="p-2.5 text-right">Tarifa ($)</th>
                        <th className="p-2.5 text-right">Total ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {filas.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-2.5 text-slate-300 font-sans">{f.fecha}</td>
                          <td className="p-2.5 text-amber-400 font-bold">{f.numeroConduce}</td>
                          <td className="p-2.5 font-sans text-slate-300">{f.proyecto}</td>
                          <td className="p-2.5 font-sans font-medium text-white">{f.itemDetalle}</td>
                          <td className="p-2.5 font-sans text-slate-300">{f.equipoNombre}</td>
                          <td className="p-2.5 font-sans text-slate-400 font-mono">{f.placa || '-'}</td>
                          <td className="p-2.5 text-right text-amber-400">{f.horas ? `${f.horas} hr` : '-'}</td>
                          <td className="p-2.5 text-right text-blue-400">{f.viajes ? `${f.viajes} vj` : '-'}</td>
                          <td className="p-2.5 text-right text-emerald-400">{f.metros ? `${f.metros} m³` : '-'}</td>
                          <td className="p-2.5 text-right text-slate-300">${f.precioUnitario.toLocaleString('es-DO')}</td>
                          <td className="p-2.5 text-right font-bold text-white">${f.total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900/90 font-bold text-xs text-slate-200 border-t border-slate-800">
                      <tr>
                        <td colSpan={6} className="p-2.5 text-right text-amber-400 font-sans">SUBTOTALES {clienteNombre}:</td>
                        <td className="p-2.5 text-right text-amber-400 font-mono">{subtotalHoras > 0 ? `${subtotalHoras} hrs` : '-'}</td>
                        <td className="p-2.5 text-right text-blue-400 font-mono">{subtotalViajes > 0 ? `${subtotalViajes} vj` : '-'}</td>
                        <td className="p-2.5 text-right text-emerald-400 font-mono">{subtotalMetros > 0 ? `${subtotalMetros} m³` : '-'}</td>
                        <td></td>
                        <td className="p-2.5 text-right text-amber-400 font-mono">${subtotalMonto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

              </div>
            );
          })
        )}

        {/* Gran Total Reporte */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between text-xs font-bold gap-4">
          <span className="text-amber-300 uppercase tracking-wider text-sm">
            Total General Trabajos a Clientes:
          </span>
          <div className="flex items-center gap-6 text-white font-mono">
            {totalHoras > 0 && <span className="text-amber-400">{totalHoras} Total Horas</span>}
            {totalViajes > 0 && <span className="text-blue-400">{totalViajes} Total Viajes</span>}
            {totalMetros > 0 && <span className="text-emerald-400">{totalMetros} m³ Material</span>}
            <span className="text-xl text-amber-400 font-extrabold font-mono">
              ${totalMontoGeneral.toLocaleString('es-DO', { minimumFractionDigits: 2 })} DOP
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
