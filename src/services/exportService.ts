import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Conduce,
  Empleado,
  FiltrosReporte,
  CompraGasoil,
  DespachoGasoil,
  ConteoFisicoGasoil,
  AlertaGasoil,
  FiltrosGasoil
} from '../types';
import { ResumenGasoil } from './gasoilService';

export interface ReporteClienteFila {
  fecha: string;
  numeroConduce: string;
  clienteNombre: string;
  proyecto: string;
  itemDetalle: string;
  equipoNombre: string;
  placa: string;
  horas: number;
  viajes: number;
  metros: number;
  precioUnitario: number;
  total: number;
  tipo: string;
}

export interface ReporteNominaFila {
  empleadoNombre: string;
  equipoNombre: string;
  placa: string;
  fecha: string;
  numeroConduce: string;
  clienteNombre: string;
  servicioDescripcion: string;
  horasTrabajadas: number;
  viajes: number;
  metros: number;
  precioServicio: number;
  importeServicio: number;
  pagoNomina: string;
}

export class ExportService {
  /**
   * Genera las filas aplanadas para el Reporte de Clientes
   */
  static procesarFilasReporteCliente(conduces: Conduce[]): ReporteClienteFila[] {
    const filas: ReporteClienteFila[] = [];

    conduces.forEach((c) => {
      if (c.tipo === 'equipo_pesado') {
        filas.push({
          fecha: c.fecha,
          numeroConduce: c.numeroConduce,
          clienteNombre: c.clienteNombre,
          proyecto: c.direccionProyecto,
          itemDetalle: c.equipoAsignado,
          equipoNombre: c.equipoAsignado,
          placa: c.placa || '',
          horas: c.totalHorasPagar,
          viajes: 0,
          metros: 0,
          precioUnitario: c.precioPorHora,
          total: c.montoTotal,
          tipo: 'Equipo Pesado (Por Hora)'
        });
      } else {
        (c.detalles || []).forEach((det) => {
          filas.push({
            fecha: c.fecha,
            numeroConduce: c.numeroConduce,
            clienteNombre: c.clienteNombre,
            proyecto: c.direccionProyecto || '-',
            itemDetalle: det.material,
            equipoNombre: 'Camión Volteo',
            placa: c.placaCamion || '',
            horas: det.unidad === 'hora' ? det.cantidad : 0,
            viajes: det.unidad === 'viaje' ? det.cantidad : 0,
            metros: det.unidad === 'metro' ? det.cantidad : 0,
            precioUnitario: det.precioUnitario,
            total: det.subtotal,
            tipo: `Materiales (${det.unidad})`
          });
        });
      }
    });

    return filas.sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  /**
   * Genera las filas aplanadas para el Reporte de Nómina
   */
  static procesarFilasReporteNomina(conduces: Conduce[], empleados?: Empleado[]): ReporteNominaFila[] {
    const filas: ReporteNominaFila[] = [];

    conduces.forEach((c) => {
      if (c.tipo === 'equipo_pesado') {
        const emp = empleados?.find((e) => e.nombre.toLowerCase().trim() === (c.operadorNombre || '').toLowerCase().trim());
        const infoNomina = emp?.salarioBase ? `$${emp.salarioBase.toLocaleString('es-DO')} (${emp.tipoSalario || 'mensual'})` : 'Pendiente de definir';

        filas.push({
          empleadoNombre: c.operadorNombre || 'Sin Asignar',
          equipoNombre: c.equipoAsignado,
          placa: c.placa || '',
          fecha: c.fecha,
          numeroConduce: c.numeroConduce,
          clienteNombre: c.clienteNombre,
          servicioDescripcion: `Operación Equipo: ${c.equipoAsignado}`,
          horasTrabajadas: c.totalHorasPagar,
          viajes: 0,
          metros: 0,
          precioServicio: c.precioPorHora,
          importeServicio: c.montoTotal,
          pagoNomina: infoNomina
        });
      } else {
        const emp = empleados?.find((e) => e.nombre.toLowerCase().trim() === (c.choferNombre || '').toLowerCase().trim());
        const infoNomina = emp?.salarioBase ? `$${emp.salarioBase.toLocaleString('es-DO')} (${emp.tipoSalario || 'mensual'})` : 'Pendiente de definir';

        (c.detalles || []).forEach((det) => {
          filas.push({
            empleadoNombre: c.choferNombre || 'Sin Asignar',
            equipoNombre: 'Camión Volteo',
            placa: c.placaCamion || '',
            fecha: c.fecha,
            numeroConduce: c.numeroConduce,
            clienteNombre: c.clienteNombre,
            servicioDescripcion: `Acarreo: ${det.material}`,
            horasTrabajadas: det.unidad === 'hora' ? det.cantidad : 0,
            viajes: det.unidad === 'viaje' ? det.cantidad : 0,
            metros: det.unidad === 'metro' ? det.cantidad : 0,
            precioServicio: det.precioUnitario,
            importeServicio: det.subtotal,
            pagoNomina: infoNomina
          });
        });
      }
    });

    return filas.sort((a, b) => a.empleadoNombre.localeCompare(b.empleadoNombre) || a.fecha.localeCompare(b.fecha));
  }

  // ===================== EXPORTAR REPORTE CLIENTES (EXCEL) =====================
  static exportarClienteExcel(conduces: Conduce[], filtros: FiltrosReporte): void {
    const filas = this.procesarFilasReporteCliente(conduces);

    const datosExcel = filas.map((f) => ({
      'Fecha': f.fecha,
      'No. Conduce': f.numeroConduce,
      'Cliente': f.clienteNombre,
      'Proyecto / Dirección': f.proyecto,
      'Equipo / Material / Servicio': f.itemDetalle,
      'Equipo': f.equipoNombre,
      'Placa': f.placa || '-',
      'Horas (H.T.)': f.horas || '-',
      'Viajes': f.viajes || '-',
      'Volumen (m³)': f.metros || '-',
      'Tarifa / Precio Unit. ($)': f.precioUnitario,
      'Monto Subtotal ($)': f.total
    }));

    // Calcular Totales
    const totalHoras = filas.reduce((sum, f) => sum + f.horas, 0);
    const totalViajes = filas.reduce((sum, f) => sum + f.viajes, 0);
    const totalMetros = filas.reduce((sum, f) => sum + f.metros, 0);
    const totalMonto = filas.reduce((sum, f) => sum + f.total, 0);

    datosExcel.push({
      'Fecha': 'TOTALES GENERALES',
      'No. Conduce': '',
      'Cliente': '',
      'Proyecto / Dirección': '',
      'Equipo / Material / Servicio': '',
      'Equipo': '',
      'Placa': '',
      'Horas (H.T.)': totalHoras,
      'Viajes': totalViajes,
      'Volumen (m³)': totalMetros,
      'Tarifa / Precio Unit. ($)': 0,
      'Monto Subtotal ($)': totalMonto
    });

    const clienteNombreTexto = filtros.clienteNombre || (filtros.clienteId ? filtros.clienteId : 'Todos los Clientes');
    const choferTexto = filtros.empleadoNombre ? filtros.empleadoNombre : 'Todos los Operadores / Choferes';
    const rangoTexto = (filtros.fechaInicio || filtros.fechaFin)
      ? `${filtros.fechaInicio || 'Inicio'} al ${filtros.fechaFin || 'Hoy'}`
      : 'Todos los periodos';

    const encabezados = [
      ['EQUIPOS Y PROYECTOS CIVILES, S.R.L. (EQUIPROCI)'],
      ['REPORTE DE PRODUCCIÓN Y TRABAJO A CLIENTES'],
      ['FILTROS APLICADOS EN ESTE REPORTE:'],
      [`  • Periodo / Fechas: ${rangoTexto}`],
      [`  • Cliente: ${clienteNombreTexto}`],
      [`  • Operador / Chofer: ${choferTexto}`],
      [`  • Total Registros: ${filas.length}`],
      []
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(encabezados);
    XLSX.utils.sheet_add_json(worksheet, datosExcel, { origin: 'A9' });

    worksheet['!cols'] = [
      { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 25 },
      { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
      { wch: 10 }, { wch: 14 }, { wch: 20 }, { wch: 20 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte_Clientes');
    XLSX.writeFile(workbook, `EQUIPROCI_Reporte_Clientes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // ===================== EXPORTAR REPORTE CLIENTES (PDF) =====================
  static exportarClientePDF(conduces: Conduce[], filtros: FiltrosReporte): void {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const filas = this.procesarFilasReporteCliente(conduces);

    const clienteNombreTexto = filtros.clienteNombre || (filtros.clienteId ? filtros.clienteId : 'Todos los Clientes');
    const choferTexto = filtros.empleadoNombre ? filtros.empleadoNombre : 'Todos los Operadores / Choferes';
    const rangoTexto = (filtros.fechaInicio || filtros.fechaFin)
      ? `${filtros.fechaInicio || 'Inicio'} al ${filtros.fechaFin || 'Hoy'}`
      : 'Todos los periodos';

    // Encabezado
    doc.setFontSize(15);
    doc.setTextColor(20, 40, 80);
    doc.text('EQUIPOS Y PROYECTOS CIVILES, S.R.L. (EQUIPROCI)', 14, 12);
    doc.setFontSize(11);
    doc.text('Reporte de Producción y Trabajo a Clientes', 14, 18);

    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(`FILTROS APLICADOS -> Periodo: ${rangoTexto}  |  Cliente: ${clienteNombreTexto}  |  Chofer/Operador: ${choferTexto}  |  Registros: ${filas.length}`, 14, 24);
    doc.text(`Fecha de emisión del documento: ${new Date().toLocaleDateString('es-DO')} ${new Date().toLocaleTimeString('es-DO')}`, 14, 28);

    const head = [['Fecha', 'No. Conduce', 'Cliente', 'Proyecto', 'Servicio/Material', 'Equipo', 'Placa', 'Horas', 'Viajes', 'Metros', 'Precio Unit.', 'Total ($)']];

    const body = filas.map((f) => [
      f.fecha,
      f.numeroConduce,
      f.clienteNombre,
      f.proyecto.substring(0, 22),
      f.itemDetalle,
      f.equipoNombre,
      f.placa || '-',
      f.horas ? f.horas.toString() : '-',
      f.viajes ? f.viajes.toString() : '-',
      f.metros ? f.metros.toString() : '-',
      `$${f.precioUnitario.toLocaleString('es-DO')}`,
      `$${f.total.toLocaleString('es-DO')}`
    ]);

    const totalMonto = filas.reduce((s, f) => s + f.total, 0);
    const totalHoras = filas.reduce((s, f) => s + f.horas, 0);
    const totalMetros = filas.reduce((s, f) => s + f.metros, 0);
    const totalViajes = filas.reduce((s, f) => s + f.viajes, 0);

    body.push([
      'TOTALES',
      '',
      '',
      '',
      '',
      '',
      '',
      totalHoras ? `${totalHoras} hrs` : '-',
      totalViajes ? `${totalViajes} vj` : '-',
      totalMetros ? `${totalMetros} m³` : '-',
      '',
      `$${totalMonto.toLocaleString('es-DO')}`
    ]);

    autoTable(doc, {
      startY: 32,
      head: head,
      body: body,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [24, 60, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [230, 235, 245], textColor: [0, 0, 0], fontStyle: 'bold' },
      theme: 'grid'
    });

    doc.save(`EQUIPROCI_Reporte_Clientes_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ===================== EXPORTAR REPORTE NÓMINA (EXCEL) =====================
  static exportarNominaExcel(conduces: Conduce[], filtros: FiltrosReporte, empleados?: Empleado[]): void {
    const filas = this.procesarFilasReporteNomina(conduces, empleados);

    const datosExcel = filas.map((f) => ({
      'Chofer / Operador': f.empleadoNombre,
      'Equipo / Vehículo': f.equipoNombre,
      'Placa': f.placa || '-',
      'Fecha': f.fecha,
      'No. Conduce': f.numeroConduce,
      'Cliente': f.clienteNombre,
      'Trabajo / Servicio': f.servicioDescripcion,
      'Horas Trab. (H.T.)': f.horasTrabajadas || '-',
      'Viajes': f.viajes || '-',
      'Volumen (m³)': f.metros || '-',
      'Precio Servicio ($)': f.precioServicio,
      'Importe Servicio ($)': f.importeServicio,
      'Salario / Tarifa': f.pagoNomina
    }));

    const totalHoras = filas.reduce((sum, f) => sum + f.horasTrabajadas, 0);
    const totalViajes = filas.reduce((sum, f) => sum + f.viajes, 0);
    const totalMetros = filas.reduce((sum, f) => sum + f.metros, 0);
    const totalMonto = filas.reduce((sum, f) => sum + f.importeServicio, 0);

    datosExcel.push({
      'Chofer / Operador': 'TOTAL IMPORTE DE SERVICIOS',
      'Equipo / Vehículo': '',
      'Placa': '',
      'Fecha': '',
      'No. Conduce': '',
      'Cliente': '',
      'Trabajo / Servicio': '',
      'Horas Trab. (H.T.)': totalHoras,
      'Viajes': totalViajes,
      'Volumen (m³)': totalMetros,
      'Precio Servicio ($)': 0,
      'Importe Servicio ($)': totalMonto,
      'Salario / Tarifa': '-'
    });

    const clienteNombreTexto = filtros.clienteNombre || (filtros.clienteId ? filtros.clienteId : 'Todos los Clientes');
    const choferTexto = filtros.empleadoNombre ? filtros.empleadoNombre : 'Todos los Operadores / Choferes';
    const rangoTexto = (filtros.fechaInicio || filtros.fechaFin)
      ? `${filtros.fechaInicio || 'Inicio'} al ${filtros.fechaFin || 'Hoy'}`
      : 'Todos los periodos';

    const encabezados = [
      ['EQUIPOS Y PROYECTOS CIVILES, S.R.L. (EQUIPROCI)'],
      ['REPORTE DE PRODUCCIÓN OPERATIVA Y RESUMEN PARA NÓMINA DE EMPLEADOS'],
      ['FILTROS APLICADOS EN ESTE REPORTE:'],
      [`  • Periodo / Fechas: ${rangoTexto}`],
      [`  • Cliente: ${clienteNombreTexto}`],
      [`  • Operador / Chofer: ${choferTexto}`],
      [`  • Total Registros: ${filas.length}`],
      ['Nota: Los valores reflejan el importe del servicio al cliente y el esquema salarial configurado para cada empleado.'],
      []
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(encabezados);
    XLSX.utils.sheet_add_json(worksheet, datosExcel, { origin: 'A10' });

    worksheet['!cols'] = [
      { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 14 },
      { wch: 15 }, { wch: 25 }, { wch: 28 }, { wch: 12 },
      { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 22 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte_Nomina');
    XLSX.writeFile(workbook, `EQUIPROCI_Reporte_Nomina_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // ===================== EXPORTAR REPORTE NÓMINA (PDF) =====================
  static exportarNominaPDF(conduces: Conduce[], filtros: FiltrosReporte, empleados?: Empleado[]): void {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const filas = this.procesarFilasReporteNomina(conduces, empleados);

    const clienteNombreTexto = filtros.clienteNombre || (filtros.clienteId ? filtros.clienteId : 'Todos los Clientes');
    const choferTexto = filtros.empleadoNombre ? filtros.empleadoNombre : 'Todos los Operadores / Choferes';
    const rangoTexto = (filtros.fechaInicio || filtros.fechaFin)
      ? `${filtros.fechaInicio || 'Inicio'} al ${filtros.fechaFin || 'Hoy'}`
      : 'Todos los periodos';

    // Encabezado
    doc.setFontSize(15);
    doc.setTextColor(20, 40, 80);
    doc.text('EQUIPOS Y PROYECTOS CIVILES, S.R.L. (EQUIPROCI)', 14, 12);
    doc.setFontSize(11);
    doc.text('Reporte de Resumen Operativo y Producción para Empleados', 14, 18);

    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.text(`FILTROS APLICADOS -> Periodo: ${rangoTexto}  |  Cliente: ${clienteNombreTexto}  |  Chofer/Operador: ${choferTexto}  |  Registros: ${filas.length}`, 14, 24);
    doc.text('Nota: Los importes corresponden al servicio facturado al cliente y se muestra la tarifa/salario acordado.', 14, 28);

    const head = [['Chofer / Operador', 'Equipo/Vehículo', 'Placa', 'Fecha', 'No. Conduce', 'Cliente', 'Servicio', 'H.T.', 'Viajes', 'm³', 'Precio Serv.', 'Imp. Servicio ($)', 'Salario / Tarifa']];

    const body = filas.map((f) => [
      f.empleadoNombre,
      f.equipoNombre,
      f.placa || '-',
      f.fecha,
      f.numeroConduce,
      f.clienteNombre,
      f.servicioDescripcion,
      f.horasTrabajadas ? f.horasTrabajadas.toString() : '-',
      f.viajes ? f.viajes.toString() : '-',
      f.metros ? f.metros.toString() : '-',
      `$${f.precioServicio.toLocaleString('es-DO')}`,
      `$${f.importeServicio.toLocaleString('es-DO')}`,
      f.pagoNomina
    ]);

    const totalMonto = filas.reduce((s, f) => s + f.importeServicio, 0);
    const totalHoras = filas.reduce((s, f) => s + f.horasTrabajadas, 0);
    const totalViajes = filas.reduce((s, f) => s + f.viajes, 0);
    const totalMetros = filas.reduce((s, f) => s + f.metros, 0);

    body.push([
      'TOTAL IMPORTE DE SERVICIOS',
      '',
      '',
      '',
      '',
      '',
      '',
      `${totalHoras} hrs`,
      `${totalViajes} vj`,
      `${totalMetros} m³`,
      '',
      `$${totalMonto.toLocaleString('es-DO')}`,
      'Por definir'
    ]);

    autoTable(doc, {
      startY: 34,
      head: head,
      body: body,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [18, 80, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
      footStyles: { fillColor: [225, 240, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
      theme: 'grid'
    });

    doc.save(`EQUIPROCI_Reporte_Nomina_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ==========================================
  // EXPORTACIONES MÓDULO CONTROL DE GASOIL
  // ==========================================

  /**
   * Exporta a Excel los datos del Módulo de Combustible / Gasoil
   */
  static exportarGasoilExcel(
    compras: CompraGasoil[],
    despachos: DespachoGasoil[],
    conteos: ConteoFisicoGasoil[],
    resumen: ResumenGasoil,
    filtros: FiltrosGasoil
  ): void {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen de Inventario
    const dataResumen = [
      { Concepto: 'Existencia Inicial (Teórica)', Galones: resumen.existenciaInicialGalones, 'Monto RD$': '-' },
      { Concepto: 'Total Comprado (+)', Galones: resumen.totalCompradoGalones, 'Monto RD$': resumen.totalMontoCompras },
      { Concepto: 'Total Despachado (-)', Galones: resumen.totalDespachadoGalones, 'Monto RD$': '-' },
      { Concepto: 'SALDO TEÓRICO CALCULADO', Galones: resumen.saldoTeoricoGalones, 'Monto RD$': '-' },
      { Concepto: 'ÚLTIMA EXISTENCIA FÍSICA (MEDIDA)', Galones: resumen.ultimoConteoFisicoGalones ?? 'Sin medición', 'Monto RD$': '-' },
      { Concepto: 'DIFERENCIA DE AUDITORÍA (FÍSICO vs TEÓRICO)', Galones: resumen.ultimaDiferenciaGalones ?? 0, 'Monto RD$': '-' }
    ];
    const wsResumen = XLSX.utils.json_to_sheet(dataResumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Inventario');

    // Hoja 2: Despachos de Combustible
    const dataDespachos = despachos.map((d) => ({
      Fecha: d.fecha,
      Hora: d.hora || '-',
      'Equipo / Vehículo': d.equipoOVehiculo,
      Placa: d.placa || '-',
      'Operador / Chofer': d.operadorOChofer || '-',
      'Galones Despachados': d.galones,
      'Horómetro (hrs)': d.horometro ?? '-',
      'Kilometraje (km)': d.kilometraje ?? '-',
      'No. Conduce': d.conduceNumero || 'Sin Conduce',
      'Actividad / Trabajo': d.actividadOTrabajo || '-',
      'Autorizado Por': d.autorizadoPor,
      'Entregado Por': d.entregadoPor,
      Observaciones: d.observaciones || ''
    }));
    const wsDespachos = XLSX.utils.json_to_sheet(dataDespachos);
    XLSX.utils.book_append_sheet(wb, wsDespachos, 'Despachos de Gasoil');

    // Hoja 3: Compras de Combustible
    const dataCompras = compras.map((c) => ({
      Fecha: c.fecha,
      Proveedor: c.proveedor,
      'Factura / Doc': c.facturaODocumento || '-',
      Referencia: c.numeroReferencia || '-',
      Galones: c.galones,
      'Precio/Galón ($)': c.precioPorGalon,
      'Monto Total ($)': c.montoTotal,
      Observaciones: c.observaciones || ''
    }));
    const wsCompras = XLSX.utils.json_to_sheet(dataCompras);
    XLSX.utils.book_append_sheet(wb, wsCompras, 'Compras de Gasoil');

    // Hoja 4: Conteos Físicos de Tanque
    const dataConteos = conteos.map((c) => ({
      Fecha: c.fecha,
      'Existencia Teórica (Gal)': c.existenciaTeoricaGalones,
      'Existencia Física (Gal)': c.existenciaFisicaGalones,
      'Diferencia (Gal)': c.diferenciaGalones,
      Responsable: c.responsable,
      Observaciones: c.observaciones || ''
    }));
    const wsConteos = XLSX.utils.json_to_sheet(dataConteos);
    XLSX.utils.book_append_sheet(wb, wsConteos, 'Conteos Físicos');

    XLSX.writeFile(wb, `EQUIPROCI_Control_Gasoil_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  /**
   * Exporta a PDF el Reporte del Módulo de Combustible / Gasoil
   */
  static exportarGasoilPDF(
    compras: CompraGasoil[],
    despachos: DespachoGasoil[],
    conteos: ConteoFisicoGasoil[],
    resumen: ResumenGasoil,
    alertas: AlertaGasoil[],
    filtros: FiltrosGasoil
  ): void {
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Header principal
    doc.setFontSize(14);
    doc.setTextColor(20, 40, 80);
    doc.text('EQUIPOS Y PROYECTOS CIVILES, S.R.L. (EQUIPROCI)', 14, 12);
    doc.setFontSize(11);
    doc.text('Módulo de Control de Combustible (Gasoil) - Trazabilidad y Auditoría', 14, 18);

    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const rangoTexto =
      filtros.fechaInicio || filtros.fechaFin
        ? `${filtros.fechaInicio || 'Inicio'} al ${filtros.fechaFin || 'Hoy'}`
        : 'Todos los periodos';
    const equipoTexto = filtros.equipoPlaca ? filtros.equipoPlaca : 'Todos los equipos';
    const opTexto = filtros.operadorChofer ? filtros.operadorChofer : 'Todos';

    doc.text(
      `FILTROS -> Rango: ${rangoTexto} | Equipo/Placa: ${equipoTexto} | Chofer/Op: ${opTexto} | Inconsistencias registradas: ${alertas.length}`,
      14,
      23
    );

    // Resumen de cajas pequeñas
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Inicial: ${resumen.existenciaInicialGalones} gal | +Comprado: ${resumen.totalCompradoGalones} gal ($${resumen.totalMontoCompras.toLocaleString('es-DO')}) | -Despachado: ${resumen.totalDespachadoGalones} gal`, 14, 28);
    const fisicoTxt = resumen.ultimoConteoFisicoGalones !== undefined ? `${resumen.ultimoConteoFisicoGalones} gal` : 'Sin registro';
    const difTxt = resumen.ultimaDiferenciaGalones !== undefined ? `${resumen.ultimaDiferenciaGalones > 0 ? '+' : ''}${resumen.ultimaDiferenciaGalones} gal` : '0 gal';
    doc.text(`SALDO TEÓRICO: ${resumen.saldoTeoricoGalones} gal  |  EXISTENCIA FÍSICA: ${fisicoTxt}  |  DIFERENCIA AUDITORÍA: ${difTxt}`, 14, 33);

    // Tabla 1: Despachos
    doc.setFontSize(10);
    doc.setTextColor(20, 40, 80);
    doc.text('Despachos a Equipos y Vehículos', 14, 37);

    const headDespachos = [
      ['Fecha', 'Hora', 'Equipo / Vehículo', 'Placa', 'Chofer/Operador', 'Galones', 'Lectura', 'Conduce', 'Autorizado', 'Entregado']
    ];

    const bodyDespachos = despachos.map((d) => [
      d.fecha,
      d.hora || '-',
      d.equipoOVehiculo,
      d.placa || '-',
      d.operadorOChofer || '-',
      `${d.galones} gal`,
      d.horometro ? `${d.horometro} hrs` : d.kilometraje ? `${d.kilometraje} km` : '-',
      d.conduceNumero || 'Sin Conduce',
      d.autorizadoPor,
      d.entregadoPor
    ]);

    autoTable(doc, {
      startY: 40,
      head: headDespachos,
      body: bodyDespachos,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold' },
      theme: 'grid'
    });

    let currentY = (doc as any).lastAutoTable.finalY + 8;

    // Tabla 2: Alertas / Inconsistencias (si existen)
    if (alertas.length > 0) {
      if (currentY > 170) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFontSize(10);
      doc.setTextColor(180, 40, 40);
      doc.text(`Movimientos e Inconsistencias para Revisión (${alertas.length})`, 14, currentY);

      const headAlertas = [['Fecha', 'Tipo', 'Nivel', 'Equipo/Placa', 'Descripción de la Inconsistencia']];
      const bodyAlertas = alertas.map((a) => [
        a.fecha,
        a.titulo,
        a.nivel === 'critico' ? '🚨 Crítico' : '⚠️ Advertencia',
        a.equipoOVehiculo || a.placa || '-',
        a.descripcion
      ]);

      autoTable(doc, {
        startY: currentY + 3,
        head: headAlertas,
        body: bodyAlertas,
        styles: { fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [180, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
        theme: 'grid'
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    }

    // Tabla 3: Compras de combustible
    if (compras.length > 0) {
      if (currentY > 170) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFontSize(10);
      doc.setTextColor(20, 40, 80);
      doc.text('Registro de Compras de Combustible', 14, currentY);

      const headCompras = [['Fecha', 'Proveedor', 'Factura/Doc', 'Referencia', 'Galones', 'Precio/Gal ($)', 'Monto Total ($)']];
      const bodyCompras = compras.map((c) => [
        c.fecha,
        c.proveedor,
        c.facturaODocumento || '-',
        c.numeroReferencia || '-',
        `${c.galones} gal`,
        `$${c.precioPorGalon.toLocaleString('es-DO')}`,
        `$${c.montoTotal.toLocaleString('es-DO')}`
      ]);

      autoTable(doc, {
        startY: currentY + 3,
        head: headCompras,
        body: bodyCompras,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [30, 80, 140], textColor: [255, 255, 255], fontStyle: 'bold' },
        theme: 'grid'
      });
    }

    doc.save(`EQUIPROCI_Control_Gasoil_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
