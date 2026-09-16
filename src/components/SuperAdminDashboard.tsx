import React, { useState } from 'react';
import { CommonTable, ColumnDef } from '../commonComponents/CommonTable';
import { Branch } from '../types';
import { BRAND_COLORS } from '../config/colors';

interface SuperAdminDashboardProps {
  onNavigate: (screen: any) => void;
}

const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'b-01',
    code: 'SCZ-001',
    name: 'Sucursal Central - Av. Monseñor Rivero',
    subtitle: 'Zona Norte - Primer Anillo',
    address: 'Av. Monseñor Rivero #420, Santa Cruz de la Sierra',
    city: 'Santa Cruz',
    adminName: 'Carlos Mendoza',
    adminEmail: 'carlos.mendoza@wonderchicken.com',
    terminalsCount: 4,
    active: true,
    syncDb: true,
  },
  {
    id: 'b-02',
    code: 'SCZ-002',
    name: 'Sucursal Equipetrol - Av. San Martín',
    subtitle: 'Zona Gastronómica Equipetrol',
    address: 'Av. San Martín esq. Calle 7 Este',
    city: 'Santa Cruz',
    adminName: 'Paola Siles',
    adminEmail: 'paola.siles@wonderchicken.com',
    terminalsCount: 3,
    active: true,
    syncDb: true,
  },
  {
    id: 'b-03',
    code: 'LPZ-001',
    name: 'Sucursal Calacoto - Av. Ballivián',
    subtitle: 'Zona Sur - La Paz',
    address: 'Calle 18 de Calacoto, Edif. Torre Empresarial',
    city: 'La Paz',
    adminName: 'Mauricio Torrico',
    adminEmail: 'm.torrico@wonderchicken.com',
    terminalsCount: 3,
    active: true,
    syncDb: true,
  },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onNavigate }) => {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);

  const columns: ColumnDef<Branch>[] = [
    {
      id: 'code',
      header: 'Código',
      render: (row) => (
        <span className="font-mono font-bold text-[#af101a] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {row.code}
        </span>
      ),
    },
    {
      id: 'name',
      header: 'Sucursal / Ubicación',
      render: (row) => (
        <div>
          <div className="font-bold text-[#141b2b]">{row.name}</div>
          <div className="text-[11px] text-[#5b403d]">{row.address}</div>
        </div>
      ),
    },
    {
      id: 'city',
      header: 'Ciudad',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#141b2b]">
          {row.city}
        </span>
      ),
    },
    {
      id: 'admin',
      header: 'Administrador Responsable',
      render: (row) => (
        <div>
          <div className="font-medium text-xs text-[#141b2b]">{row.adminName}</div>
          <div className="text-[10px] font-mono text-[#5b403d]">{row.adminEmail}</div>
        </div>
      ),
    },
    {
      id: 'terminals',
      header: 'Terminales',
      align: 'center',
      render: (row) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-[#f1f3ff] rounded font-bold">
          {row.terminalsCount} Cajas
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Estado Nodo',
      align: 'center',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          Activa &amp; Sincronizada
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <button
          type="button"
          onClick={() => onNavigate('branch-admin')}
          className="px-2.5 py-1 bg-[#f1f3ff] hover:bg-[#d32f2f] hover:text-white text-[#141b2b] font-mono text-xs font-bold rounded transition-colors cursor-pointer"
        >
          Gestionar
        </button>
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
              <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#141b2b] leading-tight">
                Consola Global de Superadministración
              </h1>
              <p className="text-xs text-[#5b403d]">
                Control Corporativo Multisede • Auditoría de Ventas e Infraestructura
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('sucursales')}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">storefront</span>
            Gestión de Sucursales
          </button>

          <button
            type="button"
            onClick={() => onNavigate('catalogo-y-variantes')}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            Catálogo Global
          </button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5b403d]">
            <span className="font-mono text-xs uppercase font-bold">Ventas Globales Hoy</span>
            <span className="material-symbols-outlined text-[#15803d]">trending_up</span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-[#141b2b]">Bs. 48,920.00</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
              +14.2% vs. mismo día semana anterior
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#5b403d]">
            <span className="font-mono text-xs uppercase font-bold">Sedes Conectadas</span>
            <span className="material-symbols-outlined text-[#005c8d]">storefront</span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-2xl font-bold text-[#141b2b]">{branches.length} / {branches.length}</div>
            <div className="text-[11px] text-[#5b403d] font-medium mt-0.5">
              100% de terminales en sincronía atómica
            </div>
          </div>
        </div>
      </div>

      {/* Multibranch CommonTable */}
      <CommonTable
        title="Red de Sucursales Wonder Chicken"
        rows={branches}
        columns={columns}
        showSearch={true}
        searchPlaceholder="Buscar por código, sede, ciudad o administrador..."
      />
    </div>
  );
};
