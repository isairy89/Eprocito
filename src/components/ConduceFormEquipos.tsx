import React, { useState, useEffect } from 'react';
import {
  Cliente,
  Servicio,
  Empleado,
  ConduceEquipoPesado,
  TurnoHorario
} from '../types';
import { StorageService } from '../services/storage';
import { Tractor, Clock, CheckCircle2, AlertCircle, Save, ArrowLeft } from 'lucide-react';

interface ConduceFormEquiposProps {
  clientes: Cliente[];
  servicios: Servicio[];
  empleados: Empleado[];
  onSave: (conduce: ConduceEquipoPesado) => void;
  onCancel: () => void;
  conduceExistente?: ConduceEquipoPesado | null;
}

export const ConduceFormEquipos: React.FC<ConduceFormEquiposProps> = ({
  clientes,
  servicios,
  empleados,
  onSave,
  onCancel,
  conduceExistente
}) => {
  // Filtrar solo servicios que aplican para equipos por hora
  const serviciosEquipos = servicios.filter(
    (s) => s.categoria === 'equipo_pesado' || s.unidadCobro === 'hora'
  );

  const operadores = empleados.filter((e) => e.rol === 'operador' || e.rol === 'chofer');
  const chequeadores = empleados.filter((e) => e.rol === 'chequeador' || e.rol === 'administrativo');

  // Estado del Formulario
  const [numeroConduce, setNumeroConduce] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [clienteId, setClienteId] = useState<string>('');
  const [direccionProyecto, setDireccionProyecto] = useState<string>('');
  const [telefonoContacto, setTelefonoContacto] = useState<string>('');
  
  const [servicioId, setServicioId] = useState<string>('');
  const [equipoAsignado, setEquipoAsignado] = useState<string>('');
  const [placa, setPlaca] = useState<string>('');

  // Turnos
  const [mananaInicio, setMananaInicio] = useState<string>('08:00');
  const [mananaFin, setMananaFin] = useState<string>('12:00');
  
  const [tardeInicio, setTardeInicio] = useState<string>('13:00');
  const [tardeFin, setTardeFin] = useState<string>('17:00');
  
  const [nocheInicio, setNocheInicio] = useState<string>('');
  const [nocheFin, setNocheFin] = useState<string>('');

  // Horas y Precio
  const [totalHorasPagar, setTotalHorasPagar] = useState<number>(8);
  const [precioPorHora, setPrecioPorHora] = useState<number>(0);

  // Empleados asignados
  const [operadorNombre, setOperadorNombre] = useState<string>('');
  const [chequeadorNombre, setChequeadorNombre] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');

  // Mensajes de Validación
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Autogenerar Número de Conduce al crear nuevo
  useEffect(() => {
    if (conduceExistente) {
      setNumeroConduce(conduceExistente.numeroConduce);
      setFecha(conduceExistente.fecha);
      setClienteId(conduceExistente.clienteId);
      setDireccionProyecto(conduceExistente.direccionProyecto);
      setTelefonoContacto(conduceExistente.telefonoContacto || '');
      setServicioId(conduceExistente.servicioId);
      setEquipoAsignado(conduceExistente.equipoAsignado);
      setPlaca(conduceExistente.placa || '');
      
      if (conduceExistente.turnoManana) {
        setMananaInicio(conduceExistente.turnoManana.inicio);
        setMananaFin(conduceExistente.turnoManana.fin);
      }
      if (conduceExistente.turnoTarde) {
        setTardeInicio(conduceExistente.turnoTarde.inicio);
        setTardeFin(conduceExistente.turnoTarde.fin);
      }
      if (conduceExistente.turnoNoche) {
        setNocheInicio(conduceExistente.turnoNoche.inicio);
        setNocheFin(conduceExistente.turnoNoche.fin);
      }

      setTotalHorasPagar(conduceExistente.totalHorasPagar);
      setPrecioPorHora(conduceExistente.precioPorHora);
      setOperadorNombre(conduceExistente.operadorNombre);
      setChequeadorNombre(conduceExistente.chequeadorNombre);
      setObservaciones(conduceExistente.observaciones || '');
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNumeroConduce(`EP-00${randomNum}`);
    }
  }, [conduceExistente]);

  // Al seleccionar cliente, cargar dirección predeterminada y teléfono
  useEffect(() => {
    if (clienteId) {
      const cli = clientes.find((c) => c.id === clienteId);
      if (cli) {
        if (!direccionProyecto) setDireccionProyecto(cli.direccion || cli.proyectoPredeterminado || '');
        if (!telefonoContacto) setTelefonoContacto(cli.telefono || '');
      }
      // Actualizar precio si hay servicio seleccionado
      if (servicioId) {
        const precioDinamico = StorageService.obtenerPrecioAcordado(clienteId, servicioId);
        setPrecioPorHora(precioDinamico);
      }
    }
  }, [clienteId, clientes]);

  // Al seleccionar servicio, actualizar equipo asignado y precio por hora
  useEffect(() => {
    if (servicioId) {
      const serv = servicios.find((s) => s.id === servicioId);
      if (serv) {
        setEquipoAsignado(serv.nombre);
        if (clienteId) {
          const precioDinamico = StorageService.obtenerPrecioAcordado(clienteId, servicioId);
          setPrecioPorHora(precioDinamico);
        } else {
          setPrecioPorHora(serv.precioBase);
        }
      }
    }
  }, [servicioId, clienteId, servicios]);

  // Cálculo de Horas por Turno
  const calcularHorasTurno = (inicio: string, fin: string): number => {
    if (!inicio || !fin) return 0;
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    if (mins2 <= mins1) return 0;
    return Number(((mins2 - mins1) / 60).toFixed(2));
  };

  const horasManana = calcularHorasTurno(mananaInicio, mananaFin);
  const horasTarde = calcularHorasTurno(tardeInicio, tardeFin);
  const horasNoche = calcularHorasTurno(nocheInicio, nocheFin);
  const subtotalHorasCalculado = horasManana + horasTarde + horasNoche;

  // Actualizar automáticamente totalHorasPagar cuando subtotal cambia (si no fue modificado manualmente a 0)
  useEffect(() => {
    if (!conduceExistente && subtotalHorasCalculado > 0) {
      setTotalHorasPagar(subtotalHorasCalculado);
    }
  }, [subtotalHorasCalculado, conduceExistente]);

  const montoTotalCalculado = totalHorasPagar * precioPorHora;

  // Validación y Guardado
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!numeroConduce.trim()) {
      setErrorMsg('El número de conduce es obligatorio.');
      return;
    }
    if (!fecha) {
      setErrorMsg('La fecha del conduce es obligatoria.');
      return;
    }
    if (!clienteId) {
      setErrorMsg('Debe seleccionar un Cliente.');
      return;
    }
    if (!servicioId) {
      setErrorMsg('Debe seleccionar el Equipo / Servicio pesado.');
      return;
    }
    if (totalHorasPagar <= 0) {
      setErrorMsg('El total de horas a pagar debe ser mayor a 0.');
      return;
    }
    if (precioPorHora <= 0) {
      setErrorMsg('El precio por hora debe ser mayor a $0 DOP.');
      return;
    }
    if (!operadorNombre.trim()) {
      setErrorMsg('Debe especificar el Operador responsable del equipo.');
      return;
    }

    const clienteObj = clientes.find((c) => c.id === clienteId);

    const conduceGuardar: ConduceEquipoPesado = {
      id: conduceExistente ? conduceExistente.id : `cond-ep-${Date.now()}`,
      tipo: 'equipo_pesado',
      numeroConduce: numeroConduce.trim(),
      fecha,
      clienteId,
      clienteNombre: clienteObj ? clienteObj.nombre : 'Cliente Desconocido',
      direccionProyecto,
      telefonoContacto,
      servicioId,
      equipoAsignado,
      placa: placa.trim() || undefined,
      turnoManana: horasManana > 0 ? { inicio: mananaInicio, fin: mananaFin, horas: horasManana } : undefined,
      turnoTarde: horasTarde > 0 ? { inicio: tardeInicio, fin: tardeFin, horas: horasTarde } : undefined,
      turnoNoche: horasNoche > 0 ? { inicio: nocheInicio, fin: nocheFin, horas: horasNoche } : undefined,
      subtotalHoras: subtotalHorasCalculado,
      totalHorasPagar: Number(totalHorasPagar),
      precioPorHora: Number(precioPorHora),
      montoTotal: Number(montoTotalCalculado),
      operadorNombre,
      chequeadorNombre,
      observaciones,
      creadoEn: conduceExistente ? conduceExistente.creadoEn : new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };

    onSave(conduceGuardar);
  };

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      
      {/* Header del Formulario */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tractor className="w-5 h-5 text-amber-400" />
            {conduceExistente ? 'Modificar Conduce de Equipo Pesado' : 'Registro de Conduce — Equipo Pesado'}
          </h2>
          <p className="text-xs text-slate-400">
            Paga por hora trabajada. Regla: Todas las horas registradas se pagan íntegramente.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Cancelar
        </button>
      </div>

      {/* Alerta de Error de Validación */}
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
            1. Información del Conduce y Cliente
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">No. Conduce *</label>
              <input
                type="text"
                value={numeroConduce}
                onChange={(e) => setNumeroConduce(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold focus:border-amber-500"
                placeholder="EP-00100"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Fecha de Trabajo *</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Dirección / Proyecto</label>
              <input
                type="text"
                value={direccionProyecto}
                onChange={(e) => setDireccionProyecto(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                placeholder="Ej. Av. Ecológica Tramo III"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Teléfono de Contacto</label>
              <input
                type="text"
                value={telefonoContacto}
                onChange={(e) => setTelefonoContacto(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                placeholder="(809) 000-0000"
              />
            </div>
          </div>
        </div>

        {/* Sección 2: Selección de Equipo */}
        <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            2. Asignación de Equipo Pesado
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Equipo / Servicio *</label>
              <select
                value={servicioId}
                onChange={(e) => setServicioId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
              >
                <option value="">-- Seleccionar Equipo --</option>
                {serviciosEquipos.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} (${s.precioBase.toLocaleString('es-DO')}/hr base)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Descripción del Equipo Asignado</label>
              <input
                type="text"
                value={equipoAsignado}
                onChange={(e) => setEquipoAsignado(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                placeholder="Ej. Retroexcavadora CAT 320 (#01)"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Placa del Equipo (Opcional)</label>
              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase focus:border-amber-500"
                placeholder="Ej. EQUIP-01"
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Horarios por Turnos */}
        <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-4 h-4" /> 3. Registro de Horarios por Turno
            </h3>
            <span className="text-[11px] text-slate-400">
              Subtotal Calculado: <strong className="text-amber-400 font-mono">{subtotalHorasCalculado} hrs</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* Turno Mañana */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-300 font-semibold">
                <span>Mañana</span>
                <span className="text-amber-400 font-mono">{horasManana} hrs</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Inicio</label>
                  <input
                    type="time"
                    value={mananaInicio}
                    onChange={(e) => setMananaInicio(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Fin</label>
                  <input
                    type="time"
                    value={mananaFin}
                    onChange={(e) => setMananaFin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Turno Tarde */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-300 font-semibold">
                <span>Tarde</span>
                <span className="text-amber-400 font-mono">{horasTarde} hrs</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Inicio</label>
                  <input
                    type="time"
                    value={tardeInicio}
                    onChange={(e) => setTardeInicio(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Fin</label>
                  <input
                    type="time"
                    value={tardeFin}
                    onChange={(e) => setTardeFin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Turno Noche */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-slate-300 font-semibold">
                <span>Noche (Opcional)</span>
                <span className="text-amber-400 font-mono">{horasNoche} hrs</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Inicio</label>
                  <input
                    type="time"
                    value={nocheInicio}
                    onChange={(e) => setNocheInicio(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Fin</label>
                  <input
                    type="time"
                    value={nocheFin}
                    onChange={(e) => setNocheFin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Sección 4: Cálculo de Importe y Personal */}
        <div className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-4">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            4. Totales a Pagar y Personal Responsable
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Total Horas a Pagar *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={totalHorasPagar}
                onChange={(e) => setTotalHorasPagar(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-amber-400 font-mono font-bold text-base focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400">Paga íntegra por hora</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Precio por Hora ($ DOP) *</label>
              <input
                type="number"
                value={precioPorHora}
                onChange={(e) => setPrecioPorHora(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono font-bold text-base focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400">
                {clienteId ? 'Tarifa cliente/base' : 'Seleccione cliente'}
              </span>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex flex-col justify-center">
              <span className="text-[10px] text-amber-300 font-semibold uppercase">Monto Total Conduce</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                ${montoTotalCalculado.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Operador *</label>
              <input
                type="text"
                list="lista-operadores"
                value={operadorNombre}
                onChange={(e) => setOperadorNombre(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                placeholder="Nombre del operador"
              />
              <datalist id="lista-operadores">
                {operadores.map((emp) => (
                  <option key={emp.id} value={emp.nombre} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Chequeador / Inspector</label>
              <input
                type="text"
                list="lista-chequeadores"
                value={chequeadorNombre}
                onChange={(e) => setChequeadorNombre(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:border-amber-500"
                placeholder="Nombre del chequeador en obra"
              />
              <datalist id="lista-chequeadores">
                {chequeadores.map((emp) => (
                  <option key={emp.id} value={emp.nombre} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 text-xs font-medium">Observaciones / Notas</label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:border-amber-500"
              placeholder="Detalles sobre el trabajo o condición del equipo..."
            />
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-2">
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
            {conduceExistente ? 'Guardar Cambios' : 'Registrar Conduce'}
          </button>
        </div>

      </form>
    </div>
  );
};
