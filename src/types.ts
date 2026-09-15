export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'CAJERA' | 'DESPACHADORA';

export type ScreenType = 
  | 'login' 
  | 'super-admin'
  | 'branch-admin'
  | 'pos-ventas' 
  | 'apertura-turno' 
  | 'control-de-turnos-y-cajas'
  | 'pedidos-pendientes'
  | 'despacho-cocina' 
  | 'catalogo-y-variantes' 
  | 'historial-de-pedidos' 
  | 'clientes'
  | 'usuarios-y-personal'
  | 'sucursales'
  | 'comanda-publica';

export type OrderType = 'MESA' | 'LLEVAR';

export type OrderStatus = 
  | 'CREATED' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'DELIVERED' 
  | 'CLOSED' 
  | 'PENDING_PAYMENT' 
  | 'CANCELLED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: 'Creado',
  CONFIRMED: 'Confirmado',
  PREPARING: 'En preparación',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CLOSED: 'Cerrado',
  PENDING_PAYMENT: 'Pago pendiente',
  CANCELLED: 'Cancelado',
};

export interface ShiftState {
  isOpen: boolean;
  shiftPeriod: 'MAÑANA' | 'NOCHE';
  cashRegisterId: '01' | '02';
  initialAmount: number;
  openedAt?: string;
  cashierName: string;
  token?: string;
  lastOrderNumber: number;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  address: string;
  city: string;
  adminName: string;
  adminEmail: string;
  adminAvatar?: string;
  terminalsCount: number;
  active: boolean;
  syncDb: boolean;
}

export interface Operator {
  id: string;
  fullName: string;
  email: string;
  ci: string;
  role: 'CASHIER' | 'DISPATCHER' | 'COOK';
  shift: string;
  shiftHours: string;
  active: boolean;
  lastAccess: string;
  branch: string;
}

export interface PendingOrder {
  id: string;
  ticketNumber: string;
  orderType: 'LLEVAR' | 'DELIVERY';
  customerName: string;
  deliveryDetails: string;
  total: number;
  elapsedTime: string;
  itemsSummary: string;
  modifiers: string[];
  status: 'PENDIENTE' | 'COBRADO' | 'CANCELADO';
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  category: 'principales' | 'bebidas' | 'extras';
  imageUrl: string;
  badge?: string;
  piecesBadge?: string;
  isCombo?: boolean;
  isPopular?: boolean;
  configurable?: boolean;
  active: boolean;
  inventariable?: string;
  variantNotes?: string;
  variantsCount?: number;
  optionsPreview?: string;
  stockControl?: string;
}

export interface PresasCount {
  ala: number;
  pecho: number;
  pierna: number;
  entrepierna: number;
}

export interface ComboConfiguration {
  presas: PresasCount;
  side: 'mixto' | 'solo-arroz' | 'solo-papa' | 'smiles';
  drink: string;
  temperature: 'FRÍA' | 'NATURAL';
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  isCombo?: boolean;
  config?: ComboConfiguration;
  customDetails?: string;
}

export interface Customer {
  id: string;
  ci: string;
  ciExt?: string;
  nit?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  gender?: 'Hombre' | 'Mujer';
  phone: string;
  email?: string;
  birthdate?: string;
  businessName?: string;
  isCorporate?: boolean;
  isFrequent?: boolean;
  lastOrderTime?: string;
  lastOrderAmount?: number;
}

export interface CompletedOrder {
  ticketNumber: string;
  timestamp: string;
  orderType: OrderType;
  tableNumber?: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'EFECTIVO' | 'QR' | 'PENDIENTE';
  cashReceived?: number;
  cashChange?: number;
  status: 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';
  cashier: string;
}
