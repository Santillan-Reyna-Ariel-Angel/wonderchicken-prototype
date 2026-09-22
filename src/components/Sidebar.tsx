import React from 'react';
import { ScreenType, UserRole } from '../types';
import { useShiftsStore } from '../features/shifts/stores/shifts.store';

interface SidebarProps {
  currentScreen: ScreenType;
  currentRole?: UserRole;
  onNavigate: (screen: ScreenType) => void;
  onLogout?: () => void;
  activeKitchenCount?: number;
  pendingOrdersCount?: number;
  collapsed?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  currentRole = 'CAJERA',
  onNavigate,
  onLogout: _onLogout,
  activeKitchenCount = 4,
  pendingOrdersCount = 3,
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
  onToggleCollapse,
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
    // Cuando el turno no está abierto: muestra "Apertura de Turno" (Requerido)
    // Cuando el turno ya está activo: muestra "Resumen de Apertura" (Solo Lectura)
    const cashierItems = [
      {
        id: 'apertura-turno' as ScreenType,
        label: shift.isOpen ? 'Resumen de Apertura' : 'Apertura de Turno',
        icon: shift.isOpen ? 'assignment' : 'lock_clock',
        nodeBadge: 'E',
        path: shift.isOpen ? '/cashier/shift/summary' : '/cashier/shift/open',
        badge: shift.isOpen ? 'Lectura' : 'Requerido',
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
    ];

    return [
      {
        title: 'Operaciones de Caja & POS',
        items: cashierItems,
      },
    ];
  };

  const sections = getNavSections();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop collapsible & Mobile off-canvas drawer) */}
      <aside
        className={`fixed top-16 bottom-0 z-40 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-[#e1e8fd] flex flex-col justify-between p-2 sm:p-3 select-none overflow-y-auto transition-all duration-200 ease-in-out ${
          /* Mobile Drawer: visible if mobileOpen, hidden off-screen otherwise */
          mobileOpen ? 'left-0 w-72' : '-left-80 md:left-0'
        } ${
          /* Desktop collapsed vs expanded */
          collapsed ? 'md:w-18' : 'md:w-64'
        }`}
      >
        <div className="flex flex-col gap-3">
          {/* Mobile Drawer Header with Close button */}
          <div className="flex md:hidden items-center justify-between pb-2 border-b border-[#f1f3ff] px-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#141b2b]">MENÚ DE NAVEGACIÓN</span>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-md text-[#5b403d] hover:bg-[#ffdad6] hover:text-[#ba1a1a] cursor-pointer"
              title="Cerrar menú"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Dynamic Navigation Sections */}
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="flex flex-col gap-1">
              {/* Section title (hidden when collapsed on desktop) */}
              <div
                className={`px-2 py-1 font-mono text-[10px] text-[#5b403d] uppercase tracking-wider font-bold transition-opacity ${
                  collapsed ? 'md:hidden' : 'block'
                }`}
              >
                {sec.title}
              </div>

              {/* Collapsed divider for desktop */}
              {collapsed && secIdx > 0 && (
                <div className="hidden md:block my-1 border-t border-[#f1f3ff]" />
              )}

              <nav className="flex flex-col gap-0.5">
                {sec.items.map((item) => {
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        if (mobileOpen && onCloseMobile) {
                          onCloseMobile();
                        }
                      }}
                      className={`relative flex items-center ${
                        collapsed ? 'md:justify-center md:px-2' : 'justify-between px-3'
                      } py-2.5 rounded-lg text-xs transition-all text-left cursor-pointer group ${
                        isActive
                          ? 'bg-[#d32f2f] text-white font-bold shadow-xs'
                          : 'text-[#5b403d] hover:bg-[#f1f3ff] hover:text-[#141b2b] font-medium'
                      }`}
                      title={collapsed ? `${item.label} (${item.path || ''})` : item.path ? `Ruta: ${item.path}` : undefined}
                    >
                      <div className={`flex items-center ${collapsed ? 'md:justify-center' : 'gap-2.5'} min-w-0`}>
                        <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>

                        {/* Text and badges (hidden on desktop if collapsed) */}
                        <div
                          className={`flex flex-col min-w-0 transition-opacity ${
                            collapsed ? 'md:hidden' : 'flex'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {item.nodeBadge && (
                              <span
                                className={`font-mono text-[9px] px-1 py-0.2 rounded font-bold shrink-0 ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[#e1e8fd] dark:bg-[#263554] text-[#141b2b] dark:text-[#e2e8f0]'
                                }`}
                              >
                                {item.nodeBadge}
                              </span>
                            )}
                            <span className={`truncate ${isActive ? 'text-white' : 'text-inherit'}`}>{item.label}</span>
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

                      {/* Item counter badge */}
                      {item.badge && (
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ml-1 ${
                            collapsed ? 'md:absolute md:-top-1 md:-right-1 md:text-[8px] md:px-1' : ''
                          } ${
                            isActive
                              ? 'bg-white text-[#d32f2f]'
                              : 'bg-[#fec330] text-[#6f5100]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip flyout on desktop when collapsed */}
                      {collapsed && (
                        <div className="hidden md:group-hover:flex absolute left-full ml-2.5 px-2.5 py-1.5 bg-[#141b2b] text-white text-xs rounded-md shadow-lg font-medium whitespace-nowrap z-50 items-center gap-1.5 pointer-events-none animate-fade-in">
                          {item.nodeBadge && (
                            <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-white/20 text-white font-bold">
                              {item.nodeBadge}
                            </span>
                          )}
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="bg-[#fec330] text-[#6f5100] font-mono text-[9px] font-bold px-1 rounded-full ml-1">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar bottom actions */}
      </aside>
    </>
  );
};

