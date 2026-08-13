import React, { useState, useEffect } from 'react';
import {
  Cliente,
  Servicio,
  PrecioCliente,
  Empleado,
  Conduce,
  ConduceEquipoPesado,
  ConduceMaterial
} from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { ProduccionDashboard } from './components/ProduccionDashboard';
import { ConduceFormEquipos } from './components/ConduceFormEquipos';
import { ConduceFormMateriales } from './components/ConduceFormMateriales';
import { ConducesList } from './components/ConducesList';
import { ServiciosPreciosManager } from './components/ServiciosPreciosManager';
import { ReporteClientes } from './components/ReporteClientes';
import { ReporteNomina } from './components/ReporteNomina';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('produccion');

  // Estados Master Data
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [preciosCliente, setPreciosCliente] = useState<PrecioCliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [conduces, setConduces] = useState<Conduce[]>([]);

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
    setConduces(StorageService.getConduces());
  };

  // Restablecer datos a demo
  const handleResetData = () => {
    if (window.confirm('¿Está seguro de que desea restablecer los datos de demostración de EQUIPROCI?')) {
      StorageService.resetToDefault();
      cargarDatos();
      setActiveTab('produccion');
    }
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

          {activeTab === 'servicios_precios' && (
            <ServiciosPreciosManager
              servicios={servicios}
              clientes={clientes}
              preciosCliente={preciosCliente}
              onSaveServicio={handleSaveServicio}
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
