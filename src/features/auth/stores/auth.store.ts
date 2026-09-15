import { create } from 'zustand';
import { UserRole } from '../../../types';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  ci: string;
  role: UserRole;
  branchId: string;
  branchName: string;
  token: string;
}

export const DEMO_PROFILES: Record<UserRole, UserSession> = {
  CAJERA: {
    id: 'u-cajera',
    name: 'Roxana Rodríguez',
    email: 'roxana@wonderchicken.com',
    ci: '8492019',
    role: 'CAJERA',
    branchId: 'SCZ-001',
    branchName: 'Sucursal Central (Caja 01)',
    token: 'jwt-cajera-token-valid-2026',
  },
  DESPACHADORA: {
    id: 'u-despachadora',
    name: 'Diana Despacho',
    email: 'diana.kds@wonderchicken.com',
    ci: '7721902',
    role: 'DESPACHADORA',
    branchId: 'SCZ-001',
    branchName: 'Sucursal Central (Mesón KDS)',
    token: 'jwt-despachadora-token-valid-2026',
  },
  ADMIN: {
    id: 'u-admin',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@wonderchicken.com',
    ci: '5543210',
    role: 'ADMIN',
    branchId: 'SCZ-001',
    branchName: 'Sucursal Central',
    token: 'jwt-admin-token-valid-2026',
  },
  SUPER_ADMIN: {
    id: 'u-superadmin',
    name: 'Ing. Fernando Vaca',
    email: 'fernando.vaca@wonderchicken.com',
    ci: '1098234',
    role: 'SUPER_ADMIN',
    branchId: 'GLOBAL',
    branchName: 'Corporativo Wonder Chicken',
    token: 'jwt-superadmin-token-valid-2026',
  },
};

interface AuthState {
  isAuthenticated: boolean;
  user: UserSession | null;
  login: (role: UserRole, customName?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  user: DEMO_PROFILES.CAJERA,

  login: (role: UserRole, customName?: string) => {
    const profile = DEMO_PROFILES[role];
    set({
      isAuthenticated: true,
      user: customName ? { ...profile, name: customName } : profile,
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
    });
  },

  switchRole: (role: UserRole) => {
    const profile = DEMO_PROFILES[role];
    set({
      isAuthenticated: true,
      user: profile,
    });
  },
}));
