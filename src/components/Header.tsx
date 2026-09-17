import React, { useState, useRef, useEffect } from 'react';
import { ScreenType, UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAuthStore } from '../features/auth/stores/auth.store';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  shiftName?: string;
  cashierName?: string;
  userRole?: UserRole;
  activeOrdersCount?: number;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenMobileSidebar?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen: _currentScreen,
  onNavigate,
  shiftName = 'MAÑANA',
  cashierName = 'Roxana Rodríguez',
  userRole = 'CAJERA',
  activeOrdersCount: _activeOrdersCount = 2,
  sidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileSidebar,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close account popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountMenuOpen]);

  // Branding configuration adhering to DashboardLayout specs:
  // logo: wonder chicken logo image
  // title: Nombre de la sucursal (Sucursal Central / Corporativo Wonder Chicken)
  // homeUrl: '/' (o acceso directo a la pantalla de POS)
  const branding = {
    logo: (
      <img
        src="https://lh3.googleusercontent.com/aida/AEtjO1UeU-dPW2xV51uDn6xjSYBx5aQ_phV1RW0qXrx1lh6__UO10EB8Q-Vo_iXTafRjk1G-tU-pg7ElZlfVyedi1YFPkh46MiMI7E4HJnbgYzS2ILQq1si0Dmb-dpRQJB0a7rWkZHIF8rtEgs0YW3NB9k9Pey6ki6L9uX9kRj5QDjf4sWTKlQUpz-5o2zh3qLOJy9c23bvWq-ZaN6RFE8_hvoHmMbRthFwyDqJcM3F8v78bIBRFYFLWrAww25KdAjmjcoKltSVNVyalaQ"
        alt="Wonder Chicken"
        className="w-full h-full object-contain rounded-full"
      />
    ),
    title: user?.branchName || (userRole === 'SUPER_ADMIN' ? 'Corporativo Global' : 'Sucursal Central'),
    homeUrl: 'pos-ventas' as ScreenType,
  };

  const handleBrandClick = () => {
    onNavigate(branding.homeUrl);
  };

  const roleLabels: Record<UserRole, string> = {
    CAJERA: 'Cajera',
    DESPACHADORA: 'Despacho',
    ADMIN: 'Administrador',
    SUPER_ADMIN: 'Super Admin',
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e1e8fd] select-none">
      <div className="h-16 w-full px-3 sm:px-5 flex items-center justify-between gap-3">
        {/* Left: Responsive Drawer Toggles + Toolpad DashboardLayout Branding */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg text-[#5b403d] hover:bg-[#f1f3ff] hover:text-[#141b2b] border border-[#e1e8fd] transition-colors cursor-pointer shrink-0"
            title="Abrir menú de navegación"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          {/* Desktop collapse/expand sidebar toggle */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex items-center justify-center p-2 rounded-lg text-[#5b403d] hover:bg-[#f1f3ff] hover:text-[#141b2b] border border-[#e1e8fd] transition-colors cursor-pointer shrink-0"
            title={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral (solo iconos)'}
            aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {sidebarCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>

          {/* Toolpad DashboardLayout Branding (Logo + Title [Nombre de la Sucursal] + HomeUrl to POS) */}
          <button
            type="button"
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 sm:gap-3 text-left focus:outline-none group cursor-pointer min-w-0"
            title={`Ir a Inicio (POS) — ${branding.title}`}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-xs p-0.5 flex items-center justify-center border border-[#e1e8fd] group-hover:scale-105 transition-transform shrink-0">
              {branding.logo}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-base text-[#141b2b] tracking-tight leading-tight group-hover:text-[#af101a] transition-colors truncate">
                {branding.title}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#5b403d] leading-none">
                <span className="font-bold text-[#af101a]">WONDER CHICKEN</span>
                <span>•</span>
                <span className="uppercase text-[9px] font-semibold text-[#15803d]">Online</span>
              </div>
            </div>
          </button>
        </div>

        {/* Right: Theme Switcher (Claro/Oscuro) + DashboardLayout Account Component */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* DashboardLayout Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e1e8fd] bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] transition-all cursor-pointer shadow-2xs group"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Alternar tema claro y oscuro"
          >
            <span className="material-symbols-outlined text-[19px] text-amber-500 group-hover:rotate-15 transition-transform">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="hidden sm:inline font-mono text-xs font-bold capitalize">
              {theme === 'dark' ? 'Oscuro' : 'Claro'}
            </span>
          </button>

          {/* DashboardLayout Integrated <Account /> Component */}
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => setAccountMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 sm:gap-2.5 p-1 sm:pl-2.5 sm:pr-3 sm:py-1 rounded-xl border border-[#e1e8fd] bg-white hover:bg-[#f1f3ff] text-[#141b2b] transition-all cursor-pointer shadow-2xs group focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/30"
              title="Administrar Cuenta y Sesión"
              aria-expanded={accountMenuOpen}
              aria-haspopup="true"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#af101a] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {cashierName.charAt(0)}
              </div>

              {/* User Details label */}
              <div className="hidden md:flex flex-col text-left leading-tight min-w-0">
                <span className="font-bold text-xs text-[#141b2b] truncate max-w-[130px]">
                  {cashierName}
                </span>
                <span className="font-mono text-[10px] text-[#5b403d] truncate">
                  {roleLabels[userRole]}
                </span>
              </div>

              <span className="material-symbols-outlined text-[#5b403d] text-[18px] group-hover:text-[#141b2b] transition-transform duration-200">
                {accountMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {/* <Account /> Management Menu Dropdown */}
            {accountMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-[#e1e8fd] z-50 p-3 flex flex-col gap-2.5 animate-fade-in text-xs">
                {/* Account Header / Current Session */}
                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#f9f9ff] border border-[#e1e8fd]">
                  <div className="w-10 h-10 rounded-full bg-[#af101a] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {cashierName.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-[#141b2b] truncate">{cashierName}</span>
                    <span className="font-mono text-[11px] text-[#5b403d] truncate">
                      {user?.email || `${cashierName.toLowerCase().replace(/\s+/g, '.')}@wonderchicken.com`}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="bg-[#fec330]/30 text-[#6f5100] font-mono text-[9px] font-bold px-1.5 py-0.2 rounded">
                        {roleLabels[userRole]}
                      </span>
                      <span className="font-mono text-[9px] text-[#5b403d]">
                        Turno: {shiftName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Branch Info */}
                <div className="px-2 py-1.5 bg-[#f1f3ff] rounded-lg text-[11px] font-mono flex items-center justify-between text-[#141b2b]">
                  <span className="text-[#5b403d]">Sucursal Activa:</span>
                  <span className="font-bold truncate max-w-[140px]">{branding.title}</span>
                </div>

                {/* Sign Out Action */}
                <div className="pt-2 border-t border-[#f1f3ff]">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountMenuOpen(false);
                      logout();
                      if (onLogout) onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


