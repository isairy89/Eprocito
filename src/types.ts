/**
 * EQUIPROCI - Tipos de Datos del Sistema Administrativo
 */

export type UnidadCobro = 'hora' | 'viaje' | 'metro';

export interface Cliente {
  id: string;
  nombre: string;
  rnc?: string;
  contacto?: string;
  telefono?: string;
  direccion?: string;
  proyectoPredeterminado?: string;
}

export interface Servicio {
  id: string;
  nombre: string; // ej: "Retroexcavadora CAT 320", "Acarreo Arena de Pañete", "Camión Volteo 14m³"
  categoria: 'equipo_pesado' | 'material' | 'acarreo_servicio';
  unidadCobro: UnidadCobro;
  precioBase: number;
  descripcion?: string;
}

export interface PrecioCliente {
  id: string;
  clienteId: string;
  servicioId: string;
  precioAcordado: number; // Precio específico negociado con este cliente
}

export interface Empleado {
  id: string;
  nombre: string;
  cedula?: string;
  rol: 'operador' | 'chofer' | 'chequeador' | 'administrativo';
  telefono?: string;
  vehiculoAsignado?: string;
  placaAsignada?: string;
  salarioBase?: number;
}

// Materiales estándar para Conduce E
export const MATERIALES_ESTANDAR = [
  'Arena de pañete',
  'Arena gruesa',
  'Arena de mina (sucia)',
  'Grava',
  'Granzote',
  'Base',
  'Sub-base',
  'Material de mina',
  'Gravillón',
  'Traslado interno',
  'Piedra',
  'Bote',
  'Gravilla de imprimación',
  'Relleno'
] as const;

export type TipoMaterial = typeof MATERIALES_ESTANDAR[number];

export interface DetalleMaterialConduce {
  material: string;
  cantidad: number; // Metros cúbicos o Viajes
  unidad: UnidadCobro;
  precioUnitario: number;
  subtotal: number;
}

export interface TurnoHorario {
  inicio: string; // "08:00"
  fin: string;    // "12:00"
  horas: number;  // 4
}

export interface ConduceEquipoPesado {
  id: string;
  tipo: 'equipo_pesado';
  numeroConduce: string; // ej. EP-00101
  fecha: string; // YYYY-MM-DD
  clienteId: string;
  clienteNombre: string;
  direccionProyecto: string;
  telefonoContacto?: string;
  
  servicioId: string;
  equipoAsignado: string; // ej. "Retroexcavadora CAT 320"
  placa?: string; // Placa del equipo si aplica
  
  // Turnos
  turnoManana?: TurnoHorario;
  turnoTarde?: TurnoHorario;
  turnoNoche?: TurnoHorario;
  
  subtotalHoras: number;
  totalHorasPagar: number; // Regla: se pagan íntegramente
  
  precioPorHora: number; // Snapshot del precio en el momento del registro
  montoTotal: number; // totalHorasPagar * precioPorHora
  
  operadorId?: string;
  operadorNombre: string;
  chequeadorId?: string;
  chequeadorNombre: string;
  
  observaciones?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ConduceMaterial {
  id: string;
  tipo: 'materiales';
  numeroConduce: string; // ej. E-00401
  fecha: string; // YYYY-MM-DD
  clienteId: string;
  clienteNombre: string;
  direccionProyecto: string;
  
  capacidadCamionM3: number; // Capacidad m³
  placaCamion: string;
  choferId?: string;
  choferNombre: string;
  recibidoConforme: string; // Nombre de quien recibe en obra
  
  detalles: DetalleMaterialConduce[];
  totalMetros: number;
  totalViajes: number;
  montoTotal: number;
  
  observaciones?: string;
  creadoEn: string;
  actualizadoEn: string;
}

export type Conduce = ConduceEquipoPesado | ConduceMaterial;

export interface FiltrosReporte {
  fechaInicio: string;
  fechaFin: string;
  clienteId: string; // '' para todos
  clienteNombre?: string;
  empleadoNombre: string; // '' para todos
  servicioId?: string;
}

// ==========================================
// MÓDULO DE CONTROL DE GASOIL / COMBUSTIBLE
// ==========================================

export interface ConfiguracionGasoil {
  existenciaInicialGalones: number; // Por defecto 1000
}

export interface CompraGasoil {
  id: string;
  fecha: string; // YYYY-MM-DD
  proveedor: string;
  facturaODocumento?: string;
  numeroReferencia?: string;
  galones: number;
  precioPorGalon: number;
  montoTotal: number; // galones * precioPorGalon
  observaciones?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface DespachoGasoil {
  id: string;
  fecha: string; // YYYY-MM-DD
  hora?: string; // HH:MM
  equipoOVehiculo: string; // Nombre del equipo o vehículo
  placa?: string;
  operadorOChofer?: string;
  galones: number;
  autorizadoPor: string;
  entregadoPor: string;
  horometro?: number; // Para equipo pesado (horas)
  kilometraje?: number; // Para vehículos/camiones (km)
  conduceId?: string; // ID del conduce relacionado si aplica
  conduceNumero?: string; // ej: "EP-00101" o "E-00501"
  actividadOTrabajo?: string; // ej: "Excavación Av. Ecológica", "Mantenimiento", "Traslado interno"
  observaciones?: string;
  creadoEn: string;
  actualizadoEn?: string;
}

export interface ConteoFisicoGasoil {
  id: string;
  fecha: string; // YYYY-MM-DD
  existenciaTeoricaGalones: number;
  existenciaFisicaGalones: number;
  diferenciaGalones: number; // existenciaFisicaGalones - existenciaTeoricaGalones
  responsable: string;
  observaciones?: string;
  creadoEn: string;
}

export type TipoInconsistenciaGasoil =
  | 'sin_actividad'
  | 'multiples_despachos'
  | 'horometro_inconsistente'
  | 'kilometraje_inconsistente'
  | 'saldo_insuficiente'
  | 'diferencia_inventario';

export interface AlertaGasoil {
  id: string;
  tipo: TipoInconsistenciaGasoil;
  nivel: 'advertencia' | 'critico';
  titulo: string;
  descripcion: string;
  fecha: string;
  equipoOVehiculo?: string;
  placa?: string;
  despachoId?: string;
  conteoId?: string;
}

export interface FiltrosGasoil {
  fechaInicio: string;
  fechaFin: string;
  equipoPlaca: string; // '' para todos
  operadorChofer: string; // '' para todos
  tipoMovimiento: 'todos' | 'compras' | 'despachos' | 'conteos';
  estadoRevision: 'todos' | 'solo_alertas';
}

