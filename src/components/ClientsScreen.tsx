import React, { useState, useMemo } from 'react';
import { Customer, UserRole } from '../types';
import { AppModal } from '../commonComponents/AppModal';

interface ClientsScreenProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer?: (customer: Customer) => void;
  onSelectCustomerForPOS: (customer: Customer) => void;
  onBackToPOS: () => void;
  userRole?: UserRole;
}

export const ClientsScreen: React.FC<ClientsScreenProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onBackToPOS,
}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states (independent of any branch)
  const [ci, setCi] = useState('');
  const [isCorporate, setIsCorporate] = useState(false);
  const [nit, setNit] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Hombre' | 'Mujer'>('Hombre');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');

  // Table filtering & pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(0);

  // Toast notification
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const resetForm = () => {
    setCi('');
    setIsCorporate(false);
    setNit('');
    setBusinessName('');
    setFirstName('');
    setLastName('');
    setGender('Hombre');
    setPhone('');
    setEmail('');
    setBirthdate('');
    setEditingCustomer(null);
  };

  const handleOpenNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setCi(cust.ci || '');
    setIsCorporate(Boolean(cust.isCorporate));
    setNit(cust.nit || '');
    setBusinessName(cust.businessName || '');
    setFirstName(cust.firstName || '');
    setLastName(cust.lastName || '');
    setGender(cust.gender || 'Hombre');
    setPhone(cust.phone === '-' ? '' : cust.phone);
    setEmail(cust.email || '');
    setBirthdate(cust.birthdate || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSaveCustomer = () => {
    if (!ci && !nit) {
      alert('Debe ingresar un número de CI o NIT.');
      return;
    }

    const calculatedFullName = isCorporate && businessName
      ? businessName
      : `${firstName} ${lastName}`.trim() || ci || 'Cliente Registrado';

    if (editingCustomer) {
      // Editing existing customer
      const updated: Customer = {
        ...editingCustomer,
        ci: ci.trim(),
        ciExt: undefined,
        nit: isCorporate ? nit.trim() : undefined,
        fullName: calculatedFullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: isCorporate ? businessName.trim() : undefined,
        gender,
        phone: phone.trim() || '+591 70000000',
        email: email.trim() || undefined,
        birthdate: birthdate || undefined,
        isCorporate,
      };

      if (onUpdateCustomer) {
        onUpdateCustomer(updated);
      } else {
        onAddCustomer(updated);
      }
      showToast(`Datos del cliente "${updated.fullName}" actualizados exitosamente.`);
    } else {
      // Creating new customer (global, available across any branch)
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        ci: ci.trim(),
        ciExt: undefined,
        nit: isCorporate ? nit.trim() : undefined,
        fullName: calculatedFullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: isCorporate ? businessName.trim() : undefined,
        gender,
        phone: phone.trim() || '+591 70000000',
        email: email.trim() || undefined,
        birthdate: birthdate || undefined,
        isCorporate,
        lastOrderTime: 'Reciente',
        lastOrderAmount: 0,
      };

      onAddCustomer(newCust);
      showToast(`Cliente "${newCust.fullName}" registrado exitosamente.`);
    }

    handleCloseModal();
  };

  // Filtered customers across the entire brand
  const filteredList = useMemo(() => {
    return customers.filter((cust) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = cust.fullName.toLowerCase().includes(q);
      const matchCi = cust.ci?.toLowerCase().includes(q);
      const matchNit = cust.nit?.toLowerCase().includes(q);
      const matchPhone = cust.phone?.toLowerCase().includes(q);
      const matchEmail = cust.email?.toLowerCase().includes(q);

      return matchName || matchCi || matchNit || matchPhone || matchEmail;
    });
  }, [customers, searchQuery]);

  // Pagination calculation
  const totalRows = filteredList.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {feedback && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#fff1f2] border border-[#fecdd3] flex items-center justify-center text-[#d32f2f]">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#1e293b]">
                Directorio Global de Clientes
              </h1>
              <p className="text-xs text-[#64748b]">
                Base de datos centralizada e independiente de sucursal • Accesible desde cualquier terminal POS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onBackToPOS}
            className="px-3.5 py-2 bg-white hover:bg-[#f1f5f9] text-[#334155] font-mono text-xs font-semibold rounded-lg border border-[#cbd5e1] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Volver a Ventas POS (F1)
          </button>

          <button
            type="button"
            onClick={handleOpenNewModal}
            className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* MUI-Style Data Table Container */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col w-full">
        {/* MUI Table Toolbar: Search */}
        <div className="p-3.5 sm:p-4 bg-[#f8f9fc] border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#334155]">
              Clientes Registrados (Red Central)
            </span>
            <span className="bg-[#e2e8f0] text-[#334155] font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {filteredList.length} registrados
            </span>
          </div>

          {/* Global Search Input */}
          <div className="relative min-w-[260px] sm:w-80">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#64748b] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar por nombre, CI, NIT, teléfono..."
              className="w-full pl-8 pr-7 py-1.5 bg-white text-xs text-[#1e293b] rounded-lg border border-[#cbd5e1] outline-none focus:border-[#d32f2f] transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-[#94a3b8] hover:text-[#334155] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* MUI Table View */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Head - Removed 'Sucursal de Origen' */}
            <thead className="bg-[#f1f3f9] text-[#475569] font-mono text-[11px] uppercase tracking-wider border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3 px-4 font-bold">Cliente / Razón Social</th>
                <th className="py-3 px-4 font-bold">Documento (CI / NIT)</th>
                <th className="py-3 px-4 font-bold">Contacto</th>
                <th className="py-3 px-4 font-bold">Datos Demográficos</th>
                <th className="py-3 px-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#f1f5f9]">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8]">
                        <span className="material-symbols-outlined text-[28px]">search_off</span>
                      </div>
                      <span className="font-bold text-sm text-[#334155]">
                        No se encontraron clientes
                      </span>
                      <span className="text-xs text-[#64748b]">
                        Intente ajustar los términos de búsqueda ingresados.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((cust) => {
                  const initials = (cust.firstName?.[0] || cust.fullName[0] || 'C').toUpperCase();

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-[#f8faff] transition-colors group"
                    >
                      {/* Cliente / Razón Social */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f1f3ff] border border-[#cbd5e1] text-[#1e293b] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-[#0f172a] truncate">
                                {cust.fullName}
                              </span>
                              {cust.isCorporate ? (
                                <span className="bg-[#fef3c7] text-[#92400e] border border-[#fde68a] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  CORP
                                </span>
                              ) : (
                                <span className="bg-[#f1f5f9] text-[#475569] font-mono text-[9px] font-medium px-1.5 py-0.5 rounded">
                                  NATURAL
                                </span>
                              )}
                            </div>
                            {cust.email && (
                              <span className="text-[11px] text-[#64748b] truncate">
                                {cust.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Documento (CI / NIT) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 font-mono text-xs text-[#0f172a]">
                          {cust.nit ? (
                            <span className="font-bold text-[#b91c1c]">NIT: {cust.nit}</span>
                          ) : (
                            <span className="font-semibold">{cust.ci}</span>
                          )}
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#334155] font-mono">
                          <span className="material-symbols-outlined text-[#15803d] text-[15px]">
                            call
                          </span>
                          <span>{cust.phone || '-'}</span>
                        </div>
                      </td>

                      {/* Datos Demográficos */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col text-[11px] text-[#64748b]">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-[#64748b]">
                              {cust.gender === 'Mujer' ? 'female' : 'male'}
                            </span>
                            <span>{cust.gender || 'Hombre'}</span>
                          </div>
                          {cust.birthdate && (
                            <span className="font-mono text-[10px] text-[#475569]">
                              Nac: {cust.birthdate}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones: Exclusivamente editar sus datos */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(cust)}
                          className="px-2.5 py-1.5 rounded-lg border border-[#cbd5e1] hover:border-[#d32f2f] text-[#334155] hover:text-[#d32f2f] hover:bg-[#fff5f5] font-mono text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Editar datos del cliente"
                        >
                          <span className="material-symbols-outlined text-[15px]">edit</span>
                          <span>Editar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* MUI Table Pagination Footer */}
        <div className="p-3 bg-[#f8f9fc] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569] font-mono">
          <div className="flex items-center gap-2">
            <span>Filas por página:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              className="bg-white border border-[#cbd5e1] rounded px-2 py-0.5 outline-none text-xs text-[#1e293b] cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span>
              {totalRows === 0
                ? '0 de 0'
                : `${page * rowsPerPage + 1}–${Math.min((page + 1) * rowsPerPage, totalRows)} de ${totalRows}`}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="w-7 h-7 rounded border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[#334155]"
                title="Página anterior"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              <span className="text-[11px] font-bold px-1">
                {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="w-7 h-7 rounded border border-[#cbd5e1] bg-white hover:bg-[#f1f5f9] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[#334155]"
                title="Página siguiente"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Nuevo Cliente / Editar Datos de Cliente */}
      <AppModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        icon={editingCustomer ? 'edit' : 'person_add'}
        title={editingCustomer ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente'}
        description={
          editingCustomer
            ? `Actualización de ficha tributaria y contacto para ${editingCustomer.fullName}`
            : 'Ficha de datos para facturación electrónica y directorio central'
        }
        maxWidth="md"
        onConfirm={handleSaveCustomer}
        confirmLabel={editingCustomer ? 'Guardar Cambios' : 'Guardar Cliente'}
        confirmIcon={editingCustomer ? 'save' : 'person_add'}
        showCancel={true}
        cancelLabel="Cancelar"
      >
        <div className="flex flex-col gap-4">
          {/* Row 1: CI + Toggle Razón Social */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1e293b]">
                Cédula de Identidad (CI) * <span className="text-[#ba1a1a] font-normal">(Obligatorio)</span>
              </label>
              <input
                type="text"
                required
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                placeholder="Ej. 8493021"
                className="w-full px-3 py-2 rounded-lg border border-[#cbd5e1] bg-white text-xs font-mono font-bold text-[#1e293b] outline-none focus:border-[#d32f2f]"
              />
            </div>

            {/* Toggle Razón Social */}
            <div className="shrink-0 flex items-end">
              <label className="flex items-center gap-2 px-2.5 py-2 bg-[#f8f9fc] rounded-lg border border-[#cbd5e1] cursor-pointer text-xs font-bold text-[#1e293b] hover:bg-[#f1f5f9] transition-colors whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={isCorporate}
                  onChange={(e) => setIsCorporate(e.target.checked)}
                  className="accent-[#d32f2f] rounded w-4 h-4 cursor-pointer"
                />
                <span>¿Razón Social?</span>
              </label>
            </div>
          </div>

          {/* If Corporate: NIT and Business Name */}
          {isCorporate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#fff8f7] rounded-lg border border-[#fecdd3] animate-fade-in">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#ba1a1a]">NIT Fiscal:</label>
                <input
                  type="text"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  placeholder="Ej. 1029384019"
                  className="w-full px-3 py-2 bg-white text-xs font-mono font-bold text-[#1e293b] rounded border border-[#cbd5e1] outline-none focus:border-[#d32f2f]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#ba1a1a]">Razón Social:</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej. Quiroga Catering SRL"
                  className="w-full px-3 py-2 bg-white text-xs font-semibold text-[#1e293b] rounded border border-[#cbd5e1] outline-none focus:border-[#d32f2f]"
                />
              </div>
            </div>
          )}

          {/* Nombres & Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1e293b]">Nombres *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Mauricio Esteban"
                className="w-full px-3 py-2 bg-white text-xs font-medium text-[#1e293b] rounded-lg border border-[#cbd5e1] outline-none focus:border-[#d32f2f]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1e293b]">Apellidos *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Villarroel Ramos"
                className="w-full px-3 py-2 bg-white text-xs font-medium text-[#1e293b] rounded-lg border border-[#cbd5e1] outline-none focus:border-[#d32f2f]"
              />
            </div>
          </div>

          {/* Género */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-[#475569]">Sexo / Género:</label>
            <div className="grid grid-cols-2 gap-2 sm:w-72">
              <button
                type="button"
                onClick={() => setGender('Hombre')}
                className={`py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  gender === 'Hombre'
                    ? 'bg-[#d32f2f] text-white shadow-2xs'
                    : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">male</span>
                Hombre
              </button>
              <button
                type="button"
                onClick={() => setGender('Mujer')}
                className={`py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  gender === 'Mujer'
                    ? 'bg-[#d32f2f] text-white shadow-2xs'
                    : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">female</span>
                Mujer
              </button>
            </div>
          </div>

          {/* Celular & Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#475569]">
                Celular de Contacto / WhatsApp:
              </label>
              <div className="flex items-center bg-white rounded-lg border border-[#cbd5e1] px-2.5 py-1.5 focus-within:border-[#d32f2f]">
                <span className="material-symbols-outlined text-[#15803d] text-[18px] mr-1">
                  call
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+591 71234567"
                  className="w-full text-xs font-mono font-medium outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#475569]">Correo Electrónico:</label>
              <div className="flex items-center bg-white rounded-lg border border-[#cbd5e1] px-2.5 py-1.5 focus-within:border-[#d32f2f]">
                <span className="material-symbols-outlined text-[#64748b] text-[18px] mr-1">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full text-xs font-medium outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Birthdate */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-[#475569]">
              Fecha de Nacimiento (Opcional - Campañas de Fidelización):
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="w-full sm:w-60 px-3 py-2 bg-white text-xs font-mono text-[#1e293b] rounded-lg border border-[#cbd5e1] outline-none focus:border-[#d32f2f]"
            />
          </div>

          {/* Legal Notice SIN Bolivia */}
          <div className="p-3 bg-[#f8f9fc] rounded-lg border border-[#e2e8f0] flex items-start gap-2">
            <span className="material-symbols-outlined text-[#d32f2f] text-[18px] shrink-0 mt-0.5">
              verified
            </span>
            <p className="text-[11px] text-[#475569] leading-relaxed">
              <strong>Nota Legal RND 102100000011 (Servicio de Impuestos Nacionales):</strong>{' '}
              Facturación nominada obligatoria para consumos superiores a Bs. 1.000,00. El NIT o CI queda registrado y sincronizado en la base de datos central accesible desde cualquier sucursal y caja de la red.
            </p>
          </div>
        </div>
      </AppModal>
    </div>
  );
};
