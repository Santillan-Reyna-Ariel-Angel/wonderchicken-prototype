import React, { useState } from 'react';
import { Customer } from '../types';

interface ClientsScreenProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onSelectCustomerForPOS: (customer: Customer) => void;
  onBackToPOS: () => void;
}

export const ClientsScreen: React.FC<ClientsScreenProps> = ({
  customers,
  onAddCustomer,
  onSelectCustomerForPOS,
  onBackToPOS,
}) => {
  // Form fields
  const [ci, setCi] = useState('');
  const [ciExt, setCiExt] = useState('LP');
  const [isCorporate, setIsCorporate] = useState(false);
  const [nit, setNit] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Hombre' | 'Mujer'>('Hombre');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleClear = () => {
    setCi('');
    setCiExt('LP');
    setIsCorporate(false);
    setNit('');
    setBusinessName('');
    setFirstName('');
    setLastName('');
    setGender('Hombre');
    setPhone('');
    setEmail('');
    setBirthdate('');
  };

  const createCustomerObj = (): Customer => {
    const full = isCorporate && businessName
      ? businessName
      : `${firstName} ${lastName}`.trim() || 'Cliente Registrado';

    return {
      id: 'cust-' + Date.now(),
      ci: ci.trim(),
      ciExt,
      nit: isCorporate ? nit.trim() : undefined,
      fullName: full,
      firstName,
      lastName,
      businessName: isCorporate ? businessName : undefined,
      gender,
      phone: phone || '+591 70000000',
      email: email || undefined,
      birthdate: birthdate || undefined,
      isCorporate,
      lastOrderTime: 'Reciente',
      lastOrderAmount: 0,
    };
  };

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ci && !nit) {
      alert('Debe ingresar un número de CI o NIT.');
      return;
    }
    const newCust = createCustomerObj();
    onAddCustomer(newCust);
    showToast(`Cliente "${newCust.fullName}" guardado exitosamente en SIN Bolivia.`);
    handleClear();
  };

  const handleSaveAndAssociate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ci && !nit) {
      alert('Debe ingresar un número de CI o NIT.');
      return;
    }
    const newCust = createCustomerObj();
    onAddCustomer(newCust);
    onSelectCustomerForPOS(newCust);
    onBackToPOS();
  };

  const handleExpressSN = () => {
    const snCustomer: Customer = {
      id: 'c-sn',
      ci: '0',
      fullName: 'Cliente S/N (Sin Nombre)',
      phone: '-',
    };
    onSelectCustomerForPOS(snCustomer);
    onBackToPOS();
  };

  const filteredList = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ci.includes(searchQuery) ||
      (c.nit && c.nit.includes(searchQuery)) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {feedback && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Header bar matching Image 27 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[24px]">group</span>
            <h1 className="text-lg sm:text-xl font-bold text-[#141b2b]">
              Directorio y Registro de Clientes
            </h1>
          </div>
          <p className="text-xs text-[#5b403d] mt-1">
            Módulo FR-019 • Gestión de Clientes y Cumplimiento Normativo de Facturación (SIN BOLIVIA)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBackToPOS}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Volver a Ventas POS (F1)
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-3.5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            + Nuevo Cliente (Alt+N)
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Summary & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Client Registration Form (7 columns) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#e1e8fd] shadow-xs p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#e1e8fd] pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#af101a]">person_add</span>
              <h2 className="font-bold text-sm sm:text-base text-[#141b2b]">
                Formulario de Nuevo Cliente
              </h2>
            </div>
            <span className="font-mono text-[11px] text-[#5b403d] bg-[#f1f3ff] px-2 py-0.5 rounded">
              Datos para Factura Electrónica
            </span>
          </div>

          <form className="flex flex-col gap-4">
            {/* Row 1: CI + Extension */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-bold text-[#141b2b]">
                  CI * <span className="text-[#ba1a1a] font-normal">(Obligatorio)</span>
                </label>
                <div className="flex rounded-lg border border-[#e1e8fd] bg-[#f1f3ff] focus-within:bg-white focus-within:border-[#af101a] overflow-hidden">
                  <input
                    type="text"
                    required
                    value={ci}
                    onChange={(e) => setCi(e.target.value)}
                    placeholder="Ej. 8493021"
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-[#141b2b] outline-none"
                  />
                  <select
                    value={ciExt}
                    onChange={(e) => setCiExt(e.target.value)}
                    className="bg-white px-2 py-2 text-xs font-mono font-bold border-l border-[#e1e8fd] text-[#5b403d] outline-none"
                  >
                    <option value="LP">LP (La Paz)</option>
                    <option value="SC">SC (Santa Cruz)</option>
                    <option value="CB">CB (Cochabamba)</option>
                    <option value="OR">OR (Oruro)</option>
                    <option value="PT">PT (Potosí)</option>
                    <option value="TJ">TJ (Tarija)</option>
                    <option value="CH">CH (Chuquisaca)</option>
                    <option value="BE">BE (Beni)</option>
                    <option value="PA">PA (Pando)</option>
                  </select>
                </div>
              </div>

              {/* Toggle Razón Social */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] cursor-pointer text-xs font-bold text-[#141b2b]">
                  <input
                    type="checkbox"
                    checked={isCorporate}
                    onChange={(e) => setIsCorporate(e.target.checked)}
                    className="accent-[#af101a] rounded w-4 h-4"
                  />
                  <span>¿Factura Razón Social?</span>
                </label>
              </div>
            </div>

            {/* If Corporate: NIT and Business Name */}
            {isCorporate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#fff8f7] rounded-lg border border-[#ffdad6] animate-fade-in">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#ba1a1a]">NIT Fiscal:</label>
                  <input
                    type="text"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    placeholder="Ej. 1029384019"
                    className="w-full px-3 py-2 bg-white text-xs font-mono font-bold text-[#141b2b] rounded border border-[#e1e8fd] outline-none focus:border-[#af101a]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-[#ba1a1a]">Razón Social:</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. Quiroga Catering SRL"
                    className="w-full px-3 py-2 bg-white text-xs font-semibold text-[#141b2b] rounded border border-[#e1e8fd] outline-none focus:border-[#af101a]"
                  />
                </div>
              </div>
            )}

            {/* Names & Last Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#141b2b]">Nombres del Cliente *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ej. Mauricio Esteban"
                  className="w-full px-3 py-2 bg-[#f1f3ff] focus:bg-white text-xs font-medium text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#141b2b]">Apellidos *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ej. Villarroel Ramos"
                  className="w-full px-3 py-2 bg-[#f1f3ff] focus:bg-white text-xs font-medium text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
                />
              </div>
            </div>

            {/* Gender / Sex */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#5b403d]">Sexo / Género:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Hombre')}
                  className={`py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    gender === 'Hombre'
                      ? 'bg-[#af101a] text-white shadow-xs'
                      : 'bg-[#f1f3ff] text-[#5b403d] hover:bg-[#e9edff]'
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
                      ? 'bg-[#af101a] text-white shadow-xs'
                      : 'bg-[#f1f3ff] text-[#5b403d] hover:bg-[#e9edff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">female</span>
                  Mujer
                </button>
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#5b403d]">
                  Celular de Contacto / WhatsApp:
                </label>
                <div className="flex items-center bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] px-2.5 py-1.5 focus-within:bg-white focus-within:border-[#af101a]">
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
                <label className="text-xs font-mono text-[#5b403d]">Correo Electrónico:</label>
                <div className="flex items-center bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] px-2.5 py-1.5 focus-within:bg-white focus-within:border-[#af101a]">
                  <span className="material-symbols-outlined text-[#5b403d] text-[18px] mr-1">
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
              <label className="text-xs font-mono text-[#5b403d]">
                Fecha de Nacimiento (Opcional - Campañas 20% Cumpleaños):
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full sm:w-60 px-3 py-2 bg-[#f1f3ff] text-xs font-mono text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
              />
            </div>

            {/* Legal Notice SIN Bolivia */}
            <div className="p-3 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] flex items-start gap-2">
              <span className="material-symbols-outlined text-[#af101a] text-[18px] shrink-0 mt-0.5">
                verified
              </span>
              <p className="text-[11px] text-[#5b403d] leading-relaxed">
                <strong>Nota Legal RND 102100000011 (Servicio de Impuestos Nacionales):</strong>{' '}
                Facturación nominada obligatoria para consumos superiores a Bs. 1.000,00. Asegúrese de registrar el número de carnet o NIT correctamente antes de emitir la comanda fiscal.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-[#e1e8fd]">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors cursor-pointer"
              >
                Limpiar Campos (Esc)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveOnly}
                  className="px-4 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#af101a] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors cursor-pointer"
                >
                  Guardar Cliente (F10)
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndAssociate}
                  className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_turned_in</span>
                  Guardar y Asociar a Orden (F9)
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Resumen Operativo & Recientes (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col">
              <span className="font-mono text-[11px] text-[#5b403d] uppercase font-bold">
                Clientes Hoy
              </span>
              <span className="font-mono text-2xl font-bold text-[#141b2b] mt-1">
                42 Registros
              </span>
              <span className="text-[11px] text-[#15803d] font-semibold mt-0.5">
                +14% vs ayer
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col">
              <span className="font-mono text-[11px] text-[#5b403d] uppercase font-bold">
                Facturación SIN
              </span>
              <span className="font-mono text-2xl font-bold text-[#15803d] mt-1">
                98.2%
              </span>
              <span className="text-[11px] text-[#5b403d] mt-0.5">
                Sincronizado
              </span>
            </div>
          </div>

          {/* Express Consumer Final button */}
          <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-xs text-[#141b2b]">Cliente Express Rápido</span>
              <span className="text-[11px] text-[#5b403d]">Consumidor final sin NIT</span>
            </div>
            <button
              type="button"
              onClick={handleExpressSN}
              className="px-3 py-1.5 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#af101a] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors cursor-pointer"
            >
              Cargar S/N
            </button>
          </div>

          {/* Recent Clients List */}
          <div className="bg-white rounded-xl border border-[#e1e8fd] shadow-xs p-4 flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-[#141b2b]">
                Registrados Recientemente
              </h3>
              <span className="font-mono text-[11px] text-[#5b403d]">
                {filteredList.length} clientes
              </span>
            </div>

            {/* Search filter */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#f1f3ff] rounded-lg text-xs border border-[#e1e8fd] outline-none"
              />
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px] pr-1">
              {filteredList.map((cust) => (
                <div
                  key={cust.id}
                  className="p-3 bg-[#f9f9ff] hover:bg-[#f1f3ff] rounded-xl border border-[#e1e8fd] transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#141b2b] truncate">
                          {cust.fullName}
                        </span>
                        {cust.isCorporate && (
                          <span className="bg-[#fec330] text-[#6f5100] font-mono text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                            Corp
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-[#5b403d]">
                        CI/NIT: {cust.ci || cust.nit} {cust.ciExt ? `(${cust.ciExt})` : ''}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectCustomerForPOS(cust);
                        onBackToPOS();
                      }}
                      className="px-2.5 py-1 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-[10px] font-bold rounded shadow-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>Enviar a POS</span>
                      <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#5b403d] pt-1 border-t border-[#e1e8fd]">
                    <span>{cust.phone}</span>
                    {cust.lastOrderAmount ? (
                      <span className="font-mono text-[#af101a] font-semibold">
                        Último: Bs. {cust.lastOrderAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span>Sin compras hoy</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
