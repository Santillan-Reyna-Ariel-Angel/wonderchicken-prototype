import React, { useState } from 'react';
import { useShiftsStore } from '../features/shifts/stores/shifts.store';
import { AppModal } from '../commonComponents/AppModal';

interface ShiftControlScreenProps {
  onBackToPOS: () => void;
}

export const ShiftControlScreen: React.FC<ShiftControlScreenProps> = ({ onBackToPOS }) => {
  const { shift, closeShift } = useShiftsStore();
  const [selectedCaja, setSelectedCaja] = useState<'01' | '02'>('01');
  const [denominations, setDenominations] = useState<{ [key: string]: number }>({
    '200': 7,
    '100': 5,
    '50': 2,
    '20': 3,
    '10': 2,
    'monedas': 15,
  });

  const [toast, setToast] = useState<string | null>(null);
  const [showZReportModal, setShowZReportModal] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDenomChange = (key: string, qty: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: Math.max(0, qty),
    }));
  };

  // Calculations for Caja 01
  const cashCounted =
    denominations['200'] * 200 +
    denominations['100'] * 100 +
    denominations['50'] * 50 +
    denominations['20'] * 20 +
    denominations['10'] * 10 +
    (denominations['monedas'] || 0);

  const initialFund = 150.00;
  const cashSales = 1980.00;
  const expenses = 35.00;
  const vales = 0.00; // vales don't discount physical cash
  const expectedCash = initialFund + cashSales - expenses;
  const difference = cashCounted - expectedCash;

  const handleCloseShift = () => {
    setShowZReportModal(true);
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

      {/* Header Operativo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] bg-[#ffdad6] text-[#af101a] uppercase font-bold tracking-wider">
              FR-004 · PDR §2.6 &amp; §13.3
            </span>
            <span className="font-mono text-xs text-[#15803d] flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span>
              Auditoría en Vivo
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#141b2b] tracking-tight mt-1">
            Control de Turnos y Arqueo de Cajas
          </h1>
          <p className="text-xs text-[#5b403d] mt-0.5">
            Supervisión de cajas activas, conciliación ciega de efectivo, liquidación de vales y generación de actas fiscales Z.
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
            onClick={() => showToast('Descargando arqueo consolidado de turno...')}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Exportar Arqueo (CSV)
          </button>
        </div>
      </div>

      {/* Cajas del Turno Actual Grid */}
      <div className="bg-white rounded-xl border border-[#e1e8fd] shadow-xs overflow-hidden flex flex-col">
        <div className="p-4 bg-[#f9f9ff] border-b border-[#e1e8fd] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[20px]">view_timeline</span>
            <h2 className="font-bold text-sm sm:text-base text-[#141b2b]">
              Cajas del Turno Actual — Turno Mañana en Curso
            </h2>
          </div>
          <span className="font-mono text-xs text-[#5b403d]">Sucursal Central (SCZ-001)</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f1f3ff] text-[#5b403d] font-mono uppercase tracking-wider border-b border-[#e1e8fd]">
              <tr>
                <th className="py-3 px-4">Caja</th>
                <th className="py-3 px-4">Cajera Responsable</th>
                <th className="py-3 px-4">Hora Apertura</th>
                <th className="py-3 px-4 text-right">Fondo Base</th>
                <th className="py-3 px-4 text-right">Venta Efectivo</th>
                <th className="py-3 px-4 text-right">QR / Delivery</th>
                <th className="py-3 px-4 text-right">Vales Personal</th>
                <th className="py-3 px-4 text-right">Gastos Menores</th>
                <th className="py-3 px-4 text-right">Total Esperado</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3ff] text-[#141b2b]">
              <tr className={`hover:bg-[#f9f9ff] transition-colors ${selectedCaja === '01' ? 'bg-[#ffdad6]/20' : ''}`}>
                <td className="py-3 px-4 font-mono font-bold text-[#af101a]">Caja 01</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#af101a] text-white font-mono text-[10px] font-bold flex items-center justify-center">
                      CC
                    </div>
                    <span className="font-bold">Carla Cajera (2222222)</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-[#5b403d]">08:30 AM</td>
                <td className="py-3 px-4 text-right font-mono">Bs. 150.00</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#15803d]">Bs. 1,980.00</td>
                <td className="py-3 px-4 text-right font-mono text-[#005c8d]">Bs. 1,440.00</td>
                <td className="py-3 px-4 text-right font-mono text-[#b45309]">
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-50 border border-amber-200 font-bold text-[11px]">
                    -Bs. 23.00
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-[#ba1a1a]">
                  <span className="inline-block px-2 py-0.5 rounded bg-rose-50 border border-rose-200 font-bold text-[11px]">
                    -Bs. 35.00
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-base text-[#141b2b]">
                  Bs. 2,095.00
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-[#15803d]/15 text-[#15803d] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    ABIERTA
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCaja('01');
                      showToast('Supervisando Caja 01 - Carla Cajera');
                    }}
                    className="px-2.5 py-1 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded shadow-xs cursor-pointer"
                  >
                    Supervisar Arqueo
                  </button>
                </td>
              </tr>

              <tr className={`hover:bg-[#f9f9ff] transition-colors ${selectedCaja === '02' ? 'bg-[#ffdad6]/20' : ''}`}>
                <td className="py-3 px-4 font-mono font-bold text-[#af101a]">Caja 02</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#fec330] text-[#6f5100] font-mono text-[10px] font-bold flex items-center justify-center">
                      EE
                    </div>
                    <span className="font-bold">Eva Empleada (7777777)</span>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-[#5b403d]">08:45 AM</td>
                <td className="py-3 px-4 text-right font-mono">Bs. 150.00</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#15803d]">Bs. 0.00</td>
                <td className="py-3 px-4 text-right font-mono text-[#005c8d]">Bs. 850.00</td>
                <td className="py-3 px-4 text-right font-mono text-[#b45309]">
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-50 border border-amber-200 font-bold text-[11px]">
                    -Bs. 23.00
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-[#ba1a1a]">
                  <span className="inline-block px-2 py-0.5 rounded bg-rose-50 border border-rose-200 font-bold text-[11px]">
                    -Bs. 50.00
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-base text-[#141b2b]">
                  Bs. 100.00
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-[#15803d]/15 text-[#15803d] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    ABIERTA
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCaja('02');
                      showToast('Supervisando Caja 02 - Eva Empleada');
                    }}
                    className="px-2.5 py-1 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded border border-[#e1e8fd] cursor-pointer"
                  >
                    Auditar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Módulo de Auditoría Operativa / Cierre de Turno y Arqueo X / Z */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Conteo Físico Ciego */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#e1e8fd] shadow-xs p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#e1e8fd] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#af101a] text-[22px]">payments</span>
                <div>
                  <h3 className="font-bold text-sm text-[#141b2b]">
                    Conteo Físico Ciego de Efectivo Declarado
                  </h3>
                  <span className="font-mono text-[11px] text-[#5b403d]">
                    Caja {selectedCaja} • Operador en Turno
                  </span>
                </div>
              </div>
              <span className="bg-[#ffdad6] text-[#af101a] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                FR-004 AUDIT
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { denom: '200', label: 'Billetes de Bs. 200', factor: 200 },
                { denom: '100', label: 'Billetes de Bs. 100', factor: 100 },
                { denom: '50', label: 'Billetes de Bs. 50', factor: 50 },
                { denom: '20', label: 'Billetes de Bs. 20', factor: 20 },
                { denom: '10', label: 'Billetes de Bs. 10', factor: 10 },
              ].map((d) => (
                <div key={d.denom} className="flex items-center justify-between p-2 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] text-xs">
                  <span className="font-bold text-[#141b2b]">{d.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDenomChange(d.denom, denominations[d.denom] - 1)}
                        className="w-6 h-6 rounded bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-mono font-bold flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={denominations[d.denom]}
                        onChange={(e) => handleDenomChange(d.denom, parseInt(e.target.value) || 0)}
                        className="w-12 text-center py-0.5 font-mono font-bold bg-white rounded border border-[#e1e8fd]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDenomChange(d.denom, denominations[d.denom] + 1)}
                        className="w-6 h-6 rounded bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-mono font-bold flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-mono font-bold text-[#af101a] w-24 text-right">
                      Bs. {(denominations[d.denom] * d.factor).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Sencillo y monedas */}
              <div className="flex items-center justify-between p-2 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] text-xs">
                <span className="font-bold text-[#141b2b]">Monedas y Fracciones (Total)</span>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1 text-[11px] font-mono text-[#5b403d]">Bs.</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={denominations['monedas']}
                      onChange={(e) => handleDenomChange('monedas', parseFloat(e.target.value) || 0)}
                      className="w-24 pl-8 pr-2 py-1 text-right font-mono font-bold bg-white rounded border border-[#e1e8fd]"
                    />
                  </div>
                  <span className="font-mono font-bold text-[#af101a] w-24 text-right">
                    Bs. {(denominations['monedas'] || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e1e8fd] flex items-center justify-between">
            <span className="font-bold text-xs uppercase text-[#5b403d]">Total Contado Físico:</span>
            <span className="font-mono text-xl font-bold text-[#141b2b]">
              Bs. {cashCounted.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Right: Cuadre Operativo y Desglose */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#e1e8fd] shadow-xs p-5 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#e1e8fd] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#15803d] text-[22px]">balance</span>
                <div>
                  <h3 className="font-bold text-sm text-[#141b2b]">
                    Cuadre Operativo y Desglose de Liquidación
                  </h3>
                  <span className="font-mono text-[11px] text-[#5b403d]">
                    Conciliación Automática del Turno
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                <span className="text-[#5b403d]">(+) Fondo Inicial Asignado:</span>
                <span className="font-mono font-bold text-[#141b2b]">Bs. {initialFund.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                <span className="text-[#5b403d]">(+) Ventas Brutas en Efectivo:</span>
                <span className="font-mono font-bold text-[#15803d]">+ Bs. {cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                <span className="text-[#5b403d]">(-) Gastos Menores Operativos:</span>
                <span className="font-mono font-bold text-[#ba1a1a]">- Bs. {expenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#f1f3ff]">
                <span className="text-[#5b403d]">(-) Vales de Consumo Personal:</span>
                <span className="font-mono font-bold text-[#5b403d]">Bs. {vales.toFixed(2)}</span>
              </div>

              <div className="flex justify-between py-2 text-sm font-bold border-t-2 border-[#141b2b]/20">
                <span className="text-[#141b2b]">Efectivo Esperado en Gaveta:</span>
                <span className="font-mono text-base text-[#141b2b]">Bs. {expectedCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-xs">
                <span className="text-[#5b403d]">Efectivo Físico Contado:</span>
                <span className="font-mono text-sm text-[#141b2b]">Bs. {cashCounted.toFixed(2)}</span>
              </div>
            </div>

            {/* Discrepancia status banner */}
            {difference === 0 ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-start gap-2 text-emerald-950">
                <span className="material-symbols-outlined text-emerald-700 text-[22px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-xs">
                    Cuadre Perfecto ± 0.00 (TOLERANCIA OK PDR §13.3)
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    La gaveta coincide exactamente con el flujo del sistema. No se reportan faltantes ni sobrantes.
                  </span>
                </div>
              </div>
            ) : difference > 0 ? (
              <div className="bg-blue-50 border border-blue-300 rounded-xl p-3 flex items-start gap-2 text-blue-950">
                <span className="material-symbols-outlined text-blue-700 text-[22px] shrink-0 mt-0.5">
                  info
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-xs">
                    Sobrante en Caja: +Bs. {difference.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-blue-800">
                    Se registrará el sobrante en el Acta Z como ajuste extraordinario.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-start gap-2 text-rose-950">
                <span className="material-symbols-outlined text-rose-700 text-[22px] shrink-0 mt-0.5">
                  warning
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-xs">
                    Faltante en Caja: -Bs. {Math.abs(difference).toFixed(2)}
                  </span>
                  <span className="text-[11px] text-rose-800">
                    Supera la tolerancia máxima (Bs. 5.00). Se requerirá firma y justificación del cajero.
                  </span>
                </div>
              </div>
            )}

            {/* Other media summary */}
            <div className="bg-[#f1f3ff] rounded-lg p-3 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#005c8d]">qr_code_2</span>
                <span>QR Simple: <strong>Bs. 1,440.00</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#795900]">badge</span>
                <span>Vales Personal: <strong>Bs. 23.00</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#e1e8fd]">
            <button
              type="button"
              onClick={handleCloseShift}
              className="w-full py-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Cerrar Turno y Generar Acta Z
            </button>
          </div>
        </div>
      </div>

      {/* Modal Acta Z */}
      <AppModal
        isOpen={showZReportModal}
        onClose={() => setShowZReportModal(false)}
        icon="print"
        title="ACTA FISCAL Z — CIERRE DE CAJA"
        description="SIN Bolivia • RND 102100000011"
        maxWidth="lg"
        onConfirm={() => {
          closeShift();
          showToast('Imprimiendo Acta Z en impresora fiscal. Turno cerrado.');
          setShowZReportModal(false);
        }}
        confirmLabel="Imprimir Acta Z"
        confirmIcon="print"
        showCancel={true}
        cancelLabel="Cerrar"
      >
        <div className="font-mono text-xs text-[#141b2b] flex flex-col gap-3 bg-white p-3 rounded-xl border border-[#e1e8fd]">
          <div className="text-center pb-2 border-b border-dashed border-gray-400">
            <div className="font-bold text-sm text-[#af101a]">WONDER CHICKEN BOLIVIA</div>
            <div className="text-[11px] text-[#5b403d]">SUCURSAL CENTRAL — NIT: 1020304050</div>
            <div className="text-[10px] text-[#5b403d]">ACTA DE CIERRE FISCAL Z Nº 000421</div>
            <div className="text-[10px] text-[#5b403d]">Fecha: {new Date().toLocaleDateString('es-BO')} • Hora: {new Date().toLocaleTimeString('es-BO')}</div>
          </div>

          <div className="flex flex-col gap-1 py-1 text-[11px]">
            <div className="flex justify-between">
              <span>CAJERO:</span>
              <span className="font-bold">Carla Cajera (CI: 2222222)</span>
            </div>
            <div className="flex justify-between">
              <span>TURNO:</span>
              <span className="font-bold">MAÑANA (08:30 - 16:00)</span>
            </div>
            <div className="flex justify-between">
              <span>CAJA:</span>
              <span className="font-bold">CAJA 01 - MESÓN PRINCIPAL</span>
            </div>
          </div>

          <div className="border-t border-b border-dashed border-gray-400 py-2 flex flex-col gap-1">
            <div className="flex justify-between">
              <span>FONDO INICIAL:</span>
              <span>Bs. {initialFund.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>VENTAS EN EFECTIVO:</span>
              <span>Bs. {cashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VENTAS QR SIMPLE:</span>
              <span>Bs. 1,440.00</span>
            </div>
            <div className="flex justify-between">
              <span>GASTOS OPERATIVOS:</span>
              <span>-Bs. {expenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VALES PERSONAL:</span>
              <span>Bs. 23.00</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#af101a] pt-1 border-t border-gray-300">
              <span>TOTAL ESPERADO EN EFECTIVO:</span>
              <span>Bs. {expectedCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#15803d]">
              <span>TOTAL DECLARADO EN GAVETA:</span>
              <span>Bs. {cashCounted.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-gray-300">
              <span>DIFERENCIA / DISCREPANCIA:</span>
              <span>Bs. {difference.toFixed(2)} (OK)</span>
            </div>
          </div>

          <div className="text-center text-[10px] text-[#5b403d] pt-1">
            Documento de control interno y auditoría fiscal tributaria.
            <br />
            Hash de Cierre: 8A4F-E021-99B2-C110
          </div>
        </div>
      </AppModal>
    </div>
  );
};
