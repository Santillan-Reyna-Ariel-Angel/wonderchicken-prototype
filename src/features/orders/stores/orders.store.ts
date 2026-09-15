import { create } from 'zustand';
import { CompletedOrder, OrderItem, Customer, OrderType } from '../../../types';

export interface KDSTicketItem {
  name: string;
  qty: number;
  details: string[];
}

export interface KDSTicket {
  id: string;
  ticketNumber: string;
  orderType: OrderType;
  tableOrChannel: string;
  customerName: string;
  timeElapsed: string;
  status: 'PREPARING' | 'READY' | 'DELIVERED';
  isPendingPayment: boolean;
  total: number;
  items: KDSTicketItem[];
  timestamp: string;
}

const INITIAL_KDS_ORDERS: KDSTicket[] = [
  {
    id: '105',
    ticketNumber: '#105',
    orderType: 'MESA',
    tableOrChannel: 'Mesa Salón 06',
    customerName: 'Carlos Mendoza',
    timeElapsed: 'Hace 2 min',
    status: 'PREPARING',
    isPendingPayment: false,
    total: 135.0,
    timestamp: '20:44',
    items: [
      {
        name: 'Combo Familiar 8 Presas',
        qty: 1,
        details: [
          '4x Pierna, 4x Entrepierna',
          'Acompañamiento: Doble porción de papas rústicas',
          'Bebida: 1x Gaseosa 2L Guaraná',
        ],
      },
    ],
  },
  {
    id: '103',
    ticketNumber: '#103',
    orderType: 'LLEVAR',
    tableOrChannel: 'Delivery Ya • Repartidor #14',
    customerName: 'Marco Ortega',
    timeElapsed: 'Hace 6 min',
    status: 'PREPARING',
    isPendingPayment: true,
    total: 90.0,
    timestamp: '20:37',
    items: [
      {
        name: 'Porción Media Broaster',
        qty: 3,
        details: [
          '1x Pecho - Ala',
          '2x Pierna - Entrepierna',
          'Sustitución: Arroz con queso en vez de papas',
        ],
      },
    ],
  },
  {
    id: '102',
    ticketNumber: '#102',
    orderType: 'MESA',
    tableOrChannel: 'Mesa Salón 04',
    customerName: 'Luis Iglesias',
    timeElapsed: 'Hace 9 min',
    status: 'READY',
    isPendingPayment: false,
    total: 72.0,
    timestamp: '20:25',
    items: [
      {
        name: 'Combo Wonder',
        qty: 2,
        details: [
          '2x Pecho-Ala',
          '1x Coca Cola 500ml (Fría), 1x Mocochinchi Casero (Frío)',
          'Acompañamiento: Mixto (Papa y Arroz)',
        ],
      },
    ],
  },
  {
    id: '101',
    ticketNumber: '#101',
    orderType: 'MESA',
    tableOrChannel: 'Mesa Salón 02',
    customerName: 'Fredy Arévalo',
    timeElapsed: 'Hace 15 min',
    status: 'READY',
    isPendingPayment: false,
    total: 23.0,
    timestamp: '20:18',
    items: [
      {
        name: 'Cuarto de Pollo Broaster',
        qty: 1,
        details: [
          'Pecho - Ala',
          'Solo Papas Fritas',
          'Extra Salsa Tártara',
        ],
      },
    ],
  },
];

interface OrdersState {
  completedOrders: CompletedOrder[];
  kdsTickets: KDSTicket[];
  addOrder: (order: CompletedOrder, isPendingPayment?: boolean) => void;
  markReady: (ticketId: string) => void;
  deliverOrder: (ticketId: string) => void;
  settlePendingOrder: (ticketId: string, paymentMethod: 'EFECTIVO' | 'QR') => void;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  completedOrders: [
    {
      ticketNumber: '#102',
      timestamp: 'Hoy 20:25',
      orderType: 'MESA',
      customer: {
        id: 'c-01',
        ci: '1234567',
        fullName: 'Luis Iglesias',
        phone: '77390123',
      },
      items: [
        {
          id: 'item-102',
          productId: 'p-003',
          name: 'Combo Wonder 2 Presas + Bebida 500ml',
          unitPrice: 36.0,
          quantity: 2,
        },
      ],
      subtotal: 72.0,
      discount: 0,
      total: 72.0,
      paymentMethod: 'EFECTIVO',
      cashReceived: 100.0,
      cashChange: 28.0,
      status: 'LISTO',
      cashier: 'Roxana (Caja 01)',
    },
    {
      ticketNumber: '#101',
      timestamp: 'Hoy 20:18',
      orderType: 'MESA',
      customer: {
        id: 'c-02',
        ci: '7654321',
        fullName: 'Fredy Arévalo',
        phone: '71029384',
      },
      items: [
        {
          id: 'item-101',
          productId: 'p-001',
          name: 'Cuarto de Pollo Broaster',
          unitPrice: 23.0,
          quantity: 1,
        },
      ],
      subtotal: 23.0,
      discount: 0,
      total: 23.0,
      paymentMethod: 'QR',
      status: 'LISTO',
      cashier: 'Roxana (Caja 01)',
    },
  ],
  kdsTickets: INITIAL_KDS_ORDERS,

  addOrder: (order, isPendingPayment = false) => {
    // Format ticket for KDS
    const kdsItems: KDSTicketItem[] = order.items.map((i) => {
      const details: string[] = [];
      if (i.config) {
        const presasDesc = Object.entries(i.config.presas)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => `${count}x ${type.toUpperCase()}`)
          .join(', ');
        if (presasDesc) details.push(`Presas: ${presasDesc}`);
        details.push(`Acompañamiento: ${i.config.side}`);
        if (i.config.drink) details.push(`Bebida: ${i.config.drink} (${i.config.temperature})`);
      } else if (i.customDetails) {
        details.push(i.customDetails);
      }
      return {
        name: i.name,
        qty: i.quantity,
        details,
      };
    });

    const ticketId = order.ticketNumber.replace('#', '');
    const newKdsTicket: KDSTicket = {
      id: ticketId,
      ticketNumber: order.ticketNumber,
      orderType: order.orderType,
      tableOrChannel: order.orderType === 'MESA' ? 'Mesa Salón' : 'Ventanilla Despacho / Delivery',
      customerName: order.customer.fullName,
      timeElapsed: 'Hace 1 min',
      status: 'PREPARING',
      isPendingPayment,
      total: order.total,
      items: kdsItems,
      timestamp: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      completedOrders: [order, ...state.completedOrders],
      kdsTickets: [newKdsTicket, ...state.kdsTickets],
    }));
  },

  markReady: (ticketId) => {
    set((state) => ({
      kdsTickets: state.kdsTickets.map((t) =>
        t.id === ticketId ? { ...t, status: 'READY' } : t
      ),
      completedOrders: state.completedOrders.map((o) =>
        o.ticketNumber.replace('#', '') === ticketId ? { ...o, status: 'LISTO' } : o
      ),
    }));
  },

  deliverOrder: (ticketId) => {
    set((state) => ({
      kdsTickets: state.kdsTickets.map((t) =>
        t.id === ticketId ? { ...t, status: 'DELIVERED' } : t
      ),
      completedOrders: state.completedOrders.map((o) =>
        o.ticketNumber.replace('#', '') === ticketId ? { ...o, status: 'ENTREGADO' } : o
      ),
    }));
  },

  settlePendingOrder: (ticketId, paymentMethod) => {
    set((state) => ({
      kdsTickets: state.kdsTickets.map((t) =>
        t.id === ticketId ? { ...t, isPendingPayment: false } : t
      ),
      completedOrders: state.completedOrders.map((o) =>
        o.ticketNumber.replace('#', '') === ticketId
          ? { ...o, paymentMethod, status: 'EN_PREPARACION' }
          : o
      ),
    }));
  },
}));
