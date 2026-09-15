import React from 'react';
import { ScreenType, UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  shiftName?: string;
  cashierName?: string;
  userRole?: UserRole;
  activeOrdersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  shiftName = 'MAÑANA',
  cashierName = 'Roxana Rodríguez',
  userRole = 'CAJERA',
  activeOrdersCount = 2,
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleLogoClick = () => {
    if (userRole === 'SUPER_ADMIN') onNavigate('super-admin');
    else if (userRole === 'ADMIN') onNavigate('branch-admin');
    else if (userRole === 'DESPACHADORA') onNavigate('despacho-cocina');
    else onNavigate('pos-ventas');
  };

  const roleLabel = {
    CAJERA: 'Cajera',
    DESPACHADORA: 'Despacho',
    ADMIN: 'Administrador',
    SUPER_ADMIN: 'Super Admin',
  }[userRole];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e1e8fd]">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand & Store metadata */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button 
            onClick={handleLogoClick}
            className="flex items-center text-left focus:outline-none group cursor-pointer"
            title="Ir a Inicio"
            aria-label="Wonder Chicken - Ir a Inicio"
          >
            <div className="w-12 h-12 rounded-full bg-white shadow-xs p-0.5 flex items-center justify-center border border-[#e1e8fd] group-hover:scale-105 transition-transform">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1UeU-dPW2xV51uDn6xjSYBx5aQ_phV1RW0qXrx1lh6__UO10EB8Q-Vo_iXTafRjk1G-tU-pg7ElZlfVyedi1YFPkh46MiMI7E4HJnbgYzS2ILQq1si0Dmb-dpRQJB0a7rWkZHIF8rtEgs0YW3NB9k9Pey6ki6L9uX9kRj5QDjf4sWTKlQUpz-5o2zh3qLOJy9c23bvWq-ZaN6RFE8_hvoHmMbRthFwyDqJcM3F8v78bIBRFYFLWrAww25KdAjmjcoKltSVNVyalaQ"
                alt="Wonder Chicken Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd]">
            <span className="material-symbols-outlined text-[#af101a] text-[18px]">storefront</span>
            <span className="font-mono text-xs font-semibold text-[#141b2b]">
              {userRole === 'SUPER_ADMIN' ? 'Corporativo Global' : 'Sucursal Central'}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#fec330]/20 text-[#6f5100] rounded-lg border border-[#fec330]/40">
            <span className="material-symbols-outlined text-[16px] text-[#795900]">wb_sunny</span>
            <span className="font-mono text-xs font-bold tracking-wider uppercase">
              Turno: {shiftName}
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle, Quick actions & cashier user profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Theme Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e1e8fd] bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] transition-all cursor-pointer shadow-2xs group"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Alternar tema claro y oscuro"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-500 group-hover:rotate-12 transition-transform">
              {theme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="hidden sm:inline font-mono text-xs font-bold capitalize">
              {theme === 'dark' ? 'Oscuro' : 'Claro'}
            </span>
          </button>

          {/* Operator info pill */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd]">
            <div className="flex flex-col text-right">
              <span className="font-semibold text-xs text-[#141b2b] leading-tight">
                {cashierName}
              </span>
              <span className="font-mono text-[10px] text-[#5b403d] leading-none">
                {roleLabel} • {userRole === 'CAJERA' ? 'Caja 01' : 'En Línea'}
              </span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-[#fec330] ring-2 ring-white animate-pulse" title="Terminal Sincronizada"></span>
          </div>

          {/* User profile icon */}
          <div className="w-8 h-8 rounded-full bg-[#af101a] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};

