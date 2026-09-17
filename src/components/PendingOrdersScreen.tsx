import React, { useState } from 'react';
import { PendingOrder, Customer } from '../types';
import { INITIAL_CUSTOMERS } from '../data/mockData';
import { AppModal } from '../commonComponents/AppModal';
import { PaymentModal } from './PaymentModal';

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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [toast, setToast] = useState<{ title: string; message: string; icon: string } | null>(null);

  const showToastNotification = (title: string, message: string, icon = 'check_circle') => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenSettleModal = (order: PendingOrder) => {
    setSettleOrder(order);

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
  };

  const handleExecutePayment = (
    method: 'EFECTIVO' | 'QR' | 'PENDIENTE',
    _cashReceived: number,
    _change: number,
    customerToCharge?: Customer,
    invoiceFlag?: boolean
  ) => {
    if (!settleOrder) return;
    const orderId = settleOrder.id;
    const total = settleOrder.total;
    const finalCustomer = customerToCharge || selectedCustomer;
    const paymentMethod = method === 'QR' ? 'QR' : 'EFECTIVO';
    const isWithInvoice = invoiceFlag !== undefined ? invoiceFlag : false;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (onOrderSettled) {
      onOrderSettled(orderId, total, finalCustomer, paymentMethod);
    }
    const idDisplay = finalCustomer.nit ? `NIT: ${finalCustomer.nit}` : finalCustomer.ci && finalCustomer.ci !== '0' ? `CI: ${finalCustomer.ci}` : 'S/N';
    showToastNotification(
      isWithInvoice ? `Comanda #${orderId} Facturada y Cobrada` : `Comanda #${orderId} Cobrada Exitosamente`,
      isWithInvoice
        ? `Factura emitida a ${finalCustomer.fullName} (${idDisplay}). Inventario descontado.`
        : 'Inventario descontado atómicamente y arqueo registrado en caja.',
      'receipt'
    );
    handleCloseSettleModal();
  };

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
      <AppModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        icon="pending_actions"
        title="PAGO PENDIENTE (Solo LLEVAR / Delivery)"
        description="Confirmación de Despacho Anticipado a Cocina • FR-011"
        maxWidth="lg"
        onConfirm={() => {
          setShowConfirmModal(false);
          showToastNotification(
            'Comanda #109 enviada a cocina',
            'Preparación inmediata iniciada. Recuerde liquidar al entregar.',
            'outdoor_grill'
          );
        }}
        confirmLabel="Confirmar Pedido a Cocina (F2)"
        confirmIcon="outdoor_grill"
        showCancel={true}
        cancelLabel="Volver al POS (Esc)"
      >
        <div className="flex flex-col gap-4 text-xs">
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
        </div>
      </AppModal>

      {/* MODAL 2: Liquidación de Cobro (reutilizando PaymentModal unificado con asignación de cliente) */}
      {settleOrder && (
        <PaymentModal
          isOpen={Boolean(settleOrder)}
          onClose={handleCloseSettleModal}
          icon="payments"
          title={`Liquidación de Cobro: Comanda ${settleOrder.ticketNumber}`}
          description={`Comanda Pendiente • ${settleOrder.elapsedTime}`}
          confirmLabel="Confirmar Cobro y Liquidar"
          cancelLabel="Cerrar"
          total={settleOrder.total}
          ticketNumber={settleOrder.ticketNumber}
          orderType={settleOrder.orderType}
          customer={selectedCustomer}
          allowCustomerSelection={true}
          customers={customers}
          onNavigateToClients={onNavigateToClients}
          onCustomerChange={(cust) => setSelectedCustomer(cust)}
          itemCount={(() => {
            const match = settleOrder.itemsSummary?.match(/^(\d+)x/);
            return match ? parseInt(match[1], 10) : 1;
          })()}
          allowPendingPayment={false}
          defaultWithInvoice={false}
          onConfirmPayment={handleExecutePayment}
        />
      )}
    </div>
  );
};
