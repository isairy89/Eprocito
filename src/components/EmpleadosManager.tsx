import React, { useState } from 'react';
import { Empleado } from '../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Phone,
  HardHat,
  Truck,
  Tractor,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

interface EmpleadosManagerProps {
  empleados: Empleado[];
  onSaveEmpleado: (empleado: Empleado) => void;
  onDeleteEmpleado?: (id: string) => void;
}

export const EmpleadosManager: React.FC<EmpleadosManagerProps> = ({
  empleados,
  onSaveEmpleado,
  onDeleteEmpleado
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalEmpleado, setModalEmpleado] = useState<boolean>(false);
  const [empleadoEdit, setEmpleadoEdit] = useState<Empleado | null>(null);

  // Form state
  const [nombre, setNombre] = useState<string>('');
  const [cedula, setCedula] = useState<string>('');
  const [rol, setRol] = useState<'operador' | 'chofer' | 'chequeador' | 'administrativo'>('operador');
  const [telefono, setTelefono] = useState<string>('');
  const [vehiculoAsignado, setVehiculoAsignado] = useState<string>('');
  const [placaAsignada, setPlacaAsignada] = useState<string>('');
  const [salarioBase, setSalarioBase] = useState<number>(0);
  const [tipoSalario, setTipoSalario] = useState<'quincenal' | 'mensual' | 'por_hora' | 'por_viaje'>('mensual');

  const handleOpenModal = (emp?: Empleado) => {
    if (emp) {
      setEmpleadoEdit(emp);
      setNombre(emp.nombre);
      setCedula(emp.cedula || '');
      setRol(emp.rol);
      setTelefono(emp.telefono || '');
      setVehiculoAsignado(emp.vehiculoAsignado || '');
      setPlacaAsignada(emp.placaAsignada || '');
      setSalarioBase(emp.salarioBase || 0);
      setTipoSalario(emp.tipoSalario || 'mensual');
    } else {
      setEmpleadoEdit(null);
      setNombre('');
      setCedula('');
      setRol('operador');
      setTelefono('');
      setVehiculoAsignado('');
      setPlacaAsignada('');
      setSalarioBase(0);
      setTipoSalario('mensual');
    }
    setModalEmpleado(true);
  };

  const handleGuardarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const empGuardar: Empleado = {
      id: empleadoEdit ? empleadoEdit.id : `emp-${Date.now()}`,
      nombre: nombre.trim(),
      cedula: cedula.trim(),
      rol,
      telefono: telefono.trim(),
      vehiculoAsignado: vehiculoAsignado.trim(),
      placaAsignada: placaAsignada.trim().toUpperCase(),
      salarioBase: Number(salarioBase) > 0 ? Number(salarioBase) : undefined,
      tipoSalario
    };

    onSaveEmpleado(empGuardar);
    setModalEmpleado(false);
  };

  const empleadosFiltrados = empleados.filter(
    (e) =>
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.cedula && e.cedula.includes(searchTerm)) ||
      (e.vehiculoAsignado && e.vehiculoAsignado.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.placaAsignada && e.placaAsignada.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRolBadge = (r: Empleado['rol']) => {
    switch (r) {
      case 'operador':
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
            <Tractor className="w-3 h-3" /> Operador Equipo
          </span>
        );
      case 'chofer':
        return (
          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
            <Truck className="w-3 h-3" /> Chofer Volteo
          </span>
        );
      case 'chequeador':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
            <HardHat className="w-3 h-3" /> Chequeador Campo
          </span>
        );
      case 'administrativo':
        return (
          <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
            <Users className="w-3 h-3" /> Administrativo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                Paso 1: Configurar Empresa
              </span>
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" />
              Gestión de Empleados, Operadores y Choferes
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Catálogo de personal operativo, choferes de camiones de volteo, operadores de equipos pesados y chequeadores de campo.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Registrar Nuevo Empleado
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-800/60 border border-slate-800 rounded-xl text-slate-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Los empleados registrados aparecerán automáticamente en las opciones de asignación de conduces y en el reporte consolidado de <strong>Nómina y Horas Trabajadas</strong>.
          </span>
        </div>
      </div>

      {/* Buscador & Métricas */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, cédula, placa o equipo..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium self-end sm:self-center">
          Total Personal: <strong className="text-amber-400 font-bold">{empleados.length}</strong>
        </div>
      </div>

      {/* Tabla de Empleados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Nombre del Empleado</th>
                <th className="p-3.5">Rol Operativo</th>
                <th className="p-3.5">Cédula</th>
                <th className="p-3.5">Teléfono</th>
                <th className="p-3.5">Equipo / Vehículo Asignado</th>
                <th className="p-3.5">Placa</th>
                <th className="p-3.5">Salario / Tarifa</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {empleadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No se encontraron empleados que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                empleadosFiltrados.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-black text-xs shrink-0 border border-slate-700">
                        {e.nombre.charAt(0)}
                      </div>
                      <span>{e.nombre}</span>
                    </td>
                    <td className="p-3.5">{getRolBadge(e.rol)}</td>
                    <td className="p-3.5 font-mono text-slate-400">{e.cedula || 'S/C'}</td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {e.telefono || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-medium">
                      {e.vehiculoAsignado || 'N/A'}
                    </td>
                    <td className="p-3.5">
                      {e.placaAsignada ? (
                        <span className="bg-slate-950 border border-slate-800 font-mono text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          {e.placaAsignada}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">S/P</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {e.salarioBase ? (
                        <span className="text-emerald-400 font-mono font-bold">
                          ${e.salarioBase.toLocaleString('es-DO')}{' '}
                          <span className="text-[10px] text-slate-400 font-normal font-sans">
                            ({e.tipoSalario || 'mensual'})
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px] italic">Sin configurar</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(e)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                          title="Editar Empleado"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteEmpleado && (
                          <button
                            onClick={() => onDeleteEmpleado(e.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Empleado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Empleado */}
      {modalEmpleado && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-amber-400" />
              {empleadoEdit ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}
            </h3>

            <form onSubmit={handleGuardarEmpleado} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-amber-500 outline-none"
                  placeholder="ej. Carlos Manuel Rodríguez"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Rol Operativo *</label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                  >
                    <option value="operador">Operador (Equipo Pesado)</option>
                    <option value="chofer">Chofer (Camión Volteo)</option>
                    <option value="chequeador">Chequeador de Campo</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Cédula</label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono outline-none focus:border-amber-500"
                    placeholder="001-0000000-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                  placeholder="(809) 000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Vehículo / Equipo Asignado</label>
                  <input
                    type="text"
                    value={vehiculoAsignado}
                    onChange={(e) => setVehiculoAsignado(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                    placeholder="ej. Camión Mack 14m³"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Placa Asignada</label>
                  <input
                    type="text"
                    value={placaAsignada}
                    onChange={(e) => setPlacaAsignada(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono uppercase outline-none focus:border-amber-500"
                    placeholder="ej. L-394810"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Salario / Tarifa Base ($)</label>
                  <input
                    type="number"
                    value={salarioBase || ''}
                    onChange={(e) => setSalarioBase(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono outline-none focus:border-amber-500"
                    placeholder="ej. 35000"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Esquema de Pago</label>
                  <select
                    value={tipoSalario}
                    onChange={(e) => setTipoSalario(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="por_hora">Por Hora</option>
                    <option value="por_viaje">Por Viaje</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalEmpleado(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {empleadoEdit ? 'Actualizar Empleado' : 'Guardar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
