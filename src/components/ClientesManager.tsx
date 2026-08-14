import React, { useState } from 'react';
import { Cliente } from '../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Phone,
  UserCheck,
  MapPin,
  ShieldCheck,
  ArrowRight,
  DollarSign
} from 'lucide-react';

interface ClientesManagerProps {
  clientes: Cliente[];
  onSaveCliente: (cliente: Cliente) => void;
  onDeleteCliente?: (id: string) => void;
  onNavigateToPrecios?: () => void;
}

export const ClientesManager: React.FC<ClientesManagerProps> = ({
  clientes,
  onSaveCliente,
  onDeleteCliente,
  onNavigateToPrecios
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [modalCliente, setModalCliente] = useState<boolean>(false);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);

  // Form state
  const [nombre, setNombre] = useState<string>('');
  const [rnc, setRnc] = useState<string>('');
  const [contacto, setContacto] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [direccion, setDireccion] = useState<string>('');

  const handleOpenModal = (cli?: Cliente) => {
    if (cli) {
      setClienteEdit(cli);
      setNombre(cli.nombre);
      setRnc(cli.rnc || '');
      setContacto(cli.contacto || '');
      setTelefono(cli.telefono || '');
      setDireccion(cli.direccion || cli.proyectoPredeterminado || '');
    } else {
      setClienteEdit(null);
      setNombre('');
      setRnc('');
      setContacto('');
      setTelefono('');
      setDireccion('');
    }
    setModalCliente(true);
  };

  const handleGuardarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const clienteGuardar: Cliente = {
      id: clienteEdit ? clienteEdit.id : `cli-${Date.now()}`,
      nombre: nombre.trim(),
      rnc: rnc.trim() || 'S/R',
      contacto: contacto.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      proyectoPredeterminado: direccion.trim()
    };

    onSaveCliente(clienteGuardar);
    setModalCliente(false);
  };

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.rnc && c.rnc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.contacto && c.contacto.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Banner Principal de Etapa 1 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                Paso 1: Configurar Empresa
              </span>
            </div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-amber-400" />
              Gestión e Registro de Clientes
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Registre los clientes y contratistas para los cuales la empresa presta servicios de equipos y materiales.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToPrecios && (
              <button
                onClick={onNavigateToPrecios}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-amber-400" />
                Configurar Tarifas / Precios
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </button>
          </div>
        </div>

        {/* Garantía */}
        <div className="mt-4 p-3 bg-slate-800/60 border border-slate-800 rounded-xl text-slate-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Una vez creado el cliente, podrá asignarle servicios y precios acordados en la sección de <strong>Servicios y Precios</strong>, o seleccionarlo directamente al emitir conduces.
          </span>
        </div>
      </div>

      {/* Buscador & Contadores */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, RNC o contacto..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium self-end sm:self-center">
          Total Clientes Registrados: <strong className="text-amber-400 font-bold">{clientes.length}</strong>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Empresa / Cliente</th>
                <th className="p-3.5">RNC / Cédula</th>
                <th className="p-3.5">Contacto Principal</th>
                <th className="p-3.5">Teléfono</th>
                <th className="p-3.5">Proyecto / Dirección</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No se encontraron clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span>{c.nombre}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{c.rnc || 'S/R'}</td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1.5 text-slate-200">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        {c.contacto || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {c.telefono || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {c.direccion || c.proyectoPredeterminado || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(c)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                          title="Editar Cliente"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteCliente && (
                          <button
                            onClick={() => onDeleteCliente(c.id)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar Cliente"
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

      {/* Modal Crear / Editar Cliente */}
      {modalCliente && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-amber-400" />
              {clienteEdit ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente'}
            </h3>

            <form onSubmit={handleGuardarCliente} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Nombre del Cliente / Empresa *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-amber-500 outline-none"
                  placeholder="ej. New Hope Dominicana"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">RNC / Cédula</label>
                  <input
                    type="text"
                    value={rnc}
                    onChange={(e) => setRnc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono outline-none focus:border-amber-500"
                    placeholder="1-01-00000-0"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Teléfono</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                    placeholder="(809) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Contacto Principal en Obra</label>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                  placeholder="ej. Ing. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Dirección / Proyecto Predeterminado</label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-amber-500"
                  placeholder="ej. Proyecto Carretera Mella Km 12"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalCliente(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer transition-colors"
                >
                  {clienteEdit ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
