import React, { useState, useMemo } from 'react';
import { Conduce, Cliente } from '../types';
import {
  FileText,
  Search,
  Filter,
  Tractor,
  Truck,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';

interface ConducesListProps {
  conduces: Conduce[];
  clientes: Cliente[];
  onEdit: (conduce: Conduce) => void;
  onDelete: (conduceId: string) => void;
  onNewEquipo: () => void;
  onNewMaterial: () => void;
}

export const ConducesList: React.FC<ConducesListProps> = ({
  conduces,
  clientes,
  onEdit,
  onDelete,
  onNewEquipo,
  onNewMaterial
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos'); // 'todos' | 'equipo_pesado' | 'materiales'
  const [clienteFiltro, setClienteFiltro] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  const [idEliminarConfirm, setIdEliminarConfirm] = useState<string | null>(null);

  // Filtrado de Conduces
  const conducesFiltrados = useMemo(() => {
    return conduces.filter((c) => {
      // Tipo
      if (tipoFiltro !== 'todos' && c.tipo !== tipoFiltro) return false;

      // Cliente
      if (clienteFiltro && c.clienteId !== clienteFiltro) return false;

      // Fecha inicio / fin
      if (fechaInicio && c.fecha < fechaInicio) return false;
      if (fechaFin && c.fecha > fechaFin) return false;

      // Búsqueda en texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const num = c.numeroConduce.toLowerCase();
        const cli = c.clienteNombre.toLowerCase();
        const dir = c.direccionProyecto.toLowerCase();
        const resp = c.tipo === 'equipo_pesado' ? c.operadorNombre.toLowerCase() : c.choferNombre.toLowerCase();
        const equipo = c.tipo === 'equipo_pesado' ? `${c.equipoAsignado} ${c.placa || ''}`.toLowerCase() : c.placaCamion.toLowerCase();

        return (
          num.includes(query) ||
          cli.includes(query) ||
          dir.includes(query) ||
          resp.includes(query) ||
          equipo.includes(query)
        );
      }

      return true;
    });
  }, [conduces, tipoFiltro, clienteFiltro, fechaInicio, fechaFin, searchTerm]);

  return (
    <div className="space-y-6">
      
      {/* Header & Filtros */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-400" />
              Registro de Conduces y Edición de Trabajos
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Consulte, filtre o edite cualquier conduce para corregir digitación. Los reportes se recalculan automáticamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNewEquipo}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Tractor className="w-4 h-4" /> + Conduce Equipos
            </button>
            <button
              onClick={onNewMaterial}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-amber-400" /> + Conduce E
            </button>
          </div>
        </div>

        {/* Buscador & Controles */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Búsqueda general */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por No. Conduce, cliente, chofer, placa..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Tipo de Conduce */}
          <div>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="equipo_pesado">Equipos Pesados (Por Hora)</option>
              <option value="materiales">Conduce E (Materiales)</option>
            </select>
          </div>

          {/* Cliente */}
          <div>
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Todos los Clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Fechas */}
          <div className="flex gap-1">
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-1/2 bg-slate-800 border border-slate-700 rounded-xl p-1.5 text-slate-200 text-[11px]"
              title="Fecha Inicio"
            />
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-1/2 bg-slate-800 border border-slate-700 rounded-xl p-1.5 text-slate-200 text-[11px]"
              title="Fecha Fin"
            />
          </div>

        </div>
      </div>

      {/* Tabla de Conduces */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Mostrando <strong className="text-white font-mono">{conducesFiltrados.length}</strong> de {conduces.length} conduces</span>
          <span className="text-[11px] text-amber-400/90 font-medium">✓ Edición con actualización automática de producción</span>
        </div>

        {conducesFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No se encontraron conduces que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">No. Conduce</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Cliente / Proyecto</th>
                  <th className="p-3">Equipo / Placa</th>
                  <th className="p-3">Operador / Chofer</th>
                  <th className="p-3 text-right">Cantidad (H.T. / Vol)</th>
                  <th className="p-3 text-right">Importe ($)</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {conducesFiltrados.map((c) => {
                  const esEquipo = c.tipo === 'equipo_pesado';
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* No. Conduce */}
                      <td className="p-3 font-mono font-bold text-amber-400">
                        {c.numeroConduce}
                      </td>

                      {/* Fecha */}
                      <td className="p-3 text-slate-300 font-mono">
                        {c.fecha}
                      </td>

                      {/* Tipo Badge */}
                      <td className="p-3">
                        {esEquipo ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <Tractor className="w-3 h-3" /> Equipo Pesado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <Truck className="w-3 h-3" /> Conduce E
                          </span>
                        )}
                      </td>

                      {/* Cliente */}
                      <td className="p-3">
                        <p className="font-semibold text-white">{c.clienteNombre}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{c.direccionProyecto}</p>
                      </td>

                      {/* Equipo / Placa */}
                      <td className="p-3 text-slate-200">
                        <p className="font-medium text-white">{esEquipo ? c.equipoAsignado : 'Camión Volteo'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {esEquipo ? (c.placa ? `Placa: ${c.placa}` : 'Placa: -') : `Placa: ${c.placaCamion || '-'}`}
                        </p>
                      </td>

                      {/* Operador / Chofer */}
                      <td className="p-3 text-slate-300">
                        {esEquipo ? (c.operadorNombre || 'Sin Asignar') : (c.choferNombre || 'Sin Asignar')}
                      </td>

                      {/* Cantidad */}
                      <td className="p-3 text-right font-mono font-bold">
                        {esEquipo ? (
                          <span className="text-amber-400">{c.totalHorasPagar} hrs</span>
                        ) : (
                          <span className="text-emerald-400">{c.totalMetros || 0} m³ ({c.totalViajes || 0} vj)</span>
                        )}
                      </td>

                      {/* Importe */}
                      <td className="p-3 text-right font-mono font-bold text-white">
                        ${c.montoTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Acciones */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onEdit(c)}
                            className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer"
                            title="Editar conduce / corregir datos"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setIdEliminarConfirm(c.id)}
                            className="p-1.5 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                            title="Eliminar conduce"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Confirmación de Eliminación */}
      {idEliminarConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirmar Eliminación</h3>
            </div>
            <p className="text-xs text-slate-300">
              ¿Está seguro de que desea eliminar este conduce? Esta acción actualizará automáticamente la producción y los reportes generales.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIdEliminarConfirm(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDelete(idEliminarConfirm);
                  setIdEliminarConfirm(null);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Eliminar Conduce
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
