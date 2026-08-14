import React, { useState } from 'react';
import { EquipoVehiculo } from '../types';
import {
  Tractor,
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface EquiposVehiculosManagerProps {
  equipos: EquipoVehiculo[];
  onSaveEquipo: (equipo: EquipoVehiculo) => void;
  onDeleteEquipo?: (id: string) => void;
}

export const EquiposVehiculosManager: React.FC<EquiposVehiculosManagerProps> = ({
  equipos,
  onSaveEquipo,
  onDeleteEquipo
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalEquipo, setModalEquipo] = useState<boolean>(false);
  const [equipoEdit, setEquipoEdit] = useState<EquipoVehiculo | null>(null);

  // Form State
  const [nombre, setNombre] = useState<string>('');
  const [tipo, setTipo] = useState<'equipo_pesado' | 'camion_volteo' | 'vehiculo_liviano'>('equipo_pesado');
  const [placa, setPlaca] = useState<string>('');
  const [capacidadM3, setCapacidadM3] = useState<number | ''>('');
  const [descripcion, setDescripcion] = useState<string>('');

  const handleOpenModal = (eq?: EquipoVehiculo) => {
    if (eq) {
      setEquipoEdit(eq);
      setNombre(eq.nombre);
      setTipo(eq.tipo);
      setPlaca(eq.placa || '');
      setCapacidadM3(eq.capacidadM3 || '');
      setDescripcion(eq.descripcion || '');
    } else {
      setEquipoEdit(null);
      setNombre('');
      setTipo('equipo_pesado');
      setPlaca('');
      setCapacidadM3('');
      setDescripcion('');
    }
    setModalEquipo(true);
  };

  const handleGuardarEquipo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const eqGuardar: EquipoVehiculo = {
      id: equipoEdit ? equipoEdit.id : `eq-${Date.now()}`,
      nombre: nombre.trim(),
      tipo,
      placa: placa.trim().toUpperCase(),
      capacidadM3: tipo === 'camion_volteo' && capacidadM3 !== '' && Number(capacidadM3) > 0 ? Number(capacidadM3) : undefined,
      descripcion: descripcion.trim()
    };

    onSaveEquipo(eqGuardar);
    setModalEquipo(false);
  };

  const equiposFiltrados = equipos.filter(
    (eq) =>
      eq.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.placa && eq.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.descripcion && eq.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getTipoBadge = (t: EquipoVehiculo['tipo']) => {
    switch (t) {
      case 'equipo_pesado':
        return (
          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
            <Tractor className="w-3 h-3" /> Equipo Pesado (Por Hora)
          </span>
        );
      case 'camion_volteo':
        return (
          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
            <Truck className="w-3 h-3" /> Camión Volteo (Materiales)
          </span>
        );
      case 'vehiculo_liviano':
        return (
          <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
            <Tag className="w-3 h-3" /> Vehículo Apoyo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Principal */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                Paso 1: Configurar Empresa
              </span>
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Tractor className="w-6 h-6 text-amber-400" />
              Catálogo de Equipos y Vehículos
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Registre la maquinaria pesada, camiones de volteo, fichas de unidad y placas oficiales para la operación.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Equipo / Vehículo
          </button>
        </div>

        <div className="mt-4 p-3 bg-slate-800/60 border border-slate-800 rounded-xl text-slate-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Los equipos y sus placas registradas facilitan la emisión rápida de conduces y el control de despachos en el módulo de <strong>Control de Gasoil</strong>.
          </span>
        </div>
      </div>

      {/* Buscador & Conteo */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por equipo, placa o ficha..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium self-end sm:self-center">
          Total Unidades Registradas: <strong className="text-amber-400 font-bold">{equipos.length}</strong>
        </div>
      </div>

      {/* Tabla de Equipos y Vehículos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Nombre / Ficha de la Unidad</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Placa</th>
                <th className="p-3.5">Capacidad (m³)</th>
                <th className="p-3.5">Descripción / Especificación</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {equiposFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No se encontraron equipos o vehículos registrados.
                  </td>
                </tr>
              ) : (
                equiposFiltrados.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                        {eq.tipo === 'camion_volteo' ? <Truck className="w-4 h-4" /> : <Tractor className="w-4 h-4" />}
                      </div>
                      <span>{eq.nombre}</span>
                    </td>
                    <td className="p-3.5">{getTipoBadge(eq.tipo)}</td>
                    <td className="p-3.5">
                      <span className="bg-slate-950 border border-slate-800 font-mono text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">
                        {eq.placa || 'SIN PLACA'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-200">
                      {eq.capacidadM3 ? `${eq.capacidadM3} m³` : 'N/A'}
                    </td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">
                      {eq.descripcion || 'Sin especificación'}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(eq)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                          title="Editar Equipo"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteEquipo && (
                          <button
                            onClick={() => onDeleteEquipo(eq.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Equipo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear / Editar Equipo */}
      {modalEquipo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Tractor className="w-5 h-5 text-amber-400" />
              {equipoEdit ? 'Editar Equipo / Vehículo' : 'Registrar Nuevo Equipo / Vehículo'}
            </h3>

            <form onSubmit={handleGuardarEquipo} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nombre / Ficha de la Unidad *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-amber-500 outline-none"
                  placeholder="ej. Camión Volteo Mack 18m³ (#05)"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Categoría *</label>
                  <select
                    value={tipo}
                    onChange={(e) => {
                      const nuevoTipo = e.target.value as any;
                      setTipo(nuevoTipo);
                      if (nuevoTipo !== 'camion_volteo') {
                        setCapacidadM3('');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                  >
                    <option value="equipo_pesado">Equipo Pesado (Horas - Cobro por Hora)</option>
                    <option value="camion_volteo">Camión Volteo (Materiales - Cobro por m³ / Viaje)</option>
                    <option value="vehiculo_liviano">Vehículo Liviano / Apoyo (N/A)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Placa Oficial</label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono uppercase outline-none focus:border-amber-500"
                    placeholder="L-000000 / EQUIP-01"
                  />
                </div>
              </div>

              {tipo === 'camion_volteo' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Capacidad de Carga en m³ (Volumen)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={capacidadM3}
                    onChange={(e) => setCapacidadM3(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono outline-none focus:border-amber-500"
                    placeholder="ej. 14, 16, 18"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Descripción / Notas de Mantenimiento</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500 resize-none"
                  placeholder="ej. Motor Mack 400HP, doble diferencial"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalEquipo(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {equipoEdit ? 'Actualizar Unidad' : 'Guardar Unidad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
