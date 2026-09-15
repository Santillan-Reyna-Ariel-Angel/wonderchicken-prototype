import React, { useState } from 'react';
import { PendingOrder } from '../types';

interface PendingOrdersScreenProps {
  onBackToPOS: () => void;
  onOrderSettled?: (ticketId: string, amount: number) => void;
}

const INITIAL_PENDING_ORDERS: PendingOrder[] = [
  {
    id: '103',
    ticketNumber: '#103',
    orderType: 'DELIVERY',
    customerName: 'Marco Ortega',
    deliveryDetails: 'Delivery Ya • Repartidor #14',
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
    orderType: 'DELIVERY',
    customerName: 'PedidosYa - Moto 4',
    deliveryDetails: 'Repartidor esperando en barra',
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
    deliveryDetails: 'Retira en ventanilla 2',
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
}) => {
  const [orders, setOrders] = useState<PendingOrder[]>(INITIAL_PENDING_ORDERS);
  const [filter, setFilter] = useState<'all' | 'delivery' | 'takeout'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [settleOrder, setSettleOrder] = useState<PendingOrder | null>(null);
  const [payMethod, setPayMethod] = useState<'EFECTIVO' | 'QR'>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState(100.00);
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
  };

  const handleCloseSettleModal = () => {
    setSettleOrder(null);
  };

  const handleExecutePayment = () => {
    if (!settleOrder) return;
    const orderId = settleOrder.id;
    const total = settleOrder.total;

    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (onOrderSettled) {
      onOrderSettled(orderId, total);
    }
    showToastNotification(
      `Comanda #${orderId} Cobrada Exitosamente`,
      'Inventario descontado atómicamente y arqueo registrado en caja.',
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
    const matchesFilter =
      filter === 'all' ||
      (filter === 'delivery' && ord.orderType === 'DELIVERY') ||
      (filter === 'takeout' && ord.orderType === 'LLEVAR');

    const matchesSearch =
      ord.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.deliveryDetails.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
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
            onClick={() => setShowConfirmModal(true)}
            className="px-3.5 py-2 bg-[#fec330] hover:bg-[#f8bd2a] text-[#6f5100] font-mono text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_alert</span>
            Despachar Anticipado (F2)
          </button>
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
        <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-lg border border-[#e1e8fd]">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-white text-[#af101a] shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('delivery')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer ${
              filter === 'delivery' ? 'bg-white text-[#af101a] shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Delivery App ({orders.filter((o) => o.orderType === 'DELIVERY').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('takeout')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer ${
              filter === 'takeout' ? 'bg-white text-[#af101a] shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Mostrador Llevar ({orders.filter((o) => o.orderType === 'LLEVAR').length})
          </button>
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
            Todas las comandas de mostrador y delivery han sido cobradas o procesadas debidamente en caja.
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
                      <span className="bg-amber-100 text-amber-900 font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                        {ord.orderType}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-[#141b2b] mt-1">
                      {ord.customerName}
                    </div>
                    <div className="text-xs text-[#5b403d] flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[14px]">moped</span>
                      <span>{ord.deliveryDetails}</span>
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
                  <span className="text-[11px] text-[#5b403d]">FR-011 Despacho Anticipado</span>
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
                <span className="material-symbols-outlined text-[#af101a] text-[26px]">two_wheeler</span>
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#141b2b]">Repartidor Delivery Ya #22</span>
                  <span className="text-[11px] text-[#5b403d]">Móvil asignado • Retiro en mostrador express</span>
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
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#e1e8fd]">
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
                    {settleOrder.customerName} • {settleOrder.deliveryDetails}
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

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left col */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <div>
                  <label className="font-mono text-[11px] text-[#5b403d] uppercase font-bold block mb-1">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayMethod('EFECTIVO')}
                      className={`py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        payMethod === 'EFECTIVO'
                          ? 'bg-[#d32f2f] text-white shadow-xs'
                          : 'bg-[#f1f3ff] text-[#141b2b] hover:bg-[#e9edff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">attach_money</span>
                      EFECTIVO
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayMethod('QR')}
                      className={`py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        payMethod === 'QR'
                          ? 'bg-[#d32f2f] text-white shadow-xs'
                          : 'bg-[#f1f3ff] text-[#141b2b] hover:bg-[#e9edff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                      PAGO SIMPLE QR
                    </button>
                  </div>
                </div>

                {payMethod === 'EFECTIVO' ? (
                  <div className="flex flex-col gap-2 bg-[#f9f9ff] p-3 rounded-lg border border-[#e1e8fd]">
                    <label className="font-mono text-xs text-[#5b403d] font-bold">
                      Monto Recibido en Gaveta:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-mono text-xs font-bold text-[#5b403d]">
                        Bs.
                      </span>
                      <input
                        type="number"
                        step="0.5"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                        className="w-full pl-10 pr-3 py-2 bg-white text-base font-mono font-bold text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
                      />
                    </div>

                    {/* Quick chips */}
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => setCashReceived(settleOrder.total)}
                        className="py-1 bg-white hover:bg-[#f1f3ff] text-[11px] font-mono font-bold rounded border border-[#e1e8fd] cursor-pointer"
                      >
                        Exacto
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashReceived(50)}
                        className="py-1 bg-white hover:bg-[#f1f3ff] text-[11px] font-mono font-bold rounded border border-[#e1e8fd] cursor-pointer"
                      >
                        Bs. 50
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashReceived(100)}
                        className="py-1 bg-white hover:bg-[#f1f3ff] text-[11px] font-mono font-bold rounded border border-[#e1e8fd] cursor-pointer"
                      >
                        Bs. 100
                      </button>
                      <button
                        type="button"
                        onClick={() => setCashReceived(200)}
                        className="py-1 bg-white hover:bg-[#f1f3ff] text-[11px] font-mono font-bold rounded border border-[#e1e8fd] cursor-pointer"
                      >
                        Bs. 200
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] text-center gap-2">
                    <div className="w-28 h-28 bg-white p-2 rounded-lg border border-[#e1e8fd] flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[80px] text-[#141b2b]">qr_code_2</span>
                    </div>
                    <span className="font-bold text-xs text-[#141b2b]">Escanee con Simple Móvil o Banco</span>
                    <span className="font-mono text-[11px] text-[#5b403d]">Acreditación inmediata garantizada</span>
                  </div>
                )}
              </div>

              {/* Right col: ledger */}
              <div className="md:col-span-5 flex flex-col justify-between bg-[#f1f3ff] p-4 rounded-xl border border-[#e1e8fd]">
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-[11px] text-[#5b403d] uppercase font-bold tracking-wider">
                    Resumen de Liquidación
                  </span>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex justify-between text-[#5b403d]">
                      <span>Total a Cobrar:</span>
                      <span className="font-mono font-bold text-[#141b2b]">
                        Bs. {settleOrder.total.toFixed(2)}
                      </span>
                    </div>
                    {payMethod === 'EFECTIVO' && (
                      <>
                        <div className="flex justify-between text-[#5b403d]">
                          <span>Efectivo Recibido:</span>
                          <span className="font-mono font-bold text-[#141b2b]">
                            Bs. {cashReceived.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-[#15803d] pt-2 border-t border-[#e1e8fd]">
                          <span>Cambio a Entregar:</span>
                          <span className="font-mono">
                            Bs. {Math.max(0, cashReceived - settleOrder.total).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-start gap-1.5 mt-2">
                    <span className="material-symbols-outlined text-emerald-700 text-[16px] mt-0.5">
                      check_circle
                    </span>
                    <p className="text-[11px] text-emerald-900 leading-tight">
                      Al confirmar el pago: Se descontará el inventario en tiempo real y se emitirá el comprobante fiscal.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  className="w-full mt-4 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  Registrar Cobro (F4)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
