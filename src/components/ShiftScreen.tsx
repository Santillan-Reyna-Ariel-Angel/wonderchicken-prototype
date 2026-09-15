import React, { useState } from 'react';

interface ShiftScreenProps {
  shiftName: string;
  cashierName: string;
  onUpdateShift: (shiftName: string) => void;
  onBackToPOS: () => void;
  ordersCount: number;
  totalSales: number;
}

export const ShiftScreen: React.FC<ShiftScreenProps> = ({
  shiftName,
  cashierName,
  onUpdateShift,
  onBackToPOS,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'MAÑANA' | 'NOCHE'>('MAÑANA');
  const [selectedCaja, setSelectedCaja] = useState<'01' | '02'>('01');
  const [initialFund, setInitialFund] = useState(150.00);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShift(selectedPeriod);
    setShowSuccessModal(true);
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

      {/* Top Banner Operador */}
      <div className="bg-[#141b2b] text-white p-4 sm:p-5 rounded-xl border border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#af101a] text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 border border-white/20">
            CC
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white">
                Bienvenida, {cashierName || 'Carla Cajera'}
              </span>
              <span className="bg-[#ffdad6] text-[#af101a] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                Rol: CAJERA
              </span>
            </div>
            <span className="font-mono text-xs text-[#e1e8fd] opacity-80">
              CI: 2222222 • Sucursal Central (Caja 01)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/10">
            FR-004 / PDR §2.6
          </span>
          <button
            type="button"
            onClick={onBackToPOS}
            className="px-3.5 py-1.5 bg-white text-[#141b2b] font-mono text-xs font-bold rounded-lg hover:bg-[#e1e8fd] transition-colors cursor-pointer"
          >
            Terminal POS
          </button>
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
};
