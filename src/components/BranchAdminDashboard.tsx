import React from 'react';
import { CommonTable, ColumnDef } from '../commonComponents/CommonTable';
import { useShiftsStore } from '../features/shifts/stores/shifts.store';
import { useOrdersStore } from '../features/orders/stores/orders.store';
import { ScreenType } from '../types';

interface BranchAdminDashboardProps {
  onNavigate: (screen: ScreenType) => void;
}

interface ShiftSummary {
  cashier: string;
  terminal: string;
  period: 'MAÑANA' | 'NOCHE';
  openedAt: string;
  fund: number;
  sales: number;
  status: 'ABIERTO' | 'CERRADO';
}

const DEMO_SHIFTS: ShiftSummary[] = [
  {
    cashier: 'Roxana Rodríguez',
    terminal: 'Caja 01',
    period: 'MAÑANA',
    openedAt: '08:30',
    fund: 150.0,
    sales: 1240.0,
    status: 'ABIERTO',
  },
  {
    cashier: 'Carla Melgar',
    terminal: 'Caja 02',
    period: 'MAÑANA',
    openedAt: '09:00',
    fund: 150.0,
    sales: 980.0,
    status: 'ABIERTO',
  },
  {
    cashier: 'Marlene Paz',
    terminal: 'Caja 01',
    period: 'NOCHE',
    openedAt: 'Ayer 16:00',
    fund: 150.0,
    sales: 2450.0,
    status: 'CERRADO',
  },
];

export const BranchAdminDashboard: React.FC<BranchAdminDashboardProps> = ({ onNavigate }) => {
  const { shift } = useShiftsStore();
  const { kdsTickets, completedOrders } = useOrdersStore();

  const pendingPaymentTickets = kdsTickets.filter((t) => t.isPendingPayment);

  const columns: ColumnDef<ShiftSummary>[] = [
    {
      id: 'terminal',
      header: 'Terminal',
      render: (row) => (
        <span className="font-mono font-bold text-[#141b2b] bg-[#f1f3ff] px-2 py-0.5 rounded">
          {row.terminal}
        </span>
      ),
    },
    {
      id: 'cashier',
      header: 'Cajera Asignada',
      render: (row) => (
        <span className="font-semibold text-xs text-[#141b2b]">{row.cashier}</span>
      ),
    },
    {
      id: 'period',
      header: 'Período',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#b45309]">
          {row.period}
        </span>
      ),
    },
    {
      id: 'openedAt',
      header: 'Hora Apertura',
      field: 'openedAt',
    },
    {
      id: 'fund',
      header: 'Fondo Inicial',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs">Bs. {row.fund.toFixed(2)}</span>
      ),
    },
    {
      id: 'sales',
      header: 'Ventas Registradas',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-[#15803d]">
          Bs. {row.sales.toFixed(2)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      align: 'center',
      render: (row) => (
        <span
          className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
            row.status === 'ABIERTO'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#af101a] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[22px]">storefront</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#141b2b] leading-tight">
                Panel de Administración de Sucursal
              </h1>
              <p className="text-xs text-[#5b403d]">
                Sucursal Central • Monitoreo de Operaciones, Catálogo y Turnos
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('catalogo-y-variantes')}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            Catálogo &amp; Variantes
          </button>
          <button
            type="button"
            onClick={() => onNavigate('control-de-turnos-y-cajas')}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Control de Turnos
          </button>
          <button
            type="button"
            onClick={() => onNavigate('usuarios-y-personal')}
            className="px-3.5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            Gestionar Personal
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5b403d]">
            <span className="font-mono text-xs uppercase font-bold">Ventas Turno Actual</span>
            <span className="material-symbols-outlined text-[#15803d]">payments</span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-[#141b2b]">Bs. 2,220.00</div>
            <div className="text-[11px] text-[#5b403d] mt-0.5">
              Fondo en gavetas: Bs. 300.00
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5b403d]">
            <span className="font-mono text-xs uppercase font-bold">Comandas en Cocina (KDS)</span>
            <span className="material-symbols-outlined text-[#af101a]">outdoor_grill</span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-[#af101a]">{kdsTickets.length} activas</div>
            <div className="text-[11px] text-[#5b403d] mt-0.5">
              Tiempo promedio línea: 8.5 min
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5b403d]">
            <span className="font-mono text-xs uppercase font-bold">Pago Pendiente [FR-011]</span>
            <span className="material-symbols-outlined text-[#b45309]">pending_actions</span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-[#b45309]">
              {pendingPaymentTickets.length} por cobrar
            </div>
            <div className="text-[11px] text-[#5b403d] mt-0.5">
              Llevar / Delivery anticipado
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5b403d]">
            <span className="font-mono text-xs uppercase font-bold">Estado de Turno</span>
            <span className="material-symbols-outlined text-[#795900]">wb_sunny</span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-xl font-bold text-[#141b2b]">
              Turno {shift.shiftPeriod}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              Caja {shift.cashRegisterId} • {shift.cashierName}
            </div>
          </div>
        </div>
      </div>

      {/* Shifts CommonTable */}
      <CommonTable
        title="Arqueo y Estado de Cajas en Sucursal"
        rows={DEMO_SHIFTS}
        columns={columns}
      />
    </div>
  );
};
