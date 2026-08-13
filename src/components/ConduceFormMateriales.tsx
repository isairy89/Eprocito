import React, { useState, useEffect } from 'react';
import {
  Cliente,
  Servicio,
  Empleado,
  ConduceMaterial,
  DetalleMaterialConduce,
  MATERIALES_ESTANDAR,
  UnidadCobro
} from '../types';
import { StorageService } from '../services/storage';
import { Truck, Plus, Trash2, AlertCircle, Save, ArrowLeft, Layers } from 'lucide-react';

interface ConduceFormMaterialesProps {
  clientes: Cliente[];
  servicios: Servicio[];
  empleados: Empleado[];
  onSave: (conduce: ConduceMaterial) => void;
  onCancel: () => void;
  conduceExistente?: ConduceMaterial | null;
}

export const ConduceFormMateriales: React.FC<ConduceFormMaterialesProps> = ({
  clientes,
  servicios,
  empleados,
  onSave,
  onCancel,
  conduceExistente
}) => {
  const choferes = empleados.filter((e) => e.rol === 'chofer' || e.rol === 'operador');

  // Estado del Formulario
  const [numeroConduce, setNumeroConduce] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [clienteId, setClienteId] = useState<string>('');
  const [direccionProyecto, setDireccionProyecto] = useState<string>('');
  
  const [capacidadCamionM3, setCapacidadCamionM3] = useState<number>(14);
  const [placaCamion, setPlacaCamion] = useState<string>('');
  const [choferNombre, setChoferNombre] = useState<string>('');
  const [recibidoConforme, setRecibidoConforme] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');

  // Filas de Detalle de Materiales
  const [detalles, setDetalles] = useState<DetalleMaterialConduce[]>([
    {
      material: 'Sub-base',
      cantidad: 28,
      unidad: 'metro',
      precioUnitario: 650,
      subtotal: 18200
    }
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inicialización
  useEffect(() => {
    if (conduceExistente) {
      setNumeroConduce(conduceExistente.numeroConduce);
      setFecha(conduceExistente.fecha);
      setClienteId(conduceExistente.clienteId);
      setDireccionProyecto(conduceExistente.direccionProyecto);
      setCapacidadCamionM3(conduceExistente.capacidadCamionM3);
      setPlacaCamion(conduceExistente.placaCamion);
      setChoferNombre(conduceExistente.choferNombre);
      setRecibidoConforme(conduceExistente.recibidoConforme);
      setDetalles(conduceExistente.detalles);
      setObservaciones(conduceExistente.observaciones || '');
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNumeroConduce(`E-00${randomNum}`);
    }
  }, [conduceExistente]);

  // Al cambiar cliente
  useEffect(() => {
    if (clienteId) {
      const cli = clientes.find((c) => c.id === clienteId);
      if (cli && !direccionProyecto) {
        setDireccionProyecto(cli.direccion || cli.proyectoPredeterminado || '');
      }
    }
  }, [clienteId, clientes]);

  // Al seleccionar chofer, autocompletar placa si tiene asignada
  useEffect(() => {
    if (choferNombre) {
      const emp = choferes.find((e) => e.nombre === choferNombre);
      if (emp && emp.placaAsignada && !placaCamion) {
        setPlacaCamion(emp.placaAsignada);
      }
    }
  }, [choferNombre, choferes]);

  // Agregar nueva fila de material
  const agregarFilaMaterial = () => {
    setDetalles([
      ...detalles,
      {
        material: MATERIALES_ESTANDAR[0],
        cantidad: 10,
        unidad: 'metro',
        precioUnitario: 800,
        subtotal: 10 * 800
      }
    ]);
  };

  // Eliminar fila
  const eliminarFilaMaterial = (index: number) => {
    if (detalles.length === 1) {
      setErrorMsg('El conduce debe incluir al menos un material o servicio.');
      return;
    }
    const nuevas = detalles.filter((_, idx) => idx !== index);
    setDetalles(nuevas);
  };

  // Actualizar campo de fila
  const actualizarFila = (index: number, campo: keyof DetalleMaterialConduce, valor: any) => {
    const copia = [...detalles];
    const item = { ...copia[index], [campo]: valor };

    // Si cambia el tipo de material, buscar si hay un servicio asociado para auto-llenar precio
    if (campo === 'material' && clienteId) {
      const servEncontrado = servicios.find((s) => s.nombre.toLowerCase().includes(valor.toLowerCase()));
      if (servEncontrado) {
        item.precioUnitario = StorageService.obtenerPrecioAcordado(clienteId, servEncontrado.id);
        item.unidad = servEncontrado.unidadCobro;
      }
    }

    item.subtotal = item.cantidad * item.precioUnitario;
    copia[index] = item;
    setDetalles(copia);
  };

  // Totales generales:
  // - 'metro': aporta a totalMetros, 0 viajes
  // - 'viaje': aporta a totalViajes, 0 metros
  // - 'hora': aporta a horas (no convierte metros a viajes usando la capacidad del camión)
  const totalMetrosCalculado = detalles
    .filter((d) => d.unidad === 'metro')
    .reduce((sum, d) => sum + d.cantidad, 0);

  const totalViajesCalculado = detalles
    .filter((d) => d.unidad === 'viaje')
    .reduce((sum, d) => sum + d.cantidad, 0);

  const montoTotalCalculado = detalles.reduce((sum, d) => sum + d.subtotal, 0);

  // Validación y Envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!numeroConduce.trim()) {
      setErrorMsg('El número de conduce E es obligatorio.');
      return;
    }
    if (!fecha) {
      setErrorMsg('La fecha es obligatoria.');
      return;
    }
    if (!clienteId) {
      setErrorMsg('Debe seleccionar el Cliente.');
      return;
    }
    if (!placaCamion.trim()) {
      setErrorMsg('Debe ingresar la Placa del camión.');
      return;
    }
    if (!choferNombre.trim()) {
      setErrorMsg('Debe especificar el Chofer del camión.');
      return;
    }
    if (detalles.length === 0) {
      setErrorMsg('Debe agregar al menos un material en el detalle.');
      return;
    }

    const tieneDetalleInvalido = detalles.some(
      (d) => !d.material.trim() || d.cantidad <= 0 || d.precioUnitario < 0
    );
    if (tieneDetalleInvalido) {
      setErrorMsg('Cada línea de detalle debe tener un material válido, cantidad mayor a 0 y precio mayor o igual a 0.');
      return;
    }

    const clienteObj = clientes.find((c) => c.id === clienteId);

    const conduceGuardar: ConduceMaterial = {
      id: conduceExistente ? conduceExistente.id : `cond-mat-${Date.now()}`,
      tipo: 'materiales',
      numeroConduce: numeroConduce.trim(),
      fecha,
      clienteId,
      clienteNombre: clienteObj ? clienteObj.nombre : 'Cliente Desconocido',
      direccionProyecto,
      capacidadCamionM3: Number(capacidadCamionM3),
      placaCamion: placaCamion.trim(),
      choferNombre: choferNombre.trim(),
      recibidoConforme: recibidoConforme.trim(),
      detalles,
      totalMetros: totalMetrosCalculado,
      totalViajes: totalViajesCalculado,
      montoTotal: montoTotalCalculado,
      observaciones,
      creadoEn: conduceExistente ? conduceExistente.creadoEn : new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };

    onSave(conduceGuardar);
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      
      {/* Header Formulario */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            {conduceExistente ? 'Modificar Conduce de Materiales (Conduce E)' : 'Registro de Conduce E — Materiales y Acarreo'}
          </h2>
          <p className="text-xs text-slate-400">
            Detalle por capacidad, placa de vehículo, m³ suministrados y número de viajes.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Cancelar
        </button>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Sección 1: Datos Generales */}
        <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            1. Datos del Conduce E y Destino
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">No. Conduce E *</label>
              <input
                type="text"
                value={numeroConduce}
                onChange={(e) => setNumeroConduce(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold focus:border-amber-500"
                placeholder="E-00500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Fecha *</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Cliente *</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
              >
                <option value="">-- Seleccionar Cliente --</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-xs font-medium">Dirección / Obra de Destino</label>
            <input
              type="text"
              value={direccionProyecto}
              onChange={(e) => setDireccionProyecto(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-amber-500"
              placeholder="Ej. Circunvalación Baní"
            />
          </div>
        </div>

        {/* Sección 2: Datos del Camión y Transporte */}
        <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            2. Información del Vehículo y Chofer
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Capacidad Camión (m³)</label>
              <input
                type="number"
                value={capacidadCamionM3}
                onChange={(e) => setCapacidadCamionM3(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Placa del Camión *</label>
              <input
                type="text"
                value={placaCamion}
                onChange={(e) => setPlacaCamion(e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase focus:border-amber-500"
                placeholder="L-000000"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Chofer Asignado *</label>
              <input
                type="text"
                list="lista-choferes"
                value={choferNombre}
                onChange={(e) => setChoferNombre(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                placeholder="Nombre del chofer"
              />
              <datalist id="lista-choferes">
                {choferes.map((emp) => (
                  <option key={emp.id} value={emp.nombre} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Recibido Conforme En Obra</label>
              <input
                type="text"
                value={recibidoConforme}
                onChange={(e) => setRecibidoConforme(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                placeholder="Ing. / Maestro en obra"
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Tabla Detalle de Materiales */}
        <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> 3. Detalle de Materiales / Servicios
            </h3>
            <button
              type="button"
              onClick={agregarFilaMaterial}
              className="px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Material
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase">
                <tr>
                  <th className="p-2.5">Tipo de Material / Servicio</th>
                  <th className="p-2.5 w-24">Cobro por</th>
                  <th className="p-2.5 w-28 text-right">Cantidad</th>
                  <th className="p-2.5 w-32 text-right">Precio Unit. ($)</th>
                  <th className="p-2.5 w-32 text-right">Subtotal ($)</th>
                  <th className="p-2.5 w-12 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {detalles.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-2">
                      <select
                        value={item.material}
                        onChange={(e) => actualizarFila(idx, 'material', e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                      >
                        {MATERIALES_ESTANDAR.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-2">
                      <select
                        value={item.unidad}
                        onChange={(e) => actualizarFila(idx, 'unidad', e.target.value as UnidadCobro)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white font-mono"
                      >
                        <option value="metro">Por Metro (m³)</option>
                        <option value="viaje">Por Viaje</option>
                      </select>
                    </td>

                    <td className="p-2 text-right">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={item.cantidad}
                        onChange={(e) => actualizarFila(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-right font-mono font-bold"
                      />
                    </td>

                    <td className="p-2 text-right">
                      <input
                        type="number"
                        value={item.precioUnitario}
                        onChange={(e) => actualizarFila(idx, 'precioUnitario', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-right font-mono"
                      />
                    </td>

                    <td className="p-2 text-right font-mono font-bold text-amber-400">
                      ${item.subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => eliminarFilaMaterial(idx)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        title="Eliminar fila"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-800 text-xs">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Total Volumen (m³):</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{totalMetrosCalculado} m³</p>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Total Viajes:</span>
              <p className="text-lg font-bold text-blue-400 font-mono">{totalViajesCalculado} viajes</p>
            </div>

            <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
              <span className="text-amber-300 font-semibold">Total Importe Conduce E:</span>
              <p className="text-xl font-black text-amber-400 font-mono">
                ${montoTotalCalculado.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl">
          <label className="block text-slate-300 mb-1 text-xs font-medium">Observaciones Adicionales</label>
          <textarea
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-amber-500"
            placeholder="Mina de origen, notas de pesaje, etc..."
          />
        </div>

        {/* Botones de Envío */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {conduceExistente ? 'Guardar Cambios' : 'Registrar Conduce E'}
          </button>
        </div>

      </form>
    </div>
  );
};
