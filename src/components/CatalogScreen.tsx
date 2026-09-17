import React, { useState } from 'react';
import { Product } from '../types';
import { AppModal } from '../commonComponents/AppModal';

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

  // New product form state matching Prisma Model:
  // id, name, basePrice (Decimal 10,2), category (String libre), description (String?),
  // active (Boolean), isSellable (Boolean), isInventoryItem (Boolean), variants (Variant[])
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Plato principal');
  const [customCategory, setCustomCategory] = useState('');
  const [newBasePrice, setNewBasePrice] = useState('25.00');
  const [newDesc, setNewDesc] = useState('');
  const [newActive, setNewActive] = useState(true);
  const [newIsSellable, setNewIsSellable] = useState(true);
  const [newIsInventoryItem, setNewIsInventoryItem] = useState(true);

  // Variants handling & rules (matching PRD FR-001/FR-002: Presas, Acompañamiento por default/intercambiable, Bebidas/Extras)
  const [hasVariants, setHasVariants] = useState(true);
  const [variantTab, setVariantTab] = useState<'presas' | 'sides' | 'drinks'>('presas');

  // 1. Presas configuration
  const [presCount, setPresCount] = useState<number>(2);
  const [allowedPresas, setAllowedPresas] = useState({
    pecho: true,
    ala: true,
    pierna: true,
    entrepierna: true,
  });

  // 2. Acompañamiento / Guarnición (por default y opciones con las que se puede intercambiar)
  const [defaultSide, setDefaultSide] = useState<string>('mixto');
  const [allowedSides, setAllowedSides] = useState<string[]>([
    'mixto',
    'solo-arroz',
    'solo-papa',
    'smiles',
  ]);

  // 3. Bebidas & Extras (si incluye por default y con cuáles se intercambia)
  const [hasIncludedDrink, setHasIncludedDrink] = useState<boolean>(true);
  const [defaultDrink, setDefaultDrink] = useState<string>('Coca Cola 500ml');
  const [allowedDrinks, setAllowedDrinks] = useState<string[]>([
    'Coca Cola 500ml',
    'Fanta Naranja 500ml',
    'Sprite 500ml',
    'Mocochinchi Casero',
  ]);

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

  const handleSaveNewProduct = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName.trim() || !newBasePrice) {
      alert('Por favor complete el nombre y el precio base del producto.');
      return;
    }

    const finalCategory = (newCategory === 'custom' ? customCategory.trim() : newCategory) || 'Plato principal';
    const parsedPrice = parseFloat(newBasePrice) || 0;
    const generatedCode = newCode.trim() ? newCode.trim().toUpperCase() : `PRD-${Date.now().toString().slice(-4)}`;

    const isPlatoPrincipal = finalCategory.toLowerCase().includes('plato') || finalCategory.toLowerCase().includes('pollo') || finalCategory.toLowerCase().includes('principal');

    const variantRulesConfig = hasVariants ? {
      presCount,
      allowedPresas,
      defaultSide,
      allowedSides,
      hasIncludedDrink,
      defaultDrink,
      allowedDrinks,
    } : undefined;

    const effectiveVariants = hasVariants
      ? [
          {
            id: `var-${Date.now()}-1`,
            name: `${newName.trim()} (Estándar / ${presCount} Presas)`,
            priceDelta: 0,
            sku: `${generatedCode}-VAR1`,
          }
        ]
      : [];

    let optionsPreviewText = 'Fórmula Base Simple';
    if (hasVariants) {
      const parts = [`${presCount} Presas`];
      if (defaultSide) parts.push(`Acomp: ${defaultSide}`);
      if (hasIncludedDrink) parts.push(`Bebida: ${defaultDrink}`);
      optionsPreviewText = parts.join(' • ');
    }

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      code: generatedCode,
      name: newName.trim(),
      category: finalCategory,
      price: parsedPrice,
      basePrice: parsedPrice,
      description: newDesc.trim(),
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80',
      active: newActive,
      isSellable: newIsSellable,
      isInventoryItem: newIsInventoryItem,
      variants: effectiveVariants,
      variantRules: variantRulesConfig,
      variantsCount: hasVariants ? 1 : 0,
      optionsPreview: optionsPreviewText,
      piecesBadge: hasVariants ? `${presCount} presas` : undefined,
      configurable: hasVariants,
      stockControl: newIsInventoryItem ? 'Control Stock' : 'Sin Inventario',
    };

    setProductList((prev) => [newProd, ...prev]);
    showToast(`Producto "${newProd.name}" con reglas de variantes registrado con éxito.`);
    setShowNewProductModal(false);

    // Reset form
    setNewCode('');
    setNewName('');
    setNewBasePrice('25.00');
    setNewCategory('Plato principal');
    setCustomCategory('');
    setNewDesc('');
    setNewActive(true);
    setNewIsSellable(true);
    setNewIsInventoryItem(true);
    setHasVariants(true);
    setPresCount(2);
    setAllowedPresas({ pecho: true, ala: true, pierna: true, entrepierna: true });
    setDefaultSide('mixto');
    setAllowedSides(['mixto', 'solo-arroz', 'solo-papa', 'smiles']);
    setHasIncludedDrink(true);
    setDefaultDrink('Coca Cola 500ml');
    setAllowedDrinks(['Coca Cola 500ml', 'Fanta Naranja 500ml', 'Sprite 500ml', 'Mocochinchi Casero']);
  };

  // Filter products (supports flexible string categories: "Plato principal", "principales", "Bebida", "bebidas", "Extra", "extras", or custom)
  const filteredProducts = productList.filter((p) => {
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      const pCat = (p.category || '').toLowerCase();
      if (categoryFilter === 'principales') {
        matchesCategory = pCat.includes('principal') || pCat.includes('principales') || pCat.includes('pollo') || pCat.includes('plato');
      } else if (categoryFilter === 'bebidas') {
        matchesCategory = pCat.includes('bebida') || pCat.includes('refresco');
      } else if (categoryFilter === 'extras') {
        matchesCategory = pCat.includes('extra') || pCat.includes('guarnición') || pCat.includes('guarnicion') || pCat.includes('salsa');
      } else {
        matchesCategory = pCat === categoryFilter.toLowerCase();
      }
    }

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.active) ||
      (statusFilter === 'inactive' && !p.active);
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);

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

      {/* MODAL: Definición de Variante y Reglas Operativas (Solo Lectura) */}
      {selectedProductRule && (
        <AppModal
          isOpen={showRuleModal}
          onClose={() => setShowRuleModal(false)}
          icon="visibility"
          title={`Reglas de Armado — ${selectedProductRule.name}`}
          description="Solo Lectura • Configuración activa de componentes y variantes para cocina y POS"
          maxWidth="2xl"
          showCancel={true}
          cancelLabel="Cerrar"
          confirmLabel=""
          onConfirm={undefined}
          footerExtra={
            <div className="flex items-center gap-1.5 text-xs text-[#5b403d] font-mono">
              <span className="material-symbols-outlined text-[16px] text-[#15803d]">lock</span>
              <span>Modo Solo Lectura (Solo visualización)</span>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-xs -mt-2">
            {/* Read-Only Notice Banner */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-950 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700 text-[18px]">info</span>
                <span>
                  <strong>Vista de Reglas Registradas:</strong> Refleja fielmente la configuración seleccionada en <em>"Configurar componentes y variantes"</em>.
                </span>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-mono text-[10px] font-bold rounded uppercase">
                Solo Lectura
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center border-b border-[#e1e8fd] bg-[#f9f9ff] -mx-4 -mt-2 px-4 rounded-t-lg">
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
            <div className="overflow-y-auto max-h-[50vh] flex flex-col gap-4 text-xs pr-1">
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
                      {selectedProductRule?.variantRules?.presCount || (selectedProductRule?.piecesBadge?.match(/\d+/)?.[0] || '2')} Presas
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProductRule?.variantRules?.allowedPresas ? selectedProductRule.variantRules.allowedPresas.pecho : true}
                          readOnly
                          className="accent-[#af101a] w-4 h-4"
                        />
                        <span className="font-bold">Pecho</span>
                      </div>
                      <span className="font-mono text-[#5b403d]">Blanca / Magra</span>
                    </div>
                    <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProductRule?.variantRules?.allowedPresas ? selectedProductRule.variantRules.allowedPresas.ala : true}
                          readOnly
                          className="accent-[#af101a] w-4 h-4"
                        />
                        <span className="font-bold">Ala</span>
                      </div>
                      <span className="font-mono text-[#5b403d]">Crocante</span>
                    </div>
                    <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProductRule?.variantRules?.allowedPresas ? selectedProductRule.variantRules.allowedPresas.pierna : true}
                          readOnly
                          className="accent-[#af101a] w-4 h-4"
                        />
                        <span className="font-bold">Pierna</span>
                      </div>
                      <span className="font-mono text-[#5b403d]">Jugosa</span>
                    </div>
                    <div className="p-3 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedProductRule?.variantRules?.allowedPresas ? selectedProductRule.variantRules.allowedPresas.entrepierna : true}
                          readOnly
                          className="accent-[#af101a] w-4 h-4"
                        />
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
                      <div className="font-bold">
                        {selectedProductRule?.variantRules?.defaultSide === 'solo-papa'
                          ? 'Solo Papas Fritas (Doble ración de papa)'
                          : selectedProductRule?.variantRules?.defaultSide === 'solo-arroz'
                          ? 'Solo Arroz con Queso (Doble ración de arroz)'
                          : selectedProductRule?.variantRules?.defaultSide === 'smiles'
                          ? 'Caritas Smiles McCain'
                          : 'Mixto (Papa Frita Rústica + Arroz con Queso)'}
                      </div>
                      <div className="text-[11px] text-[#5b403d]">Estándar por defecto sin costo adicional</div>
                    </div>
                    <span className="font-mono font-bold text-[#15803d]">Bs. 0.00</span>
                  </div>

                  <span className="font-bold text-[#141b2b] mt-2">Sustituciones Permitidas (PDR §2.1 — Sin cambio de precio):</span>
                  <div className="flex flex-col gap-2">
                    {(selectedProductRule?.variantRules?.allowedSides || ['solo-papa', 'solo-arroz', 'smiles']).map((s) => (
                      <div key={s} className="p-2.5 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                        <span className="capitalize">
                          {s === 'solo-papa' ? 'Solo Papas Fritas (Doble ración de papa)' :
                           s === 'solo-arroz' ? 'Solo Arroz con Queso (Doble ración de arroz)' :
                           s === 'smiles' ? 'Sustitución por Smiles McCain (Caritas de papa)' :
                           s === 'platano' ? 'Plátano Frito / Guarnición extra' :
                           s}
                        </span>
                        <span className="font-mono font-bold text-[#15803d]">Bs. 0.00</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ruleActiveTab === 'drinks' && (
                <div className="flex flex-col gap-3">
                  <span className="font-bold text-[#141b2b]">Bebidas Disponibles en el Combo (500ml):</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(selectedProductRule?.variantRules?.allowedDrinks || ['Coca Cola 500ml', 'Fanta Naranja 500ml', 'Sprite 500ml', 'Mocochinchi Casero']).map((b) => (
                      <div key={b} className="p-2.5 bg-[#f9f9ff] rounded-lg border border-[#e1e8fd] flex items-center justify-between">
                        <span>{b}</span>
                        <span className="font-mono font-bold text-[#15803d]">
                          {b === selectedProductRule?.variantRules?.defaultDrink ? 'Por Defecto' : 'Incluida'}
                        </span>
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
          </div>
        </AppModal>
      )}

      {/* MODAL: Registrar Nuevo Producto (Modelo Prisma Product + Variants) */}
      <AppModal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        icon="add_box"
        title="Registrar Nuevo Producto"
        description="Modelo de datos oficial • Soporte para categorías libres y gestión de variantes"
        maxWidth="2xl"
        onConfirm={() => {
          handleSaveNewProduct();
        }}
        confirmLabel="Guardar Producto"
        confirmIcon="save"
        showCancel={true}
        cancelLabel="Cancelar"
      >
        <div className="flex flex-col gap-4 text-xs">
          {/* Fila 1: Nombre del Producto & Código/SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="font-bold text-[#141b2b]">
                Nombre del Producto * <span className="text-[#ba1a1a]">(Obligatorio)</span>
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. Cuarto de Pollo Broaster Especial"
                className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#cbd5e1] focus:border-[#d32f2f] text-xs font-semibold text-[#1e293b] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#141b2b]">
                Código / SKU
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Ej. P-015"
                className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#cbd5e1] focus:border-[#d32f2f] text-xs font-mono font-bold text-[#1e293b] outline-none uppercase"
              />
            </div>
          </div>

          {/* Fila 2: Precio Base & Categoría (String libre o predefinida) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#141b2b]">
                Precio Base (basePrice: Decimal 10,2) *
              </label>
              <div className="flex items-center rounded-lg border border-[#cbd5e1] bg-[#f1f3ff] focus-within:border-[#d32f2f] px-3 py-2">
                <span className="font-mono font-bold text-[#d32f2f] mr-1.5">Bs.</span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  required
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(e.target.value)}
                  placeholder="25.00"
                  className="w-full bg-transparent font-mono font-bold text-xs text-[#1e293b] outline-none"
                />
              </div>
              <span className="text-[10px] text-[#64748b]">Precio regular si no se eligen variantes adicionales.</span>
            </div>

            {/* Categoría (String libre / Select rápido) */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#141b2b]">
                Categoría (category: String) *
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#cbd5e1] focus:border-[#d32f2f] text-xs font-medium text-[#1e293b] outline-none cursor-pointer"
              >
                <option value="Plato principal">Plato principal (Pollo / Combos)</option>
                <option value="Bebida">Bebida (Gaseosas / Refrescos)</option>
                <option value="Extra">Extra (Guarnición / Salsas)</option>
                <option value="Postre">Postre</option>
                <option value="Promoción">Promoción / Especial</option>
                <option value="custom">-- Otra categoría personalizada --</option>
              </select>

              {newCategory === 'custom' && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Escriba la nueva categoría libre..."
                  className="mt-1 px-3 py-1.5 bg-white rounded-lg border border-[#d32f2f] text-xs text-[#1e293b] outline-none animate-fade-in"
                />
              )}
            </div>
          </div>

          {/* Fila 3: Descripción (description: String?) */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#141b2b]">
              Descripción (description: String?)
            </label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Detalles para comanda, cocina KDS, ingredientes o notas de servicio..."
              className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#cbd5e1] focus:border-[#d32f2f] text-xs text-[#1e293b] outline-none resize-none"
            />
          </div>

          {/* Fila 4: Flags booleanos del modelo Prisma (active, isSellable, isInventoryItem) */}
          <div className="p-3 bg-[#f8f9fc] rounded-lg border border-[#e2e8f0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* active */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newActive}
                onChange={(e) => setNewActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#d32f2f] accent-[#d32f2f] cursor-pointer"
              />
              <div>
                <span className="font-bold text-xs text-[#1e293b] block">Activo (active)</span>
                <span className="text-[10px] text-[#64748b]">Visible en el sistema</span>
              </div>
            </label>

            {/* isSellable */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsSellable}
                onChange={(e) => setNewIsSellable(e.target.checked)}
                className="w-4 h-4 rounded text-[#d32f2f] accent-[#d32f2f] cursor-pointer"
              />
              <div>
                <span className="font-bold text-xs text-[#1e293b] block">Vendible (isSellable)</span>
                <span className="text-[10px] text-[#64748b]">Disponible en POS Caja</span>
              </div>
            </label>

            {/* isInventoryItem */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsInventoryItem}
                onChange={(e) => setNewIsInventoryItem(e.target.checked)}
                className="w-4 h-4 rounded text-[#d32f2f] accent-[#d32f2f] cursor-pointer"
              />
              <div>
                <span className="font-bold text-xs text-[#1e293b] block">Inventario (isInventoryItem)</span>
                <span className="text-[10px] text-[#64748b]">Deducción de stock</span>
              </div>
            </label>
          </div>

          {/* Fila 5: Reglas de la Variante (Componentes Obligatorios, Acompañamiento por Default/Intercambio y Bebidas) */}
          <div className="border border-[#cbd5e1] rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="p-3 bg-[#f8f9fc] border-b border-[#e2e8f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasVariantsToggle"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-4 h-4 rounded text-[#d32f2f] accent-[#d32f2f] cursor-pointer"
                />
                <label htmlFor="hasVariantsToggle" className="cursor-pointer">
                  <span className="font-bold text-xs text-[#1e293b]">
                    ¿Configurar componentes y reglas de variante? (PDR §2.1, §2.2 / FR-001)
                  </span>
                  <span className="block text-[10px] text-[#64748b]">
                    Define las presas a despachar, acompañamiento por defecto y sustituciones sin costo, y bebidas asociadas
                  </span>
                </label>
              </div>

              {hasVariants && (
                <span className="bg-[#ffdad6] text-[#af101a] font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Reglas Activas
                </span>
              )}
            </div>

            {hasVariants ? (
              <div className="flex flex-col">
                {/* Pestañas de Reglas: Presas, Acompañamiento y Sustituciones, Bebidas */}
                <div className="flex items-center border-b border-[#e2e8f0] bg-[#f1f5f9] px-3 pt-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVariantTab('presas')}
                    className={`py-2 px-3 font-mono text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                      variantTab === 'presas'
                        ? 'border-[#d32f2f] text-[#d32f2f] bg-white rounded-t-lg'
                        : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">lunch_dining</span>
                    1. Presas a Despachar
                  </button>
                  <button
                    type="button"
                    onClick={() => setVariantTab('sides')}
                    className={`py-2 px-3 font-mono text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                      variantTab === 'sides'
                        ? 'border-[#d32f2f] text-[#d32f2f] bg-white rounded-t-lg'
                        : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">ramen_dining</span>
                    2. Acompañamiento e Intercambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setVariantTab('drinks')}
                    className={`py-2 px-3 font-mono text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                      variantTab === 'drinks'
                        ? 'border-[#d32f2f] text-[#d32f2f] bg-white rounded-t-lg'
                        : 'border-transparent text-[#64748b] hover:text-[#1e293b]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">local_drink</span>
                    3. Bebida Asociada / Extras
                  </button>
                </div>

                <div className="p-3.5 bg-white flex flex-col gap-3">
                  {/* TAB 1: PRESAS */}
                  {variantTab === 'presas' && (
                    <div className="flex flex-col gap-3 animate-fade-in">
                      <div className="flex items-center justify-between p-2.5 bg-[#f8f9fc] rounded-lg border border-[#e2e8f0]">
                        <div>
                          <span className="font-bold text-[#141b2b] block">Cantidad Total de Presas por Plato:</span>
                          <span className="text-[10px] text-[#64748b]">
                            Número de presas de pollo cocido obligatorias que la cajera debe seleccionar en caja (inventario cocido PDR §2.3)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPresCount(Math.max(1, presCount - 1))}
                            className="w-7 h-7 bg-white border border-[#cbd5e1] rounded font-bold hover:bg-[#f1f5f9] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-12 text-center font-mono text-sm font-bold text-[#d32f2f] bg-white py-1 rounded border border-[#cbd5e1]">
                            {presCount} {presCount === 1 ? 'presa' : 'presas'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPresCount(presCount + 1)}
                            className="w-7 h-7 bg-white border border-[#cbd5e1] rounded font-bold hover:bg-[#f1f5f9] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-[#141b2b] block mb-1.5">Presas Habilitadas para Selección:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                            allowedPresas.pecho ? 'bg-[#fff5f5] border-[#fecdd3]' : 'bg-[#f8f9fc] border-[#e2e8f0]'
                          }`}>
                            <input
                              type="checkbox"
                              checked={allowedPresas.pecho}
                              onChange={(e) => setAllowedPresas({ ...allowedPresas, pecho: e.target.checked })}
                              className="accent-[#d32f2f] w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-xs text-[#1e293b] block">Pecho</span>
                              <span className="text-[10px] text-[#64748b]">Blanca / Magra</span>
                            </div>
                          </label>

                          <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                            allowedPresas.ala ? 'bg-[#fff5f5] border-[#fecdd3]' : 'bg-[#f8f9fc] border-[#e2e8f0]'
                          }`}>
                            <input
                              type="checkbox"
                              checked={allowedPresas.ala}
                              onChange={(e) => setAllowedPresas({ ...allowedPresas, ala: e.target.checked })}
                              className="accent-[#d32f2f] w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-xs text-[#1e293b] block">Ala</span>
                              <span className="text-[10px] text-[#64748b]">Crocante</span>
                            </div>
                          </label>

                          <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                            allowedPresas.pierna ? 'bg-[#fff5f5] border-[#fecdd3]' : 'bg-[#f8f9fc] border-[#e2e8f0]'
                          }`}>
                            <input
                              type="checkbox"
                              checked={allowedPresas.pierna}
                              onChange={(e) => setAllowedPresas({ ...allowedPresas, pierna: e.target.checked })}
                              className="accent-[#d32f2f] w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-xs text-[#1e293b] block">Pierna</span>
                              <span className="text-[10px] text-[#64748b]">Jugosa</span>
                            </div>
                          </label>

                          <label className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                            allowedPresas.entrepierna ? 'bg-[#fff5f5] border-[#fecdd3]' : 'bg-[#f8f9fc] border-[#e2e8f0]'
                          }`}>
                            <input
                              type="checkbox"
                              checked={allowedPresas.entrepierna}
                              onChange={(e) => setAllowedPresas({ ...allowedPresas, entrepierna: e.target.checked })}
                              className="accent-[#d32f2f] w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <span className="font-bold text-xs text-[#1e293b] block">Entrepierna</span>
                              <span className="text-[10px] text-[#64748b]">Tradicional</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-700 text-[16px] shrink-0">info</span>
                        <span>
                          En caja se ofrecerán pares tradicionales (Pecho-Ala / Pierna-Entrepierna) o selección granular según esta regla.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ACOMPAÑAMIENTO Y SUSTITUCIONES */}
                  {variantTab === 'sides' && (
                    <div className="flex flex-col gap-3 animate-fade-in">
                      {/* Acompañamiento por defecto */}
                      <div className="p-3 bg-[#f8f9fc] rounded-lg border border-[#e2e8f0] flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-[#141b2b] block">Acompañamiento por Defecto (Default):</span>
                            <span className="text-[10px] text-[#64748b]">
                              Viene incluido inicialmente en la ración del plato sin costo adicional (PDR §2.1).
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Bs. 0.00
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {[
                            { id: 'mixto', label: 'Mixto (Papas + Arroz)', desc: 'Estándar de la casa' },
                            { id: 'solo-papa', label: 'Solo Papas Fritas', desc: 'Doble ración de papa' },
                            { id: 'solo-arroz', label: 'Solo Arroz con Queso', desc: 'Doble ración de arroz' },
                            { id: 'smiles', label: 'Caritas Smiles McCain', desc: 'Porción de caritas' },
                          ].map((side) => (
                            <label
                              key={side.id}
                              className={`p-2.5 rounded-lg border flex flex-col gap-1 cursor-pointer transition-all ${
                                defaultSide === side.id
                                  ? 'bg-[#fff5f5] border-[#d32f2f] shadow-xs'
                                  : 'bg-white border-[#cbd5e1] hover:bg-[#f8f9fc]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name="defaultSideGroup"
                                  checked={defaultSide === side.id}
                                  onChange={() => {
                                    setDefaultSide(side.id);
                                    if (!allowedSides.includes(side.id)) {
                                      setAllowedSides([...allowedSides, side.id]);
                                    }
                                  }}
                                  className="accent-[#d32f2f] cursor-pointer"
                                />
                                <span className="font-bold text-xs text-[#1e293b]">{side.label}</span>
                              </div>
                              <span className="text-[10px] text-[#64748b]">{side.desc}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Opciones con las que se puede intercambiar */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[#141b2b]">
                            Sustituciones Permitidas (Con cuáles se puede intercambiar):
                          </span>
                          <span className="text-[10px] text-[#64748b] italic">
                            PDR §2.1: Máximo 1 sustitución por plato, <strong>NO altera el precio</strong> (Bs. 0.00)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            { id: 'mixto', label: 'Mixto (Papas Rústicas + Arroz con Queso)', tag: 'Base' },
                            { id: 'solo-papa', label: 'Solo Papas Fritas (Doble ración)', tag: 'Sin costo' },
                            { id: 'solo-arroz', label: 'Solo Arroz con Queso (Doble ración)', tag: 'Sin costo' },
                            { id: 'smiles', label: 'Smiles McCain (Caritas de papa)', tag: 'Sin costo' },
                            { id: 'platano', label: 'Plátano Frito / Guarnición extra', tag: 'Sin costo' },
                          ].map((item) => {
                            const isChecked = allowedSides.includes(item.id);
                            return (
                              <label
                                key={item.id}
                                className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                                  isChecked ? 'bg-white border-[#cbd5e1]' : 'bg-[#f8f9fc] border-[#e2e8f0] opacity-70'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAllowedSides([...allowedSides, item.id]);
                                      } else {
                                        if (item.id === defaultSide) {
                                          alert('No puede deshabilitar el acompañamiento que está configurado por defecto.');
                                          return;
                                        }
                                        setAllowedSides(allowedSides.filter((id) => id !== item.id));
                                      }
                                    }}
                                    className="accent-[#d32f2f] w-4 h-4 cursor-pointer"
                                  />
                                  <span className="font-medium text-xs text-[#1e293b]">{item.label}</span>
                                </div>
                                <span className="font-mono text-[10px] text-[#15803d] font-bold">Bs. 0.00</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: BEBIDA Y EXTRAS */}
                  {variantTab === 'drinks' && (
                    <div className="flex flex-col gap-3 animate-fade-in">
                      <div className="p-3 bg-[#f8f9fc] rounded-lg border border-[#e2e8f0] flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasIncludedDrink}
                            onChange={(e) => setHasIncludedDrink(e.target.checked)}
                            className="w-4 h-4 rounded text-[#d32f2f] accent-[#d32f2f] cursor-pointer"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#1e293b] block">
                              ¿Este plato/combo incluye bebida en su composición?
                            </span>
                            <span className="text-[10px] text-[#64748b]">
                              Ejemplo: Combo Wonder incluye bebida 500ml ya en su precio base (PDR §2.2).
                            </span>
                          </div>
                        </label>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          hasIncludedDrink ? 'bg-emerald-50 text-[#15803d] border border-emerald-200' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {hasIncludedDrink ? 'BEBIDA INCLUIDA' : 'SIN BEBIDA'}
                        </span>
                      </div>

                      {hasIncludedDrink && (
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="font-bold text-[#141b2b]">Bebida por Defecto (Default):</label>
                            <select
                              value={defaultDrink}
                              onChange={(e) => {
                                setDefaultDrink(e.target.value);
                                if (!allowedDrinks.includes(e.target.value)) {
                                  setAllowedDrinks([...allowedDrinks, e.target.value]);
                                }
                              }}
                              className="px-3 py-2 bg-[#f1f3ff] rounded-lg border border-[#cbd5e1] font-semibold text-xs text-[#1e293b] outline-none cursor-pointer"
                            >
                              <option value="Coca Cola 500ml">Coca Cola 500ml (Personal)</option>
                              <option value="Fanta Naranja 500ml">Fanta Naranja 500ml</option>
                              <option value="Sprite 500ml">Sprite 500ml</option>
                              <option value="Mocochinchi Casero">Mocochinchi Casero 500ml</option>
                              <option value="Agua Mineral 500ml">Agua Mineral Vital 500ml</option>
                            </select>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-[#141b2b]">
                                Bebidas con las que se puede intercambiar (Mismo volumen/precio):
                              </span>
                              <span className="text-[10px] text-[#64748b]">Intercambio de bebida por bebida</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {[
                                'Coca Cola 500ml',
                                'Fanta Naranja 500ml',
                                'Sprite 500ml',
                                'Mocochinchi Casero',
                                'Agua Mineral 500ml',
                                'Jugo del Valle 500ml',
                              ].map((drinkName) => {
                                const isSelected = allowedDrinks.includes(drinkName);
                                return (
                                  <label
                                    key={drinkName}
                                    className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                                      isSelected ? 'bg-white border-[#cbd5e1]' : 'bg-[#f8f9fc] border-[#e2e8f0] opacity-60'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setAllowedDrinks([...allowedDrinks, drinkName]);
                                          } else {
                                            if (drinkName === defaultDrink) {
                                              alert('No puede quitar la bebida por defecto.');
                                              return;
                                            }
                                            setAllowedDrinks(allowedDrinks.filter((d) => d !== drinkName));
                                          }
                                        }}
                                        className="accent-[#d32f2f] w-4 h-4 cursor-pointer"
                                      />
                                      <span className="text-xs font-medium text-[#1e293b]">{drinkName}</span>
                                    </div>
                                    <span className="font-mono text-[10px] text-[#15803d] font-bold">Intercambiable</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 text-center text-[#64748b] text-[11px] bg-white">
                Producto simple sin variantes de plato (ej. Extra, Bebida suelta o Postre). Se venderá directamente al precio base de <strong>Bs. {(parseFloat(newBasePrice) || 0).toFixed(2)}</strong>.
              </div>
            )}
          </div>
        </div>
      </AppModal>
    </div>
  );
};
