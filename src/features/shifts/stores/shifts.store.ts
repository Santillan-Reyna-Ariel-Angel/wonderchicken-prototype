import { create } from 'zustand';
import { ShiftState } from '../../../types';

interface ShiftsStoreState {
  shift: ShiftState;
  openShift: (params: {
    shiftPeriod: 'MAÑANA' | 'NOCHE';
    cashRegisterId: '01' | '02';
    initialAmount: number;
    cashierName: string;
  }) => void;
  closeShift: () => void;
  setCashierName: (cashierName: string) => void;
  incrementOrderNumber: () => number;
}

export const useShiftsStore = create<ShiftsStoreState>((set, get) => ({
  shift: {
    isOpen: false,
    shiftPeriod: 'MAÑANA',
    cashRegisterId: '01',
    initialAmount: 150.0,
    openedAt: undefined,
    cashierName: 'Roxana Rodríguez',
    token: undefined,
    lastOrderNumber: 100,
  },

  openShift: ({ shiftPeriod, cashRegisterId, initialAmount, cashierName }) => {
    const timestamp = new Date().toLocaleTimeString('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
    });
    set({
      shift: {
        isOpen: true,
        shiftPeriod,
        cashRegisterId,
        initialAmount,
        openedAt: `Hoy ${timestamp}`,
        cashierName,
        token: `SHF-${Date.now()}-${shiftPeriod.charAt(0)}${cashRegisterId}`,
        lastOrderNumber: 100,
      },
    });
  },

  closeShift: () => {
    set((state) => ({
      shift: {
        ...state.shift,
        isOpen: false,
      },
    }));
  },

  setCashierName: (cashierName: string) => {
    set((state) => ({
      shift: {
        ...state.shift,
        cashierName,
      },
    }));
  },

  incrementOrderNumber: () => {
    const nextNum = get().shift.lastOrderNumber + 1;
    set((state) => ({
      shift: {
        ...state.shift,
        lastOrderNumber: nextNum,
      },
    }));
    return nextNum;
  },
}));
