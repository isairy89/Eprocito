import React, { useState, useMemo } from 'react';
import { Conduce, Cliente, Empleado, FiltrosReporte } from '../types';
import { ExportService, ReporteNominaFila } from '../services/exportService';
import { Users, FileSpreadsheet, FileText, Info, ShieldCheck } from 'lucide-react';

interface ReporteNominaProps {
  conduces: Conduce[];
  clientes: Cliente[];
  empleados: Empleado[];
}

export const ReporteNomina: React.FC<ReporteNominaProps> = ({
  conduces,
  clientes,
  empleados
}) => {
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [clienteId, setClienteId] = useState<string>('');
  const [empleadoNombre, setEmpleadoNombre] = useState<string>('');

  // Filtrar conduces
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

  // Filas aplanadas de nómina
  const filasNomina = useMemo(() => {
    return ExportService.procesarFilasReporteNomina(conducesFiltrados, empleados);
  }, [conducesFiltrados, empleados]);

  // Agrupamiento por Empleado (Chofer / Operador)
  const agrupadoPorEmpleado = useMemo(() => {
    const map = new Map<string, ReporteNominaFila[]>();
    filasNomina.forEach((f) => {
      const lista = map.get(f.empleadoNombre) || [];
      lista.push(f);
      map.set(f.empleadoNombre, lista);
    });
    return map;
  }, [filasNomina]);

  // Totales
  const totalHorasGen = filasNomina.reduce((s, f) => s + f.horasTrabajadas, 0);
  const totalViajesGen = filasNomina.reduce((s, f) => s + f.viajes, 0);
  const totalMetrosGen = filasNomina.reduce((s, f) => s + f.metros, 0);
  const totalMontoGen = filasNomina.reduce((s, f) => s + f.importeServicio, 0);

  // Nombre del cliente seleccionado para el reporte
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
      
      {/* Header & Controles */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" />
              Reporte de Resumen Operativo y Producción de Empleados
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Detalle de horas trabajadas (H.T.), viajes, volumen (m³) e importe de servicios realizados por empleado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => ExportService.exportarNominaExcel(conducesFiltrados, filtrosActuales, empleados)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Exportar Excel (.xlsx)
            </button>
            <button
              onClick={() => ExportService.exportarNominaPDF(conducesFiltrados, filtrosActuales, empleados)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-2 shadow transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" /> Exportar PDF (.pdf)
            </button>
          </div>
        </div>

        {/* Nota Registro Operativo */}
        <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Resumen de Operaciones:</strong> Muestra las horas trabajadas, viajes, volumen (m³) y el importe de servicios producidos para el cliente por cada chofer/operador. El pago final de nómina dependerá del esquema o tarifa salarial que defina la empresa (actualmente no se asume igual al precio del cliente).
          </span>
        </div>

        {/* Filtros Obligatorios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Rango de Fechas</label>
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

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Filtrar por Chofer / Operador</label>
            <input
              type="text"
              value={empleadoNombre}
              onChange={(e) => setEmpleadoNombre(e.target.value)}
              placeholder="Nombre del empleado..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
            />
          </div>

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
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Resumen de Filtros Aplicados */}
        <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
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
          <div className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            {filasNomina.length} registro(s) operativo(s) en {conducesFiltrados.length} conduce(s)
          </div>
        </div>

      </div>

      {/* Tabla Vista Previa Agrupada por Empleado */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wide">
              EQUIPOS Y PROYECTOS CIVILES, S.R.L. (EQUIPROCI)
            </h2>
            <p className="text-xs text-amber-400 font-semibold">Resumen Operativo para Reporte de Nómina</p>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Moneda: <strong className="text-white font-mono">DOP ($)</strong></p>
            <p>Empleados Incluidos: <strong className="text-white font-mono">{agrupadoPorEmpleado.size}</strong></p>
          </div>
        </div>

        {agrupadoPorEmpleado.size === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No se encontraron registros de producción que coincidan con los filtros seleccionados.
          </div>
        ) : (
          Array.from(agrupadoPorEmpleado.entries()).map(([nombreEmpleado, filas]) => {
            const subHoras = filas.reduce((s, f) => s + f.horasTrabajadas, 0);
            const subViajes = filas.reduce((s, f) => s + f.viajes, 0);
            const subMetros = filas.reduce((s, f) => s + f.metros, 0);
            const subMontoServicios = filas.reduce((s, f) => s + f.importeServicio, 0);

            const primerEq = filas[0]?.equipoNombre || '';
            const primeraPlaca = filas[0]?.placa ? `Placa: ${filas[0].placa}` : '';
            const equipoPlacaStr = [primerEq, primeraPlaca].filter(Boolean).join(' | ');

            const empConfig = empleados.find(
              (e) => e.nombre.toLowerCase().trim() === nombreEmpleado.toLowerCase().trim()
            );

            return (
              <div key={nombreEmpleado} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                
                {/* Header Empleado */}
                <div className="bg-slate-800/80 p-3 px-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" /> {nombreEmpleado}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">{equipoPlacaStr}</span>
                      {empConfig?.salarioBase && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                          Salario: ${empConfig.salarioBase.toLocaleString('es-DO')} ({empConfig.tipoSalario || 'mensual'})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-300 block">
                      Importe Serv. Producidos: <strong className="text-amber-400">${subMontoServicios.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</strong>
                    </span>
                    <span className="text-[10px] font-sans text-slate-400 block">
                      Esquema: {empConfig?.salarioBase ? `$${empConfig.salarioBase.toLocaleString('es-DO')} (${empConfig.tipoSalario || 'mensual'})` : 'Configurar en Empleados'}
                    </span>
                  </div>
                </div>

                {/* Tabla Detalle */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Fecha</th>
                        <th className="p-2.5">No. Conduce</th>
                        <th className="p-2.5">Cliente</th>
                        <th className="p-2.5">Equipo</th>
                        <th className="p-2.5">Placa</th>
                        <th className="p-2.5">Trabajo / Servicio</th>
                        <th className="p-2.5 text-right">H.T. (Horas)</th>
                        <th className="p-2.5 text-right">Viajes</th>
                        <th className="p-2.5 text-right">m³</th>
                        <th className="p-2.5 text-right">Precio Serv. ($)</th>
                        <th className="p-2.5 text-right">Imp. Servicio ($)</th>
                        <th className="p-2.5 text-center">Salario / Tarifa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {filas.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="p-2.5 text-slate-300 font-sans">{f.fecha}</td>
                          <td className="p-2.5 text-amber-400 font-bold">{f.numeroConduce}</td>
                          <td className="p-2.5 font-sans text-slate-300">{f.clienteNombre}</td>
                          <td className="p-2.5 font-sans text-white">{f.equipoNombre}</td>
                          <td className="p-2.5 font-sans text-slate-400">{f.placa || '-'}</td>
                          <td className="p-2.5 font-sans text-slate-300">{f.servicioDescripcion}</td>
                          <td className="p-2.5 text-right text-amber-400 font-bold">{f.horasTrabajadas ? `${f.horasTrabajadas} hr` : '-'}</td>
                          <td className="p-2.5 text-right text-blue-400">{f.viajes ? `${f.viajes} vj` : '-'}</td>
                          <td className="p-2.5 text-right text-emerald-400">{f.metros ? `${f.metros} m³` : '-'}</td>
                          <td className="p-2.5 text-right text-slate-300">${f.precioServicio.toLocaleString('es-DO')}</td>
                          <td className="p-2.5 text-right font-bold text-white">${f.importeServicio.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-center font-sans text-[11px] text-slate-300">
                            {empConfig?.salarioBase ? `$${empConfig.salarioBase.toLocaleString('es-DO')} (${empConfig.tipoSalario || 'mensual'})` : 'Por definir'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900/90 font-bold text-xs text-slate-200 border-t border-slate-800">
                      <tr>
                        <td colSpan={6} className="p-2.5 text-right text-amber-400 font-sans">SUBTOTALES {nombreEmpleado}:</td>
                        <td className="p-2.5 text-right text-amber-400 font-mono">{subHoras > 0 ? `${subHoras} hrs` : '-'}</td>
                        <td className="p-2.5 text-right text-blue-400 font-mono">{subViajes > 0 ? `${subViajes} vj` : '-'}</td>
                        <td className="p-2.5 text-right text-emerald-400 font-mono">{subMetros > 0 ? `${subMetros} m³` : '-'}</td>
                        <td></td>
                        <td className="p-2.5 text-right text-amber-400 font-mono">${subMontoServicios.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-center font-sans text-[10px] text-emerald-400 font-normal">
                          {empConfig?.salarioBase ? `$${empConfig.salarioBase.toLocaleString('es-DO')} / ${empConfig.tipoSalario || 'mensual'}` : 'Sin salario configurado'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

              </div>
            );
          })
        )}

        {/* Total General */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between text-xs font-bold gap-4">
          <div className="flex flex-col">
            <span className="text-amber-300 uppercase tracking-wider text-sm">
              TOTAL IMPORTE DE SERVICIOS:
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Monto total de servicios facturados al cliente. Pago de nómina pendiente de definición empresarial.
            </span>
          </div>
          <div className="flex items-center gap-6 text-white font-mono shrink-0">
            {totalHorasGen > 0 && <span className="text-amber-400">{totalHorasGen} Horas (H.T.)</span>}
            {totalViajesGen > 0 && <span className="text-blue-400">{totalViajesGen} Viajes</span>}
            {totalMetrosGen > 0 && <span className="text-emerald-400">{totalMetrosGen} m³</span>}
            <span className="text-xl text-amber-400 font-extrabold font-mono">
              ${totalMontoGen.toLocaleString('es-DO', { minimumFractionDigits: 2 })} DOP
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
