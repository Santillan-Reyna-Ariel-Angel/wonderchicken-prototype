import React, { useState } from 'react';
import { Branch } from '../types';
import { AppModal } from '../commonComponents/AppModal';

interface BranchesScreenProps {
  onBackToPOS: () => void;
}

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-001',
    code: 'SCZ-001',
    name: 'Sucursal Central',
    subtitle: 'Sede Matriz • Fritura y Despacho',
    address: 'Av. Central 123',
    city: 'Santa Cruz (Centro)',
    adminName: 'Ana Admin',
    adminEmail: 'ana.admin@wonderchicken.bo',
    adminAvatar: 'https://lh3.googleusercontent.com/aida/AEtjO1UeU-dPW2xV51uDn6xjSYBx5aQ_phV1RW0qXrx1lh6__UO10EB8Q-Vo_iXTafRjk1G-tU-pg7ElZlfVyedi1YFPkh46MiMI7E4HJnbgYzS2ILQq1si0Dmb-dpRQJB0a7rWkZHIF8rtEgs0YW3NB9k9Pey6ki6L9uX9kRj5QDjf4sWTKlQUpz-5o2zh3qLOJy9c23bvWq-ZaN6RFE8_hvoHmMbRthFwyDqJcM3F8v78bIBRFYFLWrAww25KdAjmjcoKltSVNVyalaQ',
    terminalsCount: 4,
    active: true,
    syncDb: true,
  },
  {
    id: 'b-002',
    code: 'CBB-002',
    name: 'Sucursal América',
    subtitle: 'Drive-Thru & Salón',
    address: 'Av. América Este #1120',
    city: 'Cochabamba (Norte)',
    adminName: 'Valeria Rios',
    adminEmail: 'valeria.rios@wonderchicken.bo',
    terminalsCount: 2,
    active: true,
    syncDb: true,
  },
  {
    id: 'b-003',
    code: 'SCZ-003',
    name: 'Sucursal Equipetrol',
    subtitle: 'Formato Express & Delivery',
    address: 'Calle 7 Este #88',
    city: 'Santa Cruz (Equipetrol)',
    adminName: 'Diego Arteaga',
    adminEmail: 'diego.arteaga@wonderchicken.bo',
    terminalsCount: 1,
    active: true,
    syncDb: true,
  },
];

export const BranchesScreen: React.FC<BranchesScreenProps> = ({ onBackToPOS }) => {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Branch Form state
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('La Paz');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchCajas, setNewBranchCajas] = useState('2');
  const [newBranchAdmin, setNewBranchAdmin] = useState('Carlos Mendoza (carlos.m@wonderchicken.bo)');
  const [syncRules, setSyncRules] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleActive = (code: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.code === code ? { ...b, active: !b.active } : b))
    );
    showToast(`Estado de sucursal ${code} actualizado en el cluster`);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchAddress) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    const newCode = newBranchCity.includes('Paz')
      ? `LPZ-00${branches.length + 1}`
      : `SUC-00${branches.length + 1}`;

    const newBranch: Branch = {
      id: `b-${Date.now()}`,
      code: newCode,
      name: newBranchName,
      subtitle: 'Nueva Sede Autorizada',
      address: newBranchAddress,
      city: newBranchCity,
      adminName: newBranchAdmin.split('(')[0].trim(),
      adminEmail: newBranchAdmin.includes('(')
        ? newBranchAdmin.split('(')[1].replace(')', '')
        : 'admin@wonderchicken.bo',
      terminalsCount: parseInt(newBranchCajas) || 2,
      active: true,
      syncDb: syncRules,
    };

    setBranches((prev) => [...prev, newBranch]);
    showToast(`Sucursal ${newBranch.name} (${newBranch.code}) creada y sincronizada exitosamente.`);
    setShowModal(false);

    // Reset fields
    setNewBranchName('');
    setNewBranchAddress('');
    setNewBranchPhone('');
  };

  const filteredBranches = branches.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.code.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.adminName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header Operativo Super Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] bg-[#ffdad6] text-[#af101a] uppercase font-bold tracking-wider">
              FR-000 Master Control
            </span>
            <span className="font-mono text-xs text-[#795900] flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#795900]"></span>
              Wonder Chicken Bolivia
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#141b2b] tracking-tight">
            Directorio y Expansión de Sucursales
          </h1>
          <p className="text-xs text-[#5b403d] max-w-2xl">
            Gestión de sedes operativas, asignación de administradores y monitor de estado de red multi-sucursal en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBackToPOS}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Volver a POS
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">domain_add</span>
            <span>+ Nueva Sucursal (POST /branches)</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#e1e8fd] shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e1e8fd] bg-[#f9f9ff]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#af101a]"></span>
            <h2 className="font-bold text-sm sm:text-base text-[#141b2b]">
              Sucursales de la Cadena Wonder Chicken
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#e1e8fd] text-[#141b2b] font-mono text-xs font-semibold">
              {branches.length} Registradas
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, zona o admin..."
              className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#f1f3ff] text-[#5b403d] font-mono uppercase tracking-wider border-b border-[#e1e8fd]">
                <th className="py-3 px-4">Código / ID</th>
                <th className="py-3 px-4">Nombre de Sucursal</th>
                <th className="py-3 px-4">Dirección</th>
                <th className="py-3 px-4">Ciudad / Zona</th>
                <th className="py-3 px-4">Administrador Responsable</th>
                <th className="py-3 px-4 text-center">Terminales</th>
                <th className="py-3 px-4 text-center">Estado Red</th>
                <th className="py-3 px-4 text-center">Sync DB</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3ff] text-[#141b2b]">
              {filteredBranches.map((branch) => (
                <tr key={branch.code} className="hover:bg-[#f9f9ff] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#af101a]">
                    {branch.code}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-[#ffdad6] text-[#af101a] font-bold flex items-center justify-center shrink-0">
                        {branch.name.charAt(branch.name.indexOf(' ') + 1) || 'S'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[#141b2b]">{branch.name}</span>
                        <span className="text-[11px] text-[#5b403d]">{branch.subtitle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#5b403d]">{branch.address}</td>
                  <td className="py-3 px-4">
                    <span className="bg-[#f1f3ff] px-2 py-0.5 rounded font-mono text-[11px] text-[#141b2b]">
                      {branch.city}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {branch.adminAvatar ? (
                        <img
                          src={branch.adminAvatar}
                          alt={branch.adminName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#fec330] text-[#6f5100] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {branch.adminName.split(' ').map((n) => n[0]).join('')}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] leading-tight">{branch.adminName}</span>
                        <span className="text-[10px] text-[#5b403d] font-mono">{branch.adminEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f1f3ff] text-[#141b2b]">
                      {branch.terminalsCount} POS
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(branch.code)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                        branch.active ? 'bg-[#fec330]' : 'bg-[#e1e8fd]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          branch.active ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="material-symbols-outlined text-[18px] text-[#15803d]">
                      check_circle
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => showToast(`Editando parámetros de ${branch.name}`)}
                        className="p-1.5 rounded hover:bg-[#f1f3ff] text-[#5b403d] hover:text-[#141b2b] cursor-pointer"
                        title="Editar Sucursal"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_location_alt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Ventas del día: 142 tickets en ${branch.name}`)}
                        className="p-1.5 rounded hover:bg-[#f1f3ff] text-[#5b403d] hover:text-[#af101a] cursor-pointer"
                        title="Ver Métricas"
                      >
                        <span className="material-symbols-outlined text-[16px]">analytics</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Impresoras térmicas OK en ${branch.name}`)}
                        className="p-1.5 rounded hover:bg-[#f1f3ff] text-[#5b403d] hover:text-[#005c8d] cursor-pointer"
                        title="Configurar Impresoras"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f1f3ff] flex items-center justify-between font-mono text-[11px] text-[#5b403d]">
          <span>Mostrando {filteredBranches.length} de {branches.length} sedes autorizadas por la franquicia</span>
          <span className="font-bold text-[#141b2b]">Clúster Operativo Activo</span>
        </div>
      </div>

      {/* Modal: Registrar Nueva Sucursal */}
      <AppModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        icon="add_business"
        title="Registrar Nueva Sucursal"
        description="Phase 2 — Expansion Cluster"
        maxWidth="2xl"
        onConfirm={() => {
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
          handleCreateBranch(fakeEvent);
        }}
        confirmLabel="Crear y Habilitar Sucursal (POST /branches)"
        confirmIcon="check"
        showCancel={true}
        cancelLabel="Cancelar"
      >
        <div className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#141b2b] flex items-center justify-between">
              <span>Nombre de la Sucursal *</span>
              <span className="text-[11px] text-[#5b403d] font-normal">Identificador público</span>
            </label>
            <input
              type="text"
              required
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              placeholder="Ej. Sucursal Miraflores"
              className="w-full px-3 py-2 bg-[#f1f3ff] focus:bg-white rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a] font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#141b2b] flex items-center justify-between">
              <span>Dirección Física Completa *</span>
              <span className="text-[11px] text-[#5b403d] font-normal">Ubicación fiscal e impresión</span>
            </label>
            <input
              type="text"
              required
              value={newBranchAddress}
              onChange={(e) => setNewBranchAddress(e.target.value)}
              placeholder="Ej. Av. Busch #450, Miraflores, La Paz"
              className="w-full px-3 py-2 bg-[#f1f3ff] focus:bg-white rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a] font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#141b2b]">Ciudad / Departamento *</label>
              <select
                value={newBranchCity}
                onChange={(e) => setNewBranchCity(e.target.value)}
                className="w-full px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] outline-none font-medium"
              >
                <option value="La Paz">La Paz</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Sucre">Sucre</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#141b2b]">Teléfono de Contacto</label>
              <input
                type="tel"
                value={newBranchPhone}
                onChange={(e) => setNewBranchPhone(e.target.value)}
                placeholder="Ej. +591 2 2223344"
                className="w-full px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#141b2b]">Cantidad de Cajas Autorizadas</label>
              <select
                value={newBranchCajas}
                onChange={(e) => setNewBranchCajas(e.target.value)}
                className="w-full px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] outline-none font-medium"
              >
                <option value="1">1 Terminal POS</option>
                <option value="2">2 Terminales POS</option>
                <option value="3">3 Terminales POS</option>
                <option value="4">4 Terminales POS (Capacidad Máx.)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#141b2b]">Asignar Administrador de Sucursal *</label>
              <select
                value={newBranchAdmin}
                onChange={(e) => setNewBranchAdmin(e.target.value)}
                className="w-full px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] outline-none font-medium"
              >
                <option value="Carlos Mendoza (carlos.m@wonderchicken.bo)">
                  Carlos Mendoza (carlos.m@wonderchicken.bo)
                </option>
                <option value="Mariana Quispe (mariana.q@wonderchicken.bo)">
                  Mariana Quispe (mariana.q@wonderchicken.bo)
                </option>
                <option value="Rodrigo Claure (rodrigo.c@wonderchicken.bo)">
                  Rodrigo Claure (rodrigo.c@wonderchicken.bo)
                </option>
              </select>
            </div>
          </div>

          {/* Sync check */}
          <div className="p-3 rounded-lg bg-[#f1f3ff] border border-[#e1e8fd] flex items-start gap-2">
            <input
              type="checkbox"
              id="sync-rules-check"
              checked={syncRules}
              onChange={(e) => setSyncRules(e.target.checked)}
              className="accent-[#af101a] rounded mt-0.5 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="sync-rules-check" className="text-[11px] text-[#141b2b] cursor-pointer">
              <strong>Activar sincronización de catálogo de productos base y reglas de sustitución automáticamente.</strong>
              <span className="block text-[#5b403d] mt-0.5">
                La nueva sucursal clonará precios vigentes, menús de pollo broaster, piezas y salsas maestras desde Sede Central.
              </span>
            </label>
          </div>
        </div>
      </AppModal>
    </div>
  );
};
