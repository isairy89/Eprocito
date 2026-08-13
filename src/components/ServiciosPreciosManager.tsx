import React, { useState } from 'react';
import { Servicio, Cliente, PrecioCliente, UnidadCobro, Empleado } from '../types';
import { DollarSign, Plus, Edit2, Trash2, Check, ShieldCheck, UserPlus, Building2, UserCircle, Car } from 'lucide-react';

interface ServiciosPreciosManagerProps {
  servicios: Servicio[];
  clientes: Cliente[];
  preciosCliente: PrecioCliente[];
  empleados: Empleado[];
  onSaveServicio: (servicio: Servicio) => void;
  onSaveCliente?: (cliente: Cliente) => void;
  onSavePrecioCliente: (precio: PrecioCliente) => void;
  onDeletePrecioCliente: (id: string) => void;
  onSaveEmpleado?: (empleado: Empleado) => void;
  onDeleteEmpleado?: (id: string) => void;
}

export const ServiciosPreciosManager: React.FC<ServiciosPreciosManagerProps> = ({
  servicios,
  clientes,
  preciosCliente,
  empleados,
  onSaveServicio,
  onSaveCliente,
  onSavePrecioCliente,
  onDeletePrecioCliente,
  onSaveEmpleado,
  onDeleteEmpleado
}) => {
  const [activeTab, setActiveTab] = useState<'servicios' | 'clientes' | 'empleados'>('servicios');

  // Estado Formulario Servicio Base
  const [modalServicio, setModalServicio] = useState<boolean>(false);
  const [servicioEdit, setServicioEdit] = useState<Servicio | null>(null);

  const [nombreServicio, setNombreServicio] = useState<string>('');
  const [categoriaServicio, setCategoriaServicio] = useState<'equipo_pesado' | 'material' | 'acarreo_servicio'>('equipo_pesado');
  const [unidadCobro, setUnidadCobro] = useState<UnidadCobro>('hora');
  const [precioBase, setPrecioBase] = useState<number>(0); // Corregido: inicializar en 0

  // Estado Formulario Cliente
  const [modalCliente, setModalCliente] = useState<boolean>(false);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);
  
  const [nombreCliente, setNombreCliente] = useState<string>('');
  const [rncCliente, setRncCliente] = useState<string>('');
  const [contactoCliente, setContactoCliente] = useState<string>('');
  const [telefonoCliente, setTelefonoCliente] = useState<string>('');
  const [direccionCliente, setDireccionCliente] = useState<string>('');

  // Estado Formulario Empleado
  const [modalEmpleado, setModalEmpleado] = useState<boolean>(false);
  const [empleadoEdit, setEmpleadoEdit] = useState<Empleado | null>(null);

  const [nombreEmpleado, setNombreEmpleado] = useState<string>('');
  const [rolEmpleado, setRolEmpleado] = useState<'operador' | 'chofer' | 'chequeador' | 'administrativo'>('operador');
  const [salarioBase, setSalarioBase] = useState<number>(0);
  const [vehiculoAsignado, setVehiculoAsignado] = useState<string>('');
  const [placaAsignada, setPlacaAsignada] = useState<string>('');

  // Estado Formulario Tarifario Dinámico Cliente
  const [clienteSelId, setClienteSelId] = useState<string>('');
  const [servicioSelId, setServicioSelId] = useState<string>('');
  const [precioAcordadoInput, setPrecioAcordadoInput] = useState<number>(0);

  // Funciones Modal Servicio
  const handleOpenServicioModal = (s?: Servicio) => {
    if (s) {
      setServicioEdit(s);
      setNombreServicio(s.nombre);
      setCategoriaServicio(s.categoria);
      setUnidadCobro(s.unidadCobro);
      setPrecioBase(s.precioBase);
    } else {
      setServicioEdit(null);
      setNombreServicio('');
      setCategoriaServicio('equipo_pesado');
      setUnidadCobro('hora');
      setPrecioBase(0);
    }
    setModalServicio(true);
  };

  const handleGuardarServicio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreServicio.trim() || precioBase < 0) return;

    const servGuardar: Servicio = {
      id: servicioEdit ? servicioEdit.id : `serv-${Date.now()}`,
      nombre: nombreServicio.trim(),
      categoria: categoriaServicio,
      unidadCobro,
      precioBase: Number(precioBase)
    };

    onSaveServicio(servGuardar);
    setModalServicio(false);
  };

  // Funciones Modal Cliente
  const handleOpenClienteModal = (c?: Cliente) => {
    if (c) {
      setClienteEdit(c);
      setNombreCliente(c.nombre);
      setRncCliente(c.rnc || '');
      setContactoCliente(c.contacto || '');
      setTelefonoCliente(c.telefono || '');
      setDireccionCliente(c.direccion || '');
    } else {
      setClienteEdit(null);
      setNombreCliente('');
      setRncCliente('');
      setContactoCliente('');
      setTelefonoCliente('');
      setDireccionCliente('');
    }
    setModalCliente(true);
  };

  const handleGuardarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCliente.trim()) return;

    const clienteGuardar: Cliente = {
      id: clienteEdit ? clienteEdit.id : `cli-${Date.now()}`,
      nombre: nombreCliente.trim(),
      rnc: rncCliente.trim() || 'S/R',
      contacto: contactoCliente.trim(),
      telefono: telefonoCliente.trim(),
      direccion: direccionCliente.trim(),
      proyectoPredeterminado: direccionCliente.trim()
    };

    if (onSaveCliente) {
      onSaveCliente(clienteGuardar);
    }
    setModalCliente(false);
  };

  // Funciones Modal Empleado
  const handleOpenEmpleadoModal = (emp?: Empleado) => {
    if (emp) {
      setEmpleadoEdit(emp);
      setNombreEmpleado(emp.nombre);
      setRolEmpleado(emp.rol);
      setSalarioBase(emp.salarioBase || 0);
      setVehiculoAsignado(emp.vehiculoAsignado || '');
      setPlacaAsignada(emp.placaAsignada || '');
    } else {
      setEmpleadoEdit(null);
      setNombreEmpleado('');
      setRolEmpleado('operador');
      setSalarioBase(0);
      setVehiculoAsignado('');
      setPlacaAsignada('');
    }
    setModalEmpleado(true);
  };

  const handleGuardarEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEmpleado.trim()) return;

    const empleadoGuardar: Empleado = {
      id: empleadoEdit ? empleadoEdit.id : `emp-${Date.now()}`,
      nombre: nombreEmpleado.trim(),
      rol: rolEmpleado,
      salarioBase: Number(salarioBase),
      vehiculoAsignado: vehiculoAsignado.trim() || undefined,
      placaAsignada: placaAsignada.trim() || undefined
    };

    if (onSaveEmpleado) {
      onSaveEmpleado(empleadoGuardar);
    }
    setModalEmpleado(false);
  };

  // Guardar Tarifa Dinámica por Cliente
  const handleAgregarPrecioCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelId || !servicioSelId || precioAcordadoInput < 0) return;

    const nuevo: PrecioCliente = {
      id: `pc-${Date.now()}`,
      clienteId: clienteSelId,
      servicioId: servicioSelId,
      precioAcordado: Number(precioAcordadoInput)
    };

    onSavePrecioCliente(nuevo);
    setClienteSelId('');
    setServicioSelId('');
    setPrecioAcordadoInput(0);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-amber-400" />
              Catálogos Maestros (Servicios, Clientes, Empleados)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gestiona todos los registros base de tu aplicación en un solo lugar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenEmpleadoModal()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserCircle className="w-4 h-4 text-emerald-400" /> Nuevo Empleado
            </button>
            <button
              onClick={() => handleOpenClienteModal()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" /> Nuevo Cliente
            </button>
            <button
              onClick={() => handleOpenServicioModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo Servicio
            </button>
          </div>
        </div>

        {/* Navegación por Pestañas Internas */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => setActiveTab('servicios')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'servicios' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Servicios y Precios
          </button>
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'clientes' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('empleados')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'empleados' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Empleados y Equipos
          </button>
        </div>
      </div>

      {activeTab === 'servicios' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Catálogo de Servicios Básicos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Catálogo General de Servicios
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase">
                  <tr>
                    <th className="p-2.5">Servicio</th>
                    <th className="p-2.5">Unidad Cobro</th>
                    <th className="p-2.5 text-right">Precio Base ($)</th>
                    <th className="p-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {servicios.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-semibold text-white">{s.nombre}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400 uppercase">
                          Por {s.unidadCobro}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-white font-bold">
                        ${s.precioBase.toLocaleString('es-DO')}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => handleOpenServicioModal(s)}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-amber-400 cursor-pointer"
                          title="Editar servicio"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {servicios.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No hay servicios registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matriz de Precios Acordados por Cliente */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Matriz de Precios Dinámicos por Cliente
            </h2>

            <form onSubmit={handleAgregarPrecioCliente} className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl space-y-3 text-xs">
              <p className="font-semibold text-amber-400">Asignar Precio Especial a Cliente</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Cliente</label>
                  <select
                    value={clienteSelId}
                    onChange={(e) => setClienteSelId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="">Seleccionar...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Servicio</label>
                  <select
                    value={servicioSelId}
                    onChange={(e) => setServicioSelId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="">Seleccionar...</option>
                    {servicios.map((s) => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400">Precio Acordado ($)</label>
                  <input
                    type="number"
                    value={precioAcordadoInput}
                    onChange={(e) => setPrecioAcordadoInput(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white font-mono"
                    placeholder="ej. 3200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Guardar Tarifa Especial
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase">
                  <tr>
                    <th className="p-2.5">Cliente</th>
                    <th className="p-2.5">Servicio</th>
                    <th className="p-2.5 text-right">Precio Acordado</th>
                    <th className="p-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {preciosCliente.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No hay tarifas específicas por cliente. Se usan las tarifas base.
                      </td>
                    </tr>
                  ) : (
                    preciosCliente.map((pc) => {
                      const cli = clientes.find((c) => c.id === pc.clienteId);
                      const serv = servicios.find((s) => s.id === pc.servicioId);
                      return (
                        <tr key={pc.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-semibold text-white">{cli ? cli.nombre : 'Cliente'}</td>
                          <td className="p-2.5 text-slate-300">{serv ? serv.nombre : 'Servicio'}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-amber-400">
                            ${pc.precioAcordado.toLocaleString('es-DO')}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => onDeletePrecioCliente(pc.id)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              title="Eliminar tarifa especial"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clientes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Directorio de Clientes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase">
                <tr>
                  <th className="p-2.5">Nombre / RNC</th>
                  <th className="p-2.5">Contacto</th>
                  <th className="p-2.5">Dirección / Proyecto</th>
                  <th className="p-2.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {clientes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5">
                      <p className="font-bold text-white">{c.nombre}</p>
                      <p className="text-[10px] text-slate-400">RNC: {c.rnc}</p>
                    </td>
                    <td className="p-2.5">
                      <p className="text-slate-200">{c.contacto || 'Sin contacto'}</p>
                      <p className="text-[10px] text-slate-400">{c.telefono}</p>
                    </td>
                    <td className="p-2.5 text-slate-300">
                      {c.direccion || c.proyectoPredeterminado || 'N/A'}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => handleOpenClienteModal(c)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-amber-400 cursor-pointer"
                        title="Editar cliente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      No hay clientes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'empleados' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Nómina de Empleados y Operadores
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase">
                <tr>
                  <th className="p-2.5">Nombre y Rol</th>
                  <th className="p-2.5">Vehículo / Equipo Asignado</th>
                  <th className="p-2.5 text-right">Salario Base</th>
                  <th className="p-2.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {empleados.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5">
                      <p className="font-bold text-white">{e.nombre}</p>
                      <p className="text-[10px] font-mono text-emerald-400 uppercase">{e.rol}</p>
                    </td>
                    <td className="p-2.5">
                      {e.vehiculoAsignado ? (
                        <div>
                          <p className="text-slate-200">{e.vehiculoAsignado}</p>
                          {e.placaAsignada && <p className="text-[10px] text-slate-400">Placa: {e.placaAsignada}</p>}
                        </div>
                      ) : (
                        <span className="text-slate-500">Sin asignación</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-white">
                      ${(e.salarioBase || 0).toLocaleString('es-DO')}
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEmpleadoModal(e)}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-amber-400 cursor-pointer"
                          title="Editar empleado"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar al empleado ${e.nombre}?`) && onDeleteEmpleado) {
                              onDeleteEmpleado(e.id);
                            }
                          }}
                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-rose-400 cursor-pointer"
                          title="Eliminar empleado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {empleados.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      No hay empleados registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Servicio */}
      {modalServicio && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              {servicioEdit ? 'Editar Servicio' : 'Nuevo Servicio de Catálogo'}
            </h3>

            <form onSubmit={handleGuardarServicio} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nombre del Servicio / Equipo</label>
                <input
                  type="text"
                  required
                  value={nombreServicio}
                  onChange={(e) => setNombreServicio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  placeholder="ej. Camión Volteo 14m³"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Categoría</label>
                <select
                  value={categoriaServicio}
                  onChange={(e) => setCategoriaServicio(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="equipo_pesado">Equipo Pesado</option>
                  <option value="material">Materiales</option>
                  <option value="acarreo_servicio">Acarreo / Servicio</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Unidad de Cobro *</label>
                <select
                  value={unidadCobro}
                  onChange={(e) => setUnidadCobro(e.target.value as UnidadCobro)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                >
                  <option value="hora">Por Hora (Equipos pesados)</option>
                  <option value="viaje">Por Viaje (Camiones / Bote)</option>
                  <option value="metro">Por Metro m³ (Materiales / Acarreo)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Precio Base ($ DOP) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalServicio(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Cliente */}
      {modalCliente && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              {clienteEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h3>

            <form onSubmit={handleGuardarCliente} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nombre del Cliente / Empresa *</label>
                <input
                  type="text"
                  required
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                  placeholder="ej. Constructora Bisonó"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">RNC / Cédula</label>
                  <input
                    type="text"
                    value={rncCliente}
                    onChange={(e) => setRncCliente(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    placeholder="1-01-00000-0"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="(809) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Contacto Principal</label>
                <input
                  type="text"
                  value={contactoCliente}
                  onChange={(e) => setContactoCliente(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  placeholder="ej. Ing. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Dirección / Proyecto Principal</label>
                <input
                  type="text"
                  value={direccionCliente}
                  onChange={(e) => setDireccionCliente(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  placeholder="ej. Proyecto Carretera Mella Km 12"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCliente(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Empleado */}
      {modalEmpleado && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-emerald-400" />
              {empleadoEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h3>

            <form onSubmit={handleGuardarEmpleado} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombreEmpleado}
                  onChange={(e) => setNombreEmpleado(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                  placeholder="ej. Pedro Fernández"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Rol</label>
                  <select
                    value={rolEmpleado}
                    onChange={(e) => setRolEmpleado(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white uppercase font-mono"
                  >
                    <option value="operador">Operador de Equipo</option>
                    <option value="chofer">Chofer de Camión</option>
                    <option value="chequeador">Chequeador / Supervisor</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Salario Base ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={salarioBase}
                    onChange={(e) => setSalarioBase(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Vehículo / Equipo Asignado (Opcional)</label>
                <input
                  type="text"
                  value={vehiculoAsignado}
                  onChange={(e) => setVehiculoAsignado(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  placeholder="ej. Retroexcavadora CAT 320"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Útil para autocompletar en los conduces y control de gasoil.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Placa (Opcional)</label>
                <input
                  type="text"
                  value={placaAsignada}
                  onChange={(e) => setPlacaAsignada(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase"
                  placeholder="L-000000"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEmpleado(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Guardar Empleado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
