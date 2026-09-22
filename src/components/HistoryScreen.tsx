import React, { useState } from 'react';
import { CompletedOrder } from '../types';
import { AppModal } from '../commonComponents/AppModal';

interface HistoryScreenProps {
  orders: CompletedOrder[];
  onBackToPOS: () => void;
  onMarkPaid?: (ticketNumber: string) => void;
}

const formatComandaDate = (timestamp?: string): string => {
  if (!timestamp) return '04/05/2024      20:46';
  // If it already has DD/MM/YYYY and time
  const matchFull = timestamp.match(/(\d{2}\/\d{2}\/\d{4})\s*(\d{1,2}:\d{2})/);
  if (matchFull) {
    return `${matchFull[1]}      ${matchFull[2]}`;
  }
  const timeMatch = timestamp.match(/(\d{1,2}:\d{2})/);
  const timeStr = timeMatch ? timeMatch[1] : '20:46';
  return `04/05/2024      ${timeStr}`;
};

const getComandaTicketHeader = (order: CompletedOrder): string => {
  const ticketNum = order.ticketNumber.replace('#', '');
  let destination = 'LLEVAR';
  if (order.orderType === 'MESA') {
    if (order.tableNumber && order.tableNumber.trim()) {
      const cleanTable = order.tableNumber.trim().toUpperCase();
      destination = cleanTable.startsWith('MESA') ? cleanTable : `MESA ${cleanTable}`;
    } else {
      destination = 'MESA';
    }
  } else {
    destination = 'LLEVAR';
  }
  return `TICKET ${ticketNum} - ${destination}`;
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  orders,
  onBackToPOS,
  onMarkPaid,
}) => {
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (o.tableNumber && o.tableNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[26px]">receipt_long</span>
            <h1 className="text-lg sm:text-xl font-bold text-[#141b2b]">
              Historial de Pedidos y Comandas
            </h1>
          </div>
          <p className="text-xs text-[#5b403d] mt-1">
            Auditoría de tickets emitidos, comprobantes de pago y reimpresión de comandas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[220px]">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ticket o cliente..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#f1f3ff] rounded-lg text-xs border border-[#e1e8fd] outline-none"
            />
          </div>

          <button
            type="button"
            onClick={onBackToPOS}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Volver a POS
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#e1e8fd] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#141b2b]">
            <thead className="bg-[#f1f3ff] text-[#5b403d] font-mono uppercase tracking-wider border-b border-[#e1e8fd]">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Hora</th>
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Ítems</th>
                <th className="py-3 px-4">Total (Bs.)</th>
                <th className="py-3 px-4">Pago</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3ff]">
              {filteredOrders.map((ord) => (
                <tr key={ord.ticketNumber} className="hover:bg-[#f9f9ff] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#af101a]">
                    {ord.ticketNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#5b403d] whitespace-pre">
                    {formatComandaDate(ord.timestamp)}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold">
                    {ord.orderType === 'MESA' ? ord.tableNumber || 'Mesa' : 'Llevar'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#141b2b]">{ord.customer.fullName}</span>
                      <span className="font-mono text-[10px] text-[#5b403d]">
                        CI: {ord.customer.ci || ord.customer.nit || 'S/N'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#5b403d]">
                    {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-sm text-[#af101a]">
                    Bs. {ord.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        ord.paymentMethod === 'EFECTIVO'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : ord.paymentMethod === 'QR'
                          ? 'bg-[#e0f2fe] text-[#0369a1]'
                          : 'bg-[#fee2e2] text-[#ba1a1a]'
                      }`}
                    >
                      {ord.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        ord.status === 'ENTREGADO'
                          ? 'bg-[#f1f3ff] text-[#5b403d]'
                          : ord.status === 'LISTO'
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : 'bg-[#ffdad6] text-[#ba1a1a]'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded cursor-pointer"
                        title="Ver Comanda"
                      >
                        Comanda
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Reimprimiendo ticket ${ord.ticketNumber}`)}
                        className="p-1 hover:bg-[#f1f3ff] text-[#5b403d] rounded cursor-pointer"
                        title="Reimprimir Comanda"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details / Receipt Modal */}
      {selectedOrder && (
        <AppModal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          icon="receipt_long"
          title={`Ticket Comanda ${selectedOrder.ticketNumber}`}
          description={`Sucursal Central • Caja 01 • ${formatComandaDate(selectedOrder.timestamp)}`}
          maxWidth="sm"
          onConfirm={() => {
            showToast(`Imprimiendo copia del ticket ${selectedOrder.ticketNumber}`);
            setSelectedOrder(null);
          }}
          confirmLabel="Imprimir Ticket"
          confirmIcon="print"
          showCancel={true}
          cancelLabel="Cerrar"
        >
          {/* Thermal Ticket Simulation */}
          <div className="flex flex-col items-center text-center border-b border-dashed border-[#e2e8f0] pb-4">
            <span className="font-bold text-base text-[#141b2b]">WONDER CHICKEN</span>
            <span className="font-mono text-[11px] text-[#5b403d]">Sucursal Central • Caja 01</span>
            <span className="font-mono text-xs font-bold text-[#141b2b] mt-1">
              {getComandaTicketHeader(selectedOrder)}
            </span>
            <span className="font-mono text-[11px] text-[#141b2b] whitespace-pre">
              FECHA: {formatComandaDate(selectedOrder.timestamp)}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-xs font-mono border-b border-dashed border-[#e2e8f0] pb-3">
            <div><strong>Cliente:</strong> {selectedOrder.customer.fullName}</div>
            <div><strong>NIT/CI:</strong> {selectedOrder.customer.ci || selectedOrder.customer.nit || 'S/N'}</div>
            <div><strong>Cajera:</strong> {selectedOrder.cashier}</div>
          </div>

          <div className="flex flex-col gap-2 text-xs font-mono border-b border-dashed border-[#e2e8f0] pb-3">
            {selectedOrder.items.map((it, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-bold">Bs. {(it.unitPrice * it.quantity).toFixed(2)}</span>
                </div>
                {it.config?.notes && (
                  <span className="text-[10px] text-[#5b403d] pl-2 whitespace-pre-line">
                    {it.config.notes}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Información clara, plana y sin muchos colores solo texto (sin recuadro de color ni filas de efectivo/cambio) */}
          <div className="flex flex-col gap-1.5 text-xs font-mono pt-1 text-[#141b2b]">
            <div className="flex justify-between font-bold text-sm text-[#141b2b]">
              <span>TOTAL:</span>
              <span>Bs. {selectedOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#141b2b]">
              <span>Método de Pago:</span>
              <span>{selectedOrder.paymentMethod}</span>
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
};
