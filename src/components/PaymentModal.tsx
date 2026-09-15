import React, { useState, useEffect } from 'react';
import { Customer, OrderType } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (paymentMethod: 'EFECTIVO' | 'QR', cashReceived: number, change: number) => void;
  total: number;
  ticketNumber: string;
  orderType: OrderType;
  tableNumber?: string;
  customer: Customer;
  cashierName?: string;
  itemCount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  total,
  ticketNumber,
  orderType,
  tableNumber = '',
  customer,
  cashierName = 'Roxana',
  itemCount,
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(() => {
    // Round up to nearest 10 or 100
    if (total <= 50) return 50;
    if (total <= 100) return 100;
    return Math.ceil(total / 50) * 50;
  });
  const [withInvoice, setWithInvoice] = useState(true);

  // Keep cash default synchronized when total changes
  useEffect(() => {
    if (cashReceived < total) {
      setCashReceived(Math.ceil(total / 10) * 10);
    }
  }, [total]);

  const change = Math.max(0, cashReceived - total);
  const isShort = cashReceived < total && paymentMethod === 'cash';

  const handleConfirm = () => {
    if (isShort) {
      alert('El efectivo recibido es menor al monto total.');
      return;
    }
    onConfirmPayment(paymentMethod === 'cash' ? 'EFECTIVO' : 'QR', cashReceived, change);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#293040]/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e1e8fd]">
        {/* Header */}
        <div className="bg-[#d32f2f] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Cobro de Ticket {ticketNumber}
              </h2>
              <span className="font-mono text-xs text-white/80">
                Caja 01 • Cajera: {cashierName}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Payment Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Total Banner */}
          <div className="flex items-center justify-between bg-[#f1f3ff] p-4 rounded-xl border border-[#e1e8fd]">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] text-[#5b403d] uppercase font-semibold">
                Monto Total a Cobrar:
              </span>
              <span className="font-mono text-2xl sm:text-3xl text-[#af101a] font-bold leading-tight">
                Bs. {total.toFixed(2)}
              </span>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="font-mono text-xs bg-[#fec330] text-[#6f5100] px-2.5 py-0.5 rounded-full font-bold uppercase">
                {orderType === 'MESA' ? (tableNumber || 'MESA') : 'PARA LLEVAR'}
              </span>
              <span className="text-xs text-[#5b403d] mt-1 font-medium">
                {itemCount} {itemCount === 1 ? 'ítem registrado' : 'ítems registrados'}
              </span>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs text-[#5b403d] uppercase font-bold">
              Método de Pago:
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#e9edff] rounded-lg">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 rounded-md font-mono text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-white text-[#af101a] shadow-xs'
                    : 'text-[#5b403d] hover:text-[#141b2b]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">attach_money</span>
                Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`py-2 rounded-md font-mono text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'qr'
                    ? 'bg-white text-[#af101a] shadow-xs'
                    : 'text-[#5b403d] hover:text-[#141b2b]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                QR / Tarjeta Simple
              </button>
            </div>
          </div>

          {/* Cash Calculation Panel */}
          {paymentMethod === 'cash' ? (
            <div className="flex flex-col gap-3 bg-[#f1f3ff] p-4 rounded-xl border border-[#e1e8fd]">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="cash-received-input"
                  className="text-xs font-bold text-[#141b2b]"
                >
                  Efectivo Recibido:
                </label>
                <div className="relative w-44">
                  <span className="absolute left-3 top-2 font-mono text-xs font-bold text-[#5b403d]">
                    Bs.
                  </span>
                  <input
                    id="cash-received-input"
                    type="number"
                    step="1.00"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white text-[#141b2b] font-mono text-base font-bold rounded-lg text-right border border-[#e1e8fd] focus:outline-none focus:border-[#af101a] focus:ring-2 focus:ring-[#af101a]/10"
                  />
                </div>
              </div>

              {/* Quick Denominations */}
              <div className="flex items-center gap-1.5 justify-end flex-wrap">
                <span className="font-mono text-xs text-[#5b403d] mr-1">Rápido:</span>
                <button
                  type="button"
                  onClick={() => setCashReceived(total)}
                  className="px-2.5 py-1 bg-white hover:bg-[#e9edff] rounded border border-[#e1e8fd] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
                >
                  Exacto
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived(90)}
                  className="px-2.5 py-1 bg-white hover:bg-[#e9edff] rounded border border-[#e1e8fd] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
                >
                  90 Bs
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived(100)}
                  className="px-2.5 py-1 bg-white hover:bg-[#e9edff] rounded border border-[#e1e8fd] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
                >
                  100 Bs
                </button>
                <button
                  type="button"
                  onClick={() => setCashReceived(200)}
                  className="px-2.5 py-1 bg-white hover:bg-[#e9edff] rounded border border-[#e1e8fd] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
                >
                  200 Bs
                </button>
              </div>

              {/* Change Output */}
              <div className="flex items-center justify-between pt-2 border-t border-[#e1e8fd]">
                <span className="text-xs font-bold text-[#141b2b]">
                  Cambio / Vuelto a entregar:
                </span>
                {isShort ? (
                  <span className="font-mono text-base font-bold text-[#ba1a1a]">
                    Faltante: Bs. {(total - cashReceived).toFixed(2)}
                  </span>
                ) : (
                  <span className="font-mono text-lg font-bold text-[#15803d]">
                    Bs. {change.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* QR Panel */
            <div className="flex flex-col items-center justify-center p-6 bg-[#f1f3ff] rounded-xl border border-[#e1e8fd] gap-2">
              <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-xs border border-[#e1e8fd]">
                <span className="material-symbols-outlined text-[#141b2b] text-[100px]">
                  qr_code_2
                </span>
              </div>
              <span className="font-mono text-xs text-[#5b403d] mt-1 font-semibold">
                Escanee con Simple Móvil / BCP / BNB
              </span>
              <span className="font-mono text-sm font-bold text-[#af101a]">
                Total: Bs. {total.toFixed(2)}
              </span>
            </div>
          )}

          {/* Invoicing info check */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#141b2b] select-none">
            <input
              type="checkbox"
              checked={withInvoice}
              onChange={(e) => setWithInvoice(e.target.checked)}
              className="accent-[#af101a] rounded w-4 h-4"
            />
            <span>
              Facturar con datos del cliente:{' '}
              <strong className="text-[#af101a]">
                {customer.fullName} ({customer.ci || customer.nit || 'S/N'})
              </strong>
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#e9edff] p-4 sm:p-5 flex items-center justify-between border-t border-[#e1e8fd]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white text-[#141b2b] font-medium text-xs hover:bg-[#f1f3ff] border border-[#e1e8fd] transition-colors cursor-pointer"
          >
            Volver a Edición
          </button>
          <button
            type="button"
            disabled={isShort}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-lg bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">receipt</span>
            Confirmar Venta y Generar Comanda
          </button>
        </div>
      </div>
    </div>
  );
};
