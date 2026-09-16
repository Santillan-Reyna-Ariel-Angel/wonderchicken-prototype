import React from 'react';
import { ScreenType, UserRole } from '../types';
import { useShiftsStore } from '../features/shifts/stores/shifts.store';

interface SidebarProps {
  currentScreen: ScreenType;
  currentRole?: UserRole;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  activeKitchenCount?: number;
  pendingOrdersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  currentRole = 'CAJERA',
  onNavigate,
  onLogout,
  activeKitchenCount = 4,
  pendingOrdersCount = 3,
}) => {
  const { shift } = useShiftsStore();

  // Navigation definitions according to role and Navigation Map Nodes
  const getNavSections = () => {
    if (currentRole === 'SUPER_ADMIN') {
      return [
        {
          title: 'Superadministración',
          items: [
            { id: 'super-admin' as ScreenType, label: 'Dashboard Global', icon: 'admin_panel_settings', nodeBadge: 'C', path: '/super-admin' },
            { id: 'sucursales' as ScreenType, label: 'Gestión Sucursales', icon: 'storefront', nodeBadge: 'M', path: '/super-admin/branches', badge: '3 Sedes' },
            { id: 'clientes' as ScreenType, label: 'Clientes Cross-Sucursal', icon: 'group', nodeBadge: 'Q', path: '/branch-admin/customers' },
            { id: 'catalogo-y-variantes' as ScreenType, label: 'Catálogo Global', icon: 'inventory_2', nodeBadge: 'N1', path: '/branch-admin/products' },
            { id: 'control-de-turnos-y-cajas' as ScreenType, label: 'Reportes & Auditoría', icon: 'tune', nodeBadge: 'O', path: '/branch-admin/reports' },
            { id: 'usuarios-y-personal' as ScreenType, label: 'Usuarios y Roles', icon: 'badge', nodeBadge: 'N2', path: '/branch-admin/users' },
          ],
        },
      ];
    }

    if (currentRole === 'ADMIN') {
      return [
        {
          title: 'Administración de Sede',
          items: [
            { id: 'branch-admin' as ScreenType, label: 'Dashboard Sucursal', icon: 'dashboard', nodeBadge: 'D', path: '/branch-admin' },
            { id: 'catalogo-y-variantes' as ScreenType, label: 'Catálogo y Variantes', icon: 'inventory_2', nodeBadge: 'N1', path: '/branch-admin/products' },
            { id: 'usuarios-y-personal' as ScreenType, label: 'Personal de Sucursal', icon: 'badge', nodeBadge: 'N2', path: '/branch-admin/users' },
            { id: 'control-de-turnos-y-cajas' as ScreenType, label: 'Reportes Operativos', icon: 'tune', nodeBadge: 'O', path: '/branch-admin/reports' },
            { id: 'clientes' as ScreenType, label: 'Clientes (Admin FR-019)', icon: 'group', nodeBadge: 'Q', path: '/branch-admin/customers' },
          ],
        },
        {
          title: 'Supervisión Operativa',
          items: [
            { id: 'pos-ventas' as ScreenType, label: 'Terminal POS', icon: 'point_of_sale', nodeBadge: 'F', path: '/cashier/pos' },
            { id: 'historial-de-pedidos' as ScreenType, label: 'Historial de Pedidos', icon: 'receipt_long', nodeBadge: 'J', path: '/cashier/orders' },
            { 
              id: 'pedidos-pendientes' as ScreenType, 
              label: 'Pago Pendiente [FR-011]', 
              icon: 'pending_actions',
              badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined 
            },
          ],
        },
      ];
    }

    if (currentRole === 'DESPACHADORA') {
      return [
        {
          title: 'Módulo de Despacho',
          items: [
            { 
              id: 'despacho-cocina' as ScreenType, 
              label: 'Comandas KDS', 
              icon: 'outdoor_grill', 
              nodeBadge: 'K',
              path: '/dispatcher',
              badge: activeKitchenCount > 0 ? `${activeKitchenCount}` : undefined 
            },
            { id: 'comanda-publica' as ScreenType, label: 'Monitor Turnos PDR', icon: 'tv', path: '/order/[token]' },
          ],
        },
      ];
    }

    // Default: CAJERA
    return [
      {
        title: 'Operaciones de Caja & POS',
        items: [
          {
            id: 'apertura-turno' as ScreenType,
            label: shift.isOpen ? 'Turno Abierto' : 'Apertura de Turno',
            icon: shift.isOpen ? 'lock_open' : 'lock_clock',
            nodeBadge: 'E',
            path: '/cashier/shift/open',
            badge: shift.isOpen ? 'Activo' : 'Requerido',
          },
          { id: 'pos-ventas' as ScreenType, label: 'POS Ventas', icon: 'point_of_sale', nodeBadge: 'F', path: '/cashier/pos' },
          { id: 'historial-de-pedidos' as ScreenType, label: 'Historial de Pedidos', icon: 'receipt_long', nodeBadge: 'J', path: '/cashier/orders' },
          { id: 'clientes' as ScreenType, label: 'Clientes (FR-019)', icon: 'group', nodeBadge: 'P', path: '/cashier/customers' },
          { 
            id: 'pedidos-pendientes' as ScreenType, 
            label: 'Pago Pendiente [FR-011]', 
            icon: 'pending_actions', 
            badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined 
          },
        ],
      },
    ];
  };

  const sections = getNavSections();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e1e8fd] z-40 flex flex-col justify-between p-3 select-none overflow-y-auto">
      <div className="flex flex-col gap-4">
        {/* Dynamic Navigation Sections */}
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="flex flex-col gap-1">
            <div className="px-2 py-1 font-mono text-[10px] text-[#5b403d] uppercase tracking-wider font-bold">
              {sec.title}
            </div>

            <nav className="flex flex-col gap-0.5">
              {sec.items.map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all text-left cursor-pointer group ${
                      isActive
                        ? 'bg-[#d32f2f] text-white font-bold shadow-xs'
                        : 'text-[#5b403d] hover:bg-[#f1f3ff] hover:text-[#141b2b] font-medium'
                    }`}
                    title={item.path ? `Ruta: ${item.path}` : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[19px] shrink-0">{item.icon}</span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          {item.nodeBadge && (
                            <span
                              className={`font-mono text-[9px] px-1 py-0.2 rounded font-bold shrink-0 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-[#e1e8fd] text-[#141b2b]'
                              }`}
                            >
                              {item.nodeBadge}
                            </span>
                          )}
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.path && (
                          <span
                            className={`font-mono text-[9px] tracking-tight truncate ${
                              isActive ? 'text-white/75' : 'text-[#5b403d]/70 group-hover:text-[#af101a]'
                            }`}
                          >
                            {item.path}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.badge && (
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ml-1 ${
                          isActive
                            ? 'bg-white text-[#d32f2f]'
                            : 'bg-[#fec330] text-[#6f5100]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="pt-3 flex flex-col gap-1.5 border-t border-[#f1f3ff]">
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#5b403d] hover:bg-[#ffdad6] hover:text-[#ba1a1a] transition-colors font-medium cursor-pointer"
        >
          <span className="material-symbols-outlined text-[19px]">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

