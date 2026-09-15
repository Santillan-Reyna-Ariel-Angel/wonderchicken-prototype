import React, { useState } from 'react';
import { PendingOrder, Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../data/mockData';

interface PendingOrdersScreenProps {
  onBackToPOS: () => void;
  onOrderSettled?: (ticketId: string, amount: number, customer?: Customer, paymentMethod?: 'EFECTIVO' | 'QR') => void;
  customers?: Customer[];
  onNavigateToClients?: () => void;
}

const INITIAL_PENDING_ORDERS: PendingOrder[] = [
  {
    id: '103',
    ticketNumber: '#103',
    orderType: 'LLEVAR',
    customerName: 'Marco Ortega',
    deliveryDetails: '',
    total: 90.00,
    elapsedTime: 'Hace 6 min',
    itemsSummary: '3x Porción Media Broaster',
    modifiers: [
      '1x Pecho - Ala',
      '2x Pierna - Entrepierna',
      'Sustitución: Arroz con queso en vez de papas',
    ],
    status: 'PENDIENTE',
  },
  {
    id: '106',
    ticketNumber: '#106',
    orderType: 'LLEVAR',
    customerName: 's/n',
    deliveryDetails: '',
    total: 58.00,
    elapsedTime: 'Hace 2 min',
    itemsSummary: '1x Combo Familiar 8 Presas',
    modifiers: [
      '+ Papas familiares rústicas',
      '+ Gaseosa 2L Guaraná',
    ],
    status: 'PENDIENTE',
  },
  {
    id: '108',
    ticketNumber: '#108',
    orderType: 'LLEVAR',
    customerName: 'Sra. Carmen Salazar',
    deliveryDetails: '',
    total: 32.50,
    elapsedTime: 'Hace 1 min',
    itemsSummary: '1x Cuarto Pecho Broaster + Tártara',
    modifiers: [
      '+ 1x Porción Extra Plátanos Fritos (Bs. 7.50)',
    ],
    status: 'PENDIENTE',
  },
];

export const PendingOrdersScreen: React.FC<PendingOrdersScreenProps> = ({
  onBackToPOS,
  onOrderSettled,
  customers = INITIAL_CUSTOMERS,
  onNavigateToClients,
}) => {
  const [orders, setOrders] = useState<PendingOrder[]>(INITIAL_PENDING_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [settleOrder, setSettleOrder] = useState<PendingOrder | null>(null);
  const [payMethod, setPayMethod] = useState<'EFECTIVO' | 'QR'>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState(100.00);
  const [withInvoice, setWithInvoice] = useState(false);
  
  // Customer selector state (matching POS)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  const [toast, setToast] = useState<{ title: string; message: string; icon: string } | null>(null);

  const showToastNotification = (title: string, message: string, icon = 'check_circle') => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenSettleModal = (order: PendingOrder) => {
    setSettleOrder(order);
    const defaultCash = order.total <= 90 ? 100 : Math.ceil(order.total / 10) * 10;
    setCashReceived(defaultCash);
    setPayMethod('EFECTIVO');
    setWithInvoice(false);
    setShowCustomerDropdown(false);
    setCustomerSearch('');

    // Find customer in list or create matching customer representation
    const orderName = (order.customerName || '').trim();
    const found = customers.find(
      (c) => c.fullName.trim().toLowerCase() === orderName.toLowerCase()
    );
    if (found) {
      setSelectedCustomer(found);
    } else if (orderName && orderName.toLowerCase() !== 's/n') {
      setSelectedCustomer({
        id: `c-${Date.now()}`,
        ci: '0',
        fullName: orderName,
        phone: '-',
      });
    } else {
      setSelectedCustomer({
        id: 'c-sn',
        ci: '0',
        fullName: 'Cliente S/N',
        phone: '-',
      });
    }
  };

  const handleCloseSettleModal = () => {
    setSettleOrder(null);
    setShowCustomerDropdown(false);
  };

  const handleExecutePayment = () => {
    if (!settleOrder) return;
    const orderId = settleOrder.id;
    const total = settleOrder.total;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (onOrderSettled) {
      onOrderSettled(orderId, total, selectedCustomer, payMethod);
    }
    const idDisplay = selectedCustomer.nit ? `NIT: ${selectedCustomer.nit}` : selectedCustomer.ci && selectedCustomer.ci !== '0' ? `CI: ${selectedCustomer.ci}` : 'S/N';
    showToastNotification(
      withInvoice ? `Comanda #${orderId} Facturada y Cobrada` : `Comanda #${orderId} Cobrada Exitosamente`,
      withInvoice
        ? `Factura emitida a ${selectedCustomer.fullName} (${idDisplay}). Inventario descontado.`
        : 'Inventario descontado atómicamente y arqueo registrado en caja.',
      'receipt'
    );
    handleCloseSettleModal();
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.ci.includes(customerSearch) ||
      (c.nit && c.nit.includes(customerSearch))
  );

  const handleCancelOrder = (orderId: string) => {
    if (confirm(`¿Desea cancelar el pedido #${orderId}? Al no haber sido cobrado, no afectará el arqueo de caja.`)) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToastNotification(
        `Pedido #${orderId} Cancelado`,
        'Se alertó a cocina para detener o reasignar las presas en fritura.',
        'delete'
      );
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const cust = ord.customerName?.trim() ? ord.customerName : 's/n';
    const matchesSearch =
      ord.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const totalPendingAmount = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#141b2b] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[24px]">{toast.icon}</span>
          <div className="flex flex-col">
            <span className="font-bold text-xs">{toast.title}</span>
            <span className="text-[11px] text-[#e1e8fd] opacity-90">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[22px]">pending_actions</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[#141b2b]">
              Bandeja de Pedidos con Pago Pendiente (FR-011)
            </h1>
          </div>
          <p className="text-xs text-[#5b403d] mt-1">
            Despachados a fritura/cocina anticipada • Pendientes de liquidación fiscal y cobro en ventanilla.
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
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-3 py-1.5 bg-[#f1f3ff] text-[#af101a] rounded-lg border border-[#e1e8fd]">
            Pedidos para Llevar ({orders.length})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por ticket o cliente..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#f1f3ff] rounded-lg text-xs border border-[#e1e8fd] outline-none"
            />
          </div>

          <div className="bg-[#fff8f7] border border-[#ffdad6] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#ba1a1a] font-bold">Por cobrar:</span>
            <span className="font-mono text-sm font-bold text-[#af101a]">
              Bs. {totalPendingAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e1e8fd] p-12 flex flex-col items-center justify-center text-center shadow-xs">
          <span className="material-symbols-outlined text-[54px] text-[#15803d]">
            verified
          </span>
          <h3 className="font-bold text-base text-[#141b2b] mt-3">
            ¡Sin pedidos pendientes de liquidación!
          </h3>
          <p className="text-xs text-[#5b403d] mt-1 max-w-md">
            Todas las comandas para llevar han sido cobradas o procesadas debidamente en caja.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-xl border-2 border-amber-400 shadow-xs flex flex-col justify-between overflow-hidden transition-all hover:shadow-md relative"
            >
              <div className="h-1.5 bg-amber-500 w-full"></div>

              <div className="p-4 flex flex-col gap-3">
                {/* Header card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl font-bold text-[#af101a]">
                        {ord.ticketNumber}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-[#141b2b] mt-1">
                      {ord.customerName?.trim() ? ord.customerName : 's/n'}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono text-lg font-bold text-[#af101a]">
                      Bs. {ord.total.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      <span>{ord.elapsedTime}</span>
                    </span>
                  </div>
                </div>

                {/* Items breakdown */}
                <div className="bg-[#f1f3ff] rounded-lg p-3 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between font-bold text-[#141b2b]">
                    <span>{ord.itemsSummary}</span>
                    <span className="font-mono">Bs. {ord.total.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 pl-2 text-[11px] text-[#5b403d] italic border-l-2 border-[#af101a]/30">
                    {ord.modifiers.map((m, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        • {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Badge alert */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="bg-[#ffdad6] text-[#ba1a1a] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    ESTADO: PAGO PENDIENTE
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-3 bg-[#f9f9ff] border-t border-[#e1e8fd] flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenSettleModal(ord)}
                  className="flex-1 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
                  <span>Cobrar Pedido (F4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCancelOrder(ord.id)}
                  className="p-2 bg-[#ffdad6]/50 hover:bg-[#ffdad6] text-[#ba1a1a] rounded-lg transition-colors cursor-pointer"
                  title="Cancelar comanda sin penalización contable"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Confirmación de Despacho con Pago Pendiente */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-[#293040]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#e1e8fd]">
            <div className="bg-[#af101a] px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">pending_actions</span>
                <div>
                  <div className="font-bold text-base leading-tight uppercase">
                    PAGO PENDIENTE (Solo LLEVAR / Delivery)
                  </div>
                  <div className="font-mono text-[11px] opacity-90">
                    Confirmación de Despacho Anticipado a Cocina • FR-011
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#e1e8fd]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-[#af101a]">#109 LLEVAR</span>
                  <span className="bg-amber-100 text-amber-900 font-mono text-xs px-2 py-0.5 rounded font-bold">
                    ESTADO: PREPARING
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-[#5b403d] uppercase">Total por Cobrar</span>
                  <div className="font-mono text-base font-bold text-[#af101a]">Bs. 72.00</div>
                </div>
              </div>

              <div className="bg-[#f1f3ff] p-3 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-[#af101a] text-[26px]">shopping_bag</span>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#141b2b]">Pedido para Llevar</span>
                  <span className="text-[11px] text-[#5b403d]">Cliente: s/n • Retiro en mostrador</span>
                </div>
              </div>

              {/* Warning box */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2 text-amber-950">
                <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">warning</span>
                <p className="text-[11px] leading-relaxed">
                  <strong>Advertencia de Control Operativo:</strong> La comanda se despachará a cocina para <strong>preparación y fritura inmediata</strong>. El inventario físico y los ingresos de caja se liquidan al registrar el cobro final en la ventanilla.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e1e8fd]">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg cursor-pointer"
                >
                  Volver al POS (Esc)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    showToastNotification(
                      'Comanda #109 enviada a cocina',
                      'Preparación inmediata iniciada. Recuerde liquidar al entregar.',
                      'outdoor_grill'
                    );
                  }}
                  className="px-5 py-2 bg-[#af101a] hover:bg-[#8e0c15] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">outdoor_grill</span>
                  Confirmar Pedido a Cocina (F2)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Liquidación de Cobro (POST /orders/{id}/pay) */}
      {settleOrder && (
        <div className="fixed inset-0 z-50 bg-[#293040]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#e1e8fd]">
            <div className="bg-[#f1f3ff] px-6 py-4 flex items-center justify-between border-b border-[#e1e8fd]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#af101a] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[22px]">payments</span>
                </div>
                <div>
                  <div className="font-bold text-base text-[#141b2b]">
                    Liquidación de Cobro: Comanda {settleOrder.ticketNumber}
                  </div>
                  <div className="font-mono text-xs text-[#5b403d]">
                    Comanda Pendiente • {settleOrder.elapsedTime}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseSettleModal}
                className="w-8 h-8 rounded-full hover:bg-white text-[#5b403d] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {/* Total Banner (Monto a cobrar & ítems registrados) */}
              <div className="flex items-center justify-between bg-[#f1f3ff] p-4 rounded-xl border border-[#e1e8fd]">
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-[#5b403d] uppercase font-semibold">
                    Monto Total a Cobrar:
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl text-[#af101a] font-bold leading-tight">
                    Bs. {settleOrder.total.toFixed(2)}
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="font-mono text-xs bg-[#fec330] text-[#6f5100] px-2.5 py-0.5 rounded-full font-bold uppercase">
                    {settleOrder.orderType === 'MESA' ? 'EN MESA' : settleOrder.orderType === 'DELIVERY' ? 'DELIVERY' : 'PARA LLEVAR'}
                  </span>
                  <span className="text-xs text-[#5b403d] mt-1 font-medium">
                    {(() => {
                      const match = settleOrder.itemsSummary?.match(/^(\d+)x/);
                      const count = match ? match[1] : '1';
                      return `${count} ${count === '1' ? 'ítem registrado' : 'ítems registrados'}`;
                    })()}
                  </span>
                </div>
              </div>
              {/* Customer Selector Bar (Matching POS Sales) */}
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
                        ({selectedCustomer.ci && selectedCustomer.ci !== '0' ? `CI: ${selectedCustomer.ci}` : selectedCustomer.nit ? `NIT: ${selectedCustomer.nit}` : 'S/N'})
                      </span>
                      <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                    </button>
                  </div>

                  {onNavigateToClients && (
                    <button
                      type="button"
                      onClick={onNavigateToClients}
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
                        onClick={() => {
                          setSelectedCustomer({
                            id: 'c-sn',
                            ci: '0',
                            fullName: 'Cliente S/N',
                            phone: '-',
                          });
                          setShowCustomerDropdown(false);
                        }}
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
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setShowCustomerDropdown(false);
                          }}
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

              {/* Invoicing info check */}
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[#141b2b] select-none font-bold">
                <input
                  type="checkbox"
                  checked={withInvoice}
                  onChange={(e) => setWithInvoice(e.target.checked)}
                  className="accent-[#af101a] rounded w-4 h-4 cursor-pointer"
                />
                <span>
                  Facturar con datos del cliente:{' '}
                  <strong className="text-[#af101a]">
                    {selectedCustomer.fullName} ({selectedCustomer.nit ? `NIT ${selectedCustomer.nit}` : selectedCustomer.ci && selectedCustomer.ci !== '0' ? `CI ${selectedCustomer.ci}` : 'S/N'})
                  </strong>
                </span>
              </label>

              {/* Payment Method Tabs */}
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-[#5b403d] uppercase font-bold">
                  Método de Pago:
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#e9edff] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPayMethod('EFECTIVO')}
                    className={`py-2 rounded-md font-mono text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payMethod === 'EFECTIVO'
                        ? 'bg-white text-[#af101a] shadow-xs'
                        : 'text-[#5b403d] hover:text-[#141b2b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">attach_money</span>
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('QR')}
                    className={`py-2 rounded-md font-mono text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      payMethod === 'QR'
                        ? 'bg-white text-[#af101a] shadow-xs'
                        : 'text-[#5b403d] hover:text-[#141b2b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
                    QR / Tarjeta Simple
                  </button>
                </div>
              </div>

              {payMethod === 'EFECTIVO' ? (
                <div className="flex flex-col gap-3 bg-[#f1f3ff] p-3.5 rounded-xl border border-[#e1e8fd]">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs font-bold text-[#141b2b]">
                      Efectivo Recibido:
                    </label>
                    <div className="relative w-40">
                      <span className="absolute left-3 top-2 font-mono text-xs font-bold text-[#5b403d]">
                        Bs.
                      </span>
                      <input
                        type="number"
                        step="1.00"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-1.5 bg-white text-[#141b2b] font-mono text-base font-bold rounded-lg text-right border border-[#e1e8fd] focus:outline-none focus:border-[#af101a] focus:ring-2 focus:ring-[#af101a]/10"
                      />
                    </div>
                  </div>

                  {/* Quick chips */}
                  <div className="flex items-center gap-1.5 justify-end flex-wrap">
                    <span className="font-mono text-xs text-[#5b403d] mr-1">Rápido:</span>
                    <button
                      type="button"
                      onClick={() => setCashReceived(settleOrder.total)}
                      className="px-2.5 py-1 bg-white hover:bg-[#e9edff] rounded border border-[#e1e8fd] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
                    >
                      Exacto
                    </button>
                    <button
                      type="button"
                      onClick={() => setCashReceived(50)}
                      className="px-2.5 py-1 bg-white hover:bg-[#e9edff] rounded border border-[#e1e8fd] font-mono text-xs font-bold text-[#141b2b] cursor-pointer"
                    >
                      50 Bs
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
                    {cashReceived < settleOrder.total ? (
                      <span className="font-mono text-sm font-bold text-[#ba1a1a]">
                        Faltante: Bs. {(settleOrder.total - cashReceived).toFixed(2)}
                      </span>
                    ) : (
                      <span className="font-mono text-base font-bold text-[#15803d]">
                        Bs. {(cashReceived - settleOrder.total).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 bg-[#f1f3ff] rounded-xl border border-[#e1e8fd] gap-2">
                  <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shadow-xs border border-[#e1e8fd]">
                    <span className="material-symbols-outlined text-[#141b2b] text-[80px]">
                      qr_code_2
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#5b403d] font-semibold">
                    Escanee con Simple Móvil / BCP / BNB
                  </span>
                  <span className="font-mono text-sm font-bold text-[#af101a]">
                    Total: Bs. {settleOrder.total.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer: Solo el botón de Confirmar Cobro y Liquidar */}
            <div className="p-4 sm:p-5 bg-[#f1f3ff] border-t border-[#e1e8fd]">
              <button
                type="button"
                disabled={payMethod === 'EFECTIVO' && cashReceived < settleOrder.total}
                onClick={handleExecutePayment}
                className="w-full py-3 bg-[#d32f2f] hover:bg-[#af101a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">receipt</span>
                Confirmar Cobro y Liquidar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
