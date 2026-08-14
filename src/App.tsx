import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import {
  Cliente,
  Servicio,
  PrecioCliente,
  Empleado,
  EquipoVehiculo,
  Conduce,
  ConduceEquipoPesado,
  ConduceMaterial,
  ConfiguracionGasoil,
  CompraGasoil,
  DespachoGasoil,
  ConteoFisicoGasoil
} from './types';
import { StorageService, StorageStatus } from './services/storage';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { ProduccionDashboard } from './components/ProduccionDashboard';
import { ConduceFormEquipos } from './components/ConduceFormEquipos';
import { ConduceFormMateriales } from './components/ConduceFormMateriales';
import { ConducesList } from './components/ConducesList';
import { ServiciosPreciosManager } from './components/ServiciosPreciosManager';
import { ClientesManager } from './components/ClientesManager';
import { EmpleadosManager } from './components/EmpleadosManager';
import { EquiposVehiculosManager } from './components/EquiposVehiculosManager';
import { ReporteClientes } from './components/ReporteClientes';
import { ReporteNomina } from './components/ReporteNomina';
import { ControlGasoilManager } from './components/ControlGasoilManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('produccion');

  // Estados Master Data
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [preciosCliente, setPreciosCliente] = useState<PrecioCliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [equiposVehiculos, setEquiposVehiculos] = useState<EquipoVehiculo[]>([]);
  const [conduces, setConduces] = useState<Conduce[]>([]);

  // Estados Módulo Gasoil
  const [configGasoil, setConfigGasoil] = useState<ConfiguracionGasoil>({ existenciaInicialGalones: 1000 });
  const [comprasGasoil, setComprasGasoil] = useState<CompraGasoil[]>([]);
  const [despachosGasoil, setDespachosGasoil] = useState<DespachoGasoil[]>([]);
  const [conteosGasoil, setConteosGasoil] = useState<ConteoFisicoGasoil[]>([]);

  // Estado de error de almacenamiento
  const [storageError, setStorageError] = useState<StorageStatus | null>(null);

  // Conduce en edición
  const [conduceEnEdicion, setConduceEnEdicion] = useState<Conduce | null>(null);

  // Carga inicial de datos desde LocalStorage o fábrica
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setClientes(StorageService.getClientes());
    setServicios(StorageService.getServicios());
    setPreciosCliente(StorageService.getPreciosCliente());
    setEmpleados(StorageService.getEmpleados());
    setEquiposVehiculos(StorageService.getEquiposVehiculos());
    setConduces(StorageService.getConduces());

    setConfigGasoil(StorageService.getConfiguracionGasoil());
    setComprasGasoil(StorageService.getComprasGasoil());
    setDespachosGasoil(StorageService.getDespachosGasoil());
    setConteosGasoil(StorageService.getConteosGasoil());

    const status = StorageService.getStorageStatus();
    if (status.hasError) {
      setStorageError(status);
    } else {
      setStorageError(null);
    }
  };

  // Restablecer datos a demo
  const handleResetData = () => {
    StorageService.resetToDefault();
    cargarDatos();
    setActiveTab('produccion');
  };

  // Guardar Conduce Equipo Pesado
  const handleSaveConduceEquipo = (nuevoConduce: ConduceEquipoPesado) => {
    const copia = [...conduces];
    const index = copia.findIndex((c) => c.id === nuevoConduce.id);

    if (index >= 0) {
      copia[index] = nuevoConduce;
    } else {
      copia.unshift(nuevoConduce);
    }

    setConduces(copia);
    StorageService.saveConduces(copia);
    setConduceEnEdicion(null);
    setActiveTab('conduces_lista');
  };

  // Guardar Conduce Material
  const handleSaveConduceMaterial = (nuevoConduce: ConduceMaterial) => {
    const copia = [...conduces];
    const index = copia.findIndex((c) => c.id === nuevoConduce.id);

    if (index >= 0) {
      copia[index] = nuevoConduce;
    } else {
      copia.unshift(nuevoConduce);
    }

    setConduces(copia);
    StorageService.saveConduces(copia);
    setConduceEnEdicion(null);
    setActiveTab('conduces_lista');
  };

  // Eliminar Conduce
  const handleDeleteConduce = (id: string) => {
    const copia = conduces.filter((c) => c.id !== id);
    setConduces(copia);
    StorageService.saveConduces(copia);
  };

  // Editar Conduce existente
  const handleStartEditConduce = (conduce: Conduce) => {
    setConduceEnEdicion(conduce);
    if (conduce.tipo === 'equipo_pesado') {
      setActiveTab('registro_equipos');
    } else {
      setActiveTab('registro_materiales');
    }
  };

  // Guardar Cliente
  const handleSaveCliente = (cli: Cliente) => {
    const copia = [...clientes];
    const idx = copia.findIndex((c) => c.id === cli.id);
    if (idx >= 0) {
      copia[idx] = cli;
    } else {
      copia.push(cli);
    }
    setClientes(copia);
    StorageService.saveClientes(copia);
  };

  // Eliminar Cliente
  const handleDeleteCliente = (id: string) => {
    const copia = clientes.filter((c) => c.id !== id);
    setClientes(copia);
    StorageService.saveClientes(copia);
  };

  // Guardar Empleado
  const handleSaveEmpleado = (emp: Empleado) => {
    const copia = [...empleados];
    const idx = copia.findIndex((e) => e.id === emp.id);
    if (idx >= 0) {
      copia[idx] = emp;
    } else {
      copia.push(emp);
    }
    setEmpleados(copia);
    StorageService.saveEmpleados(copia);
  };

  // Eliminar Empleado
  const handleDeleteEmpleado = (id: string) => {
    const copia = empleados.filter((e) => e.id !== id);
    setEmpleados(copia);
    StorageService.saveEmpleados(copia);
  };

  // Guardar Equipo / Vehículo
  const handleSaveEquipo = (eq: EquipoVehiculo) => {
    const copiaEquipos = [...equiposVehiculos];
    const idx = copiaEquipos.findIndex((e) => e.id === eq.id);
    const prevEq = idx >= 0 ? copiaEquipos[idx] : null;

    if (idx >= 0) {
      copiaEquipos[idx] = eq;
    } else {
      copiaEquipos.push(eq);
    }
    setEquiposVehiculos(copiaEquipos);
    StorageService.saveEquiposVehiculos(copiaEquipos);

    // Sincronizar automáticamente con el catálogo de Servicios
    const copiaServicios = [...servicios];
    const servIdx = copiaServicios.findIndex(
      (s) => s.id === `serv-${eq.id}` || s.nombre.toLowerCase() === (prevEq ? prevEq.nombre.toLowerCase() : eq.nombre.toLowerCase())
    );

    if (servIdx >= 0) {
      copiaServicios[servIdx] = {
        ...copiaServicios[servIdx],
        nombre: eq.nombre,
        categoria: eq.tipo === 'camion_volteo' ? 'material' : 'equipo_pesado',
        unidadCobro: eq.tipo === 'camion_volteo' ? 'viaje' : 'hora'
      };
      setServicios(copiaServicios);
      StorageService.saveServicios(copiaServicios);
    } else {
      const nuevoServicio: Servicio = {
        id: `serv-${eq.id}`,
        nombre: eq.nombre,
        categoria: eq.tipo === 'camion_volteo' ? 'material' : 'equipo_pesado',
        unidadCobro: eq.tipo === 'camion_volteo' ? 'viaje' : 'hora',
        precioBase: eq.tipo === 'camion_volteo' ? 4500 : 2500,
        descripcion: eq.descripcion || `Maquinaria / Equipo ${eq.nombre}`
      };
      copiaServicios.push(nuevoServicio);
      setServicios(copiaServicios);
      StorageService.saveServicios(copiaServicios);
    }
  };

  // Eliminar Equipo / Vehículo
  const handleDeleteEquipo = (id: string) => {
    const copia = equiposVehiculos.filter((e) => e.id !== id);
    setEquiposVehiculos(copia);
    StorageService.saveEquiposVehiculos(copia);
  };

  // Guardar Servicio Base
  const handleSaveServicio = (serv: Servicio) => {
    const copia = [...servicios];
    const idx = copia.findIndex((s) => s.id === serv.id);
    if (idx >= 0) {
      copia[idx] = serv;
    } else {
      copia.push(serv);
    }
    setServicios(copia);
    StorageService.saveServicios(copia);
  };

  // Guardar Tarifa Dinámica Cliente
  const handleSavePrecioCliente = (precio: PrecioCliente) => {
    const copia = [...preciosCliente];
    // Reemplazar si ya existe para cliente + servicio
    const idx = copia.findIndex(
      (p) => p.clienteId === precio.clienteId && p.servicioId === precio.servicioId
    );
    if (idx >= 0) {
      copia[idx] = precio;
    } else {
      copia.push(precio);
    }
    setPreciosCliente(copia);
    StorageService.savePreciosCliente(copia);
  };

  // Eliminar Tarifa Cliente
  const handleDeletePrecioCliente = (id: string) => {
    const copia = preciosCliente.filter((p) => p.id !== id);
    setPreciosCliente(copia);
    StorageService.savePreciosCliente(copia);
  };

  // Manejadores Gasoil
  const handleSaveConfigGasoil = (cfg: ConfiguracionGasoil) => {
    setConfigGasoil(cfg);
    StorageService.saveConfiguracionGasoil(cfg);
  };

  const handleSaveCompraGasoil = (compra: CompraGasoil) => {
    const copia = [...comprasGasoil];
    const idx = copia.findIndex((c) => c.id === compra.id);
    if (idx >= 0) {
      copia[idx] = compra;
    } else {
      copia.unshift(compra);
    }
    setComprasGasoil(copia);
    StorageService.saveComprasGasoil(copia);
  };

  const handleDeleteCompraGasoil = (id: string) => {
    const copia = comprasGasoil.filter((c) => c.id !== id);
    setComprasGasoil(copia);
    StorageService.saveComprasGasoil(copia);
  };

  const handleSaveDespachoGasoil = (despacho: DespachoGasoil) => {
    const copia = [...despachosGasoil];
    const idx = copia.findIndex((d) => d.id === despacho.id);
    if (idx >= 0) {
      copia[idx] = despacho;
    } else {
      copia.unshift(despacho);
    }
    setDespachosGasoil(copia);
    StorageService.saveDespachosGasoil(copia);
  };

  const handleDeleteDespachoGasoil = (id: string) => {
    const copia = despachosGasoil.filter((d) => d.id !== id);
    setDespachosGasoil(copia);
    StorageService.saveDespachosGasoil(copia);
  };

  const handleSaveConteoGasoil = (conteo: ConteoFisicoGasoil) => {
    const copia = [...conteosGasoil];
    const idx = copia.findIndex((c) => c.id === conteo.id);
    if (idx >= 0) {
      copia[idx] = conteo;
    } else {
      copia.unshift(conteo);
    }
    setConteosGasoil(copia);
    StorageService.saveConteosGasoil(copia);
  };

  const handleDeleteConteoGasoil = (id: string) => {
    const copia = conteosGasoil.filter((c) => c.id !== id);
    setConteosGasoil(copia);
    StorageService.saveConteosGasoil(copia);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Header */}
      <Header
        onResetData={handleResetData}
      />

      {/* Workspace Principal */}
      <div className="flex flex-1">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab !== 'registro_equipos' && tab !== 'registro_materiales') {
              setConduceEnEdicion(null);
            }
            setActiveTab(tab);
          }}
          totalConduces={conduces.length}
        />

        {/* Content View Area */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-y-auto">
          
          {storageError && storageError.hasError && (
            <div className="bg-amber-950/80 border border-amber-500/60 text-amber-100 p-4 rounded-xl mb-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-200 text-sm md:text-base">
                    Advertencia de Almacenamiento: Registros Ilegibles Detectados
                  </h4>
                  <p className="text-xs md:text-sm text-amber-200/80 mt-1">
                    Se encontraron claves de almacenamiento con formato no válido ({storageError.corruptedKeys.join(', ')}). 
                    Para prevenir la destrucción de la información original, <span className="font-semibold text-amber-100 underline">se ha bloqueado la sobrescritura en almacenamiento</span>. Sus datos guardados no han sido borrados.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={cargarDatos}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg transition shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reintentar
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'clientes' && (
            <ClientesManager
              clientes={clientes}
              onSaveCliente={handleSaveCliente}
              onDeleteCliente={handleDeleteCliente}
              onNavigateToPrecios={() => setActiveTab('servicios_precios')}
            />
          )}

          {activeTab === 'empleados' && (
            <EmpleadosManager
              empleados={empleados}
              onSaveEmpleado={handleSaveEmpleado}
              onDeleteEmpleado={handleDeleteEmpleado}
            />
          )}

          {activeTab === 'equipos_vehiculos' && (
            <EquiposVehiculosManager
              equipos={equiposVehiculos}
              onSaveEquipo={handleSaveEquipo}
              onDeleteEquipo={handleDeleteEquipo}
            />
          )}

          {activeTab === 'produccion' && (
            <ProduccionDashboard
              conduces={conduces}
              clientes={clientes}
              onNavigate={(tab) => {
                setConduceEnEdicion(null);
                setActiveTab(tab);
              }}
            />
          )}

          {activeTab === 'registro_equipos' && (
            <ConduceFormEquipos
              clientes={clientes}
              servicios={servicios}
              empleados={empleados}
              equipos={equiposVehiculos}
              conduceExistente={conduceEnEdicion?.tipo === 'equipo_pesado' ? (conduceEnEdicion as ConduceEquipoPesado) : null}
              onSave={handleSaveConduceEquipo}
              onCancel={() => {
                setConduceEnEdicion(null);
                setActiveTab('conduces_lista');
              }}
            />
          )}

          {activeTab === 'registro_materiales' && (
            <ConduceFormMateriales
              clientes={clientes}
              servicios={servicios}
              empleados={empleados}
              equipos={equiposVehiculos}
              conduceExistente={conduceEnEdicion?.tipo === 'materiales' ? (conduceEnEdicion as ConduceMaterial) : null}
              onSave={handleSaveConduceMaterial}
              onCancel={() => {
                setConduceEnEdicion(null);
                setActiveTab('conduces_lista');
              }}
            />
          )}

          {activeTab === 'conduces_lista' && (
            <ConducesList
              conduces={conduces}
              clientes={clientes}
              onEdit={handleStartEditConduce}
              onDelete={handleDeleteConduce}
              onNewEquipo={() => {
                setConduceEnEdicion(null);
                setActiveTab('registro_equipos');
              }}
              onNewMaterial={() => {
                setConduceEnEdicion(null);
                setActiveTab('registro_materiales');
              }}
            />
          )}

          {activeTab === 'control_gasoil' && (
            <ControlGasoilManager
              configGasoil={configGasoil}
              comprasGasoil={comprasGasoil}
              despachosGasoil={despachosGasoil}
              conteosGasoil={conteosGasoil}
              conduces={conduces}
              servicios={servicios}
              empleados={empleados}
              equipos={equiposVehiculos}
              onSaveConfig={handleSaveConfigGasoil}
              onSaveCompra={handleSaveCompraGasoil}
              onDeleteCompra={handleDeleteCompraGasoil}
              onSaveDespacho={handleSaveDespachoGasoil}
              onDeleteDespacho={handleDeleteDespachoGasoil}
              onSaveConteo={handleSaveConteoGasoil}
              onDeleteConteo={handleDeleteConteoGasoil}
            />
          )}

          {activeTab === 'servicios_precios' && (
            <ServiciosPreciosManager
              servicios={servicios}
              clientes={clientes}
              preciosCliente={preciosCliente}
              onSaveServicio={handleSaveServicio}
              onSaveCliente={handleSaveCliente}
              onSavePrecioCliente={handleSavePrecioCliente}
              onDeletePrecioCliente={handleDeletePrecioCliente}
            />
          )}

          {activeTab === 'reporte_clientes' && (
            <ReporteClientes
              conduces={conduces}
              clientes={clientes}
              empleados={empleados}
            />
          )}

          {activeTab === 'reporte_nomina' && (
            <ReporteNomina
              conduces={conduces}
              clientes={clientes}
              empleados={empleados}
            />
          )}

        </main>
      </div>

    </div>
  );
}
