import React, { useState, useMemo } from 'react';
import Chip from '@mui/material/Chip';
import { CompletedOrder } from '../types';
import { AppModal } from '../commonComponents/AppModal';
import { MuiDatePicker } from '../commonComponents/MuiDatePicker';
import { MuiDataGridTable, TableColumn } from '../commonComponents/MuiDataGridTable';

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
  const [filterDate, setFilterDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredOrders = useMemo(() => {
    if (!filterDate) return orders;
    return orders.filter((o) => {
      const [year, month, day] = filterDate.split('-');
      const formattedDate1 = `${day}/${month}/${year}`;
      const formattedDate2 = filterDate;
      const ts = o.timestamp || '04/05/2024';
      return ts.includes(formattedDate1) || ts.includes(formattedDate2);
    });
  }, [orders, filterDate]);

  const columns = useMemo<TableColumn<CompletedOrder>[]>(() => [
    {
      field: 'ticketNumber',
      headerName: 'Ticket',
      width: 110,
      renderCell: ({ row }) => (
        <span className="font-mono font-bold text-[#af101a] dark:text-[#ef5350]">
          {row.ticketNumber}
        </span>
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Hora',
      width: 150,
      renderCell: ({ row }) => (
        <span className="font-mono text-xs text-[#5b403d] dark:text-[#94a3b8] whitespace-pre">
          {formatComandaDate(row.timestamp)}
        </span>
      ),
    },
    {
      field: 'orderType',
      headerName: 'Servicio',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Chip
          label={row.orderType === 'MESA' ? row.tableNumber || 'Mesa' : 'Llevar'}
          size="small"
          variant={row.orderType === 'MESA' ? 'filled' : 'outlined'}
          color={row.orderType === 'MESA' ? 'primary' : 'default'}
          sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
        />
      ),
    },
    {
      field: 'customer',
      headerName: 'Cliente',
      minWidth: 170,
      flex: 1,
      renderCell: ({ row }) => (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">
            {row.customer.fullName}
          </span>
          <span className="font-mono text-[10px] text-[#5b403d] dark:text-[#94a3b8]">
            CI: {row.customer.ci || row.customer.nit || 'S/N'}
          </span>
        </div>
      ),
    },
    {
      field: 'items',
      headerName: 'Ítems',
      minWidth: 200,
      flex: 1.5,
      renderCell: ({ row }) => (
        <span className="text-xs text-[#5b403d] dark:text-[#cbd5e1] truncate">
          {row.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
        </span>
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 110,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#af101a] dark:text-[#ef5350]">
          Bs. {row.total.toFixed(2)}
        </span>
      ),
    },
    {
      field: 'paymentMethod',
      headerName: 'Pago',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => {
        const isEfectivo = row.paymentMethod === 'EFECTIVO';
        const isQR = row.paymentMethod === 'QR';
        return (
          <Chip
            label={row.paymentMethod}
            size="small"
            color={isEfectivo ? 'success' : isQR ? 'info' : 'error'}
            variant="filled"
            sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => {
        const isEntregado = row.status === 'ENTREGADO';
        const isListo = row.status === 'LISTO';
        return (
          <Chip
            label={row.status}
            size="small"
            color={isListo ? 'success' : isEntregado ? 'default' : 'warning'}
            variant="filled"
            sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setSelectedOrder(row)}
            className="px-2.5 py-1 bg-[#f1f3ff] dark:bg-[#1a233b] hover:bg-[#e9edff] dark:hover:bg-[#263554] text-[#141b2b] dark:text-[#f8fafc] font-mono text-xs font-bold rounded cursor-pointer transition-colors"
            title="Ver Comanda"
          >
            Comanda
          </button>
          <button
            type="button"
            onClick={() => showToast(`Reimprimiendo ticket ${row.ticketNumber}`)}
            className="p-1 hover:bg-[#f1f3ff] dark:hover:bg-[#1f2c4a] text-[#5b403d] dark:text-[#94a3b8] rounded cursor-pointer transition-colors"
            title="Reimprimir Comanda"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
          </button>
        </div>
      ),
    },
  ], []);

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#162036] p-4 sm:p-6 rounded-xl border border-[#e1e8fd] dark:border-[#263554] shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] dark:text-[#ef5350] text-[26px]">receipt_long</span>
            <h1 className="text-lg sm:text-xl font-bold text-[#141b2b] dark:text-[#f8fafc]">
              Historial de Pedidos y Comandas
            </h1>
          </div>
          <p className="text-xs text-[#5b403d] dark:text-[#94a3b8] mt-1">
            Auditoría de tickets emitidos, comprobantes de pago y reimpresión de comandas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* MUI DatePicker Filter */}
          <div className="flex items-center gap-1.5">
            <MuiDatePicker
              label="Filtrar por fecha"
              value={filterDate}
              onChange={setFilterDate}
              maxWidth={180}
              helperText=""
            />
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                title="Limpiar fecha"
                className="p-1.5 rounded-lg text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#1f2c4a] border border-[#e1e8fd] dark:border-[#263554] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onBackToPOS}
            className="px-3.5 py-2 bg-[#f1f3ff] dark:bg-[#1a233b] hover:bg-[#e9edff] dark:hover:bg-[#243050] text-[#141b2b] dark:text-[#f8fafc] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] dark:border-[#263554] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Volver a POS
          </button>
        </div>
      </div>

      {/* Modern Reusable MuiDataGridTable */}
      <MuiDataGridTable<CompletedOrder>
        rows={filteredOrders}
        columns={columns}
        getRowId={(row) => row.ticketNumber}
        header={{
          title: 'Auditoría Central de Comandas',
          badgeText: `${filteredOrders.length} tickets`,
          showSearch: true,
          searchPlaceholder: 'Buscar ticket, cliente o mesa...',
        }}
        pagination={{
          pageSize: 10,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        emptyState={{
          message: 'No se encontraron comandas',
          subMessage: 'Intente ajustar la fecha o el filtro de búsqueda.',
        }}
        rowHeight={60}
        minHeight={490}
      />

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
