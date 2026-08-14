import {
  Cliente,
  Servicio,
  PrecioCliente,
  Empleado,
  Conduce,
  ConfiguracionGasoil,
  CompraGasoil,
  DespachoGasoil,
  ConteoFisicoGasoil,
  EquipoVehiculo
} from '../types';
import {
  CLIENTES_INICIALES,
  SERVICIOS_INICIALES,
  PRECIOS_CLIENTE_INICIALES,
  EMPLEADOS_INICIALES,
  EQUIPOS_VEHICULOS_INICIALES,
  CONDUCES_INICIALES,
  CONFIGURACION_GASOIL_INICIAL,
  COMPRAS_GASOIL_INICIALES,
  DESPACHOS_GASOIL_INICIALES,
  CONTEOS_GASOIL_INICIALES
} from '../data/initialData';

const KEYS = {
  CLIENTES: 'equiproci_clientes',
  SERVICIOS: 'equiproci_servicios',
  PRECIOS_CLIENTE: 'equiproci_precios_cliente',
  EMPLEADOS: 'equiproci_empleados',
  EQUIPOS_VEHICULOS: 'equiproci_equipos_vehiculos',
  CONDUCES: 'equiproci_conduces',
  GASOIL_CONFIG: 'equiproci_gasoil_config',
  GASOIL_COMPRAS: 'equiproci_gasoil_compras',
  GASOIL_DESPACHOS: 'equiproci_gasoil_despachos',
  GASOIL_CONTEOS: 'equiproci_gasoil_conteos'
};

// Registro de claves que sufrieron error de lectura o corrupción
const corruptedKeys = new Set<string>();

export interface StorageStatus {
  hasError: boolean;
  corruptedKeys: string[];
}

function getItem<T>(key: string, defaultValue: T): T {
  let rawData: string | null = null;
  try {
    rawData = localStorage.getItem(key);
  } catch (err) {
    console.error(`Error al acceder a localStorage para ${key}:`, err);
    corruptedKeys.add(key);
    return (Array.isArray(defaultValue) ? [] : {}) as unknown as T;
  }

  // CASO A: Primera instalación (clave no existe en localStorage)
  if (rawData === null) {
    corruptedKeys.delete(key);
    try {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    } catch (e) {
      console.warn(`No se pudo inicializar ${key} en localStorage:`, e);
    }
    return defaultValue;
  }

  // CASO B: Clave existe -> Intentar parsear
  try {
    const parsed = JSON.parse(rawData);
    corruptedKeys.delete(key); // Lectura y parseo exitosos
    return parsed as T;
  } catch (parseErr) {
    // CASO C: Error al parsear datos existentes que SÍ están en localStorage
    console.error(`Error de parseo JSON en '${key}'. Se marca como corrupta para bloquear sobrescritura y preservar los datos originales:`, parseErr);
    corruptedKeys.add(key);
    return (Array.isArray(defaultValue) ? [] : {}) as unknown as T;
  }
}

function setItem<T>(key: string, value: T): boolean {
  // CRÍTICO: Si la clave está en estado de error/corrupción, BLOQUEAR la escritura
  // para evitar que el estado en memoria [] o {} sobrescriba el contenido original en disk.
  if (corruptedKeys.has(key)) {
    console.error(`[SEGURIDAD DE ALMACENAMIENTO] Escritura bloqueada para '${key}'. Los datos persistidos sufrieron un error de lectura y no serán sobrescritos.`);
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error al guardar ${key} en localStorage:`, err);
    return false;
  }
}

export class StorageService {
  // Clientes
  static getClientes(): Cliente[] {
    return getItem(KEYS.CLIENTES, CLIENTES_INICIALES);
  }
  static saveClientes(clientes: Cliente[]): void {
    setItem(KEYS.CLIENTES, clientes);
  }

  // Servicios
  static getServicios(): Servicio[] {
    return getItem(KEYS.SERVICIOS, SERVICIOS_INICIALES);
  }
  static saveServicios(servicios: Servicio[]): void {
    setItem(KEYS.SERVICIOS, servicios);
  }

  // Precios por Cliente
  static getPreciosCliente(): PrecioCliente[] {
    return getItem(KEYS.PRECIOS_CLIENTE, PRECIOS_CLIENTE_INICIALES);
  }
  static savePreciosCliente(precios: PrecioCliente[]): void {
    setItem(KEYS.PRECIOS_CLIENTE, precios);
  }

  // Empleados
  static getEmpleados(): Empleado[] {
    return getItem(KEYS.EMPLEADOS, EMPLEADOS_INICIALES);
  }
  static saveEmpleados(empleados: Empleado[]): void {
    setItem(KEYS.EMPLEADOS, empleados);
  }

  // Equipos y Vehículos
  static getEquiposVehiculos(): EquipoVehiculo[] {
    return getItem(KEYS.EQUIPOS_VEHICULOS, EQUIPOS_VEHICULOS_INICIALES);
  }
  static saveEquiposVehiculos(equipos: EquipoVehiculo[]): void {
    setItem(KEYS.EQUIPOS_VEHICULOS, equipos);
  }

  // Conduces
  static getConduces(): Conduce[] {
    return getItem(KEYS.CONDUCES, CONDUCES_INICIALES);
  }
  static saveConduces(conduces: Conduce[]): void {
    setItem(KEYS.CONDUCES, conduces);
  }

  // Generador de Consecutivo Seguro de Conduce (sin duplicados ni Math.random)
  static generarSiguienteNumeroConduce(tipo: 'equipo_pesado' | 'materiales', prefijo?: string): string {
    const conduces = this.getConduces();
    const pref = (prefijo || (tipo === 'equipo_pesado' ? 'EP' : 'E')).toUpperCase();
    
    // Extraer todos los números asociados a este prefijo
    let maxNumero = 0;
    const regex = new RegExp(`^${pref}-0*([0-9]+)$`, 'i');
    
    conduces.forEach((c) => {
      const limpio = (c.numeroConduce || '').trim();
      const match = limpio.match(regex);
      if (match && match[1]) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxNumero) {
          maxNumero = val;
        }
      }
    });

    // Si no hay números previos, comenzar en base lógica según el tipo
    const siguienteValor = maxNumero > 0 ? maxNumero + 1 : (tipo === 'equipo_pesado' ? 101 : 501);
    
    // Rellenar con ceros (ej: EP-00103 o E-00503)
    const numeroRelleno = String(siguienteValor).padStart(5, '0');
    return `${pref}-${numeroRelleno}`;
  }

  // ==========================================
  // METODOS MÓDULO DE CONTROL DE GASOIL
  // ==========================================

  static getConfiguracionGasoil(): ConfiguracionGasoil {
    return getItem(KEYS.GASOIL_CONFIG, CONFIGURACION_GASOIL_INICIAL);
  }
  static saveConfiguracionGasoil(config: ConfiguracionGasoil): void {
    setItem(KEYS.GASOIL_CONFIG, config);
  }

  static getComprasGasoil(): CompraGasoil[] {
    return getItem(KEYS.GASOIL_COMPRAS, COMPRAS_GASOIL_INICIALES);
  }
  static saveComprasGasoil(compras: CompraGasoil[]): void {
    setItem(KEYS.GASOIL_COMPRAS, compras);
  }

  static getDespachosGasoil(): DespachoGasoil[] {
    return getItem(KEYS.GASOIL_DESPACHOS, DESPACHOS_GASOIL_INICIALES);
  }
  static saveDespachosGasoil(despachos: DespachoGasoil[]): void {
    setItem(KEYS.GASOIL_DESPACHOS, despachos);
  }

  static getConteosGasoil(): ConteoFisicoGasoil[] {
    return getItem(KEYS.GASOIL_CONTEOS, CONTEOS_GASOIL_INICIALES);
  }
  static saveConteosGasoil(conteos: ConteoFisicoGasoil[]): void {
    setItem(KEYS.GASOIL_CONTEOS, conteos);
  }

  // Helper de Precio Dinámico
  static obtenerPrecioAcordado(clienteId: string, servicioId: string): number {
    const preciosCliente = this.getPreciosCliente();
    const especifico = preciosCliente.find(
      (p) => p.clienteId === clienteId && p.servicioId === servicioId
    );
    if (especifico && especifico.precioAcordado > 0) {
      return especifico.precioAcordado;
    }
    const servicios = this.getServicios();
    const serv = servicios.find((s) => s.id === servicioId);
    return serv ? serv.precioBase : 0;
  }

  // Reset a datos de fábrica
  static resetToDefault(): void {
    corruptedKeys.clear();
    setItem(KEYS.CLIENTES, CLIENTES_INICIALES);
    setItem(KEYS.SERVICIOS, SERVICIOS_INICIALES);
    setItem(KEYS.PRECIOS_CLIENTE, PRECIOS_CLIENTE_INICIALES);
    setItem(KEYS.EMPLEADOS, EMPLEADOS_INICIALES);
    setItem(KEYS.EQUIPOS_VEHICULOS, EQUIPOS_VEHICULOS_INICIALES);
    setItem(KEYS.CONDUCES, CONDUCES_INICIALES);
    setItem(KEYS.GASOIL_CONFIG, CONFIGURACION_GASOIL_INICIAL);
    setItem(KEYS.GASOIL_COMPRAS, COMPRAS_GASOIL_INICIALES);
    setItem(KEYS.GASOIL_DESPACHOS, DESPACHOS_GASOIL_INICIALES);
    setItem(KEYS.GASOIL_CONTEOS, CONTEOS_GASOIL_INICIALES);
  }

  // Estado global de salud de lectura
  static getStorageStatus(): StorageStatus {
    return {
      hasError: corruptedKeys.size > 0,
      corruptedKeys: Array.from(corruptedKeys)
    };
  }
}
