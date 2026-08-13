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
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error al leer ${key} de localStorage:`, err);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error al guardar ${key} en localStorage:`, err);
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
