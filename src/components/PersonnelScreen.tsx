import React, { useState } from 'react';
import { Operator } from '../types';

interface PersonnelScreenProps {
  onBackToPOS: () => void;
}

const INITIAL_OPERATORS: Operator[] = [
  {
    id: 'op-1',
    fullName: 'Carla Cajera',
    email: 'carlac@wonderchicken.com',
    ci: '2222222',
    role: 'CASHIER',
    shift: 'Mañana',
    shiftHours: '08:30 - 16:00',
    active: true,
    lastAccess: 'Hoy 08:24 (POS-01)',
    branch: 'Sucursal Central',
  },
  {
    id: 'op-2',
    fullName: 'Diana Despacho',
    email: 'dianad@wonderchicken.com',
    ci: '3333333',
    role: 'DISPATCHER',
    shift: 'Mañana',
    shiftHours: '08:30 - 16:00',
    active: true,
    lastAccess: 'Hoy 08:31 (KDS-EXP)',
    branch: 'Sucursal Central',
  },
  {
    id: 'op-3',
    fullName: 'Eva Empleada',
    email: 'evae@wonderchicken.com',
    ci: '7777777',
    role: 'CASHIER',
    shift: 'Noche',
    shiftHours: '16:00 - 23:30',
    active: true,
    lastAccess: 'Ayer 23:28 (POS-02)',
    branch: 'Sucursal Central',
  },
  {
    id: 'op-4',
    fullName: 'Marcos Cocina',
    email: 'marcosc@wonderchicken.com',
    ci: '5554321',
    role: 'COOK',
    shift: 'Noche',
    shiftHours: '16:00 - 23:30',
    active: true,
    lastAccess: 'Ayer 23:35 (KDS-LINE)',
    branch: 'Sucursal Central',
  },
];

export const PersonnelScreen: React.FC<PersonnelScreenProps> = ({ onBackToPOS }) => {
  const [operators, setOperators] = useState<Operator[]>(INITIAL_OPERATORS);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CASHIER' | 'DISPATCHER' | 'COOK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [ci, setCi] = useState('');
  const [phone, setPhone] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [role, setRole] = useState<'CASHIER' | 'DISPATCHER' | 'COOK'>('CASHIER');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleStatus = (id: string) => {
    setOperators((prev) =>
      prev.map((op) => (op.id === id ? { ...op, active: !op.active } : op))
    );
    showToast('Estado del operador actualizado');
  };

  const handleCreateOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !ci) {
      alert('Complete los campos obligatorios.');
      return;
    }

    const newOp: Operator = {
      id: `op-${Date.now()}`,
      fullName: `${firstName} ${lastName}`.trim(),
      email: `${emailUser || firstName.toLowerCase()}@wonderchicken.com`,
      ci: ci.trim(),
      role,
      shift: 'Mañana',
      shiftHours: '08:30 - 16:00',
      active: true,
      lastAccess: 'Pendiente de primer login',
      branch: 'Sucursal Central',
    };

    setOperators((prev) => [...prev, newOp]);
    showToast(`Operador ${newOp.fullName} registrado en el clúster.`);
    setShowModal(false);

    // Reset
    setFirstName('');
    setLastName('');
    setCi('');
    setPhone('');
    setEmailUser('');
  };

  const filteredOperators = operators.filter((op) => {
    const matchesRole = roleFilter === 'ALL' || op.role === roleFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      op.fullName.toLowerCase().includes(q) ||
      op.ci.includes(q) ||
      op.email.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (opRole: string) => {
    switch (opRole) {
      case 'CASHIER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffdad6] text-[#af101a] font-mono text-[10px] font-bold uppercase">
            <span className="material-symbols-outlined text-[12px]">point_of_sale</span>
            Cajera
          </span>
        );
      case 'DISPATCHER':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fec330]/30 text-[#795900] font-mono text-[10px] font-bold uppercase">
            <span className="material-symbols-outlined text-[12px]">soup_kitchen</span>
            Despachadora
          </span>
        );
      case 'COOK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f1f3ff] text-[#141b2b] font-mono text-[10px] font-bold uppercase">
            <span className="material-symbols-outlined text-[12px]">outdoor_grill</span>
            Cocinero
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#ffdad6] text-[#af101a] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#141b2b] tracking-tight">
              Gestión de Personal y Roles de Sucursal
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#ffdfa0] text-[#795900] font-mono text-[10px] font-bold uppercase">
              PDR §2.7
            </span>
          </div>
          <p className="text-xs text-[#5b403d] mt-1">
            Administración de operadores, asignación de turnos y control de accesos JWT para Sucursal Central.
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
            className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            + Nuevo Operador
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#e1e8fd] shadow-xs overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-4 bg-[#f9f9ff] border-b border-[#e1e8fd] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-sm text-[#141b2b]">Plantilla Activa de Operadores</span>
            <span className="bg-[#e1e8fd] text-[#5b403d] font-mono text-xs px-2 py-0.5 rounded-full">
              {filteredOperators.length} en pantalla
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-white text-xs font-mono font-bold text-[#141b2b] px-3 py-1.5 rounded-lg border border-[#e1e8fd] outline-none cursor-pointer"
              >
                <option value="ALL">Todos los Roles ({operators.length})</option>
                <option value="CASHIER">Cajera ({operators.filter((o) => o.role === 'CASHIER').length})</option>
                <option value="DISPATCHER">Despachadora ({operators.filter((o) => o.role === 'DISPATCHER').length})</option>
                <option value="COOK">Cocinero ({operators.filter((o) => o.role === 'COOK').length})</option>
              </select>
            </div>

            <div className="relative w-48 sm:w-60">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por CI o nombre..."
                className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-[#141b2b]">
            <thead className="bg-[#f1f3ff] text-[#5b403d] font-mono uppercase tracking-wider border-b border-[#e1e8fd]">
              <tr>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3 px-4">CI</th>
                <th className="py-3 px-4">Rol Operativo</th>
                <th className="py-3 px-4">Turno Asignado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Último Acceso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3ff]">
              {filteredOperators.map((op) => (
                <tr key={op.id} className="hover:bg-[#f9f9ff] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#af101a] font-bold font-mono text-xs flex items-center justify-center shrink-0">
                        {op.fullName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#141b2b]">{op.fullName}</span>
                        <span className="font-mono text-[11px] text-[#5b403d]">{op.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">{op.ci}</td>
                  <td className="py-3 px-4">{getRoleBadge(op.role)}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-xs text-[#141b2b]">{op.shift}</span>
                      <span className="font-mono text-[10px] text-[#5b403d]">{op.shiftHours}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(op.id)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                        op.active ? 'bg-[#15803d]' : 'bg-[#e1e8fd]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          op.active ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="ml-2 font-mono text-[11px] text-[#5b403d]">
                      {op.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#5b403d]">
                    {op.lastAccess}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => showToast(`Editando datos de ${op.fullName}`)}
                        className="p-1 rounded text-[#5b403d] hover:text-[#af101a] hover:bg-[#f1f3ff] cursor-pointer"
                        title="Editar operador"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`PIN de ${op.fullName} restablecido a su CI`)}
                        className="p-1 rounded text-[#5b403d] hover:text-[#795900] hover:bg-[#f1f3ff] cursor-pointer"
                        title="Restablecer PIN/Clave"
                      >
                        <span className="material-symbols-outlined text-[16px]">key</span>
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
          <span>Mostrando {filteredOperators.length} de {operators.length} operadores registrados</span>
          <span>Sucursal Central • Cajas 01 a 04</span>
        </div>
      </div>

      {/* Modal: Registrar Nuevo Operador (FR-018) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#293040]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-[#e1e8fd]">
            <div className="px-6 py-4 bg-[#f1f3ff] flex items-center justify-between border-b border-[#e1e8fd]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#d32f2f] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#141b2b] leading-tight">
                    Registrar Nuevo Operador
                  </h2>
                  <span className="font-mono text-[11px] text-[#af101a] font-bold">
                    FR-018 / Phase 3 • Credenciales POS
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white text-[#5b403d] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateOperator} className="p-6 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#141b2b]">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Roberto"
                    className="px-3 py-2 bg-[#f1f3ff] focus:bg-white rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#141b2b]">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Gómez"
                    className="px-3 py-2 bg-[#f1f3ff] focus:bg-white rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#141b2b]">Cédula Identidad (CI) *</label>
                    <span className="text-[#795900] font-mono text-[10px] font-bold">Clave inicial</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={ci}
                    onChange={(e) => setCi(e.target.value)}
                    placeholder="Ej. 8492011"
                    className="px-3 py-2 bg-[#f1f3ff] focus:bg-white rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#141b2b]">Celular (+591) *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="71234567"
                    className="px-3 py-2 bg-[#f1f3ff] focus:bg-white rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a] font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#141b2b]">
                  Correo Corporativo (@wonderchicken.com) *
                </label>
                <div className="flex rounded-lg bg-[#f1f3ff] border border-[#e1e8fd] overflow-hidden">
                  <input
                    type="text"
                    value={emailUser}
                    onChange={(e) => setEmailUser(e.target.value)}
                    placeholder="robertog"
                    className="flex-1 px-3 py-2 bg-transparent outline-none font-medium"
                  />
                  <span className="px-3 py-2 bg-[#e1e8fd] text-[#5b403d] font-mono text-[11px] select-none">
                    @wonderchicken.com
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#141b2b]">Rol Funcional *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] outline-none font-medium"
                  >
                    <option value="CASHIER">Cajera / Punto de Venta</option>
                    <option value="DISPATCHER">Despachadora / KDS Expeditor</option>
                    <option value="COOK">Cocinero / KDS Línea</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#141b2b]">Sucursal Asignada</label>
                  <div className="bg-[#f1f3ff] px-3 py-2 rounded-lg border border-[#e1e8fd] flex items-center gap-1.5 text-[#141b2b] font-medium">
                    <span className="material-symbols-outlined text-[16px] text-[#af101a]">storefront</span>
                    <span>Sucursal Central (Fija)</span>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="p-3 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] flex items-start gap-2 text-[11px] text-[#5b403d]">
                <span className="material-symbols-outlined text-[#af101a] text-[18px] shrink-0 mt-0.5">
                  lock_reset
                </span>
                <p>
                  El operador iniciará sesión con su correo corporativo y su CI como clave inicial hasheada con <strong>bcryptjs</strong> (PDR §2.7). Se le solicitará cambio en su primer inicio de sesión.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e1e8fd]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Guardar Operador (POST /users)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
