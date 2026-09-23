import React, { useState } from 'react';
import Chip from '@mui/material/Chip';
import { Product } from '../types';
import { AppModal } from '../commonComponents/AppModal';
import { MuiDataGridTable, TableColumn } from '../commonComponents/MuiDataGridTable';
import { ProductRulesModal } from './ProductRulesModal';

interface CatalogScreenProps {
  products: Product[];
  onUpdateProduct?: (updated: Product) => void;
  onBackToPOS?: () => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  products,
  onUpdateProduct,
  onBackToPOS,
}) => {
  const [productList, setProductList] = useState<Product[]>(products);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedProductRule, setSelectedProductRule] = useState<Product | null>(null);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
  const [hasIncludedSide, setHasIncludedSide] = useState<boolean>(true);
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
    setShowRuleModal(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
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
    setHasIncludedSide(true);
    setDefaultSide('mixto');
    setAllowedSides(['mixto', 'solo-arroz', 'solo-papa', 'smiles']);
    setHasIncludedDrink(true);
    setDefaultDrink('Coca Cola 500ml');
    setAllowedDrinks(['Coca Cola 500ml', 'Fanta Naranja 500ml', 'Sprite 500ml', 'Mocochinchi Casero']);
    setShowNewProductModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setNewCode(product.code || '');
    setNewName(product.name || '');
    setNewBasePrice(String(product.basePrice ?? product.price ?? 25));

    const standardCats = ['Plato principal', 'Bebida', 'Acompañamiento', 'Extra', 'Postre'];
    if (standardCats.includes(product.category)) {
      setNewCategory(product.category);
      setCustomCategory('');
    } else if (product.category) {
      setNewCategory('custom');
      setCustomCategory(product.category);
    } else {
      setNewCategory('Plato principal');
      setCustomCategory('');
    }

    setNewDesc(product.description || '');
    setNewActive(product.active !== false);
    setNewIsSellable(product.isSellable !== false);
    setNewIsInventoryItem(product.isInventoryItem !== false);

    const isConfigurable = Boolean(product.configurable || product.variantRules);
    setHasVariants(isConfigurable);

    if (product.variantRules) {
      setPresCount(product.variantRules.presCount || 2);
      setAllowedPresas(
        product.variantRules.allowedPresas || {
          pecho: true,
          ala: true,
          pierna: true,
          entrepierna: true,
        }
      );
      const isSideInc = Boolean(
        product.variantRules.hasIncludedSide !== undefined
          ? product.variantRules.hasIncludedSide
          : (product.variantRules.allowedSides && product.variantRules.allowedSides.length > 0) || product.variantRules.defaultSide
      );
      setHasIncludedSide(isSideInc);
      setDefaultSide(product.variantRules.defaultSide || 'mixto');
      setAllowedSides(
        product.variantRules.allowedSides || ['mixto', 'solo-arroz', 'solo-papa', 'smiles']
      );
      setHasIncludedDrink(Boolean(product.variantRules.hasIncludedDrink));
      setDefaultDrink(product.variantRules.defaultDrink || 'Coca Cola 500ml');
      setAllowedDrinks(
        product.variantRules.allowedDrinks || [
          'Coca Cola 500ml',
          'Fanta Naranja 500ml',
          'Sprite 500ml',
          'Mocochinchi Casero',
        ]
      );
    } else {
      setPresCount(2);
      setAllowedPresas({ pecho: true, ala: true, pierna: true, entrepierna: true });
      setHasIncludedSide(false);
      setDefaultSide('mixto');
      setAllowedSides(['mixto', 'solo-arroz', 'solo-papa', 'smiles']);
      setHasIncludedDrink(false);
      setDefaultDrink('Coca Cola 500ml');
      setAllowedDrinks(['Coca Cola 500ml', 'Fanta Naranja 500ml', 'Sprite 500ml', 'Mocochinchi Casero']);
    }

    setShowNewProductModal(true);
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

    const variantRulesConfig = hasVariants ? {
      presCount,
      allowedPresas,
      hasIncludedSide,
      defaultSide: hasIncludedSide ? defaultSide : undefined,
      allowedSides: hasIncludedSide ? allowedSides : [],
      hasIncludedDrink,
      defaultDrink: hasIncludedDrink ? defaultDrink : undefined,
      allowedDrinks: hasIncludedDrink ? allowedDrinks : [],
    } : undefined;

    const effectiveVariants = hasVariants
      ? [
          {
            id: editingProduct?.variants?.[0]?.id || `var-${Date.now()}-1`,
            name: `${newName.trim()} (Estándar / ${presCount} Presas)`,
            priceDelta: 0,
            sku: `${generatedCode}-VAR1`,
          }
        ]
      : [];

    let optionsPreviewText = 'Fórmula Base Simple';
    if (hasVariants) {
      const parts = [`${presCount} Presas`];
      if (hasIncludedSide && defaultSide) parts.push(`Acomp: ${defaultSide}`);
      if (hasIncludedDrink && defaultDrink) parts.push(`Bebida: ${defaultDrink}`);
      optionsPreviewText = parts.join(' • ');
    }

    if (editingProduct) {
      const updatedProd: Product = {
        ...editingProduct,
        code: generatedCode,
        name: newName.trim(),
        category: finalCategory,
        price: parsedPrice,
        basePrice: parsedPrice,
        description: newDesc.trim(),
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

      setProductList((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedProd : p)));
      if (onUpdateProduct) onUpdateProduct(updatedProd);
      showToast(`Producto "${updatedProd.name}" actualizado con éxito.`);
      setShowNewProductModal(false);
      setEditingProduct(null);
      return;
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
            onClick={openCreateModal}
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

      {/* Products Table Card using MuiDataGridTable */}
      <MuiDataGridTable<Product>
        rows={filteredProducts}
        getRowId={(row) => row.id}
        columns={[
          {
            field: 'code',
            headerName: 'Código',
            width: 110,
            renderCell: ({ row }) => (
              <span className="font-mono font-bold text-[#af101a] dark:text-[#ef5350]">
                {row.code}
              </span>
            ),
          },
          {
            field: 'name',
            headerName: 'Producto & Imagen',
            minWidth: 240,
            flex: 1.5,
            renderCell: ({ row }) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0 border border-[#e1e8fd] dark:border-[#263554]">
                  <img
                    src={row.imageUrl}
                    alt={row.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">{row.name}</span>
                  <span className="text-[11px] text-[#5b403d] dark:text-[#94a3b8] line-clamp-1">{row.description}</span>
                </div>
              </div>
            ),
          },
          {
            field: 'category',
            headerName: 'Categoría',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
              <Chip
                label={row.category}
                size="small"
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              />
            ),
          },
          {
            field: 'price',
            headerName: 'Precio Base',
            width: 120,
            align: 'right',
            headerAlign: 'right',
            renderCell: ({ row }) => (
              <span className="font-mono font-bold text-sm text-[#af101a] dark:text-[#ef5350]">
                Bs. {row.price.toFixed(2)}
              </span>
            ),
          },
          {
            field: 'variantsCount',
            headerName: 'Variantes',
            width: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
              <Chip
                label={`${row.variantsCount || (row.configurable ? 4 : 1)} Var.`}
                size="small"
                variant="filled"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}
              />
            ),
          },
          {
            field: 'optionsPreview',
            headerName: 'Reglas de Armado',
            minWidth: 170,
            flex: 1.1,
            renderCell: ({ row }) => (
              <span className="text-xs text-[#5b403d] dark:text-[#cbd5e1] truncate">
                {row.optionsPreview || (row.configurable ? 'Bebida / Papas / Ensalada' : 'Fórmula fija')}
              </span>
            ),
          },
          {
            field: 'configurable',
            headerName: 'Control Presas',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
              <Chip
                label={row.configurable ? 'Sí Presas' : 'No Presas'}
                size="small"
                color={row.configurable ? 'success' : 'default'}
                variant={row.configurable ? 'filled' : 'outlined'}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              />
            ),
          },
          {
            field: 'active',
            headerName: 'POS Activo',
            width: 110,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ row }) => (
              <button
                type="button"
                onClick={() => handleToggleActive(row.id)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                  row.active ? 'bg-[#15803d]' : 'bg-[#e1e8fd] dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5 ${
                    row.active ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            ),
          },
          {
            field: 'actions',
            headerName: 'Acciones',
            width: 140,
            align: 'right',
            headerAlign: 'right',
            renderCell: ({ row }) => (
              <div className="flex items-center justify-end gap-1.5">
                {row.configurable && (
                  <button
                    type="button"
                    onClick={() => openRules(row)}
                    className="px-2 py-1 bg-[#ffdad6] dark:bg-rose-950/60 hover:bg-[#ffb4ab] dark:hover:bg-rose-900/60 text-[#af101a] dark:text-[#ef5350] font-mono text-[11px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                    title="Ver Ficha Técnica de Reglas de Armado"
                  >
                    <span className="material-symbols-outlined text-[14px]">schema</span>
                    Reglas
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEditModal(row)}
                  className="p-1.5 rounded bg-[#f1f3ff] dark:bg-[#1a233b] hover:bg-[#e1e8fd] dark:hover:bg-[#263554] text-[#141b2b] dark:text-[#f8fafc] cursor-pointer transition-colors flex items-center justify-center"
                  title={`Editar producto ${row.name}`}
                >
                  <span className="material-symbols-outlined text-[15px]">edit</span>
                </button>
              </div>
            ),
          },
        ]}
        header={{
          title: 'Catálogo de Menú y Variantes',
          badgeText: `${filteredProducts.length} productos`,
          showSearch: true,
          searchPlaceholder: 'Buscar producto o código...',
        }}
        pagination={{
          pageSize: 10,
          pageSizeOptions: [5, 10, 20, 50],
        }}
        emptyState={{
          message: 'No se encontraron productos',
          subMessage: 'Pruebe seleccionando otra categoría o limpiando la búsqueda.',
        }}
        rowHeight={68}
        minHeight={500}
      />

      {/* MODAL: Ficha Técnica de Reglas Operativas (Solo Lectura con Tabs Dinámicos) */}
      {selectedProductRule && (
        <ProductRulesModal
          isOpen={showRuleModal}
          onClose={() => setShowRuleModal(false)}
          product={selectedProductRule}
        />
      )}

      {/* MODAL: Registrar / Editar Producto (Modelo Prisma Product + Variants) */}
      <AppModal
        isOpen={showNewProductModal}
        onClose={() => {
          setShowNewProductModal(false);
          setEditingProduct(null);
        }}
        icon={editingProduct ? 'edit' : 'add_box'}
        title={editingProduct ? `Editar Producto: ${editingProduct.name}` : 'Registrar Nuevo Producto'}
        description={
          editingProduct
            ? 'Actualización de datos maestros, precios y reglas de ensamble'
            : 'Modelo de datos oficial • Soporte para categorías libres y gestión de variantes'
        }
        maxWidth="2xl"
        onConfirm={() => {
          handleSaveNewProduct();
        }}
        confirmLabel={editingProduct ? 'Guardar Cambios' : 'Guardar Producto'}
        confirmIcon={editingProduct ? 'save' : 'add_circle'}
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
                      {/* Control similar al de Bebida */}
                      <div className="p-3 bg-[#f8f9fc] rounded-lg border border-[#e2e8f0] flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasIncludedSide}
                            onChange={(e) => setHasIncludedSide(e.target.checked)}
                            className="w-4 h-4 rounded text-[#d32f2f] accent-[#d32f2f] cursor-pointer"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#1e293b] block">
                              ¿Este plato/combo incluye acompañamiento en su composición?
                            </span>
                            <span className="text-[10px] text-[#64748b]">
                              Ejemplo: Porción Media y Combos incluyen papas y arroz sin costo adicional (PDR §2.1).
                            </span>
                          </div>
                        </label>
                        <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                          hasIncludedSide ? 'bg-emerald-50 text-[#15803d] border border-emerald-200' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {hasIncludedSide ? 'ACOMPAÑAMIENTO INCLUIDO' : 'SIN ACOMPAÑAMIENTO'}
                        </span>
                      </div>

                      {hasIncludedSide ? (
                        <>
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
                        </>
                      ) : (
                        <div className="p-4 rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8f9fc] text-center">
                          <p className="text-xs text-[#64748b]">
                            Este plato se despacha <strong>sin acompañamiento</strong> (por ejemplo: Cuarto de Pollo, Medio Pollo). En caja solo se despacharán las presas seleccionadas.
                          </p>
                        </div>
                      )}
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
