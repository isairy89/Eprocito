import React, { useState, useMemo } from 'react';
import {
  Fuel,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Plus,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Truck,
  Tractor,
  UserCheck,
  ShieldCheck,
  Edit2,
  Trash2,
  Scale,
  History,
  X,
  Building2,
  Receipt
} from 'lucide-react';
import {
  ConfiguracionGasoil,
  CompraGasoil,
  DespachoGasoil,
  ConteoFisicoGasoil,
  Conduce,
  Servicio,
  Empleado,
  EquipoVehiculo,
  FiltrosGasoil,
  AlertaGasoil
} from '../types';
import { GasoilService, ResumenGasoil } from '../services/gasoilService';
import { ExportService } from '../services/exportService';

interface ControlGasoilManagerProps {
  configGasoil: ConfiguracionGasoil;
  comprasGasoil: CompraGasoil[];
  despachosGasoil: DespachoGasoil[];
  conteosGasoil: ConteoFisicoGasoil[];
  conduces: Conduce[];
  servicios: Servicio[];
  empleados: Empleado[];
  equipos?: EquipoVehiculo[];
  onSaveConfig: (cfg: ConfiguracionGasoil) => void;
  onSaveCompra: (compra: CompraGasoil) => void;
  onDeleteCompra: (id: string) => void;
  onSaveDespacho: (despacho: DespachoGasoil) => void;
  onDeleteDespacho: (id: string) => void;
  onSaveConteo: (conteo: ConteoFisicoGasoil) => void;
  onDeleteConteo: (id: string) => void;
}

type SubTabGasoil = 'alertas' | 'despachos' | 'compras' | 'conteos' | 'historial';

export const ControlGasoilManager: React.FC<ControlGasoilManagerProps> = ({
  configGasoil,
  comprasGasoil,
  despachosGasoil,
  conteosGasoil,
  conduces,
  servicios,
  empleados,
  equipos = [],
  onSaveConfig,
  onSaveCompra,
  onDeleteCompra,
  onSaveDespacho,
  onDeleteDespacho,
  onSaveConteo,
  onDeleteConteo
}) => {
  const [subTab, setSubTab] = useState<SubTabGasoil>('alertas');

  // Estado de Filtros
  const [filtros, setFiltros] = useState<FiltrosGasoil>({
    fechaInicio: '',
    fechaFin: '',
    equipoPlaca: '',
    operadorChofer: '',
    tipoMovimiento: 'todos',
    estadoRevision: 'todos'
  });

  // Modales
  const [modalDespachoAbierto, setModalDespachoAbierto] = useState(false);
  const [despachoEditando, setDespachoEditando] = useState<DespachoGasoil | null>(null);
  const [errorModalDespacho, setErrorModalDespacho] = useState<string | null>(null);

  const [modalCompraAbierto, setModalCompraAbierto] = useState(false);
  const [compraEditando, setCompraEditando] = useState<CompraGasoil | null>(null);
  const [errorModalCompra, setErrorModalCompra] = useState<string | null>(null);

  const [modalConteoAbierto, setModalConteoAbierto] = useState(false);

  // Modal Ajuste Existencia Inicial
  const [modalConfigAbierto, setModalConfigAbierto] = useState(false);
  const [tempExistenciaInicial, setTempExistenciaInicial] = useState<number>(
    configGasoil.existenciaInicialGalones || 1000
  );

  // Form State Despacho
  const [formDespacho, setFormDespacho] = useState<Partial<DespachoGasoil>>({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    equipoOVehiculo: '',
    placa: '',
    operadorOChofer: '',
    galones: '' as any,
    autorizadoPor: '',
    entregadoPor: '',
    horometro: undefined,
    kilometraje: undefined,
    conduceId: '',
    conduceNumero: '',
    actividadOTrabajo: '',
    observaciones: ''
  });

  // Form State Compra
  const [formCompra, setFormCompra] = useState<Partial<CompraGasoil>>({
    fecha: new Date().toISOString().split('T')[0],
    proveedor: '',
    facturaODocumento: '',
    numeroReferencia: '',
    galones: '' as any,
    precioPorGalon: '' as any,
    observaciones: ''
  });

  // Form State Conteo
  const [formConteo, setFormConteo] = useState<{
    fecha: string;
    existenciaFisicaGalones: number | string;
    responsable: string;
    observaciones: string;
  }>({
    fecha: new Date().toISOString().split('T')[0],
    existenciaFisicaGalones: '',
    responsable: '',
    observaciones: ''
  });

  // Cálculo de Resumen e Inconsistencias en tiempo real
  const resumen: ResumenGasoil = useMemo(() => {
    return GasoilService.calcularResumen(configGasoil, comprasGasoil, despachosGasoil, conteosGasoil);
  }, [configGasoil, comprasGasoil, despachosGasoil, conteosGasoil]);

  const alertasInconsistencias: AlertaGasoil[] = useMemo(() => {
    return GasoilService.detectarInconsistencias(
      despachosGasoil,
      conduces,
      conteosGasoil,
      resumen.saldoDisponibleGalones
    );
  }, [despachosGasoil, conduces, conteosGasoil, resumen.saldoDisponibleGalones]);

  const historialMovimientos = useMemo(() => {
    return GasoilService.obtenerHistorialMovimientos(
      configGasoil,
      comprasGasoil,
      despachosGasoil,
      conteosGasoil
    );
  }, [configGasoil, comprasGasoil, despachosGasoil, conteosGasoil]);

  // Aplicación de Filtros a Despachos y Compras
  const despachosFiltrados = useMemo(() => {
    return GasoilService.filtrarDespachos(despachosGasoil, filtros);
  }, [despachosGasoil, filtros]);

  const comprasFiltradas = useMemo(() => {
    return comprasGasoil.filter((c) => {
      if (filtros.fechaInicio && c.fecha < filtros.fechaInicio) return false;
      if (filtros.fechaFin && c.fecha > filtros.fechaFin) return false;
      return true;
    });
  }, [comprasGasoil, filtros]);

  // Catalogos combinados para autocompletar
  const listaEquiposSugeridos = useMemo(() => {
    const setEq = new Set<string>();
    servicios.forEach((s) => setEq.add(s.nombre));
    equipos.forEach((eq) => {
      if (eq.nombre) setEq.add(eq.nombre);
    });
    empleados.forEach((e) => {
      if (e.vehiculoAsignado) setEq.add(e.vehiculoAsignado);
    });
    conduces.forEach((c) => {
      if (c.tipo === 'equipo_pesado' && c.equipoAsignado) setEq.add(c.equipoAsignado);
    });
    return Array.from(setEq);
  }, [servicios, equipos, empleados, conduces]);

  const listaPlacasSugeridas = useMemo(() => {
    const setPl = new Set<string>();
    equipos.forEach((eq) => {
      if (eq.placa) setPl.add(eq.placa);
    });
    empleados.forEach((e) => {
      if (e.placaAsignada) setPl.add(e.placaAsignada);
    });
    conduces.forEach((c) => {
      if (c.tipo === 'equipo_pesado' && c.placa) setPl.add(c.placa);
      if (c.tipo === 'materiales' && c.placaCamion) setPl.add(c.placaCamion);
    });
    return Array.from(setPl);
  }, [equipos, empleados, conduces]);

  const listaOperadoresSugeridos = useMemo(() => {
    const setOp = new Set<string>();
    empleados.forEach((e) => setOp.add(e.nombre));
    conduces.forEach((c) => {
      if (c.tipo === 'equipo_pesado' && c.operadorNombre) setOp.add(c.operadorNombre);
      if (c.tipo === 'materiales' && c.choferNombre) setOp.add(c.choferNombre);
    });
    return Array.from(setOp);
  }, [empleados, conduces]);

  // Manejadores de Formularios
  const handleAbrirNuevoDespacho = () => {
    setDespachoEditando(null);
    setErrorModalDespacho(null);
    setFormDespacho({
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toTimeString().slice(0, 5),
      equipoOVehiculo: '',
      placa: '',
      operadorOChofer: '',
      galones: '' as any,
      autorizadoPor: '',
      entregadoPor: '',
      horometro: undefined,
      kilometraje: undefined,
      conduceId: '',
      conduceNumero: '',
      actividadOTrabajo: '',
      observaciones: ''
    });
    setModalDespachoAbierto(true);
  };

  const handleAbrirEditarDespacho = (d: DespachoGasoil) => {
    setDespachoEditando(d);
    setErrorModalDespacho(null);
    setFormDespacho({ ...d });
    setModalDespachoAbierto(true);
  };

  const handleGuardarDespachoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDespacho.equipoOVehiculo || !formDespacho.fecha || !formDespacho.galones) {
      setErrorModalDespacho('Por favor complete los campos obligatorios: Fecha, Equipo/Vehículo y Galones.');
      return;
    }

    const despachoFinal: DespachoGasoil = {
      id: despachoEditando ? despachoEditando.id : `desp-${Date.now()}`,
      fecha: formDespacho.fecha || new Date().toISOString().split('T')[0],
      hora: formDespacho.hora || '08:00',
      equipoOVehiculo: formDespacho.equipoOVehiculo || '',
      placa: formDespacho.placa || '',
      operadorOChofer: formDespacho.operadorOChofer || '',
      galones: Number(formDespacho.galones) || 0,
      autorizadoPor: formDespacho.autorizadoPor || '',
      entregadoPor: formDespacho.entregadoPor || '',
      horometro: formDespacho.horometro ? Number(formDespacho.horometro) : undefined,
      kilometraje: formDespacho.kilometraje ? Number(formDespacho.kilometraje) : undefined,
      conduceId: formDespacho.conduceId || undefined,
      conduceNumero: formDespacho.conduceNumero || undefined,
      actividadOTrabajo: formDespacho.actividadOTrabajo || '',
      observaciones: formDespacho.observaciones || '',
      creadoEn: despachoEditando ? despachoEditando.creadoEn : new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };

    onSaveDespacho(despachoFinal);
    setErrorModalDespacho(null);
    setModalDespachoAbierto(false);
  };

  const handleAbrirNuevaCompra = () => {
    setCompraEditando(null);
    setErrorModalCompra(null);
    setFormCompra({
      fecha: new Date().toISOString().split('T')[0],
      proveedor: '',
      facturaODocumento: '',
      numeroReferencia: '',
      galones: '' as any,
      precioPorGalon: '' as any,
      observaciones: ''
    });
    setModalCompraAbierto(true);
  };

  const handleAbrirEditarCompra = (c: CompraGasoil) => {
    setCompraEditando(c);
    setErrorModalCompra(null);
    setFormCompra({ ...c });
    setModalCompraAbierto(true);
  };

  const handleGuardarCompraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompra.proveedor || !formCompra.fecha || !formCompra.galones) {
      setErrorModalCompra('Por favor complete Fecha, Proveedor y Galones.');
      return;
    }

    const galones = Number(formCompra.galones) || 0;
    const precio = Number(formCompra.precioPorGalon) || 0;

    const compraFinal: CompraGasoil = {
      id: compraEditando ? compraEditando.id : `comp-${Date.now()}`,
      fecha: formCompra.fecha || new Date().toISOString().split('T')[0],
      proveedor: formCompra.proveedor || '',
      facturaODocumento: formCompra.facturaODocumento || '',
      numeroReferencia: formCompra.numeroReferencia || '',
      galones,
      precioPorGalon: precio,
      montoTotal: galones * precio,
      observaciones: formCompra.observaciones || '',
      creadoEn: compraEditando ? compraEditando.creadoEn : new Date().toISOString(),
      actualizadoEn: new Date().toISOString()
    };

    onSaveCompra(compraFinal);
    setErrorModalCompra(null);
    setModalCompraAbierto(false);
  };

  const handleAbrirNuevoConteo = () => {
    setFormConteo({
      fecha: new Date().toISOString().split('T')[0],
      existenciaFisicaGalones: '',
      responsable: '',
      observaciones: ''
    });
    setModalConteoAbierto(true);
  };

  const handleGuardarConteoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teorica = resumen.saldoTeoricoGalones;
    const fisica = Number(formConteo.existenciaFisicaGalones) || 0;
    const diferencia = fisica - teorica;

    const conteoFinal: ConteoFisicoGasoil = {
      id: `cont-${Date.now()}`,
      fecha: formConteo.fecha,
      existenciaTeoricaGalones: teorica,
      existenciaFisicaGalones: fisica,
      diferenciaGalones: diferencia,
      responsable: formConteo.responsable || '',
      observaciones: formConteo.observaciones || '',
      creadoEn: new Date().toISOString()
    };

    onSaveConteo(conteoFinal);
    setModalConteoAbierto(false);
  };

  const handleGuardarExistenciaInicial = () => {
    onSaveConfig({ existenciaInicialGalones: Number(tempExistenciaInicial) || 0 });
    setModalConfigAbierto(false);
  };

  // Exportaciones
  const handleExportarExcel = () => {
    ExportService.exportarGasoilExcel(
      comprasFiltradas,
      despachosFiltrados,
      conteosGasoil,
      resumen,
      filtros
    );
  };

  const handleExportarPDF = () => {
    ExportService.exportarGasoilPDF(
      comprasFiltradas,
      despachosFiltrados,
      conteosGasoil,
      resumen,
      alertasInconsistencias,
      filtros
    );
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
          <Fuel className="w-64 h-64 text-amber-500" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
              <Fuel className="w-4 h-4" /> Módulo de Operaciones & Combustible
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Control de Gasoil e Inventario
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Trazabilidad completa de compras, despachos a equipos y detección de inconsistencias para auditoría.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAbrirNuevoDespacho}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer text-xs md:text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Registrar Despacho
            </button>
            <button
              onClick={handleAbrirNuevaCompra}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer text-xs md:text-sm"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Registrar Compra
            </button>
            <button
              onClick={handleAbrirNuevoConteo}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer text-xs md:text-sm"
            >
              <Scale className="w-4 h-4 text-sky-400" /> Conteo Físico
            </button>
          </div>
        </div>

        {/* Cajas Metricas de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-6">
          {/* Tarjeta 1: Saldo Teórico */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">Saldo Teórico (Sistema)</span>
              <button
                onClick={() => {
                  setTempExistenciaInicial(configGasoil.existenciaInicialGalones || 1000);
                  setModalConfigAbierto(true);
                }}
                className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                title="Ajustar existencia inicial teórica"
              >
                Inicial
              </button>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-xl font-black text-amber-400">
                {resumen.saldoTeoricoGalones.toLocaleString('es-DO')}{' '}
                <span className="text-xs font-normal text-slate-400">gal</span>
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                  resumen.saldoTeoricoGalones > 200
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {resumen.saldoTeoricoGalones > 200 ? 'Suficiente' : 'Bajo'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">
              Inicial + Compras - Despachos
            </span>
          </div>

          {/* Tarjeta 2: Conteo Físico Real */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-sky-400" /> Existencia Física
            </span>
            <div className="mt-1.5">
              <span className="text-xl font-black text-sky-400">
                {resumen.ultimoConteoFisicoGalones !== undefined
                  ? `${resumen.ultimoConteoFisicoGalones.toLocaleString('es-DO')} gal`
                  : 'Sin medir'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">
              {resumen.fechaUltimoConteo ? `Conteo del ${resumen.fechaUltimoConteo}` : 'Sin conteos registrados'}
            </span>
          </div>

          {/* Tarjeta 3: Diferencia Auditoría */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-400" /> Diferencia Físico
            </span>
            <div className="mt-1.5">
              <span
                className={`text-xl font-black ${
                  resumen.ultimaDiferenciaGalones !== undefined && resumen.ultimaDiferenciaGalones < 0
                    ? 'text-rose-400'
                    : resumen.ultimaDiferenciaGalones !== undefined && resumen.ultimaDiferenciaGalones > 0
                    ? 'text-emerald-400'
                    : 'text-slate-300'
                }`}
              >
                {resumen.ultimaDiferenciaGalones !== undefined
                  ? `${resumen.ultimaDiferenciaGalones > 0 ? '+' : ''}${resumen.ultimaDiferenciaGalones.toLocaleString('es-DO')} gal`
                  : '0 gal'}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">
              Físico vs Teórico (Auditoría)
            </span>
          </div>

          {/* Tarjeta 4: Total Compras */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Total Compras
            </span>
            <div className="mt-1.5">
              <span className="text-xl font-black text-emerald-400">
                +{resumen.totalCompradoGalones.toLocaleString('es-DO')}{' '}
                <span className="text-xs font-normal text-slate-400">gal</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">
              RD$ {resumen.totalMontoCompras.toLocaleString('es-DO')}
            </span>
          </div>

          {/* Tarjeta 5: Total Despachado */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Despachado
            </span>
            <div className="mt-1.5">
              <span className="text-xl font-black text-rose-400">
                -{resumen.totalDespachadoGalones.toLocaleString('es-DO')}{' '}
                <span className="text-xs font-normal text-slate-400">gal</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">
              {despachosGasoil.length} entregas
            </span>
          </div>

          {/* Tarjeta 6: Inconsistencias a Revisar */}
          <div
            onClick={() => setSubTab('alertas')}
            className={`bg-slate-950/80 border p-3.5 rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
              alertasInconsistencias.length > 0
                ? 'border-amber-500/50 hover:bg-amber-950/30'
                : 'border-slate-800'
            }`}
          >
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Para Revisar
            </span>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span
                className={`text-xl font-black ${
                  alertasInconsistencias.length > 0 ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {alertasInconsistencias.length}
              </span>
              <span className="text-[9px] text-amber-400/80 font-semibold underline">Ver Alertas</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 truncate">
              Inconsistencias
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Combinada */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className="bg-transparent text-slate-200 outline-none text-xs"
              placeholder="Fecha Desde"
            />
            <span className="text-slate-600">-</span>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className="bg-transparent text-slate-200 outline-none text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Equipo o Placa..."
              value={filtros.equipoPlaca}
              onChange={(e) => setFiltros({ ...filtros, equipoPlaca: e.target.value })}
              className="bg-transparent text-slate-200 outline-none text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg min-w-[160px]">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Chofer u Operador..."
              value={filtros.operadorChofer}
              onChange={(e) => setFiltros({ ...filtros, operadorChofer: e.target.value })}
              className="bg-transparent text-slate-200 outline-none text-xs w-full"
            />
          </div>

          {(filtros.fechaInicio || filtros.fechaFin || filtros.equipoPlaca || filtros.operadorChofer) && (
            <button
              onClick={() =>
                setFiltros({
                  fechaInicio: '',
                  fechaFin: '',
                  equipoPlaca: '',
                  operadorChofer: '',
                  tipoMovimiento: 'todos',
                  estadoRevision: 'todos'
                })
              }
              className="text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* Botones Exportación */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportarExcel}
            className="bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-600/50 text-emerald-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Exportar Excel
          </button>
          <button
            onClick={handleExportarPDF}
            className="bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 text-amber-200 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Sub-Navegación de Pestañas Internas */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('alertas')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'alertas'
              ? 'border-amber-500 text-amber-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" /> Alertas para Revisar
          {alertasInconsistencias.length > 0 && (
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold text-[10px]">
              {alertasInconsistencias.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab('despachos')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'despachos'
              ? 'border-amber-500 text-amber-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" /> Registro de Despachos ({despachosFiltrados.length})
        </button>

        <button
          onClick={() => setSubTab('compras')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'compras'
              ? 'border-amber-500 text-amber-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" /> Compras ({comprasFiltradas.length})
        </button>

        <button
          onClick={() => setSubTab('conteos')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'conteos'
              ? 'border-amber-500 text-amber-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4 text-sky-400" /> Conteo Físico Tanque
        </button>

        <button
          onClick={() => setSubTab('historial')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'historial'
              ? 'border-amber-500 text-amber-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" /> Historial / Kardex
        </button>
      </div>

      {/* VISTA 1: ALERTAS Y REVISIÓN */}
      {subTab === 'alertas' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Inconsistencias y Movimientos
                para Revisión
              </h3>
              <span className="text-xs text-slate-400">
                Regla auditiva: Las alertas identifican datos incompletos o inusuales para verificación.
              </span>
            </div>

            {alertasInconsistencias.length === 0 ? (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-8 text-center space-y-2">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-200 text-base">
                  No hay inconsistencias detectadas
                </h4>
                <p className="text-xs text-emerald-200/70 max-w-lg mx-auto">
                  Todos los despachos registrados corresponden a conduces activos de la empresa y las
                  lecturas de horómetro/kilometraje mantienen coherencia ascendente.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertasInconsistencias.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                      alerta.nivel === 'critico'
                        ? 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                        : 'bg-amber-950/40 border-amber-500/50 text-amber-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          alerta.nivel === 'critico' ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{alerta.titulo}</h4>
                          <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded font-mono border border-slate-700">
                            {alerta.fecha}
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-slate-200/90 leading-relaxed">
                          {alerta.descripcion}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {alerta.despachoId && (
                        <button
                          onClick={() => {
                            const d = despachosGasoil.find((x) => x.id === alerta.despachoId);
                            if (d) handleAbrirEditarDespacho(d);
                          }}
                          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Ver Despacho
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desglose de Consumo por Equipo y Chofer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Por Equipo */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Tractor className="w-4 h-4 text-amber-400" /> Acumulado de Consumo por Equipo
              </h4>
              <div className="space-y-3">
                {GasoilService.obtenerConsumoPorEquipo(despachosFiltrados).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-100">{item.equipoOVehiculo}</p>
                      <p className="text-[10px] text-slate-400">
                        Placa: {item.placa || 'N/A'} • {item.totalDespachos} entregas
                      </p>
                    </div>
                    <span className="font-extrabold text-amber-400 text-sm">
                      {item.totalGalones.toLocaleString('es-DO')} gal
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Por Operador */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Acumulado por Chofer / Operador
              </h4>
              <div className="space-y-3">
                {GasoilService.obtenerConsumoPorOperador(despachosFiltrados).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-100">{item.operadorOChofer}</p>
                      <p className="text-[10px] text-slate-400">{item.totalDespachos} entregas recibidas</p>
                    </div>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      {item.totalGalones.toLocaleString('es-DO')} gal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: TABLA DE DESPACHOS */}
      {subTab === 'despachos' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" /> Registro de Despachos de Combustible
            </h3>
            <button
              onClick={handleAbrirNuevoDespacho}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Nuevo Despacho
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Fecha / Hora</th>
                  <th className="p-3">Equipo / Vehículo</th>
                  <th className="p-3">Chofer / Operador</th>
                  <th className="p-3">Galones</th>
                  <th className="p-3">Horóm / Km</th>
                  <th className="p-3">Conduce / Trabajo</th>
                  <th className="p-3">Autorizado / Entregado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {despachosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      No hay registros de despachos que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  despachosFiltrados.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono">
                        <div>{d.fecha}</div>
                        <div className="text-[10px] text-slate-500">{d.hora || '08:00'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-200">{d.equipoOVehiculo}</div>
                        <div className="text-[10px] text-amber-400/90 font-mono">
                          {d.placa ? `Placa: ${d.placa}` : 'Sin Placa'}
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-300">
                        {d.operadorOChofer || 'No asignado'}
                      </td>
                      <td className="p-3 font-extrabold text-amber-400 text-sm">
                        {d.galones} <span className="text-xs font-normal text-slate-400">gal</span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        {d.horometro
                          ? `${d.horometro} hrs`
                          : d.kilometraje
                          ? `${d.kilometraje} km`
                          : '-'}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">
                          {d.conduceNumero ? `Conduce ${d.conduceNumero}` : 'Sin Conduce'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {d.actividadOTrabajo || d.observaciones || '-'}
                        </div>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">
                        <div>Auth: {d.autorizadoPor}</div>
                        <div>Entregó: {d.entregadoPor}</div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleAbrirEditarDespacho(d)}
                            className="p-1.5 hover:bg-slate-800 rounded text-amber-400 transition-colors cursor-pointer"
                            title="Editar Despacho"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar el despacho de ${d.galones} gal para ${d.equipoOVehiculo}?`)) {
                                onDeleteDespacho(d.id);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-800 rounded text-rose-400 transition-colors cursor-pointer"
                            title="Eliminar Despacho"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 3: TABLA DE COMPRAS */}
      {subTab === 'compras' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" /> Registro de Compras de Combustible
            </h3>
            <button
              onClick={handleAbrirNuevaCompra}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Registrar Compra
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Proveedor</th>
                  <th className="p-3">Factura / Doc</th>
                  <th className="p-3">Galones Comprados</th>
                  <th className="p-3">Precio / Galón</th>
                  <th className="p-3">Monto Total RD$</th>
                  <th className="p-3">Observaciones</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {comprasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-500">
                      No hay compras registradas.
                    </td>
                  </tr>
                ) : (
                  comprasFiltradas.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono">{c.fecha}</td>
                      <td className="p-3 font-bold text-slate-200">{c.proveedor}</td>
                      <td className="p-3 font-mono text-slate-400">
                        {c.facturaODocumento || c.numeroReferencia || '-'}
                      </td>
                      <td className="p-3 font-extrabold text-emerald-400 text-sm">
                        +{c.galones.toLocaleString('es-DO')}{' '}
                        <span className="text-xs font-normal text-slate-400">gal</span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        RD$ {c.precioPorGalon.toLocaleString('es-DO')}
                      </td>
                      <td className="p-3 font-extrabold text-slate-100">
                        RD$ {c.montoTotal.toLocaleString('es-DO')}
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 max-w-[200px] truncate">
                        {c.observaciones || '-'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleAbrirEditarCompra(c)}
                            className="p-1.5 hover:bg-slate-800 rounded text-amber-400 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la compra de ${c.galones} gal a ${c.proveedor}?`)) {
                                onDeleteCompra(c.id);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-800 rounded text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 4: CONTEO FÍSICO DE TANQUE */}
      {subTab === 'conteos' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-sky-400" /> Registro de Conteos y Ajustes Físicos de Tanque
              </h3>
              <p className="text-xs text-slate-400">
                Ajusta la existencia física observada contra el saldo teórico calculado del sistema.
              </p>
            </div>
            <button
              onClick={handleAbrirNuevoConteo}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Registrar Conteo Físico
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Existencia Teórica</th>
                  <th className="p-3">Existencia Física (Medida)</th>
                  <th className="p-3">Diferencia</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3">Observaciones</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {conteosGasoil.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500">
                      No se han registrado conteos físicos de tanque.
                    </td>
                  </tr>
                ) : (
                  conteosGasoil.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono">{c.fecha}</td>
                      <td className="p-3 font-bold text-slate-300">
                        {c.existenciaTeoricaGalones.toLocaleString('es-DO')} gal
                      </td>
                      <td className="p-3 font-extrabold text-sky-400">
                        {c.existenciaFisicaGalones.toLocaleString('es-DO')} gal
                      </td>
                      <td className="p-3 font-black">
                        <span
                          className={`px-2 py-0.5 rounded font-mono ${
                            c.diferenciaGalones < 0
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : c.diferenciaGalones > 0
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {c.diferenciaGalones > 0 ? '+' : ''}
                          {c.diferenciaGalones} gal
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-200">{c.responsable}</td>
                      <td className="p-3 text-[11px] text-slate-400 max-w-[220px] truncate">
                        {c.observaciones || '-'}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar esta medición de conteo físico?')) {
                              onDeleteConteo(c.id);
                            }
                          }}
                          className="p-1.5 hover:bg-slate-800 rounded text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 5: HISTORIAL COMPLETO / KARDEX */}
      {subTab === 'historial' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" /> Libro Kardex Auditables de Movimientos de Gasoil
            </h3>
            <p className="text-xs text-slate-400">
              Reconstrucción cronológica del saldo disponible desde la existencia inicial.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Fecha / Hora</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Concepto / Referencia</th>
                  <th className="p-3 text-emerald-400 text-right">Entradas (+)</th>
                  <th className="p-3 text-rose-400 text-right">Salidas (-)</th>
                  <th className="p-3 text-sky-400 text-right">Ajuste (+/-)</th>
                  <th className="p-3 text-amber-400 text-right font-extrabold">Saldo Resultante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                <tr className="bg-slate-950/60 font-semibold text-slate-300">
                  <td className="p-3 font-mono">-</td>
                  <td className="p-3">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">Config. Inicial</span>
                  </td>
                  <td className="p-3 text-slate-400">Existencia Inicial Teórica en Tanque</td>
                  <td className="p-3 text-right text-emerald-400">
                    +{resumen.existenciaInicialGalones}
                  </td>
                  <td className="p-3 text-right text-slate-600">-</td>
                  <td className="p-3 text-right text-slate-600">-</td>
                  <td className="p-3 text-right font-black text-amber-400">
                    {resumen.existenciaInicialGalones} gal
                  </td>
                </tr>

                {historialMovimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono">
                      <div>{m.fecha}</div>
                      <div className="text-[10px] text-slate-500">{m.hora}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.tipoMovimiento === 'entrada'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : m.tipoMovimiento === 'salida'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {m.tipoEtiqueta}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{m.concepto}</div>
                      <div className="text-[10px] text-slate-400">
                        {m.referenciaODocumento} {m.responsableOAutorizado ? `| ${m.responsableOAutorizado}` : ''}
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      {m.entradaGalones > 0 ? `+${m.entradaGalones}` : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-rose-400">
                      {m.salidaGalones > 0 ? `-${m.salidaGalones}` : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-sky-400">
                      {m.ajusteGalones !== 0 ? `${m.ajusteGalones > 0 ? '+' : ''}${m.ajusteGalones}` : '-'}
                    </td>
                    <td className="p-3 text-right font-black text-amber-400">
                      {m.saldoResultanteGalones} gal
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR / EDITAR DESPACHO */}
      {modalDespachoAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setModalDespachoAbierto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              {despachoEditando ? 'Editar Despacho de Gasoil' : 'Nuevo Despacho a Equipo / Vehículo'}
            </h3>

            {/* Error de validación */}
            {errorModalDespacho && (
              <div className="bg-rose-950/80 border border-rose-500/80 p-3 rounded-xl text-rose-100 text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorModalDespacho}</span>
              </div>
            )}

            {/* Advertencia de Existencia Insuficiente */}
            {Number(formDespacho.galones || 0) > resumen.saldoTeoricoGalones && (
              <div className="bg-rose-950/80 border border-rose-500/80 p-3 rounded-xl text-rose-100 text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <strong>Existencia Insuficiente:</strong> La cantidad a despachar (
                  {formDespacho.galones} gal) supera el saldo teórico disponible ({resumen.saldoTeoricoGalones}{' '}
                  gal). El saldo quedará en negativo si procede sin compra.
                </div>
              </div>
            )}

            <form onSubmit={handleGuardarDespachoSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formDespacho.fecha}
                    onChange={(e) => setFormDespacho({ ...formDespacho, fecha: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Hora</label>
                  <input
                    type="time"
                    value={formDespacho.hora}
                    onChange={(e) => setFormDespacho({ ...formDespacho, hora: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Equipo / Vehículo *</label>
                  <input
                    type="text"
                    required
                    list="equipos-list"
                    placeholder="ej: Retroexcavadora CAT 320 (#01)"
                    value={formDespacho.equipoOVehiculo}
                    onChange={(e) => setFormDespacho({ ...formDespacho, equipoOVehiculo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                  <datalist id="equipos-list">
                    {listaEquiposSugeridos.map((eq, i) => (
                      <option key={i} value={eq} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Placa</label>
                  <input
                    type="text"
                    list="placas-list"
                    placeholder="ej: L-394810 o EQUIP-01"
                    value={formDespacho.placa}
                    onChange={(e) => setFormDespacho({ ...formDespacho, placa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                  <datalist id="placas-list">
                    {listaPlacasSugeridas.map((pl, i) => (
                      <option key={i} value={pl} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Chofer / Operador</label>
                  <input
                    type="text"
                    list="operadores-list"
                    placeholder="ej: Carlos Manuel Rodríguez"
                    value={formDespacho.operadorOChofer}
                    onChange={(e) => setFormDespacho({ ...formDespacho, operadorOChofer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                  <datalist id="operadores-list">
                    {listaOperadoresSugeridos.map((op, i) => (
                      <option key={i} value={op} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Cantidad (Galones) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    placeholder="0"
                    value={formDespacho.galones ?? ''}
                    onChange={(e) =>
                      setFormDespacho({
                        ...formDespacho,
                        galones: e.target.value === '' ? ('' as any) : Number(e.target.value)
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-extrabold text-sm outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Horómetro (Hrs Equipo)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="ej: 1250"
                    value={formDespacho.horometro || ''}
                    onChange={(e) =>
                      setFormDespacho({
                        ...formDespacho,
                        horometro: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Kilometraje (Km Vehículo)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="ej: 84500"
                    value={formDespacho.kilometraje || ''}
                    onChange={(e) =>
                      setFormDespacho({
                        ...formDespacho,
                        kilometraje: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Conduce Relacionado</label>
                  <select
                    value={formDespacho.conduceNumero || ''}
                    onChange={(e) => {
                      const num = e.target.value;
                      const cond = conduces.find((c) => c.numeroConduce === num);
                      setFormDespacho({
                        ...formDespacho,
                        conduceNumero: num,
                        conduceId: cond ? cond.id : undefined,
                        actividadOTrabajo: cond ? `Trabajo en ${cond.clienteNombre}` : formDespacho.actividadOTrabajo
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  >
                    <option value="">Sin Conduce (Movimiento interno / Mantenimiento)</option>
                    {conduces.map((c) => (
                      <option key={c.id} value={c.numeroConduce}>
                        {c.numeroConduce} - {c.clienteNombre} ({c.fecha})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Autorización / Entrega</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Autorizó"
                      value={formDespacho.autorizadoPor}
                      onChange={(e) => setFormDespacho({ ...formDespacho, autorizadoPor: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Entregó"
                      value={formDespacho.entregadoPor}
                      onChange={(e) => setFormDespacho({ ...formDespacho, entregadoPor: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Actividad / Proyecto / Observaciones
                </label>
                <input
                  type="text"
                  placeholder="ej: Excavación cimentación Av. Ecológica o traslado de patio"
                  value={formDespacho.actividadOTrabajo}
                  onChange={(e) => setFormDespacho({ ...formDespacho, actividadOTrabajo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalDespachoAbierto(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Guardar Despacho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REGISTRAR / EDITAR COMPRA */}
      {modalCompraAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setModalCompraAbierto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              {compraEditando ? 'Editar Compra de Gasoil' : 'Registrar Compra de Combustible'}
            </h3>

            {/* Error de validación */}
            {errorModalCompra && (
              <div className="bg-rose-950/80 border border-rose-500/80 p-3 rounded-xl text-rose-100 text-xs flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorModalCompra}</span>
              </div>
            )}

            <form onSubmit={handleGuardarCompraSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Fecha de Compra *</label>
                <input
                  type="date"
                  required
                  value={formCompra.fecha}
                  onChange={(e) => setFormCompra({ ...formCompra, fecha: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Proveedor *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Refidomsa / Distribuidora Shell"
                  value={formCompra.proveedor}
                  onChange={(e) => setFormCompra({ ...formCompra, proveedor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Factura / Doc</label>
                  <input
                    type="text"
                    placeholder="FAC-12345"
                    value={formCompra.facturaODocumento}
                    onChange={(e) => setFormCompra({ ...formCompra, facturaODocumento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Referencia</label>
                  <input
                    type="text"
                    placeholder="REF-001"
                    value={formCompra.numeroReferencia}
                    onChange={(e) => setFormCompra({ ...formCompra, numeroReferencia: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Galones Comprados *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="0"
                    value={formCompra.galones ?? ''}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        galones: e.target.value === '' ? ('' as any) : Number(e.target.value)
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-black text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Precio / Galón (RD$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formCompra.precioPorGalon ?? ''}
                    onChange={(e) =>
                      setFormCompra({
                        ...formCompra,
                        precioPorGalon: e.target.value === '' ? ('' as any) : Number(e.target.value)
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Monto Total Calculado:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  RD${' '}
                  {(
                    (Number(formCompra.galones) || 0) * (Number(formCompra.precioPorGalon) || 0)
                  ).toLocaleString('es-DO')}
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observaciones</label>
                <input
                  type="text"
                  placeholder="Detalles de la cisterna o despacho"
                  value={formCompra.observaciones}
                  onChange={(e) => setFormCompra({ ...formCompra, observaciones: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalCompraAbierto(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Guardar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTRAR CONTEO FÍSICO */}
      {modalConteoAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setModalConteoAbierto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-5 h-5 text-sky-400" /> Registrar Conteo Físico en Tanque
            </h3>

            <form onSubmit={handleGuardarConteoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Fecha de Medición *</label>
                <input
                  type="date"
                  required
                  value={formConteo.fecha}
                  onChange={(e) => setFormConteo({ ...formConteo, fecha: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Existencia Teórica Calculada:</span>
                  <span className="font-bold text-slate-200">
                    {resumen.saldoTeoricoGalones.toLocaleString('es-DO')} gal
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Existencia Física Medida en Tanque (Galones) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="0"
                  value={formConteo.existenciaFisicaGalones ?? ''}
                  onChange={(e) =>
                    setFormConteo({
                      ...formConteo,
                      existenciaFisicaGalones: e.target.value === '' ? '' : Number(e.target.value)
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sky-400 font-black text-sm outline-none"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 font-medium">Diferencia Calculada (Físico vs Teórico):</span>
                <span
                  className={`text-base font-extrabold ${
                    Number(formConteo.existenciaFisicaGalones || 0) - resumen.saldoTeoricoGalones < 0
                      ? 'text-rose-400'
                      : Number(formConteo.existenciaFisicaGalones || 0) - resumen.saldoTeoricoGalones > 0
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {Number(formConteo.existenciaFisicaGalones || 0) - resumen.saldoTeoricoGalones > 0 ? '+' : ''}
                  {(Number(formConteo.existenciaFisicaGalones || 0) - resumen.saldoTeoricoGalones).toLocaleString('es-DO')} gal
                </span>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Responsable de Medición</label>
                <input
                  type="text"
                  placeholder="ej: Miguel Torres / Encargado de Patio"
                  value={formConteo.responsable}
                  onChange={(e) => setFormConteo({ ...formConteo, responsable: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Observaciones</label>
                <input
                  type="text"
                  placeholder="Método de medición (vara graduada, reloj digital, etc.)"
                  value={formConteo.observaciones}
                  onChange={(e) => setFormConteo({ ...formConteo, observaciones: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalConteoAbierto(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Guardar Conteo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: AJUSTAR EXISTENCIA INICIAL */}
      {modalConfigAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setModalConfigAbierto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-amber-400" /> Ajustar Existencia Inicial
            </h3>

            <p className="text-xs text-slate-400">
              Modifica la base teórica inicial con la que arranca el inventario del sistema antes de la primera compra o despacho.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Existencia Inicial Base (Galones)
                </label>
                <input
                  type="number"
                  value={tempExistenciaInicial}
                  onChange={(e) => setTempExistenciaInicial(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-extrabold text-base outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalConfigAbierto(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarExistenciaInicial}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-xl cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
