import React, { useState, useEffect } from 'react';
import { Customer, OrderType } from '../types';
import { AppModal } from '../commonComponents/AppModal';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (
    paymentMethod: 'EFECTIVO' | 'QR' | 'PENDIENTE',
    cashReceived: number,
    change: number,
    selectedCustomer?: Customer,
    withInvoice?: boolean
  ) => void;
  total: number;
  ticketNumber: string;
  orderType: OrderType;
  tableNumber?: string;
  customer: Customer;
  cashierName?: string;
  itemCount: number;

  // Customization props for flexible reuse (e.g. "Confirmación de Cobro" vs "Liquidación de Cobro")
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: string;

  // Mode & customer assignment capability
  allowCustomerSelection?: boolean;
  customers?: Customer[];
  onNavigateToClients?: () => void;
  onCustomerChange?: (customer: Customer) => void;
  
  // Payment options
  allowPendingPayment?: boolean;
  defaultWithInvoice?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  total,
  ticketNumber,
  orderType,
  tableNumber = '',
  customer: initialCustomer,
  cashierName = 'Roxana',
  itemCount,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Volver a Edición',
  icon = 'point_of_sale',
  allowCustomerSelection = false,
  customers = [],
  onNavigateToClients,
  onCustomerChange,
  allowPendingPayment,
  defaultWithInvoice = true,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(initialCustomer);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr' | 'pending'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(() => {
    if (total <= 50) return 50;
    if (total <= 100) return 100;
    return Math.ceil(total / 50) * 50;
  });
  const [withInvoice, setWithInvoice] = useState(defaultWithInvoice);

  // Sync initialCustomer when opened or changed from outside
  useEffect(() => {
    setSelectedCustomer(initialCustomer);
  }, [initialCustomer, isOpen]);

  // Keep cash default synchronized when total changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultCash = total <= 50 ? 50 : total <= 100 ? 100 : Math.ceil(total / 10) * 10;
      setCashReceived(defaultCash);
      setPaymentMethod('cash');
      setWithInvoice(defaultWithInvoice);
      setShowCustomerDropdown(false);
      setCustomerSearch('');
    }
  }, [isOpen, total, defaultWithInvoice]);

  const change = Math.max(0, cashReceived - total);
  const isShort = cashReceived < total && paymentMethod === 'cash';

  const handleCustomerSelect = (c: Customer) => {
    setSelectedCustomer(c);
    setShowCustomerDropdown(false);
    if (onCustomerChange) {
      onCustomerChange(c);
    }
  };

  const handleConfirm = () => {
    if (isShort) {
      alert('El efectivo recibido es menor al monto total.');
      return;
    }
    if (paymentMethod === 'pending') {
      onConfirmPayment('PENDIENTE', 0, 0, selectedCustomer, withInvoice);
    } else {
      onConfirmPayment(
        paymentMethod === 'cash' ? 'EFECTIVO' : 'QR',
        cashReceived,
        change,
        selectedCustomer,
        withInvoice
      );
    }
  };

  const getConfirmLabel = () => {
    if (confirmLabel) return confirmLabel;
    if (paymentMethod === 'pending') {
      return 'Registrar Comanda Pendiente de Pago';
    }
    return 'Confirmar Cobro y Enviar Comanda';
  };

  const getConfirmIcon = () => {
    if (paymentMethod === 'pending') {
      return 'pending_actions';
    }
    return 'receipt';
  };

  // Determine if pending option should be shown
  const canShowPending = allowPendingPayment !== undefined ? allowPendingPayment : orderType === 'LLEVAR';

  // Filter customers for dropdown search
  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.ci.includes(customerSearch) ||
      (c.nit && c.nit.includes(customerSearch))
  );

  const displayTitle = title || `Confirmación de Cobro • Ticket #${ticketNumber}`;
  const displayDescription = description || `Caja 01 • Turno Activo • Cajera: ${cashierName}`;

  const customerIdDisplay = selectedCustomer.nit
    ? `NIT ${selectedCustomer.nit}`
    : selectedCustomer.ci && selectedCustomer.ci !== '0'
    ? `CI ${selectedCustomer.ci}`
    : 'S/N';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={icon}
      title={displayTitle}
      description={displayDescription}
      maxWidth="lg"
      onConfirm={handleConfirm}
      confirmLabel={getConfirmLabel()}
      confirmIcon={getConfirmIcon()}
      confirmDisabled={isShort}
      showCancel={true}
      cancelLabel={cancelLabel}
    >
      <div className="flex flex-col gap-4">
        {/* Total & Order Type Summary Banner */}
        <div className="bg-[#f8f9fc] p-4 rounded-xl border border-[#e2e8f0] flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-[#5b403d] uppercase font-bold block">
              {allowCustomerSelection ? 'Monto Total a Cobrar:' : 'Total a Cobrar:'}
            </span>
            <span className="font-mono text-2xl sm:text-3xl text-[#af101a] font-bold leading-tight">
              Bs. {total.toFixed(2)}
            </span>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="font-mono text-xs bg-[#fec330] text-[#6f5100] px-2.5 py-0.5 rounded-full font-bold uppercase">
              {orderType === 'MESA' ? (tableNumber ? `MESA ${tableNumber}` : 'MESA') : orderType === 'DELIVERY' ? 'DELIVERY' : 'PARA LLEVAR'}
            </span>
            <span className="text-xs text-[#5b403d] mt-1 font-medium">
              {itemCount} {itemCount === 1 ? 'ítem registrado' : 'ítems registrados'}
            </span>
          </div>
        </div>

        {/* Customer Selector Section (flexible inclusion for Liquidación and customizable assignment) */}
        {allowCustomerSelection && (
          <div className="py-2.5 border-b border-[#e1e8fd] relative">
            <label className="font-mono text-[10px] text-[#5b403d] uppercase font-bold block mb-1">
              Cliente Asignado:
            </label>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="material-symbols-outlined text-[#af101a] text-[18px]">person</span>
                <button
                  type="button"
                  onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                  className="text-left truncate text-xs font-bold text-[#141b2b] hover:text-[#af101a] cursor-pointer flex items-center gap-1"
                >
                  <span className="truncate">{selectedCustomer.fullName}</span>
                  <span className="font-mono text-[10px] text-[#5b403d]">
                    ({customerIdDisplay})
                  </span>
                  <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                </button>
              </div>

              {onNavigateToClients && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerDropdown(false);
                    onNavigateToClients();
                  }}
                  className="px-2 py-1 bg-[#f1f3ff] hover:bg-[#e9edff] rounded text-[10px] font-mono font-bold text-[#af101a] flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  title="Registrar nuevo cliente en módulo SIN"
                >
                  <span className="material-symbols-outlined text-[14px]">person_add</span>
                  + Nuevo
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showCustomerDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-[#e1e8fd] p-2 flex flex-col gap-1.5 animate-fade-in">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Buscar por Nombre, CI o NIT..."
                  className="p-2 bg-[#f1f3ff] text-xs font-medium rounded-lg border border-[#e1e8fd] outline-none"
                  autoFocus
                />

                <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                  {/* Anonymous S/N Option */}
                  <button
                    type="button"
                    onClick={() =>
                      handleCustomerSelect({
                        id: 'c-sn',
                        ci: '0',
                        fullName: 'Cliente S/N (Sin Nombre)',
                        phone: '-',
                      })
                    }
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f1f3ff] text-left cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-[#141b2b]">Cliente S/N</span>
                      <span className="text-[10px] text-[#5b403d]">Consumidor Final (Sin Factura Nominada)</span>
                    </div>
                    <span className="font-mono text-xs text-[#5b403d]">0</span>
                  </button>

                  {filteredCustomers.map((cust) => (
                    <button
                      key={cust.id}
                      type="button"
                      onClick={() => handleCustomerSelect(cust)}
                      className={`flex items-center justify-between p-2 rounded-lg text-left cursor-pointer ${
                        cust.id === selectedCustomer.id ? 'bg-[#ffdad6]/40' : 'hover:bg-[#f1f3ff]'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="font-bold text-xs text-[#141b2b] truncate">{cust.fullName}</span>
                        <span className="text-[10px] text-[#5b403d]">{cust.phone}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#af101a] shrink-0">
                        {cust.nit ? `NIT ${cust.nit}` : `CI ${cust.ci}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Invoicing info check */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#141b2b] select-none">
          <input
            type="checkbox"
            checked={withInvoice}
            onChange={(e) => setWithInvoice(e.target.checked)}
            className="accent-[#af101a] rounded w-4 h-4 cursor-pointer"
          />
          <span>
            Facturar con datos del cliente:{' '}
            <strong className="text-[#af101a]">
              {selectedCustomer.fullName} ({customerIdDisplay})
            </strong>
          </span>
        </label>

        {/* Payment Method Tabs */}
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs text-[#5b403d] uppercase font-bold flex items-center justify-between">
            <span>{allowCustomerSelection ? 'Método de Pago:' : 'Modalidad de Cobro:'}</span>
            {canShowPending && (
              <span className="text-[10px] text-[#af101a] font-semibold lowercase">
                (opción diferida habilitada)
              </span>
            )}
          </label>
          <div className={`grid ${canShowPending ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 p-1 bg-[#f1f3f9] rounded-lg`}>
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`py-2 px-1 rounded-md font-mono text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'cash'
                  ? 'bg-white text-[#af101a] shadow-xs'
                  : 'text-[#5b403d] hover:text-[#141b2b]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">attach_money</span>
              <span>Efectivo</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('qr')}
              className={`py-2 px-1 rounded-md font-mono text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                paymentMethod === 'qr'
                  ? 'bg-white text-[#af101a] shadow-xs'
                  : 'text-[#5b403d] hover:text-[#141b2b]'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">qr_code_2</span>
              <span>{allowCustomerSelection ? 'QR / Tarjeta Simple' : 'QR Simple'}</span>
            </button>
            {canShowPending && (
              <button
                type="button"
                onClick={() => setPaymentMethod('pending')}
                className={`py-2 px-1 rounded-md font-mono text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'pending'
                    ? 'bg-[#af101a] text-white shadow-xs'
                    : 'text-[#5b403d] hover:text-[#af101a]'
                }`}
                title="Registro de PENDING_PAYMENT"
              >
                <span className="material-symbols-outlined text-[17px]">pending_actions</span>
                <span>Pendiente</span>
              </button>
            )}
          </div>
        </div>

        {/* Cash Calculation Panel */}
        {paymentMethod === 'cash' && (
          <div className="flex flex-col gap-3 bg-[#f8f9fc] p-4 rounded-xl border border-[#e2e8f0]">
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
                  className="w-full pl-9 pr-3 py-1.5 bg-white text-[#141b2b] font-mono text-base font-bold rounded-lg text-right border border-[#cbd5e1] focus:outline-none focus:border-[#af101a] focus:ring-2 focus:ring-[#af101a]/10"
                />
              </div>
            </div>

            {/* Quick Denominations */}
            <div className="flex items-center gap-1.5 justify-end flex-wrap">
              <span className="font-mono text-xs text-[#5b403d] mr-1">Rápido:</span>
              <button
                type="button"
                onClick={() => setCashReceived(total)}
                className="px-2.5 py-1 bg-white hover:bg-[#f1f5f9] rounded border border-[#cbd5e1] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
              >
                Exacto
              </button>
              <button
                type="button"
                onClick={() => setCashReceived(50)}
                className="px-2.5 py-1 bg-white hover:bg-[#f1f5f9] rounded border border-[#cbd5e1] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
              >
                50 Bs
              </button>
              <button
                type="button"
                onClick={() => setCashReceived(100)}
                className="px-2.5 py-1 bg-white hover:bg-[#f1f5f9] rounded border border-[#cbd5e1] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
              >
                100 Bs
              </button>
              <button
                type="button"
                onClick={() => setCashReceived(200)}
                className="px-2.5 py-1 bg-white hover:bg-[#f1f5f9] rounded border border-[#cbd5e1] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
              >
                200 Bs
              </button>
            </div>

            {/* Change Output */}
            <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
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
        )}

        {/* QR Panel */}
        {paymentMethod === 'qr' && (
          <div className="flex flex-col items-center justify-center p-6 bg-[#f8f9fc] rounded-xl border border-[#e2e8f0] gap-2">
            <div className="w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-xs border border-[#e2e8f0]">
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

        {/* Pending Payment Info Panel */}
        {paymentMethod === 'pending' && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <span className="material-symbols-outlined text-[20px] text-amber-700">info</span>
              <span>Registro de Pago Diferido [FR-011]</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              La orden se registrará con estado <strong className="font-mono font-bold">PENDING_PAYMENT</strong>. La comanda se enviará inmediatamente a cocina (KDS) para su preparación. La cajera podrá liquidar el cobro cuando el cliente pase a recoger su pedido.
            </p>
          </div>
        )}
      </div>
    </AppModal>
  );
};
