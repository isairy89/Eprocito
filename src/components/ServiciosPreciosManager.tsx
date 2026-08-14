import React, { useState } from 'react';
import { Servicio, Cliente, PrecioCliente, UnidadCobro } from '../types';
import { DollarSign, Plus, Edit2, Trash2, Check, ShieldCheck, UserPlus, Building2 } from 'lucide-react';

interface ServiciosPreciosManagerProps {
  servicios: Servicio[];
  clientes: Cliente[];
  preciosCliente: PrecioCliente[];
  onSaveServicio: (servicio: Servicio) => void;
  onSaveCliente?: (cliente: Cliente) => void;
  onSavePrecioCliente: (precio: PrecioCliente) => void;
  onDeletePrecioCliente: (id: string) => void;
}

export const ServiciosPreciosManager: React.FC<ServiciosPreciosManagerProps> = ({
  servicios,
  clientes,
  preciosCliente,
  onSaveServicio,
  onSaveCliente,
  onSavePrecioCliente,
  onDeletePrecioCliente
}) => {
  // Estado Formulario Servicio Base
  const [modalServicio, setModalServicio] = useState<boolean>(false);
  const [servicioEdit, setServicioEdit] = useState<Servicio | null>(null);

  const [nombreServicio, setNombreServicio] = useState<string>('');
  const [categoriaServicio, setCategoriaServicio] = useState<'equipo_pesado' | 'material' | 'acarreo_servicio'>('equipo_pesado');
  const [unidadCobro, setUnidadCobro] = useState<UnidadCobro>('hora');
  const [precioBase, setPrecioBase] = useState<number>(1000);

  // Estado Formulario Cliente
  const [modalCliente, setModalCliente] = useState<boolean>(false);
  const [nombreCliente, setNombreCliente] = useState<string>('');
  const [rncCliente, setRncCliente] = useState<string>('');
  const [contactoCliente, setContactoCliente] = useState<string>('');
  const [telefonoCliente, setTelefonoCliente] = useState<string>('');
  const [direccionCliente, setDireccionCliente] = useState<string>('');

  // Estado Formulario Tarifario Dinámico Cliente
  const [clienteSelId, setClienteSelId] = useState<string>('');
  const [servicioSelId, setServicioSelId] = useState<string>('');
  const [precioAcordadoInput, setPrecioAcordadoInput] = useState<number>(0);

  // Abrir Modal Servicio
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
      setPrecioBase(1000);
    }
    setModalServicio(true);
  };

  // Abrir Modal Cliente
  const handleOpenClienteModal = () => {
    setNombreCliente('');
    setRncCliente('');
    setContactoCliente('');
    setTelefonoCliente('');
    setDireccionCliente('');
    setModalCliente(true);
  };

  // Guardar Cliente
  const handleGuardarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCliente.trim()) return;

    const nuevoCliente: Cliente = {
      id: `cli-${Date.now()}`,
      nombre: nombreCliente.trim(),
      rnc: rncCliente.trim() || 'S/R',
      contacto: contactoCliente.trim(),
      telefono: telefonoCliente.trim(),
      direccion: direccionCliente.trim(),
      proyectoPredeterminado: direccionCliente.trim()
    };

    if (onSaveCliente) {
      onSaveCliente(nuevoCliente);
    }
    setModalCliente(false);
  };

  // Guardar Servicio Base
  const handleGuardarServicio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreServicio.trim() || precioBase <= 0) return;

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

  // Guardar Tarifa Dinámica por Cliente
  const handleAgregarPrecioCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteSelId || !servicioSelId || precioAcordadoInput <= 0) return;

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
              Configuración de Servicios y Precios Dinámicos
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Las tarifas no son fijas universales; varían según cliente y servicio contratado.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              <Plus className="w-4 h-4" /> Nuevo Servicio Catálogo
            </button>
          </div>
        </div>

        {/* Regla Importante Regla #2 */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
          <span>
            <strong>Garantía de Registros Históricos:</strong> Los precios configurados aplican a conduces futuros. Modificar un precio no altera retroactivamente los conduces ya registrados.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Lado Izquierdo: Catálogo de Servicios Básicos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            Catálogo General de Servicios y Unidades de Cobro
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Lado Derecho: Matriz de Precios Acordados por Cliente */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Matriz de Precios Dinámicos por Cliente
          </h2>

          {/* Formulario Agregar Tarifa Cliente */}
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

          {/* Lista de Tarifas Especiales */}
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

      {/* Modal Crear / Editar Servicio */}
      {modalServicio && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
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
                  min="1"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalServicio(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Crear Cliente */}
      {modalCliente && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" /> Nuevo Cliente
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
                  placeholder="ej. New Hope Dominicana"
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

    </div>
  );
};
