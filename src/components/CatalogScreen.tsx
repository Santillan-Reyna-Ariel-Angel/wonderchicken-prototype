import React, { useState } from 'react';
import { Product } from '../types';

interface CatalogScreenProps {
  products: Product[];
  onUpdateProduct?: (updated: Product) => void;
  onBackToPOS?: () => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({ products, onBackToPOS }) => {
  const [productList, setProductList] = useState<Product[]>(products);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'principales' | 'bebidas' | 'extras'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedProductRule, setSelectedProductRule] = useState<Product | null>(null);
  const [ruleActiveTab, setRuleActiveTab] = useState<'presas' | 'sides' | 'drinks'>('presas');
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  // New product state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'principales' | 'bebidas' | 'extras'>('principales');
  const [newPrice, setNewPrice] = useState('25.00');
  const [newDesc, setNewDesc] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleActive = (productId: string) => {
    setProductList((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, active: !p.active } : p))
    );
    showToast('Estado de disponibilidad en POS actualizado');
  };

  const openRules = (product: Product) => {
    setSelectedProductRule(product);
    setRuleActiveTab('presas');
    setShowRuleModal(true);
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newPrice) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const newProd: Product = {
      id: `p-${Date.now()}`,
      code: newCode.toUpperCase(),
      name: newName,
      category: newCategory,
      price: parseFloat(newPrice) || 0,
      description: newDesc || 'Nuevo producto de pollo broaster',
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80',
      configurable: newCategory === 'principales',
      active: true,
      variantsCount: 1,
      optionsPreview: '1 Var. Base',
      stockControl: 'Sí Control',
    };

    setProductList((prev) => [...prev, newProd]);
    showToast(`Producto ${newProd.name} registrado en catálogo.`);
    setShowNewProductModal(false);

    // Reset
    setNewCode('');
    setNewName('');
    setNewPrice('25.00');
    setNewDesc('');
  };

  // Filter products
  const filteredProducts = productList.filter((p) => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.active) ||
      (statusFilter === 'inactive' && !p.active);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[26px]">inventory_2</span>
            <h1 className="text-lg sm:text-xl font-bold text-[#141b2b]">
              Catálogo y Variantes — Menú Oficial 2026
            </h1>
            <span className="bg-[#ffdad6] text-[#af101a] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
              FR-001 POS
            </span>
          </div>
          <p className="text-xs text-[#5b403d] mt-1">
            Matriz de productos de pollo broaster, reglas de sustitución, combos y sincronización directa con terminales.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onBackToPOS && (
            <button
              type="button"
              onClick={onBackToPOS}
              className="px-3 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
              Volver a POS
            </button>
          )}
          <button
            type="button"
            onClick={() => showToast('Catálogo sincronizado exitosamente con todas las terminales')}
            className="px-3 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-[#15803d]">sync</span>
            Sincronizar POS
          </button>
          <button
            type="button"
            onClick={() => setShowNewProductModal(true)}
            className="px-3.5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-lg border border-[#e1e8fd] overflow-x-auto">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'all' ? 'bg-white text-[#af101a] shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Todos ({productList.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('principales')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'principales' ? 'bg-[#d32f2f] text-white shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Pollo / Platos ({productList.filter((p) => p.category === 'principales').length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('bebidas')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'bebidas' ? 'bg-[#d32f2f] text-white shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Bebidas ({productList.filter((p) => p.category === 'bebidas').length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter('extras')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'extras' ? 'bg-[#d32f2f] text-white shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Guarniciones / Extras ({productList.filter((p) => p.category === 'extras').length})
          </button>
        </div>

        {/* Search and status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#f1f3ff] text-xs font-mono font-bold text-[#141b2b] px-3 py-1.5 rounded-lg border border-[#e1e8fd] outline-none cursor-pointer"
            >
              <option value="all">Estado: Todos</option>
              <option value="active">Solo Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div className="relative w-48 sm:w-64">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto o código..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#f1f3ff] text-xs text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
            />
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-xl border border-[#e1e8fd] shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-[#141b2b]">
            <thead className="bg-[#f1f3ff] text-[#5b403d] font-mono uppercase tracking-wider border-b border-[#e1e8fd]">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Producto &amp; Imagen</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4 text-right">Precio Base</th>
                <th className="py-3 px-4 text-center">Variantes</th>
                <th className="py-3 px-4">Reglas de Armado</th>
                <th className="py-3 px-4 text-center">Control Presas</th>
                <th className="py-3 px-4 text-center">POS Activo</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3ff]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#f9f9ff] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#af101a]">{p.code}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-[#e1e8fd]">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#141b2b]">{p.name}</span>
                        <span className="text-[11px] text-[#5b403d] line-clamp-1">{p.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-[#f1f3ff] text-[#141b2b] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-sm text-[#af101a]">
                    Bs. {p.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#f1f3ff]">
                      {p.variantsCount || (p.configurable ? 4 : 1)} Var.
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#5b403d]">
                    {p.optionsPreview || (p.configurable ? 'Bebida / Papas / Ensalada' : 'Fórmula fija')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {p.configurable ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                        Sí Presas
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-[#5b403d] bg-gray-100 px-2 py-0.5 rounded">
                        No Presas
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p.id)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                        p.active ? 'bg-[#15803d]' : 'bg-[#e1e8fd]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          p.active ? 'translate-x-4' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.configurable ? (
                        <button
                          type="button"
                          onClick={() => openRules(p)}
                          className="px-2 py-1 bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#af101a] font-mono text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer"
                          title="Gestionar Reglas de Armado"
                        >
                          <span className="material-symbols-outlined text-[14px]">schema</span>
                          Reglas
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => showToast(`Editando producto ${p.name}`)}
                          className="p-1.5 rounded hover:bg-[#f1f3ff] text-[#5b403d] hover:text-[#141b2b] cursor-pointer"
                          title="Editar Producto"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#f1f3ff] flex items-center justify-between font-mono text-[11px] text-[#5b403d]">
          <span>Mostrando {filteredProducts.length} productos configurados para Sucursal Central</span>
          <span>Actualización en caliente habilitada</span>
        </div>
      </div>

      {/* MODAL: Definición de Variante y Reglas Operativas (FR-001 POS) */}
      {showRuleModal && selectedProductRule && (
        <div className="fixed inset-0 z-50 bg-[#293040]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden border border-[#e1e8fd] max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#141b2b] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#fec330] text-[24px]">tune</span>
                <div>
                  <h2 className="font-bold text-base leading-tight">
                    Definición de Variante y Reglas Operativas — {selectedProductRule.name}
                  </h2>
                  <span className="font-mono text-xs text-[#e1e8fd]">
                    FR-001 POS • Restricciones de Cocina y Despacho
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-[#e1e8fd] bg-[#f9f9ff] px-6">
              <button
                type="button"
                onClick={() => setRuleActiveTab('presas')}
                className={`py-3 px-4 font-mono text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  ruleActiveTab === 'presas'
                    ? 'border-[#af101a] text-[#af101a]'
                    : 'border-transparent text-[#5b403d] hover:text-[#141b2b]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">lunch_dining</span>
                1. Presas Obligatorias
              </button>
              <button
                type="button"
                onClick={() => setRuleActiveTab('sides')}
                className={`py-3 px-4 font-mono text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  ruleActiveTab === 'sides'
                    ? 'border-[#af101a] text-[#af101a]'
                    : 'border-transparent text-[#5b403d] hover:text-[#141b2b]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">ramen_dining</span>
                2. Acompañamiento y Sustituciones
              </button>
              <button
                type="button"
                onClick={() => setRuleActiveTab('drinks')}
                className={`py-3 px-4 font-mono text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  ruleActiveTab === 'drinks'
                    ? 'border-[#af101a] text-[#af101a]'
                    : 'border-transparent text-[#5b403d] hover:text-[#141b2b]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">local_drink</span>
                3. Bebida y Extras Incluidos
              </button>
            </div>

            {/* Tab content */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
              {ruleActiveTab === 'presas' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-[#f1f3ff] p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#141b2b]">Total de Presas por Ración:</span>
                      <p className="text-[11px] text-[#5b403d]">
                        El cajero debe completar exactamente esta cantidad antes de emitir comanda.
                      </p>
                    </div>
                    <span className="font-mono text-base font-bold text-[#af101a] bg-white px-3 py-1 rounded border border-[#e1e8fd]">
                      2 Presas
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="accent-[#af101a] w-4 h-4" />
                        <span className="font-bold">Pecho</span>
                      </div>
                      <span className="font-mono text-[#5b403d]">Blanca / Magra</span>
                    </div>
                    <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="accent-[#af101a] w-4 h-4" />
                        <span className="font-bold">Ala</span>
                      </div>
                      <span className="font-mono text-[#5b403d]">Crocante</span>
                    </div>
                    <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="accent-[#af101a] w-4 h-4" />
                        <span className="font-bold">Pierna</span>
                      </div>
                      <span className="font-mono text-[#5b403d]">Jugosa</span>
                    </div>
                    <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="accent-[#af101a] w-4 h-4" />
                        <span className="font-bold">Entrepierna</span>
                      </div>
                      <span className="font-mono text-[#5b403d]">Tradicional</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-[11px] flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0">verified</span>
                    <span>
                      <strong>FR-002: Selección Granular Activa.</strong> Se habilitará tanto el selector rápido de pares (Pecho-Ala / Pierna-Entrepierna) como la suma libre en caja.
                    </span>
                  </div>
                </div>
              )}

              {ruleActiveTab === 'sides' && (
                <div className="flex flex-col gap-3">
                  <span className="font-bold text-[#141b2b]">Acompañamiento Base:</span>
                  <div className="p-3 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                    <div>
                      <div className="font-bold">Mixto (Papa Frita Rústica + Arroz con Queso)</div>
                      <div className="text-[11px] text-[#5b403d]">Estándar por defecto sin costo adicional</div>
                    </div>
                    <span className="font-mono font-bold text-[#15803d]">Bs. 0.00</span>
                  </div>

                  <span className="font-bold text-[#141b2b] mt-2">Sustituciones Permitidas:</span>
                  <div className="flex flex-col gap-2">
                    <div className="p-2.5 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <span>Solo Papas Fritas (Doble ración de papa)</span>
                      <span className="font-mono font-bold text-[#5b403d]">Bs. 0.00</span>
                    </div>
                    <div className="p-2.5 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <span>Solo Arroz con Queso (Doble ración de arroz)</span>
                      <span className="font-mono font-bold text-[#5b403d]">Bs. 0.00</span>
                    </div>
                    <div className="p-2.5 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <span>Sustitución por Smiles McCain (Caritas de papa)</span>
                      <span className="font-mono font-bold text-[#af101a]">+ Bs. 4.00</span>
                    </div>
                  </div>
                </div>
              )}

              {ruleActiveTab === 'drinks' && (
                <div className="flex flex-col gap-3">
                  <span className="font-bold text-[#141b2b]">Bebidas Disponibles en el Combo (500ml):</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Coca Cola 500ml', 'Fanta Naranja 500ml', 'Sprite 500ml', 'Mocochinchi Casero'].map((b) => (
                      <div key={b} className="p-2.5 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                        <span>{b}</span>
                        <span className="font-mono font-bold text-[#15803d]">Incluida</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold">Opciones de Temperatura de Servicio</span>
                      <span className="block text-[11px] text-[#5b403d]">Obligatorio en mostrador</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white font-mono text-[10px] font-bold border border-[#e1e8fd]">
                        FRÍA
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white font-mono text-[10px] font-bold border border-[#e1e8fd]">
                        NATURAL
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#f9f9ff] border-t border-[#e1e8fd] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRuleModal(false)}
                className="px-4 py-2 bg-white text-[#141b2b] border border-[#e1e8fd] font-mono text-xs font-bold rounded-lg cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Reglas de armado guardadas y sincronizadas con el POS');
                  setShowRuleModal(false);
                }}
                className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                Guardar Reglas y Actualizar POS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Registrar Nuevo Producto */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-[#293040]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-[#e1e8fd]">
            <div className="bg-[#f1f3ff] px-6 py-4 flex items-center justify-between border-b border-[#e1e8fd]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#af101a] text-[22px]">add_box</span>
                <h3 className="font-bold text-base text-[#141b2b]">Registrar Nuevo Producto</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white text-[#5b403d] flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="p-6 flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#141b2b]">Código / SKU *</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Ej. P-010"
                    className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] font-mono outline-none uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#141b2b]">Precio Base (Bs.) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="25.00"
                    className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#141b2b]">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Mega Balde 12 Presas"
                  className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#141b2b]">Categoría Operativa</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] outline-none font-medium"
                >
                  <option value="principales">Pollo / Platos Principales</option>
                  <option value="bebidas">Bebidas y Refrescos</option>
                  <option value="extras">Guarniciones / Extras</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#141b2b]">Descripción / Componentes</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detalles para KDS y ticket..."
                  className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#e1e8fd] outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e1e8fd]">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-4 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] rounded-lg font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
