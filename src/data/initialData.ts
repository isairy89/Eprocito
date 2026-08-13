import { Cliente, Servicio, PrecioCliente, Empleado, Conduce } from '../types';

export const CLIENTES_INICIALES: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Constructora Malespín, S.A.',
    rnc: '1-01-88942-1',
    contacto: 'Ing. Fernando Alcántara',
    telefono: '(809) 555-0142',
    direccion: 'Proyecto Av. Ecológica Tramo III, Santo Domingo Este',
    proyectoPredeterminado: 'Av. Ecológica Tramo III'
  },
  {
    id: 'cli-2',
    nombre: 'Ministerio de Obras Públicas (MOPC)',
    rnc: '4-01-00021-3',
    contacto: 'Lic. Claudia Fernández',
    telefono: '(809) 535-6000',
    direccion: 'Circunvalación Baní, Peravia',
    proyectoPredeterminado: 'Circunvalación Baní'
  },
  {
    id: 'cli-3',
    nombre: 'Ingeniería & Obras Civiles SRL',
    rnc: '1-30-44910-8',
    contacto: 'Ing. Ricardo Vargas',
    telefono: '(829) 541-8900',
    direccion: 'Torre Res. Horizon, Naco, D.N.',
    proyectoPredeterminado: 'Torre Res. Horizon'
  },
  {
    id: 'cli-4',
    nombre: 'Desarrollos Urbanos del Este',
    rnc: '1-31-00821-5',
    contacto: 'Arq. Mariana Peña',
    telefono: '(809) 688-3344',
    direccion: 'Residencial Prados del Sol, San Isidro',
    proyectoPredeterminado: 'Residencial Prados del Sol'
  }
];

export const SERVICIOS_INICIALES: Servicio[] = [
  {
    id: 'serv-1',
    nombre: 'Retroexcavadora CAT 320',
    categoria: 'equipo_pesado',
    unidadCobro: 'hora',
    precioBase: 3500,
    descripcion: 'Excavaciones profundas y movimiento de tierra'
  },
  {
    id: 'serv-2',
    nombre: 'Pala Cargadora CAT 950',
    categoria: 'equipo_pesado',
    unidadCobro: 'hora',
    precioBase: 3800,
    descripcion: 'Carga de material en cantera y acopio'
  },
  {
    id: 'serv-3',
    nombre: 'Rodillo Compactador 10 Ton',
    categoria: 'equipo_pesado',
    unidadCobro: 'hora',
    precioBase: 2900,
    descripcion: 'Compactación de base y sub-base'
  },
  {
    id: 'serv-4',
    nombre: 'Motoniveladora CAT 120M',
    categoria: 'equipo_pesado',
    unidadCobro: 'hora',
    precioBase: 4200,
    descripcion: 'Nivelación de terreno y rasante'
  },
  {
    id: 'serv-5',
    nombre: 'Acarreo en Camión Volteo 14m³ (Por Viaje)',
    categoria: 'material',
    unidadCobro: 'viaje',
    precioBase: 4500,
    descripcion: 'Transporte de material por viaje en radio urbano'
  },
  {
    id: 'serv-6',
    nombre: 'Suministro y Acarreo de Arena de Pañete',
    categoria: 'material',
    unidadCobro: 'metro',
    precioBase: 850,
    descripcion: 'Precio por m³ suministrado en obra'
  },
  {
    id: 'serv-7',
    nombre: 'Suministro y Acarreo de Sub-base',
    categoria: 'material',
    unidadCobro: 'metro',
    precioBase: 650,
    descripcion: 'Material clasificado de minas para sub-base'
  },
  {
    id: 'serv-8',
    nombre: 'Suministro y Acarreo de Grava',
    categoria: 'material',
    unidadCobro: 'metro',
    precioBase: 950,
    descripcion: 'Grava triturada limpia de 3/4"'
  },
  {
    id: 'serv-9',
    nombre: 'Bote de Material Inservible / Escombros',
    categoria: 'material',
    unidadCobro: 'viaje',
    precioBase: 3800,
    descripcion: 'Retiro y desalojo de material inservible por viaje'
  }
];

export const PRECIOS_CLIENTE_INICIALES: PrecioCliente[] = [
  { id: 'pc-1', clienteId: 'cli-1', servicioId: 'serv-1', precioAcordado: 3200 }, // Descuento por volumen a Malespín
  { id: 'pc-2', clienteId: 'cli-1', servicioId: 'serv-5', precioAcordado: 4200 },
  { id: 'pc-3', clienteId: 'cli-2', servicioId: 'serv-1', precioAcordado: 3500 },
  { id: 'pc-4', clienteId: 'cli-2', servicioId: 'serv-7', precioAcordado: 600 },
  { id: 'pc-5', clienteId: 'cli-3', servicioId: 'serv-6', precioAcordado: 880 },
];

export const EMPLEADOS_INICIALES: Empleado[] = [
  { id: 'emp-1', nombre: 'Carlos Manuel Rodríguez', cedula: '001-1284950-3', rol: 'operador', vehiculoAsignado: 'Retroexcavadora CAT 320 (#01)', placaAsignada: 'EQUIP-01' },
  { id: 'emp-2', nombre: 'Juan Antonio Pérez', cedula: '001-0847291-5', rol: 'operador', vehiculoAsignado: 'Pala Cargadora CAT 950 (#02)', placaAsignada: 'EQUIP-02' },
  { id: 'emp-3', nombre: 'Ramón Emilio González', cedula: '002-0048192-8', rol: 'chofer', vehiculoAsignado: 'Camión Mack 14m³', placaAsignada: 'L-394810' },
  { id: 'emp-4', nombre: 'José Luis Almonte', cedula: '001-1928471-2', rol: 'chofer', vehiculoAsignado: 'Camión International 16m³', placaAsignada: 'L-291048' },
  { id: 'emp-5', nombre: 'Miguel Ángel Torres', cedula: '012-0038419-4', rol: 'chequeador', telefono: '(809) 481-2093' },
  { id: 'emp-6', nombre: 'Santo Reyes Guzmán', cedula: '001-0029381-0', rol: 'chequeador', telefono: '(829) 304-9182' },
  { id: 'emp-7', nombre: 'Lidia María Rosario', cedula: '001-1827364-9', rol: 'administrativo', telefono: '(809) 530-1000' }
];

export const CONDUCES_INICIALES: Conduce[] = [
  {
    id: 'cond-101',
    tipo: 'equipo_pesado',
    numeroConduce: 'EP-00101',
    fecha: '2026-08-10',
    clienteId: 'cli-1',
    clienteNombre: 'Constructora Malespín, S.A.',
    direccionProyecto: 'Av. Ecológica Tramo III, SDE',
    telefonoContacto: '(809) 555-0142',
    servicioId: 'serv-1',
    equipoAsignado: 'Retroexcavadora CAT 320 (#01)',
    placa: 'EQUIP-01',
    turnoManana: { inicio: '08:00', fin: '12:00', horas: 4 },
    turnoTarde: { inicio: '13:00', fin: '17:00', horas: 4 },
    subtotalHoras: 8,
    totalHorasPagar: 8,
    precioPorHora: 3200,
    montoTotal: 25600,
    operadorNombre: 'Carlos Manuel Rodríguez',
    chequeadorNombre: 'Miguel Ángel Torres',
    observaciones: 'Excavación para cimentación de alcantarilla',
    creadoEn: '2026-08-10T17:30:00Z',
    actualizadoEn: '2026-08-10T17:30:00Z'
  },
  {
    id: 'cond-102',
    tipo: 'equipo_pesado',
    numeroConduce: 'EP-00102',
    fecha: '2026-08-11',
    clienteId: 'cli-2',
    clienteNombre: 'Ministerio de Obras Públicas (MOPC)',
    direccionProyecto: 'Circunvalación Baní, Peravia',
    telefonoContacto: '(809) 535-6000',
    servicioId: 'serv-2',
    equipoAsignado: 'Pala Cargadora CAT 950 (#02)',
    placa: 'EQUIP-02',
    turnoManana: { inicio: '07:30', fin: '12:00', horas: 4.5 },
    turnoTarde: { inicio: '13:00', fin: '18:00', horas: 5 },
    subtotalHoras: 9.5,
    totalHorasPagar: 9.5,
    precioPorHora: 3800,
    montoTotal: 36100,
    operadorNombre: 'Juan Antonio Pérez',
    chequeadorNombre: 'Santo Reyes Guzmán',
    observaciones: 'Carga de material de mina a camiones volteo',
    creadoEn: '2026-08-11T18:15:00Z',
    actualizadoEn: '2026-08-11T18:15:00Z'
  },
  {
    id: 'cond-201',
    tipo: 'materiales',
    numeroConduce: 'E-00501',
    fecha: '2026-08-10',
    clienteId: 'cli-1',
    clienteNombre: 'Constructora Malespín, S.A.',
    direccionProyecto: 'Av. Ecológica Tramo III, SDE',
    capacidadCamionM3: 14,
    placaCamion: 'L-394810',
    choferNombre: 'Ramón Emilio González',
    recibidoConforme: 'Ing. Pedro Méndez',
    detalles: [
      {
        material: 'Sub-base',
        cantidad: 28, // 2 viajes de 14m3
        unidad: 'metro',
        precioUnitario: 650,
        subtotal: 18200
      }
    ],
    totalMetros: 28,
    totalViajes: 0,
    montoTotal: 18200,
    observaciones: 'Acarreo de sub-base desde Mina San Isidro',
    creadoEn: '2026-08-10T16:00:00Z',
    actualizadoEn: '2026-08-10T16:00:00Z'
  },
  {
    id: 'cond-202',
    tipo: 'materiales',
    numeroConduce: 'E-00502',
    fecha: '2026-08-12',
    clienteId: 'cli-3',
    clienteNombre: 'Ingeniería & Obras Civiles SRL',
    direccionProyecto: 'Torre Res. Horizon, Naco',
    capacidadCamionM3: 16,
    placaCamion: 'L-291048',
    choferNombre: 'José Luis Almonte',
    recibidoConforme: 'Maestro Esteban Díaz',
    detalles: [
      {
        material: 'Arena de pañete',
        cantidad: 32,
        unidad: 'metro',
        precioUnitario: 880,
        subtotal: 28160
      }
    ],
    totalMetros: 32,
    totalViajes: 0,
    montoTotal: 28160,
    observaciones: 'Arena de pañete cernida calidad A',
    creadoEn: '2026-08-12T11:00:00Z',
    actualizadoEn: '2026-08-12T11:00:00Z'
  }
];

// ==========================================
// DATOS INICIALES MÓDULO DE GASOIL
// ==========================================

export const CONFIGURACION_GASOIL_INICIAL = {
  existenciaInicialGalones: 1000
};

export const COMPRAS_GASOIL_INICIALES = [
  {
    id: 'comp-1',
    fecha: '2026-08-08',
    proveedor: 'Refidomsa / Distribuidora Dominicana de Combustibles',
    facturaODocumento: 'FAC-90821',
    numeroReferencia: 'REF-2026-08',
    galones: 500,
    precioPorGalon: 210,
    montoTotal: 105000,
    observaciones: 'Compra en cisterna principal para abastecimiento semanal de patio',
    creadoEn: '2026-08-08T09:00:00Z'
  }
];

export const DESPACHOS_GASOIL_INICIALES = [
  {
    id: 'desp-1',
    fecha: '2026-08-10',
    hora: '07:15',
    equipoOVehiculo: 'Retroexcavadora CAT 320 (#01)',
    placa: 'EQUIP-01',
    operadorOChofer: 'Carlos Manuel Rodríguez',
    galones: 30,
    autorizadoPor: 'Ing. Fernando Alcántara',
    entregadoPor: 'Miguel Torres',
    horometro: 1250,
    conduceId: 'cond-101',
    conduceNumero: 'EP-00101',
    actividadOTrabajo: 'Excavación para cimentación en Av. Ecológica',
    observaciones: 'Despacho al iniciar turno de la mañana',
    creadoEn: '2026-08-10T07:15:00Z'
  },
  {
    id: 'desp-2',
    fecha: '2026-08-10',
    hora: '07:30',
    equipoOVehiculo: 'Camión Mack 14m³',
    placa: 'L-394810',
    operadorOChofer: 'Ramón Emilio González',
    galones: 25,
    autorizadoPor: 'Ing. Fernando Alcántara',
    entregadoPor: 'Miguel Torres',
    kilometraje: 84500,
    conduceId: 'cond-201',
    conduceNumero: 'E-00501',
    actividadOTrabajo: 'Acarreo de sub-base a Av. Ecológica',
    observaciones: 'Tanque lleno previo a viajes',
    creadoEn: '2026-08-10T07:30:00Z'
  },
  {
    id: 'desp-3',
    fecha: '2026-08-11',
    hora: '08:00',
    equipoOVehiculo: 'Pala Cargadora CAT 950 (#02)',
    placa: 'EQUIP-02',
    operadorOChofer: 'Juan Antonio Pérez',
    galones: 35,
    autorizadoPor: 'Lic. Claudia Fernández',
    entregadoPor: 'Santo Reyes Guzmán',
    horometro: 3100,
    conduceId: 'cond-102',
    conduceNumero: 'EP-00102',
    actividadOTrabajo: 'Carga de material de mina en Baní',
    observaciones: 'Despacho en mina',
    creadoEn: '2026-08-11T08:00:00Z'
  },
  {
    id: 'desp-4',
    fecha: '2026-08-12',
    hora: '07:45',
    equipoOVehiculo: 'Camión International 16m³',
    placa: 'L-291048',
    operadorOChofer: 'José Luis Almonte',
    galones: 28,
    autorizadoPor: 'Lidia Rosario',
    entregadoPor: 'Miguel Torres',
    kilometraje: 62100,
    conduceId: 'cond-202',
    conduceNumero: 'E-00502',
    actividadOTrabajo: 'Transporte arena de pañete Torre Horizon',
    observaciones: 'Suministro matutino',
    creadoEn: '2026-08-12T07:45:00Z'
  },
  {
    id: 'desp-5',
    fecha: '2026-08-13',
    hora: '09:00',
    equipoOVehiculo: 'Camión Mack 14m³',
    placa: 'L-394810',
    operadorOChofer: 'Ramón Emilio González',
    galones: 25,
    autorizadoPor: 'Lidia Rosario',
    entregadoPor: 'Miguel Torres',
    kilometraje: 84620,
    conduceNumero: '',
    actividadOTrabajo: 'Traslado interno y movimiento en patio',
    observaciones: 'Sin conduce de cliente emitido para esa fecha (Movimiento operativo en patio)',
    creadoEn: '2026-08-13T09:00:00Z'
  },
  {
    id: 'desp-6',
    fecha: '2026-08-13',
    hora: '14:30',
    equipoOVehiculo: 'Camión Mack 14m³',
    placa: 'L-394810',
    operadorOChofer: 'Ramón Emilio González',
    galones: 20,
    autorizadoPor: 'Lidia Rosario',
    entregadoPor: 'Miguel Torres',
    kilometraje: 84680,
    conduceNumero: '',
    actividadOTrabajo: 'Recarga para viaje extraordinario de apoyo',
    observaciones: 'Segundo despacho del mismo día',
    creadoEn: '2026-08-13T14:30:00Z'
  }
];

export const CONTEOS_GASOIL_INICIALES = [
  {
    id: 'cont-1',
    fecha: '2026-08-13',
    existenciaTeoricaGalones: 1337,
    existenciaFisicaGalones: 1320,
    diferenciaGalones: -17,
    responsable: 'Miguel Torres',
    observaciones: 'Conteo físico en tanque de patio con vara graduada. Ligera merma normal por sedimentación y calibración.',
    creadoEn: '2026-08-13T16:00:00Z'
  }
];
