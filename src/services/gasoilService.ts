import {
  ConfiguracionGasoil,
  CompraGasoil,
  DespachoGasoil,
  ConteoFisicoGasoil,
  Conduce,
  AlertaGasoil,
  FiltrosGasoil
} from '../types';

export interface ResumenGasoil {
  existenciaInicialGalones: number;
  totalCompradoGalones: number;
  totalMontoCompras: number;
  totalDespachadoGalones: number;
  totalAjustesDiferenciaGalones: number;
  saldoTeoricoGalones: number;
  saldoDisponibleGalones: number;
  ultimoConteoFisicoGalones?: number;
  ultimaDiferenciaGalones?: number;
  fechaUltimoConteo?: string;
}

export interface MovimientoHistorialGasoil {
  id: string;
  fecha: string;
  hora?: string;
  tipoMovimiento: 'entrada' | 'salida' | 'ajuste_conteo';
  tipoEtiqueta: 'Compra' | 'Despacho' | 'Conteo Físico';
  concepto: string;
  equipoOVehiculo?: string;
  placa?: string;
  operadorOChofer?: string;
  referenciaODocumento?: string;
  entradaGalones: number;
  salidaGalones: number;
  ajusteGalones: number;
  saldoResultanteGalones: number;
  responsableOAutorizado?: string;
  observaciones?: string;
}

export class GasoilService {
  /**
   * Calcula el resumen cuantitativo del inventario de gasoil.
   * Saldo teórico = Existencia inicial + compras - despachos.
   * Un conteo físico NO modifica automáticamente el saldo teórico.
   */
  static calcularResumen(
    config: ConfiguracionGasoil,
    compras: CompraGasoil[],
    despachos: DespachoGasoil[],
    conteos: ConteoFisicoGasoil[]
  ): ResumenGasoil {
    const existenciaInicialGalones = config.existenciaInicialGalones || 0;

    const totalCompradoGalones = compras.reduce((acc, c) => acc + (Number(c.galones) || 0), 0);
    const totalMontoCompras = compras.reduce((acc, c) => acc + (Number(c.montoTotal) || 0), 0);
    const totalDespachadoGalones = despachos.reduce((acc, d) => acc + (Number(d.galones) || 0), 0);

    // Suma de diferencias acumuladas en conteos físicos (para auditoría)
    const totalAjustesDiferenciaGalones = conteos.reduce(
      (acc, c) => acc + (Number(c.diferenciaGalones) || 0),
      0
    );

    // Saldo Teórico: estrictamente Inicial + Compras - Despachos
    const saldoTeoricoGalones = existenciaInicialGalones + totalCompradoGalones - totalDespachadoGalones;

    // Conteo Físico más reciente
    const conteosOrdenados = [...conteos].sort((a, b) => b.fecha.localeCompare(a.fecha));
    const ultimoConteo = conteosOrdenados[0];

    return {
      existenciaInicialGalones,
      totalCompradoGalones,
      totalMontoCompras,
      totalDespachadoGalones,
      totalAjustesDiferenciaGalones,
      saldoTeoricoGalones,
      saldoDisponibleGalones: saldoTeoricoGalones,
      ultimoConteoFisicoGalones: ultimoConteo ? ultimoConteo.existenciaFisicaGalones : undefined,
      ultimaDiferenciaGalones: ultimoConteo ? ultimoConteo.diferenciaGalones : undefined,
      fechaUltimoConteo: ultimoConteo ? ultimoConteo.fecha : undefined
    };
  }

  /**
   * Genera el libro de movimientos cronológicos acumulados con saldo resultante.
   * El saldo acumulado (teórico) solo cambia por entradas y salidas, no por conteos físicos.
   */
  static obtenerHistorialMovimientos(
    config: ConfiguracionGasoil,
    compras: CompraGasoil[],
    despachos: DespachoGasoil[],
    conteos: ConteoFisicoGasoil[]
  ): MovimientoHistorialGasoil[] {
    const movimientos: {
      id: string;
      fecha: string;
      hora: string;
      timestamp: number;
      tipoMovimiento: 'entrada' | 'salida' | 'ajuste_conteo';
      tipoEtiqueta: 'Compra' | 'Despacho' | 'Conteo Físico';
      concepto: string;
      equipoOVehiculo?: string;
      placa?: string;
      operadorOChofer?: string;
      referenciaODocumento?: string;
      entradaGalones: number;
      salidaGalones: number;
      ajusteGalones: number;
      responsableOAutorizado?: string;
      observaciones?: string;
    }[] = [];

    // Compras (Entradas)
    compras.forEach((c) => {
      movimientos.push({
        id: c.id,
        fecha: c.fecha,
        hora: '00:00',
        timestamp: new Date(`${c.fecha}T00:00:00`).getTime(),
        tipoMovimiento: 'entrada',
        tipoEtiqueta: 'Compra',
        concepto: `Compra de combustible - ${c.proveedor}`,
        referenciaODocumento: c.facturaODocumento || c.numeroReferencia || 'Factura/Doc N/A',
        entradaGalones: Number(c.galones) || 0,
        salidaGalones: 0,
        ajusteGalones: 0,
        observaciones: c.observaciones
      });
    });

    // Despachos (Salidas)
    despachos.forEach((d) => {
      movimientos.push({
        id: d.id,
        fecha: d.fecha,
        hora: d.hora || '12:00',
        timestamp: new Date(`${d.fecha}T${d.hora || '12:00'}:00`).getTime(),
        tipoMovimiento: 'salida',
        tipoEtiqueta: 'Despacho',
        concepto: `Despacho a ${d.equipoOVehiculo}${d.placa ? ` (${d.placa})` : ''}`,
        equipoOVehiculo: d.equipoOVehiculo,
        placa: d.placa,
        operadorOChofer: d.operadorOChofer,
        referenciaODocumento: d.conduceNumero ? `Conduce ${d.conduceNumero}` : 'Sin Conduce',
        entradaGalones: 0,
        salidaGalones: Number(d.galones) || 0,
        ajusteGalones: 0,
        responsableOAutorizado: `Auth: ${d.autorizadoPor || 'N/A'} / Entregó: ${d.entregadoPor || 'N/A'}`,
        observaciones: d.observaciones
      });
    });

    // Conteos Físicos (Medición de Auditoría)
    conteos.forEach((c) => {
      movimientos.push({
        id: c.id,
        fecha: c.fecha,
        hora: '23:59',
        timestamp: new Date(`${c.fecha}T23:59:59`).getTime(),
        tipoMovimiento: 'ajuste_conteo',
        tipoEtiqueta: 'Conteo Físico',
        concepto: `Medición física en tanque (${c.existenciaFisicaGalones} gal medidos vs ${c.existenciaTeoricaGalones} gal teóricos)`,
        referenciaODocumento: `Diferencia: ${c.diferenciaGalones > 0 ? '+' : ''}${c.diferenciaGalones} gal`,
        entradaGalones: 0,
        salidaGalones: 0,
        ajusteGalones: Number(c.diferenciaGalones) || 0,
        responsableOAutorizado: c.responsable,
        observaciones: c.observaciones
      });
    });

    // Ordenar cronológicamente
    movimientos.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
      return a.hora.localeCompare(b.hora);
    });

    let saldoAcumulado = config.existenciaInicialGalones || 0;

    return movimientos.map((m) => {
      // El saldo teórico acumulado solo varía con entradas y salidas de combustible
      saldoAcumulado = saldoAcumulado + m.entradaGalones - m.salidaGalones;
      return {
        ...m,
        saldoResultanteGalones: Math.round(saldoAcumulado * 100) / 100
      };
    });
  }

  /**
   * Genera las alertas objetivas de inconsistencia para revisión
   */
  static detectarInconsistencias(
    despachos: DespachoGasoil[],
    conduces: Conduce[],
    conteos: ConteoFisicoGasoil[],
    saldoDisponibleActual: number
  ): AlertaGasoil[] {
    const alertas: AlertaGasoil[] = [];

    // CASO A: Combustible sin actividad/conduce en esa fecha
    despachos.forEach((d) => {
      if (!d.fecha || !d.equipoOVehiculo) return;

      const equipoBuscado = d.equipoOVehiculo.toLowerCase().trim();
      const placaBuscada = (d.placa || '').toLowerCase().trim();

      // Verificar si hay algún conduce en esa fecha que coincida con el equipo o la placa
      const conduceCoincidente = conduces.some((c) => {
        if (c.fecha !== d.fecha) return false;

        if (c.tipo === 'equipo_pesado') {
          const eqConduce = (c.equipoAsignado || '').toLowerCase().trim();
          const plConduce = (c.placa || '').toLowerCase().trim();
          return (
            eqConduce.includes(equipoBuscado) ||
            equipoBuscado.includes(eqConduce) ||
            (placaBuscada && plConduce && placaBuscada === plConduce)
          );
        } else {
          const plCamion = (c.placaCamion || '').toLowerCase().trim();
          return (
            (placaBuscada && plCamion && placaBuscada === plCamion) ||
            equipoBuscado.includes(plCamion)
          );
        }
      });

      if (!conduceCoincidente) {
        alertas.push({
          id: `alt-sin-act-${d.id}`,
          tipo: 'sin_actividad',
          nivel: 'advertencia',
          titulo: 'Despacho sin actividad o conduce registrado',
          descripcion: `⚠️ Revisar: Se despacharon ${d.galones} gal a "${d.equipoOVehiculo}"${d.placa ? ` (${d.placa})` : ''} el ${d.fecha}, pero no se registra conduce de trabajo ni actividad oficial en esa fecha.`,
          fecha: d.fecha,
          equipoOVehiculo: d.equipoOVehiculo,
          placa: d.placa,
          despachoId: d.id
        });
      }
    });

    // CASO B: Múltiples despachos el mismo día para el mismo vehículo/equipo
    const despachosPorFechaYEquipo: Record<string, DespachoGasoil[]> = {};
    despachos.forEach((d) => {
      const clave = `${d.fecha}_${(d.placa || d.equipoOVehiculo).toLowerCase().trim()}`;
      if (!despachosPorFechaYEquipo[clave]) {
        despachosPorFechaYEquipo[clave] = [];
      }
      despachosPorFechaYEquipo[clave].push(d);
    });

    Object.entries(despachosPorFechaYEquipo).forEach(([clave, lista]) => {
      if (lista.length > 1) {
        const primer = lista[0];
        const totalGalones = lista.reduce((acc, item) => acc + (Number(item.galones) || 0), 0);
        alertas.push({
          id: `alt-mult-${clave}`,
          tipo: 'multiples_despachos',
          nivel: 'advertencia',
          titulo: 'Múltiples despachos el mismo día',
          descripcion: `⚠️ Revisar: El equipo "${primer.equipoOVehiculo}"${primer.placa ? ` (${primer.placa})` : ''} tiene ${lista.length} despachos registrados el ${primer.fecha} sumando un total de ${totalGalones} gal.`,
          fecha: primer.fecha,
          equipoOVehiculo: primer.equipoOVehiculo,
          placa: primer.placa
        });
      }
    });

    // CASO C & D: Horómetro o Kilometraje Inconsistente (Nuevo menor al anterior)
    const despachosPorEquipoOrdenados: Record<string, DespachoGasoil[]> = {};
    despachos.forEach((d) => {
      const clave = (d.placa || d.equipoOVehiculo).toLowerCase().trim();
      if (!despachosPorEquipoOrdenados[clave]) {
        despachosPorEquipoOrdenados[clave] = [];
      }
      despachosPorEquipoOrdenados[clave].push(d);
    });

    Object.values(despachosPorEquipoOrdenados).forEach((lista) => {
      lista.sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora || '').localeCompare(b.hora || ''));

      for (let i = 1; i < lista.length; i++) {
        const actual = lista[i];
        const anterior = lista[i - 1];

        // Horómetro
        if (
          typeof actual.horometro === 'number' &&
          typeof anterior.horometro === 'number' &&
          actual.horometro > 0 &&
          anterior.horometro > 0 &&
          actual.horometro < anterior.horometro
        ) {
          alertas.push({
            id: `alt-horo-${actual.id}`,
            tipo: 'horometro_inconsistente',
            nivel: 'critico',
            titulo: 'Inconsistencia de Horómetro',
            descripcion: `🚨 Revisar: Horómetro menor al anterior en "${actual.equipoOVehiculo}". Se registró ${actual.horometro} hrs el ${actual.fecha}, menor a las ${anterior.horometro} hrs registradas el ${anterior.fecha}.`,
            fecha: actual.fecha,
            equipoOVehiculo: actual.equipoOVehiculo,
            despachoId: actual.id
          });
        }

        // Kilometraje
        if (
          typeof actual.kilometraje === 'number' &&
          typeof anterior.kilometraje === 'number' &&
          actual.kilometraje > 0 &&
          anterior.kilometraje > 0 &&
          actual.kilometraje < anterior.kilometraje
        ) {
          alertas.push({
            id: `alt-km-${actual.id}`,
            tipo: 'kilometraje_inconsistente',
            nivel: 'critico',
            titulo: 'Inconsistencia de Kilometraje',
            descripcion: `🚨 Revisar: Kilometraje menor al anterior en "${actual.equipoOVehiculo}" (${actual.placa || ''}). Se registró ${actual.kilometraje} km el ${actual.fecha}, menor a los ${anterior.kilometraje} km del ${anterior.fecha}.`,
            fecha: actual.fecha,
            equipoOVehiculo: actual.equipoOVehiculo,
            placa: actual.placa,
            despachoId: actual.id
          });
        }
      }
    });

    // CASO E: Saldo Insuficiente / Negativo
    if (saldoDisponibleActual < 0) {
      alertas.push({
        id: 'alt-saldo-neg',
        tipo: 'saldo_insuficiente',
        nivel: 'critico',
        titulo: 'Existencia Insuficiente en Tanque',
        descripcion: `🚨 Revisar: El saldo disponible calculado de combustible está en negativo (${saldoDisponibleActual} gal). Se requiere verificar las compras o ajustar inventario inicial.`,
        fecha: new Date().toISOString().split('T')[0]
      });
    }

    // CASO F: Diferencia de inventario físico
    conteos.forEach((c) => {
      if (c.diferenciaGalones !== 0) {
        alertas.push({
          id: `alt-cont-${c.id}`,
          tipo: 'diferencia_inventario',
          nivel: Math.abs(c.diferenciaGalones) > 50 ? 'critico' : 'advertencia',
          titulo: 'Diferencia de Inventario Físico',
          descripcion: `⚠️ Diferencia de inventario en conteo del ${c.fecha}: ${c.existenciaTeoricaGalones} gal teóricos vs ${c.existenciaFisicaGalones} gal físicos (Diferencia: ${c.diferenciaGalones > 0 ? '+' : ''}${c.diferenciaGalones} gal). Resp: ${c.responsable}`,
          fecha: c.fecha,
          conteoId: c.id
        });
      }
    });

    return alertas.sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  /**
   * Filtrado unificado de los datos de gasoil
   */
  static filtrarDespachos(despachos: DespachoGasoil[], filtros: FiltrosGasoil): DespachoGasoil[] {
    return despachos.filter((d) => {
      if (filtros.fechaInicio && d.fecha < filtros.fechaInicio) return false;
      if (filtros.fechaFin && d.fecha > filtros.fechaFin) return false;

      if (filtros.equipoPlaca) {
        const eqBuscado = filtros.equipoPlaca.toLowerCase();
        const eqMatch = (d.equipoOVehiculo || '').toLowerCase().includes(eqBuscado);
        const plMatch = (d.placa || '').toLowerCase().includes(eqBuscado);
        if (!eqMatch && !plMatch) return false;
      }

      if (filtros.operadorChofer) {
        const opBuscado = filtros.operadorChofer.toLowerCase();
        const opMatch = (d.operadorOChofer || '').toLowerCase().includes(opBuscado);
        if (!opMatch) return false;
      }

      return true;
    });
  }

  /**
   * Agrupado de consumo por equipo
   */
  static obtenerConsumoPorEquipo(
    despachos: DespachoGasoil[]
  ): { equipoOVehiculo: string; placa: string; totalGalones: number; totalDespachos: number }[] {
    const mapa: Record<string, { equipoOVehiculo: string; placa: string; totalGalones: number; totalDespachos: number }> = {};

    despachos.forEach((d) => {
      const clave = `${d.equipoOVehiculo}_${d.placa || ''}`;
      if (!mapa[clave]) {
        mapa[clave] = {
          equipoOVehiculo: d.equipoOVehiculo,
          placa: d.placa || '',
          totalGalones: 0,
          totalDespachos: 0
        };
      }
      mapa[clave].totalGalones += Number(d.galones) || 0;
      mapa[clave].totalDespachos += 1;
    });

    return Object.values(mapa).sort((a, b) => b.totalGalones - a.totalGalones);
  }

  /**
   * Agrupado de consumo por operador/chofer
   */
  static obtenerConsumoPorOperador(
    despachos: DespachoGasoil[]
  ): { operadorOChofer: string; totalGalones: number; totalDespachos: number }[] {
    const mapa: Record<string, { operadorOChofer: string; totalGalones: number; totalDespachos: number }> = {};

    despachos.forEach((d) => {
      const nombre = d.operadorOChofer || 'Sin Especificar';
      if (!mapa[nombre]) {
        mapa[nombre] = {
          operadorOChofer: nombre,
          totalGalones: 0,
          totalDespachos: 0
        };
      }
      mapa[nombre].totalGalones += Number(d.galones) || 0;
      mapa[nombre].totalDespachos += 1;
    });

    return Object.values(mapa).sort((a, b) => b.totalGalones - a.totalGalones);
  }
}
