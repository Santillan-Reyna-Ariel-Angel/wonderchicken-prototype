/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenType, Product, Customer, CompletedOrder, OrderItem, OrderType, UserRole } from './types';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_ORDERS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { POSScreen } from './components/POSScreen';
import { CatalogScreen } from './components/CatalogScreen';
import { ClientsScreen } from './components/ClientsScreen';
import { KitchenScreen } from './components/KitchenScreen';
import { ShiftScreen } from './components/ShiftScreen';
import { ShiftControlScreen } from './components/ShiftControlScreen';
import { PendingOrdersScreen } from './components/PendingOrdersScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { PersonnelScreen } from './components/PersonnelScreen';
import { BranchesScreen } from './components/BranchesScreen';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { BranchAdminDashboard } from './components/BranchAdminDashboard';
import { PublicOrderScreen } from './components/PublicOrderScreen';
import { useAuthStore } from './features/auth/stores/auth.store';
import { useShiftsStore } from './features/shifts/stores/shifts.store';

export default function App() {
  const { shift, setCashierName: updateStoreCashier } = useShiftsStore();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    return !shift.isOpen ? 'apertura-turno' : 'pos-ventas';
  });
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<CompletedOrder[]>(INITIAL_ORDERS);
  const [activeCustomer, setActiveCustomer] = useState<Customer>(INITIAL_CUSTOMERS[0]);
  const [shiftName, setShiftName] = useState<string>('MAÑANA');
  const [cashierName, setCashierName] = useState<string>('Roxana Rodríguez');
  const [userRole, setUserRole] = useState<UserRole>('CAJERA');

  const { login, switchRole } = useAuthStore();

  // Active kitchen orders count (En preparación or Listo)
  const activeKitchenCount = orders.filter((o) => o.status !== 'ENTREGADO').length;
  const totalSales = orders
    .filter((o) => o.paymentMethod !== 'PENDIENTE')
    .reduce((acc, o) => acc + o.total, 0);

  // Handlers
  const handleLoginSuccess = (name: string, role: UserRole) => {
    setCashierName(name);
    setUserRole(role);
    updateStoreCashier(name);
    login(role, name);

    if (role === 'SUPER_ADMIN') {
      setCurrentScreen('super-admin');
    } else if (role === 'ADMIN') {
      setCurrentScreen('branch-admin');
    } else if (role === 'DESPACHADORA') {
      setCurrentScreen('despacho-cocina');
    } else {
      // Para cajera, si el turno no está abierto, va directamente a apertura-turno
      if (!shift.isOpen) {
        setCurrentScreen('apertura-turno');
      } else {
        setCurrentScreen('pos-ventas');
      }
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    switchRole(newRole);
    const names: Record<UserRole, string> = {
      CAJERA: 'Roxana Rodríguez',
      DESPACHADORA: 'Diana Despacho',
      ADMIN: 'Carlos Mendoza',
      SUPER_ADMIN: 'Ing. Fernando Vaca',
    };
    const name = names[newRole];
    setCashierName(name);
    updateStoreCashier(name);

    if (newRole === 'SUPER_ADMIN') {
      setCurrentScreen('super-admin');
    } else if (newRole === 'ADMIN') {
      setCurrentScreen('branch-admin');
    } else if (newRole === 'DESPACHADORA') {
      setCurrentScreen('despacho-cocina');
    } else {
      setCurrentScreen('pos-ventas');
    }
  };

  const handleLogout = () => {
    setCurrentScreen('login');
  };

  const handleCompleteSale = (
    items: OrderItem[],
    customer: Customer,
    orderType: OrderType,
    tableNumber: string,
    paymentMethod: 'EFECTIVO' | 'QR' | 'PENDIENTE',
    cashReceived: number,
    change: number
  ) => {
    const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    const newOrder: CompletedOrder = {
      ticketNumber: `#${String(orders.length + 143).padStart(5, '0')}`,
      timestamp: `Hoy ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      orderType,
      tableNumber: orderType === 'MESA' ? tableNumber : undefined,
      customer,
      items: [...items],
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod,
      cashReceived: paymentMethod === 'EFECTIVO' ? cashReceived : undefined,
      cashChange: paymentMethod === 'EFECTIVO' ? change : undefined,
      status: 'EN_PREPARACION',
      cashier: `${cashierName} (Caja 01)`,
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Update customer's last order info
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id
          ? {
              ...c,
              lastOrderTime: 'Hace un momento',
              lastOrderAmount: subtotal,
            }
          : c
      )
    );
  };

  const handleUpdateOrderStatus = (
    ticketNumber: string,
    status: 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO'
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.ticketNumber === ticketNumber ? { ...o, status } : o))
    );
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
    if (activeCustomer.id === updatedCustomer.id) {
      setActiveCustomer(updatedCustomer);
    }
  };

  // If on login screen, render standalone full-bleed login experience
  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onOpenPublicTracker={() => setCurrentScreen('comanda-publica')}
      />
    );
  }

  // If on public comanda tracker (/order/[token]), render dedicated client screen
  if (currentScreen === 'comanda-publica') {
    return (
      <PublicOrderScreen
        onBackToApp={() => {
          if (userRole === 'SUPER_ADMIN') setCurrentScreen('super-admin');
          else if (userRole === 'ADMIN') setCurrentScreen('branch-admin');
          else if (userRole === 'DESPACHADORA') setCurrentScreen('despacho-cocina');
          else setCurrentScreen('pos-ventas');
        }}
      />
    );
  }

  // If opening shift before starting work, render standalone screen like login (without extra menus)
  if (currentScreen === 'apertura-turno' && !shift.isOpen) {
    return (
      <ShiftScreen
        shiftName={shiftName}
        cashierName={cashierName}
        onUpdateShift={setShiftName}
        onBackToPOS={() => setCurrentScreen('pos-ventas')}
        ordersCount={orders.length}
        totalSales={totalSales}
        standalone={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#141b2b] app-main-bg transition-colors duration-200">
      {/* POS Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        shiftName={shift.shiftPeriod || shiftName}
        cashierName={cashierName}
        userRole={userRole}
        activeOrdersCount={activeKitchenCount}
      />

      {/* POS Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        currentRole={userRole}
        onNavigate={setCurrentScreen}
        onLogout={handleLogout}
        activeKitchenCount={activeKitchenCount}
      />

      {/* Main Content Area (offset by header 4rem and sidebar 16rem) */}
      <main className="pt-20 pl-4 pr-4 pb-8 sm:pr-6 md:pl-70 max-w-[1600px] min-h-[calc(100vh-4rem)]">
        {currentScreen === 'super-admin' && (
          <SuperAdminDashboard onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'branch-admin' && (
          <BranchAdminDashboard onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'pos-ventas' && (
          <POSScreen
            products={products}
            customers={customers}
            activeCustomer={activeCustomer}
            onSelectCustomer={setActiveCustomer}
            onNavigateToClients={() => setCurrentScreen('clientes')}
            onCompleteSale={handleCompleteSale}
          />
        )}

        {currentScreen === 'catalogo-y-variantes' && (
          <CatalogScreen products={products} onBackToPOS={() => setCurrentScreen('pos-ventas')} />
        )}

        {currentScreen === 'pedidos-pendientes' && (
          <PendingOrdersScreen
            onBackToPOS={() => setCurrentScreen('pos-ventas')}
            customers={customers}
            onNavigateToClients={() => setCurrentScreen('clientes')}
            onOrderSettled={(ticketId, amount, customer, paymentMethod) => {
              // Add to completed orders
              const settledOrder: CompletedOrder = {
                ticketNumber: `#${ticketId}`,
                timestamp: `Hoy ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                orderType: 'LLEVAR',
                customer: customer || activeCustomer,
                items: [
                  {
                    id: `settled-${ticketId}`,
                    productId: 'p-002',
                    name: 'Comanda Anticipada Liquidada',
                    unitPrice: amount,
                    quantity: 1,
                  },
                ],
                subtotal: amount,
                discount: 0,
                total: amount,
                paymentMethod: paymentMethod || 'EFECTIVO',
                status: 'LISTO',
                cashier: `${cashierName} (Caja 01)`,
              };
              setOrders((prev) => [settledOrder, ...prev]);
            }}
          />
        )}

        {currentScreen === 'control-de-turnos-y-cajas' && (
          <ShiftControlScreen onBackToPOS={() => setCurrentScreen('pos-ventas')} />
        )}

        {currentScreen === 'usuarios-y-personal' && (
          <PersonnelScreen onBackToPOS={() => setCurrentScreen('pos-ventas')} />
        )}

        {currentScreen === 'sucursales' && (
          <BranchesScreen onBackToPOS={() => setCurrentScreen('pos-ventas')} />
        )}

        {currentScreen === 'clientes' && (
          <ClientsScreen
            customers={customers}
            onAddCustomer={handleAddCustomer}
            onUpdateCustomer={handleUpdateCustomer}
            onSelectCustomerForPOS={setActiveCustomer}
            onBackToPOS={() => setCurrentScreen('pos-ventas')}
            userRole={userRole}
          />
        )}

        {currentScreen === 'despacho-cocina' && (
          <KitchenScreen
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onBackToPOS={() => setCurrentScreen('pos-ventas')}
          />
        )}

        {currentScreen === 'apertura-turno' && (
          <ShiftScreen
            shiftName={shiftName}
            cashierName={cashierName}
            onUpdateShift={setShiftName}
            onBackToPOS={() => setCurrentScreen('pos-ventas')}
            ordersCount={orders.length}
            totalSales={totalSales}
          />
        )}

        {currentScreen === 'historial-de-pedidos' && (
          <HistoryScreen
            orders={orders}
            onBackToPOS={() => setCurrentScreen('pos-ventas')}
          />
        )}
      </main>
    </div>
  );
}

