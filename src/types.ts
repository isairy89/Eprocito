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
}

// Materiales estándar para Conduce E
export const MATERIALES_ESTANDAR = [
  'Arena de pañete',
  'Arena gruesa',
  'Arena de mina sucia',
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
  empleadoNombre: string; // '' para todos
  servicioId?: string;
}

