import {
  Cliente,
  Servicio,
  PrecioCliente,
  Empleado,
  Conduce
} from '../types';
import {
  CLIENTES_INICIALES,
  SERVICIOS_INICIALES,
  PRECIOS_CLIENTE_INICIALES,
  EMPLEADOS_INICIALES,
  CONDUCES_INICIALES
} from '../data/initialData';

const KEYS = {
  CLIENTES: 'equiproci_clientes',
  SERVICIOS: 'equiproci_servicios',
  PRECIOS_CLIENTE: 'equiproci_precios_cliente',
  EMPLEADOS: 'equiproci_empleados',
  CONDUCES: 'equiproci_conduces'
};

function getItem<T>(key: string, defaultValue: T): T {
  let rawData: string | null = null;
  try {
    rawData = localStorage.getItem(key);
  } catch (err) {
    console.error(`Error al acceder a localStorage para ${key}:`, err);
    return (Array.isArray(defaultValue) ? [] : {}) as unknown as T;
  }

  // CASO A: Primera instalación (clave no existe)
  if (rawData === null) {
    try {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    } catch (e) {
      console.warn(`No se pudo inicializar ${key} en localStorage:`, e);
    }
    return defaultValue;
  }

  // CASO B: Clave existe -> Intentar parsear
  try {
    return JSON.parse(rawData) as T;
  } catch (parseErr) {
    // CASO C: Error al parsear datos existentes
    // CRÍTICO: NO retornar defaultValue (initialData) para evitar reemplazar
    // datos reales por la plantilla inicial. Tampoco sobrescribir localStorage.
    console.error(`Error de parseo JSON en ${key}. Se conservan los datos de localStorage sin sobrescribir:`, parseErr);
    return (Array.isArray(defaultValue) ? [] : {}) as unknown as T;
  }
}

function setItem<T>(key: string, value: T): boolean {
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

  // Conduces
  static getConduces(): Conduce[] {
    return getItem(KEYS.CONDUCES, CONDUCES_INICIALES);
  }
  static saveConduces(conduces: Conduce[]): void {
    setItem(KEYS.CONDUCES, conduces);
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
    setItem(KEYS.CLIENTES, CLIENTES_INICIALES);
    setItem(KEYS.SERVICIOS, SERVICIOS_INICIALES);
    setItem(KEYS.PRECIOS_CLIENTE, PRECIOS_CLIENTE_INICIALES);
    setItem(KEYS.EMPLEADOS, EMPLEADOS_INICIALES);
    setItem(KEYS.CONDUCES, CONDUCES_INICIALES);
  }
}
