import React, { useState } from 'react';
import { useShiftsStore } from '../features/shifts/stores/shifts.store';
import { useTheme } from '../context/ThemeContext';

interface ShiftScreenProps {
  shiftName: string;
  cashierName: string;
  onUpdateShift: (shiftName: string) => void;
  onBackToPOS: () => void;
  ordersCount: number;
  totalSales: number;
  standalone?: boolean;
}

export const ShiftScreen: React.FC<ShiftScreenProps> = ({
  shiftName,
  cashierName,
  onUpdateShift,
  onBackToPOS,
  ordersCount,
  totalSales,
  standalone = false,
}) => {
  const { shift, openShift } = useShiftsStore();
  const { theme, toggleTheme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'MAÑANA' | 'NOCHE'>((shift.shiftPeriod as 'MAÑANA' | 'NOCHE') || 'MAÑANA');
  const [selectedCaja, setSelectedCaja] = useState<'01' | '02'>((shift.cashRegisterId as '01' | '02') || '01');
  const [initialFund, setInitialFund] = useState(shift.initialAmount || 150.00);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openShift({
      shiftPeriod: selectedPeriod,
      cashRegisterId: selectedCaja,
      initialAmount: initialFund,
      cashierName: cashierName || 'Roxana Rodríguez',
    });
    onUpdateShift(selectedPeriod);
    setShowSuccessModal(true);
  };

  // If shift is already open, show only the official Resumen de Apertura view
  if (shift.isOpen && !standalone) {
    return (
      <div className="flex flex-col gap-5 max-w-4xl mx-auto animate-fade-in">
        {/* Toast */}
        {toast && (
          <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
            <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
            <span>{toast}</span>
          </div>
        )}

        {/* Top Banner Status */}
        <div className="bg-[#141b2b] text-white p-4 sm:p-5 rounded-xl border border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 border border-white/20">
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white">
                  Turno Activo en Operación
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-emerald-500/30">
                  ABIERTO
                </span>
              </div>
              <span className="font-mono text-xs text-[#e1e8fd] opacity-80">
                Operador: {shift.cashierName} • Caja {shift.cashRegisterId} • {shift.openedAt || 'Hoy'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToPOS}
            className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Ir a Terminal POS
          </button>
        </div>

        {/* Resumen de Apertura Card */}
        <div className="bg-white rounded-2xl border border-[#e1e8fd] shadow-sm p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#e1e8fd] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#af101a]/10 flex items-center justify-center text-[#af101a]">
                <span className="material-symbols-outlined text-[22px]">assignment</span>
              </div>
              <div>
                <h3 className="font-bold text-base text-[#141b2b]">Resumen de Apertura de Turno</h3>
                <p className="text-xs text-[#5b403d]">Registro fiscal oficial emitido al inicio de la jornada operativa</p>
              </div>
            </div>
            <span className="font-mono text-xs bg-[#f1f3ff] text-[#141b2b] px-3 py-1 rounded-lg border border-[#e1e8fd]">
              {shift.token || 'SHF-ACTIVO'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e1e8fd] flex flex-col gap-3 text-xs">
              <div className="font-bold text-[#141b2b] flex items-center gap-1.5 text-xs pb-1 border-b border-[#e1e8fd]">
                <span className="material-symbols-outlined text-[16px] text-[#af101a]">person</span>
                Datos del Operador
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                <span className="text-[#5b403d]">Operador Responsable:</span>
                <span className="font-bold text-[#141b2b]">{shift.cashierName || cashierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                <span className="text-[#5b403d]">Cédula Identidad:</span>
                <span className="font-mono font-bold text-[#141b2b]">2222222</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#5b403d]">Rol de Acceso:</span>
                <span className="font-bold text-[#141b2b]">CAJERA</span>
              </div>
            </div>

            <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e1e8fd] flex flex-col gap-3 text-xs">
              <div className="font-bold text-[#141b2b] flex items-center gap-1.5 text-xs pb-1 border-b border-[#e1e8fd]">
                <span className="material-symbols-outlined text-[16px] text-[#af101a]">storefront</span>
                Terminal y Horario
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                <span className="text-[#5b403d]">Sucursal:</span>
                <span className="font-bold text-[#141b2b]">Sucursal Central (SCZ-001)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                <span className="text-[#5b403d]">Turno Asignado:</span>
                <span className="font-mono font-bold text-[#af101a]">{shift.shiftPeriod}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#5b403d]">Caja Asignada:</span>
                <span className="font-mono font-bold text-[#141b2b]">Caja {shift.cashRegisterId}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#fff8f7] p-4 rounded-xl border border-[#af101a]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[#5b403d]">Fondo Inicial Declarado en Gaveta</span>
              <div className="text-2xl font-mono font-bold text-[#15803d]">
                Bs. {Number(shift.initialAmount || 0).toFixed(2)}
              </div>
            </div>
            <div className="text-right sm:text-right text-xs text-[#5b403d]">
              <div>Apertura registrada:</div>
              <div className="font-mono font-bold text-[#141b2b]">{shift.openedAt || 'Hoy'}</div>
            </div>
          </div>

          <div className="p-3.5 bg-[#f1f3ff] rounded-xl border border-[#e1e8fd] flex items-start gap-2.5 text-xs text-[#5b403d]">
            <span className="material-symbols-outlined text-[#15803d] text-[20px] shrink-0 mt-0.5">
              verified
            </span>
            <p>
              El turno se encuentra actualmente activo. Para realizar el arqueo final, arqueo ciego o cierre fiscal Z al terminar su jornada, diríjase al módulo de <strong>Control Turnos y Cajas</strong>.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[#e1e8fd]">
            <button
              type="button"
              onClick={() => showToast('Copia de acta de apertura enviada a la impresora térmica.')}
              className="px-4 py-2.5 bg-white border border-[#e1e8fd] hover:bg-[#f1f3ff] text-[#141b2b] font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Reimprimir Comprobante
            </button>
            <button
              type="button"
              onClick={onBackToPOS}
              className="px-5 py-2.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
              Ir a Terminal POS
            </button>
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Top Banner Operador */}
      <div className="bg-[#141b2b] text-white p-4 sm:p-5 rounded-xl border border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#af101a] text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 border border-white/20">
            CC
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">
                Bienvenida, {cashierName || 'Roxana Rodríguez'}
              </span>
              <span className="bg-[#ffdad6] text-[#af101a] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Rol: CAJERA
              </span>
            </div>
            <span className="font-mono text-xs text-[#e1e8fd] opacity-80">
              CI: 8492019 • Sucursal Central (Caja 01)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10">
            FR-004 / PDR §2.6
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 cols: The 3 Steps */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Paso 1: Declaración de Período de Turno */}
          <div className="bg-white p-5 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#af101a]">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              <h2 className="font-bold text-sm sm:text-base text-[#141b2b]">
                Paso 1: Declaración de Período de Turno
              </h2>
            </div>
            <p className="text-xs text-[#5b403d]">
              Seleccione el bloque de horario operativo que comenzará a facturar y custodiar la gaveta física.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setSelectedPeriod('MAÑANA')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedPeriod === 'MAÑANA'
                    ? 'border-[#af101a] bg-[#fff8f7]'
                    : 'border-[#e1e8fd] hover:border-[#af101a]/40 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#fec330] text-[22px]">wb_sunny</span>
                    <span className="font-bold text-sm text-[#141b2b]">Turno Mañana</span>
                  </div>
                  <input
                    type="radio"
                    checked={selectedPeriod === 'MAÑANA'}
                    onChange={() => setSelectedPeriod('MAÑANA')}
                    className="accent-[#af101a] w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="font-mono text-xs font-semibold text-[#af101a]">
                  08:30 — 16:00
                </div>
                <span className="text-[11px] text-[#5b403d]">
                  Apertura de salón, recepción de fritura fresca y pedidos de almuerzo.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPeriod('NOCHE')}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  selectedPeriod === 'NOCHE'
                    ? 'border-[#af101a] bg-[#fff8f7]'
                    : 'border-[#e1e8fd] hover:border-[#af101a]/40 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#005c8d] text-[22px]">dark_mode</span>
                    <span className="font-bold text-sm text-[#141b2b]">Turno Noche</span>
                  </div>
                  <input
                    type="radio"
                    checked={selectedPeriod === 'NOCHE'}
                    onChange={() => setSelectedPeriod('NOCHE')}
                    className="accent-[#af101a] w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="font-mono text-xs font-semibold text-[#005c8d]">
                  16:00 — 23:30
                </div>
                <span className="text-[11px] text-[#5b403d]">
                  Flujo nocturno, delivery alto, retiro de comensales y arqueo de cierre Z.
                </span>
              </button>
            </div>
          </div>

          {/* Paso 2: Selección de Caja Registradora */}
          <div className="bg-white p-5 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#af101a]">
              <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
              <h2 className="font-bold text-sm sm:text-base text-[#141b2b]">
                Paso 2: Selección de Caja Registradora
              </h2>
            </div>
            <p className="text-xs text-[#5b403d]">
              Indique qué terminal físico operará en Sucursal Central.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setSelectedCaja('01')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  selectedCaja === '01'
                    ? 'border-[#af101a] bg-[#fff8f7]'
                    : 'border-[#e1e8fd] hover:border-[#af101a]/40 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#141b2b]">Caja 01</span>
                  <span className="bg-[#15803d]/15 text-[#15803d] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    LIBRE
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#141b2b]">Mesón Principal</span>
                <span className="text-[11px] text-[#5b403d]">Ventas salón y comensales directos.</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCaja('02')}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  selectedCaja === '02'
                    ? 'border-[#af101a] bg-[#fff8f7]'
                    : 'border-[#e1e8fd] hover:border-[#af101a]/40 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#141b2b]">Caja 02</span>
                  <span className="bg-[#15803d]/15 text-[#15803d] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    LIBRE
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#141b2b]">Despacho / Delivery</span>
                <span className="text-[11px] text-[#5b403d]">Ventanilla rápida y repartidores.</span>
              </button>

              <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 opacity-60 text-left flex flex-col gap-1.5 select-none">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-gray-500">Caja 03</span>
                  <span className="bg-gray-200 text-gray-600 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    EN USO
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-600">Auto-Pollo / Express</span>
                <span className="text-[11px] text-gray-400">Operada por Diana Despacho.</span>
              </div>
            </div>
          </div>

          {/* Paso 3: Monto Inicial en Efectivo */}
          <div className="bg-white p-5 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#af101a]">
              <span className="material-symbols-outlined text-[20px]">attach_money</span>
              <h2 className="font-bold text-sm sm:text-base text-[#141b2b]">
                Paso 3: Monto Inicial en Efectivo (Fondo de Sencillo)
              </h2>
            </div>
            <p className="text-xs text-[#5b403d]">
              Declare con precisión la dotación de cambio recibida para abrir la gaveta física.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
              <div className="relative flex-1 max-w-xs">
                <span className="absolute left-3 top-2.5 font-mono text-sm font-bold text-[#5b403d]">
                  Bs.
                </span>
                <input
                  type="number"
                  step="5"
                  min="0"
                  value={initialFund}
                  onChange={(e) => setInitialFund(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#f1f3ff] text-xl font-mono font-bold text-[#141b2b] rounded-xl border border-[#e1e8fd] outline-none focus:border-[#af101a] focus:bg-white transition-all"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setInitialFund(100)}
                  className="px-3 py-1.5 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] cursor-pointer"
                >
                  Bs. 100
                </button>
                <button
                  type="button"
                  onClick={() => setInitialFund(150)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold rounded-lg border cursor-pointer ${
                    initialFund === 150
                      ? 'bg-[#d32f2f] text-white border-[#d32f2f]'
                      : 'bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] border-[#e1e8fd]'
                  }`}
                >
                  Bs. 150 (Frecuente)
                </button>
                <button
                  type="button"
                  onClick={() => setInitialFund(200)}
                  className="px-3 py-1.5 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] cursor-pointer"
                >
                  Bs. 200
                </button>
                <button
                  type="button"
                  onClick={() => setInitialFund((prev) => prev + 20)}
                  className="px-2.5 py-1.5 bg-[#fec330]/20 hover:bg-[#fec330]/30 text-[#6f5100] font-mono text-xs font-bold rounded-lg border border-[#fec330]/40 cursor-pointer"
                >
                  +Bs. 20
                </button>
                <button
                  type="button"
                  onClick={() => setInitialFund((prev) => prev + 50)}
                  className="px-2.5 py-1.5 bg-[#fec330]/20 hover:bg-[#fec330]/30 text-[#6f5100] font-mono text-xs font-bold rounded-lg border border-[#fec330]/40 cursor-pointer"
                >
                  +Bs. 50
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 cols: Resumen y Confirmación */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-[#e1e8fd] shadow-xs p-5 flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-[#e1e8fd] pb-3">
                <span className="material-symbols-outlined text-[#af101a] text-[20px]">assignment</span>
                <h3 className="font-bold text-sm text-[#141b2b]">Resumen de Apertura</h3>
              </div>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                  <span className="text-[#5b403d]">Operador Responsable:</span>
                  <span className="font-bold text-[#141b2b]">{cashierName || 'Carla Cajera'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                  <span className="text-[#5b403d]">Cédula Identidad:</span>
                  <span className="font-mono font-bold text-[#141b2b]">2222222</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                  <span className="text-[#5b403d]">Sucursal:</span>
                  <span className="font-bold text-[#141b2b]">Sucursal Central (SCZ-001)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                  <span className="text-[#5b403d]">Turno Asignado:</span>
                  <span className="font-mono font-bold text-[#af101a]">{selectedPeriod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                  <span className="text-[#5b403d]">Caja Asignada:</span>
                  <span className="font-mono font-bold text-[#141b2b]">Caja {selectedCaja}</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-bold border-t-2 border-[#141b2b]/20">
                  <span className="text-[#141b2b]">Fondo Inicial Declarado:</span>
                  <span className="font-mono text-base text-[#15803d]">
                    Bs. {initialFund.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#f1f3ff] rounded-xl border border-[#e1e8fd] flex items-start gap-2 text-[11px] text-[#5b403d]">
                <span className="material-symbols-outlined text-[#af101a] text-[18px] shrink-0 mt-0.5">
                  info
                </span>
                <p>
                  Al confirmar la apertura, el sistema registrará el timestamp de inicio fiscal y vinculará cada venta del turno a su usuario.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenShiftSubmit}
              className="w-full mt-5 py-3.5 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              Abrir Turno y Entrar al POS
            </button>
          </div>
        </div>
      </div>

      {/* Modal Confirmación de Apertura */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-[#293040]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center gap-4 border border-[#e1e8fd]">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#15803d] flex items-center justify-center">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-lg text-[#141b2b]">
                ¡Turno Abierto Exitosamente!
              </h3>
              <p className="text-xs text-[#5b403d]">
                La gaveta de <strong>Caja {selectedCaja}</strong> ha sido inicializada con <strong>Bs. {initialFund.toFixed(2)}</strong>.
              </p>
            </div>

            <div className="bg-[#f1f3ff] p-3 rounded-lg w-full text-left font-mono text-xs flex flex-col gap-1 border border-[#e1e8fd]">
              <div className="flex justify-between text-[#5b403d]">
                <span>Token de Turno:</span>
                <span className="font-bold text-[#141b2b]">SHF-2024-1024-M01</span>
              </div>
              <div className="flex justify-between text-[#5b403d]">
                <span>Apertura:</span>
                <span className="text-[#141b2b]">{new Date().toLocaleTimeString('es-BO')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                onBackToPOS();
              }}
              className="w-full py-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              Ir a Terminal de Venta POS
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (standalone) {
    return (
      <div className="bg-[#f9f9ff] text-[#141b2b] min-h-screen flex flex-col justify-between relative overflow-x-hidden app-main-bg">
        {/* Top subtle background gradient */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#af101a]/10 via-[#f1f3ff] to-transparent pointer-events-none -z-10" />

        {/* Top Header Bar for standalone mode */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-4 pb-2 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-36 sm:w-44 h-auto py-1">
              <img
                alt="Wonder Chicken Logo Oficial"
                className="w-full h-auto object-contain drop-shadow-xs"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhh0pXr4EBA8TvPmBg94EssTE6eADYtpDKx9IwH7RFx6_goeQFLJFHEQoSu8u6HBAmjoUwTE2tEfreFWdF6hgtcKFykKjrrK_KAknnqmyJQa3Ky72tyQL7ZKNfBjQZ1aMvw742hiz7FbwlaciN0-4jBh0nGI6Eg-qVqFWWR9nZpZ14vFillF5M0mtTfL6yJ49nqbW4HtB_XVBRtdeOq-kSThf6WUOzwJVmgWT55lBN8HfP-ktQdZJU27tPuuDipBN5TA"
              />
            </div>
            <span className="hidden sm:inline font-mono text-xs text-[#5b403d] border-l border-[#e1e8fd] pl-3 py-1">
              Apertura Inicial de Caja & Turno Fiscal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e1e8fd] bg-white hover:bg-[#f1f3ff] text-[#141b2b] transition-all cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
              <span className="font-mono text-xs font-bold capitalize">
                {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
              </span>
            </button>
          </div>
        </div>

        {/* Main Content Form */}
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 flex-1 flex flex-col justify-center">
          {content}
        </main>

        {/* Footer info */}
        <footer className="w-full border-t border-[#e1e8fd] bg-white/50 backdrop-blur-xs py-3 text-center text-xs text-[#5b403d] font-mono">
          Wonder Chicken POS & Cajas v2.4 • Sistema Conforme Normativa SIN Bolivia
        </footer>
      </div>
    );
  }

  return content;
};
