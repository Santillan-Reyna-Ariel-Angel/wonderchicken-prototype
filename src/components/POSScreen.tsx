import React, { useState } from 'react';
import { Product, OrderItem, Customer, OrderType, ComboConfiguration } from '../types';
import { ComboVariantModal } from './ComboVariantModal';
import { PaymentModal } from './PaymentModal';
import { CustomItemModal } from './CustomItemModal';

interface POSScreenProps {
  products: Product[];
  customers: Customer[];
  activeCustomer: Customer;
  onSelectCustomer: (cust: Customer) => void;
  onNavigateToClients: () => void;
  onCompleteSale: (
    items: OrderItem[],
    customer: Customer,
    orderType: OrderType,
    tableNumber: string,
    paymentMethod: 'EFECTIVO' | 'QR' | 'PENDIENTE',
    cashReceived: number,
    change: number
  ) => void;
}

export const POSScreen: React.FC<POSScreenProps> = ({
  products,
  customers,
  activeCustomer,
  onSelectCustomer,
  onNavigateToClients,
  onCompleteSale,
}) => {
  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'principales' | 'bebidas' | 'extras'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Order type
  const [orderType, setOrderType] = useState<OrderType>('MESA');
  const [tableNumber, setTableNumber] = useState('');

  // Cart state
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);

  // Customer dropdown
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals
  const [showComboModal, setShowComboModal] = useState(false);
  const [selectedProductForConfig, setSelectedProductForConfig] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Adding product to cart
  const handleAddProduct = (product: Product) => {
    // Si es plato configurable (platos principales de 2 presas o con variantes configurables)
    if (product.configurable) {
      setSelectedProductForConfig(product);
      setShowComboModal(true);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id && !item.config);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && !item.config ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
        },
      ];
    });
    showToast(`Añadido: ${product.name}`);
  };

  // Confirm configured dish / combo
  const handleConfirmCombo = (config: ComboConfiguration) => {
    const currentProduct = selectedProductForConfig || products.find((p) => p.id === 'p-003') || {
      id: 'p-003',
      name: 'Combo Wonder',
      price: 36.00,
    };

    setCartItems((prev) => [
      ...prev,
      {
        id: 'cfg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        productId: currentProduct.id,
        name: currentProduct.name,
        unitPrice: currentProduct.price,
        quantity: 1,
        isCombo: Boolean(currentProduct.isCombo),
        config,
      },
    ]);
    showToast(`${currentProduct.name} configurado añadido a la orden`);
    setSelectedProductForConfig(null);
  };

  // Add custom manual item
  const handleAddCustomItem = (item: OrderItem) => {
    setCartItems((prev) => [...prev, item]);
    showToast(`Añadido: ${item.name}`);
  };

  // Cart quantity controls
  const handleUpdateQty = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (confirm('¿Desea limpiar todos los ítems de la orden actual?')) {
      setCartItems([]);
    }
  };

  // Totals
  const subtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const discount = 0.00;
  const total = subtotal - discount;

  // Finalize payment from modal
  const handlePaymentConfirmed = (
    paymentMethod: 'EFECTIVO' | 'QR' | 'PENDIENTE',
    cashReceived: number,
    change: number,
    selectedCustomer?: Customer
  ) => {
    const finalCustomer = selectedCustomer || activeCustomer;
    if (paymentMethod === 'PENDIENTE') {
      onCompleteSale(cartItems, finalCustomer, orderType, tableNumber, 'PENDIENTE', 0, 0);
      setShowPaymentModal(false);
      setCartItems([]);
      showToast('Orden guardada con Pago Pendiente [FR-011]');
      return;
    }
    onCompleteSale(cartItems, finalCustomer, orderType, tableNumber, paymentMethod, cashReceived, change);
    setShowPaymentModal(false);
    setCartItems([]);
    showToast('¡Venta registrada con éxito! Comanda enviada a cocina KDS.');
  };

  const handlePendingPayment = () => {
    if (cartItems.length === 0) {
      alert('La orden está vacía.');
      return;
    }
    onCompleteSale(cartItems, activeCustomer, orderType, tableNumber, 'PENDIENTE', 0, 0);
    setCartItems([]);
    showToast('Orden guardada con Pago Pendiente [FR-011]');
  };

  // Customer suggestions
  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.ci.includes(customerSearch) ||
      (c.nit && c.nit.includes(customerSearch))
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-5rem)]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 left-72 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{notification}</span>
        </div>
      )}

      {/* LEFT COLUMN: Catalog / Product Grid */}
      <div className="flex-1 flex flex-col gap-3 min-w-0 bg-white rounded-xl shadow-xs border border-[#e1e8fd] p-4 overflow-hidden">
        {/* Category filter pills & Search bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#e1e8fd]">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#d32f2f] text-white shadow-xs'
                  : 'bg-[#f1f3ff] text-[#5b403d] hover:bg-[#e9edff]'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory('principales')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'principales'
                  ? 'bg-[#d32f2f] text-white shadow-xs'
                  : 'bg-[#f1f3ff] text-[#5b403d] hover:bg-[#e9edff]'
              }`}
            >
              <span>🍗</span>
              <span>Platos Principales</span>
            </button>
            <button
              onClick={() => setSelectedCategory('bebidas')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'bebidas'
                  ? 'bg-[#d32f2f] text-white shadow-xs'
                  : 'bg-[#f1f3ff] text-[#5b403d] hover:bg-[#e9edff]'
              }`}
            >
              <span>🥤</span>
              <span>Bebidas</span>
            </button>
            <button
              onClick={() => setSelectedCategory('extras')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'extras'
                  ? 'bg-[#d32f2f] text-white shadow-xs'
                  : 'bg-[#f1f3ff] text-[#5b403d] hover:bg-[#e9edff]'
              }`}
            >
              <span>🍟</span>
              <span>Extras &amp; Guarniciones</span>
            </button>

            {/* Direct access to custom sale modal from catalog toolbar */}
            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold whitespace-nowrap bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto sm:ml-0"
              title="Crear venta personalizada por pasos (Presas + Acompañante + Bebida)"
            >
              <span className="material-symbols-outlined text-[16px] text-amber-700">tune</span>
              <span>Venta Custom</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#f1f3ff] focus:bg-white rounded-lg text-xs font-medium text-[#141b2b] border border-[#e1e8fd] focus:outline-none focus:border-[#af101a]"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-[#e1e8fd] hover:border-[#af101a]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Image container - clickable */}
                  <div
                    onClick={() => handleAddProduct(product)}
                    className="relative w-full h-36 bg-[#f1f3ff] overflow-hidden cursor-pointer select-none"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAddProduct(product);
                      }
                    }}
                    title={product.configurable ? `Configurar ${product.name}` : `Añadir ${product.name}`}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Pieces / Volume Badge */}
                    {product.piecesBadge && (
                      <span className="absolute bottom-2 left-2 bg-[#141b2b]/80 backdrop-blur-xs text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded pointer-events-none">
                        {product.piecesBadge}
                      </span>
                    )}

                    {/* Promotional Badges */}
                    {product.badge && (
                      <span className="absolute top-2 right-2 bg-[#fec330] text-[#6f5100] font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase pointer-events-none">
                        {product.badge}
                      </span>
                    )}

                    {/* Centered Transparent Action Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors p-2 pointer-events-none">
                      <div
                        className="px-4 py-1.5 bg-transparent border border-white/90 text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {product.configurable ? 'add_circle' : 'add_circle'}
                        </span>
                        <span>Añadir</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-sm text-[#141b2b] leading-snug">
                          {product.name}
                        </h3>
                        <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                          product.category === 'bebidas'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : product.category === 'extras'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-[#f1f3ff] text-[#5b403d] border-[#e1e8fd]'
                        }`}>
                          {product.category === 'bebidas'
                            ? 'Bebida'
                            : product.category === 'extras'
                            ? 'Extra'
                            : 'Plato principal'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5b403d] line-clamp-2 mt-0.5">
                        {product.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#f1f3ff] mt-2">
                      <span className="font-mono text-base font-bold text-[#af101a]">
                        Bs. {product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Ticket de Venta / Cart */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-xs border border-[#e1e8fd] p-4 overflow-hidden">
        {/* Service Type (MESA / LLEVAR) */}
        <div className="flex items-center justify-between pb-3 border-b border-[#e1e8fd]">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#f1f3ff] rounded-lg w-full">
            <button
              type="button"
              onClick={() => setOrderType('MESA')}
              className={`py-1.5 rounded-md font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                orderType === 'MESA'
                  ? 'bg-white text-[#af101a] shadow-xs'
                  : 'text-[#5b403d] hover:text-[#141b2b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_restaurant</span>
              MESA
            </button>
            <button
              type="button"
              onClick={() => setOrderType('LLEVAR')}
              className={`py-1.5 rounded-md font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                orderType === 'LLEVAR'
                  ? 'bg-white text-[#af101a] shadow-xs'
                  : 'text-[#5b403d] hover:text-[#141b2b]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">takeout_dining</span>
              LLEVAR
            </button>
          </div>
        </div>

        {/* Customer Selector Bar */}
        <div className="py-2.5 border-b border-[#e1e8fd] relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="material-symbols-outlined text-[#af101a] text-[18px]">person</span>
              <button
                type="button"
                onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                className="text-left truncate text-xs font-bold text-[#141b2b] hover:text-[#af101a] cursor-pointer flex items-center gap-1"
              >
                <span className="truncate">{activeCustomer.fullName}</span>
                <span className="font-mono text-[10px] text-[#5b403d]">
                  ({activeCustomer.ci || activeCustomer.nit || 'S/N'})
                </span>
                <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onNavigateToClients}
              className="px-2 py-1 bg-[#f1f3ff] hover:bg-[#e9edff] rounded text-[10px] font-mono font-bold text-[#af101a] flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="Registrar nuevo cliente en módulo SIN"
            >
              <span className="material-symbols-outlined text-[14px]">person_add</span>
              + Nuevo
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showCustomerDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-xl shadow-xl border border-[#e1e8fd] p-2 flex flex-col gap-1.5 animate-fade-in">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Buscar por Nombre, CI o NIT..."
                className="p-2 bg-[#f1f3ff] text-xs font-medium rounded-lg border border-[#e1e8fd] outline-none"
                autoFocus
              />

              <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                {/* Anonymous S/N Option */}
                <button
                  type="button"
                  onClick={() => {
                    onSelectCustomer({
                      id: 'c-sn',
                      ci: '0',
                      fullName: 'Cliente S/N (Sin Nombre)',
                      phone: '-',
                    });
                    setShowCustomerDropdown(false);
                  }}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f1f3ff] text-left cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#141b2b]">Cliente S/N</span>
                    <span className="text-[10px] text-[#5b403d]">Consumidor Final (Sin Factura Nominada)</span>
                  </div>
                  <span className="font-mono text-xs text-[#5b403d]">0</span>
                </button>

                {filteredCustomers.map((cust) => (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => {
                      onSelectCustomer(cust);
                      setShowCustomerDropdown(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-left cursor-pointer ${
                      cust.id === activeCustomer.id ? 'bg-[#ffdad6]/40' : 'hover:bg-[#f1f3ff]'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-bold text-xs text-[#141b2b] truncate">{cust.fullName}</span>
                      <span className="text-[10px] text-[#5b403d]">{cust.phone}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#af101a]">
                      {cust.ci || cust.nit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#5b403d]">
              <span className="material-symbols-outlined text-[48px] text-[#e1e8fd]">
                shopping_cart
              </span>
              <span className="font-bold text-sm text-[#141b2b] mt-2">La orden está vacía</span>
              <span className="text-xs text-[#5b403d] mt-1">
                Selecciona productos del menú o añade un ítem personalizado.
              </span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#f9f9ff] rounded-xl p-3 border border-[#e1e8fd] flex flex-col gap-1.5"
              >
                {/* Main line */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs sm:text-sm text-[#141b2b]">
                      {item.name}
                    </span>
                    <span className="font-mono text-xs text-[#5b403d]">
                      Bs. {item.unitPrice.toFixed(2)} c/u
                    </span>
                  </div>

                  <span className="font-mono text-xs sm:text-sm font-bold text-[#af101a]">
                    Bs. {(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* Configuration Specs / Notes */}
                {item.config?.notes && (
                  <div className="bg-white p-2 rounded-lg border border-[#e1e8fd] text-[11px] font-mono text-[#5b403d] whitespace-pre-line leading-relaxed">
                    {item.config.notes}
                  </div>
                )}

                {item.customDetails && (
                  <span className="text-[11px] text-[#795900] italic">
                    {item.customDetails}
                  </span>
                )}

                {/* Controls (Qty +/- and Remove) */}
                <div className="flex items-center justify-between pt-1 mt-1 border-t border-[#e1e8fd]">
                  <div className="flex items-center gap-2 bg-white px-2 py-0.5 rounded-lg border border-[#e1e8fd]">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-sm text-[#5b403d] hover:text-[#ba1a1a] cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-bold text-[#141b2b] w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="w-5 h-5 flex items-center justify-center font-bold text-sm text-[#5b403d] hover:text-[#15803d] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-[#5b403d] hover:text-[#ba1a1a] p-1 rounded transition-colors cursor-pointer"
                    title="Eliminar de la orden"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Calculations */}
        <div className="pt-3 border-t border-[#e1e8fd] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-[#5b403d]">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold">Bs. {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5b403d]">
            <span>Descuentos:</span>
            <span className="font-mono font-semibold">Bs. {discount.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[#141b2b] pt-1 border-t border-[#f1f3ff]">
            <span>TOTAL A COBRAR:</span>
            <span className="font-mono text-xl text-[#af101a]">
              Bs. {total.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-2">
            {/* Primary Checkout Button */}
            <button
              type="button"
              disabled={cartItems.length === 0}
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              [F1] Registrar Pago (Efectivo / QR)
            </button>

            {/* Secondary actions row */}
            <div>
              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={handlePendingPayment}
                className="w-full py-2 px-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-[11px] font-bold rounded-lg border border-[#e1e8fd] transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                <span>Pago Pendiente [FR-011]</span>
              </button>
            </div>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-center font-mono text-[11px] text-[#5b403d] hover:text-[#ba1a1a] transition-colors py-1 cursor-pointer"
              >
                Limpiar Pedido
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ComboVariantModal
        isOpen={showComboModal}
        product={selectedProductForConfig}
        onClose={() => {
          setShowComboModal(false);
          setSelectedProductForConfig(null);
        }}
        onConfirm={handleConfirmCombo}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirmPayment={handlePaymentConfirmed}
        total={total}
        ticketNumber="#00142"
        orderType={orderType}
        tableNumber={tableNumber}
        customer={activeCustomer}
        customers={customers}
        onNavigateToClients={onNavigateToClients}
        onCustomerChange={(c) => onSelectCustomer(c)}
        allowCustomerSelection={false}
        itemCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
      />

      <CustomItemModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onAddCustomItem={handleAddCustomItem}
      />
    </div>
  );
};
