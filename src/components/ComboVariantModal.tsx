import React, { useState, useEffect } from 'react';
import { Product, ComboConfiguration, PresasCount } from '../types';
import { AppModal } from '../commonComponents/AppModal';

interface ComboVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: ComboConfiguration) => void;
  product?: Product | null;
}

export const ComboVariantModal: React.FC<ComboVariantModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  product,
}) => {
  // Determine product specs & rules
  const targetProduct = product || {
    id: 'p-003',
    code: 'P-003',
    name: 'Combo Wonder',
    price: 36.0,
    category: 'principales',
    variantRules: {
      presCount: 2,
      allowedPresas: { pecho: true, ala: true, pierna: true, entrepierna: true },
      defaultSide: 'mixto',
      allowedSides: ['mixto', 'solo-papa', 'solo-arroz', 'smiles'],
      hasIncludedDrink: true,
      defaultDrink: 'Coca Cola 500ml',
      allowedDrinks: ['Coca Cola 500ml', 'Coca Cola Zero 500ml', 'Fanta Naranja 500ml', 'Sprite 500ml', 'Mocochinchi Casero 500ml'],
    },
  };

  const rules = targetProduct.variantRules;
  const targetPresasRequired = rules?.presCount ?? 2;

  // Has side included? ONLY if product explicitly defines allowedSides or defaultSide
  const hasSide = Boolean(rules?.allowedSides && rules.allowedSides.length > 0) || Boolean(rules?.defaultSide);
  // Has drink included?
  const hasDrink = Boolean(rules?.hasIncludedDrink);

  const [presaTab, setPresaTab] = useState<'rapido' | 'granular'>('rapido');

  // Quick selection keys:
  // For 2 presas: 'pecho-ala' | 'pierna-entrepierna'
  // For 4 presas: 'completo' (1 Pecho, 1 Ala, 1 Pierna, 1 Entrepierna) | 'doble-pecho-ala' (2 Pecho, 2 Ala) | 'doble-pierna-entrepierna' (2 Pierna, 2 Entrepierna)
  const [selectedQuickPreset, setSelectedQuickPreset] = useState<string>('default');

  const [granularPresas, setGranularPresas] = useState<PresasCount>({
    ala: 1,
    pecho: 1,
    pierna: 0,
    entrepierna: 0,
  });

  const defaultSideVal = (rules?.defaultSide as any) || 'mixto';
  const [sideOption, setSideOption] = useState<string>(defaultSideVal);

  const defaultDrinkVal = rules?.defaultDrink || 'Coca Cola 500ml';
  const [drink, setDrink] = useState<string>(defaultDrinkVal);
  const [temperature, setTemperature] = useState<'FRÍA' | 'NATURAL'>('FRÍA');

  // Initialize and reset when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setPresaTab('rapido');
      if (targetPresasRequired === 4) {
        setSelectedQuickPreset('completo');
        setGranularPresas({
          pecho: 1,
          ala: 1,
          pierna: 1,
          entrepierna: 1,
        });
      } else {
        setSelectedQuickPreset('pecho-ala');
        setGranularPresas({
          ala: 1,
          pecho: 1,
          pierna: 0,
          entrepierna: 0,
        });
      }
      setSideOption((rules?.defaultSide as any) || 'mixto');
      setDrink(rules?.defaultDrink || 'Coca Cola 500ml');
      setTemperature('FRÍA');
    }
  }, [isOpen, targetProduct.id, targetPresasRequired]);

  if (!isOpen) return null;

  // Calculate current total presas
  const totalPresas =
    presaTab === 'rapido'
      ? targetPresasRequired
      : granularPresas.ala + granularPresas.pecho + granularPresas.pierna + granularPresas.entrepierna;

  const isValid = totalPresas === targetPresasRequired;

  const adjustPresa = (kind: keyof PresasCount, delta: number) => {
    const currentVal = granularPresas[kind];
    if (delta < 0 && currentVal <= 0) return;
    if (delta > 0 && totalPresas >= targetPresasRequired) return;

    setGranularPresas((prev) => ({
      ...prev,
      [kind]: prev[kind] + delta,
    }));
  };

  const handleSelectQuickPreset = (presetKey: string) => {
    setSelectedQuickPreset(presetKey);

    if (targetPresasRequired === 4) {
      if (presetKey === 'completo') {
        setGranularPresas({ pecho: 1, ala: 1, pierna: 1, entrepierna: 1 });
      } else if (presetKey === 'doble-pecho-ala') {
        setGranularPresas({ pecho: 2, ala: 2, pierna: 0, entrepierna: 0 });
      } else if (presetKey === 'doble-pierna-entrepierna') {
        setGranularPresas({ pecho: 0, ala: 0, pierna: 2, entrepierna: 2 });
      }
    } else {
      if (presetKey === 'pecho-ala') {
        setGranularPresas({ ala: 1, pecho: 1, pierna: 0, entrepierna: 0 });
      } else if (presetKey === 'pierna-entrepierna') {
        setGranularPresas({ ala: 0, pecho: 0, pierna: 1, entrepierna: 1 });
      }
    }
  };

  const handleAdd = () => {
    if (!isValid) return;

    let presasToSave: PresasCount = { ...granularPresas };

    if (presaTab === 'rapido') {
      if (targetPresasRequired === 4) {
        if (selectedQuickPreset === 'completo') {
          presasToSave = { pecho: 1, ala: 1, pierna: 1, entrepierna: 1 };
        } else if (selectedQuickPreset === 'doble-pecho-ala') {
          presasToSave = { pecho: 2, ala: 2, pierna: 0, entrepierna: 0 };
        } else if (selectedQuickPreset === 'doble-pierna-entrepierna') {
          presasToSave = { pecho: 0, ala: 0, pierna: 2, entrepierna: 2 };
        }
      } else {
        if (selectedQuickPreset === 'pecho-ala') {
          presasToSave = { ala: 1, pecho: 1, pierna: 0, entrepierna: 0 };
        } else {
          presasToSave = { ala: 0, pecho: 0, pierna: 1, entrepierna: 1 };
        }
      }
    }

    const presasList: string[] = [];
    if (presasToSave.pecho) presasList.push(`${presasToSave.pecho}x Pecho`);
    if (presasToSave.ala) presasList.push(`${presasToSave.ala}x Ala`);
    if (presasToSave.pierna) presasList.push(`${presasToSave.pierna}x Pierna`);
    if (presasToSave.entrepierna) presasList.push(`${presasToSave.entrepierna}x Entrepierna`);

    const noteLines: string[] = [];
    noteLines.push(`• Presas: ${presasList.join(', ')}`);

    if (hasSide) {
      let sideLabel = 'Mixto (Papa y Arroz)';
      if (sideOption === 'solo-arroz') sideLabel = 'Solo Arroz';
      if (sideOption === 'solo-papa') sideLabel = 'Solo Papa';
      if (sideOption === 'smiles') sideLabel = 'Smiles McCain';
      noteLines.push(`• Acompañamiento: ${sideLabel}`);
    }

    if (hasDrink) {
      noteLines.push(`• Bebida: 1x ${drink} (${temperature})`);
    }

    const notes = noteLines.join('\n');

    onConfirm({
      presas: presasToSave,
      side: hasSide ? (sideOption as any) : undefined,
      drink: hasDrink ? drink : undefined,
      temperature: hasDrink ? temperature : undefined,
      notes,
    });
    onClose();
  };

  // Human description for modal header
  const modalDescription = [
    `Selección de ${targetPresasRequired} presas`,
    hasSide ? 'Acompañamiento con sustitución' : null,
    hasDrink ? 'Bebida 500ml' : null,
  ]
    .filter(Boolean)
    .join(' + ');

  const allowedSidesList = rules?.allowedSides || ['mixto', 'solo-papa', 'solo-arroz', 'smiles'];
  const allowedDrinksList = rules?.allowedDrinks || [
    'Coca Cola 500ml',
    'Coca Cola Zero 500ml',
    'Fanta Naranja 500ml',
    'Sprite 500ml',
    'Mocochinchi Casero 500ml',
  ];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon="tune"
      title={`Configurar Variante: ${targetProduct.name}`}
      description={modalDescription}
      maxWidth="2xl"
      footerExtra={
        <div className="flex flex-col">
          <span className="font-mono text-xs text-[#5b403d] dark:text-[#94a3b8]">Precio Final:</span>
          <span className="font-mono text-lg font-bold text-[#af101a] dark:text-[#f87171]">
            Bs. {targetProduct.price.toFixed(2)}
          </span>
        </div>
      }
      onConfirm={handleAdd}
      confirmLabel={`Agregar a la Orden (Bs. ${targetProduct.price.toFixed(2)})`}
      confirmIcon="add_shopping_cart"
      confirmDisabled={!isValid}
      showCancel={true}
      cancelLabel="Cancelar"
    >
      <div className="flex flex-col gap-4">
        {/* Step 1: Presas Requeridas */}
        <div className="mui-container-subtle bg-[#f8f9fc] dark:bg-[#1a233b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#263554] flex flex-col gap-3 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-[#141b2b] dark:text-[#f8fafc] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#af101a] dark:text-[#f87171] text-[18px]">kebab_dining</span>
              1. Selección de Presas (Total requeridas: {targetPresasRequired})
            </span>
            <span
              className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold ${
                isValid ? 'bg-[#d32f2f] text-white' : 'bg-[#ba1a1a] text-white animate-pulse'
              }`}
            >
              {totalPresas} / {targetPresasRequired} Seleccionadas
            </span>
          </div>
          <p className="text-xs text-[#5b403d] dark:text-[#94a3b8]">
            {targetPresasRequired === 4
              ? 'Seleccione una combinación estándar rápida o personalice individualmente las 4 presas exactas.'
              : 'Seleccione un par tradicional rápido (1 clic) o personalice individualmente las 2 presas exactas.'}
          </p>

          {/* Navigation Tabs Header */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#e9edf8] dark:bg-[#243050] rounded-lg">
            <button
              type="button"
              onClick={() => setPresaTab('rapido')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                presaTab === 'rapido'
                  ? 'bg-white dark:bg-[#131b2e] text-[#af101a] dark:text-[#f87171] shadow-xs'
                  : 'text-[#5b403d] dark:text-[#94a3b8] hover:text-[#141b2b] dark:hover:text-[#f8fafc]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              {targetPresasRequired === 4 ? 'Combinación Rápida (4 presas)' : 'Pares Tradicionales (Rápido)'}
            </button>
            <button
              type="button"
              onClick={() => setPresaTab('granular')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                presaTab === 'granular'
                  ? 'bg-white dark:bg-[#131b2e] text-[#af101a] dark:text-[#f87171] shadow-xs'
                  : 'text-[#5b403d] dark:text-[#94a3b8] hover:text-[#141b2b] dark:hover:text-[#f8fafc]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Selección Granular ({targetPresasRequired} exactas)
            </button>
          </div>

          {/* Tab 1: Combinación Rápida */}
          {presaTab === 'rapido' && (
            <div className="flex flex-col gap-2">
              {targetPresasRequired === 4 ? (
                // 4 Presas Quick Presets: 3 columns on desktop/tablet, 1 column on mobile
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Preset 1: Completo Clásico (1 Pecho, 1 Ala, 1 Pierna, 1 Entrepierna) */}
                  <label
                    onClick={() => handleSelectQuickPreset('completo')}
                    className={`relative flex sm:flex-col sm:items-start items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedQuickPreset === 'completo'
                        ? 'border-[#af101a] dark:border-[#f87171] bg-white dark:bg-[#131b2e] shadow-xs'
                        : 'border-[#e2e8f0] dark:border-[#263554] bg-white dark:bg-[#131b2e] hover:border-[#af101a]/40'
                    }`}
                  >
                    <div className="flex sm:flex-col items-start gap-2.5 sm:gap-2 w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="preset-selection"
                            checked={selectedQuickPreset === 'completo'}
                            onChange={() => handleSelectQuickPreset('completo')}
                            className="accent-[#af101a] w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span className="font-bold text-xs sm:text-sm text-[#141b2b] dark:text-[#f8fafc] leading-tight">
                            Medio Completo
                          </span>
                        </div>
                        <span className="bg-[#fec330] text-[#6f5100] font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                          Estándar
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs text-[#5b403d] dark:text-[#94a3b8] sm:pl-6">
                        1 Pecho + 1 Ala + 1 Pierna + 1 Entrepierna
                      </span>
                    </div>
                  </label>

                  {/* Preset 2: Doble Pecho - Ala */}
                  <label
                    onClick={() => handleSelectQuickPreset('doble-pecho-ala')}
                    className={`relative flex sm:flex-col sm:items-start items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedQuickPreset === 'doble-pecho-ala'
                        ? 'border-[#af101a] dark:border-[#f87171] bg-white dark:bg-[#131b2e] shadow-xs'
                        : 'border-[#e2e8f0] dark:border-[#263554] bg-white dark:bg-[#131b2e] hover:border-[#af101a]/40'
                    }`}
                  >
                    <div className="flex sm:flex-col items-start gap-2.5 sm:gap-2 w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="preset-selection"
                            checked={selectedQuickPreset === 'doble-pecho-ala'}
                            onChange={() => handleSelectQuickPreset('doble-pecho-ala')}
                            className="accent-[#af101a] w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span className="font-bold text-xs sm:text-sm text-[#141b2b] dark:text-[#f8fafc] leading-tight">
                            Doble Pecho + Ala
                          </span>
                        </div>
                        <span className="bg-[#f1f3ff] text-[#af101a] font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                          Blanca
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs text-[#5b403d] dark:text-[#94a3b8] sm:pl-6">
                        2 Pechos + 2 Alas
                      </span>
                    </div>
                  </label>

                  {/* Preset 3: Doble Pierna - Entrepierna */}
                  <label
                    onClick={() => handleSelectQuickPreset('doble-pierna-entrepierna')}
                    className={`relative flex sm:flex-col sm:items-start items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedQuickPreset === 'doble-pierna-entrepierna'
                        ? 'border-[#af101a] dark:border-[#f87171] bg-white dark:bg-[#131b2e] shadow-xs'
                        : 'border-[#e2e8f0] dark:border-[#263554] bg-white dark:bg-[#131b2e] hover:border-[#af101a]/40'
                    }`}
                  >
                    <div className="flex sm:flex-col items-start gap-2.5 sm:gap-2 w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="preset-selection"
                            checked={selectedQuickPreset === 'doble-pierna-entrepierna'}
                            onChange={() => handleSelectQuickPreset('doble-pierna-entrepierna')}
                            className="accent-[#af101a] w-4 h-4 cursor-pointer shrink-0"
                          />
                          <span className="font-bold text-xs sm:text-sm text-[#141b2b] dark:text-[#f8fafc] leading-tight">
                            Doble Pierna + Entrep.
                          </span>
                        </div>
                        <span className="bg-[#fff5f5] text-[#af101a] font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                          Jugosa
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs text-[#5b403d] dark:text-[#94a3b8] sm:pl-6">
                        2 Piernas + 2 Entrepiernas
                      </span>
                    </div>
                  </label>
                </div>
              ) : (
                // 2 Presas Quick Presets (Cuarto de Pollo, Porción Media, Combo Wonder)
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Option 1: Pecho - Ala */}
                  <label
                    onClick={() => handleSelectQuickPreset('pecho-ala')}
                    className={`relative flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedQuickPreset === 'pecho-ala'
                        ? 'border-[#af101a] dark:border-[#f87171] bg-white dark:bg-[#131b2e] shadow-xs'
                        : 'border-[#e2e8f0] dark:border-[#263554] bg-white dark:bg-[#131b2e] hover:border-[#af101a]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="pair-selection"
                        checked={selectedQuickPreset === 'pecho-ala'}
                        onChange={() => handleSelectQuickPreset('pecho-ala')}
                        className="accent-[#af101a] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#141b2b] dark:text-[#f8fafc]">Pecho - Ala</span>
                          <span className="bg-[#fec330] text-[#6f5100] font-mono text-[10px] px-1.5 py-0.2 rounded font-bold uppercase">
                            Favorito
                          </span>
                        </div>
                        <span className="text-xs text-[#5b403d] dark:text-[#94a3b8]">
                          1 Pecho + 1 Ala (Tradicional dorada)
                        </span>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Pierna - Entrepierna */}
                  <label
                    onClick={() => handleSelectQuickPreset('pierna-entrepierna')}
                    className={`relative flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedQuickPreset === 'pierna-entrepierna'
                        ? 'border-[#af101a] dark:border-[#f87171] bg-white dark:bg-[#131b2e] shadow-xs'
                        : 'border-[#e2e8f0] dark:border-[#263554] bg-white dark:bg-[#131b2e] hover:border-[#af101a]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="pair-selection"
                        checked={selectedQuickPreset === 'pierna-entrepierna'}
                        onChange={() => handleSelectQuickPreset('pierna-entrepierna')}
                        className="accent-[#af101a] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#141b2b] dark:text-[#f8fafc]">Pierna - Entrepierna</span>
                        <span className="text-xs text-[#5b403d] dark:text-[#94a3b8]">
                          1 Pierna + 1 Entrepierna (Jugosa)
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
              )}

              <span className="font-mono text-[11px] text-[#5b403d] dark:text-[#94a3b8] text-right italic">
                * Selección en 1 clic para acelerar la atención en caja
              </span>
            </div>
          )}

          {/* Tab 2: Granular */}
          {presaTab === 'granular' && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Pecho */}
                <div
                  className={`p-3 rounded-lg flex flex-col items-center justify-between gap-2 shadow-xs border bg-white dark:bg-[#131b2e] ${
                    granularPresas.pecho > 0
                      ? 'border-[#af101a]/60 dark:border-[#f87171]/60 bg-[#fff2f0] dark:bg-[#231b2b]'
                      : 'border-[#e1e8fd] dark:border-[#263554]'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-[#af101a] dark:text-[#f87171] text-[20px]">lunch_dining</span>
                    <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">Pecho</span>
                    <span className="text-[10px] text-[#5b403d] dark:text-[#94a3b8]">Tradicional</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f1f3ff] dark:bg-[#243050] px-2 py-1 rounded">
                    <button
                      type="button"
                      onClick={() => adjustPresa('pecho', -1)}
                      className="w-7 h-7 bg-white dark:bg-[#131b2e] rounded font-bold text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold text-[#141b2b] dark:text-[#f8fafc] w-4 text-center">
                      {granularPresas.pecho}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustPresa('pecho', 1)}
                      disabled={totalPresas >= targetPresasRequired}
                      className={`w-7 h-7 rounded font-bold shadow-xs flex items-center justify-center ${
                        totalPresas >= targetPresasRequired
                          ? 'opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500'
                          : 'bg-white dark:bg-[#131b2e] text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] cursor-pointer'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Ala */}
                <div
                  className={`p-3 rounded-lg flex flex-col items-center justify-between gap-2 shadow-xs border bg-white dark:bg-[#131b2e] ${
                    granularPresas.ala > 0
                      ? 'border-[#af101a]/60 dark:border-[#f87171]/60 bg-[#fff2f0] dark:bg-[#231b2b]'
                      : 'border-[#e1e8fd] dark:border-[#263554]'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-[#af101a] dark:text-[#f87171] text-[20px]">kebab_dining</span>
                    <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">Ala</span>
                    <span className="text-[10px] text-[#5b403d] dark:text-[#94a3b8]">Crocante</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f1f3ff] dark:bg-[#243050] px-2 py-1 rounded">
                    <button
                      type="button"
                      onClick={() => adjustPresa('ala', -1)}
                      className="w-7 h-7 bg-white dark:bg-[#131b2e] rounded font-bold text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold text-[#141b2b] dark:text-[#f8fafc] w-4 text-center">
                      {granularPresas.ala}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustPresa('ala', 1)}
                      disabled={totalPresas >= targetPresasRequired}
                      className={`w-7 h-7 rounded font-bold shadow-xs flex items-center justify-center ${
                        totalPresas >= targetPresasRequired
                          ? 'opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500'
                          : 'bg-white dark:bg-[#131b2e] text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] cursor-pointer'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Pierna */}
                <div
                  className={`p-3 rounded-lg flex flex-col items-center justify-between gap-2 shadow-xs border bg-white dark:bg-[#131b2e] ${
                    granularPresas.pierna > 0
                      ? 'border-[#af101a]/60 dark:border-[#f87171]/60 bg-[#fff2f0] dark:bg-[#231b2b]'
                      : 'border-[#e1e8fd] dark:border-[#263554]'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-[#af101a] dark:text-[#f87171] text-[20px]">set_meal</span>
                    <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">Pierna</span>
                    <span className="text-[10px] text-[#5b403d] dark:text-[#94a3b8]">Jugosa</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f1f3ff] dark:bg-[#243050] px-2 py-1 rounded">
                    <button
                      type="button"
                      onClick={() => adjustPresa('pierna', -1)}
                      className="w-7 h-7 bg-white dark:bg-[#131b2e] rounded font-bold text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold text-[#141b2b] dark:text-[#f8fafc] w-4 text-center">
                      {granularPresas.pierna}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustPresa('pierna', 1)}
                      disabled={totalPresas >= targetPresasRequired}
                      className={`w-7 h-7 rounded font-bold shadow-xs flex items-center justify-center ${
                        totalPresas >= targetPresasRequired
                          ? 'opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500'
                          : 'bg-white dark:bg-[#131b2e] text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] cursor-pointer'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Entrepierna */}
                <div
                  className={`p-3 rounded-lg flex flex-col items-center justify-between gap-2 shadow-xs border bg-white dark:bg-[#131b2e] ${
                    granularPresas.entrepierna > 0
                      ? 'border-[#af101a]/60 dark:border-[#f87171]/60 bg-[#fff2f0] dark:bg-[#231b2b]'
                      : 'border-[#e1e8fd] dark:border-[#263554]'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="material-symbols-outlined text-[#af101a] dark:text-[#f87171] text-[20px]">dinner_dining</span>
                    <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">Entrepierna</span>
                    <span className="text-[10px] text-[#5b403d] dark:text-[#94a3b8]">Con hueso</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#f1f3ff] dark:bg-[#243050] px-2 py-1 rounded">
                    <button
                      type="button"
                      onClick={() => adjustPresa('entrepierna', -1)}
                      className="w-7 h-7 bg-white dark:bg-[#131b2e] rounded font-bold text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-sm font-bold text-[#141b2b] dark:text-[#f8fafc] w-4 text-center">
                      {granularPresas.entrepierna}
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustPresa('entrepierna', 1)}
                      disabled={totalPresas >= targetPresasRequired}
                      className={`w-7 h-7 rounded font-bold shadow-xs flex items-center justify-center ${
                        totalPresas >= targetPresasRequired
                          ? 'opacity-40 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500'
                          : 'bg-white dark:bg-[#131b2e] text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] cursor-pointer'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-[#5b403d] dark:text-[#94a3b8] text-right italic">
                * Debe completar exactamente {targetPresasRequired} presas (actualmente {totalPresas}/{targetPresasRequired})
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Acompañamiento y Sustitución (ONLY IF INCLUDED IN DISH) */}
        {hasSide && (
          <div className="mui-container-subtle bg-[#f8f9fc] dark:bg-[#1a233b] p-4 rounded-xl border border-[#e2e8f0] dark:border-[#263554] flex flex-col gap-3 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#141b2b] dark:text-[#f8fafc] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#795900] dark:text-[#facc15] text-[18px]">swap_horiz</span>
                2. Acompañamiento Incluido (1 sustitución sin costo adicional)
              </span>
              <span className="font-mono text-xs text-[#5b403d] dark:text-[#94a3b8] font-bold">+0.00 Bs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allowedSidesList.includes('mixto') && (
                <label className={`flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#131b2e] rounded-lg border cursor-pointer hover:bg-[#e9edff] dark:hover:bg-[#243050] transition-colors ${
                  sideOption === 'mixto' ? 'border-[#af101a] dark:border-[#f87171]' : 'border-[#e2e8f0] dark:border-[#263554]'
                }`}>
                  <input
                    type="radio"
                    name="side-option"
                    value="mixto"
                    checked={sideOption === 'mixto'}
                    onChange={() => setSideOption('mixto')}
                    className="accent-[#af101a]"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">Mixto: Papa y Arroz</span>
                    <span className="text-[11px] text-[#5b403d] dark:text-[#94a3b8]">Estándar equilibrado</span>
                  </div>
                </label>
              )}

              {allowedSidesList.includes('solo-papa') && (
                <label className={`flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#131b2e] rounded-lg border cursor-pointer hover:bg-[#e9edff] dark:hover:bg-[#243050] transition-colors ${
                  sideOption === 'solo-papa' ? 'border-[#af101a] dark:border-[#f87171]' : 'border-[#e2e8f0] dark:border-[#263554]'
                }`}>
                  <input
                    type="radio"
                    name="side-option"
                    value="solo-papa"
                    checked={sideOption === 'solo-papa'}
                    onChange={() => setSideOption('solo-papa')}
                    className="accent-[#af101a]"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">Solo Papa (Doble papa rústica)</span>
                    <span className="font-mono text-[11px] text-[#5b403d] dark:text-[#94a3b8]">Cambio: +0.00 Bs</span>
                  </div>
                </label>
              )}

              {allowedSidesList.includes('solo-arroz') && (
                <label className={`flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#131b2e] rounded-lg border cursor-pointer hover:bg-[#e9edff] dark:hover:bg-[#243050] transition-colors ${
                  sideOption === 'solo-arroz' ? 'border-[#af101a] dark:border-[#f87171]' : 'border-[#e2e8f0] dark:border-[#263554]'
                }`}>
                  <input
                    type="radio"
                    name="side-option"
                    value="solo-arroz"
                    checked={sideOption === 'solo-arroz'}
                    onChange={() => setSideOption('solo-arroz')}
                    className="accent-[#af101a]"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">Solo Arroz (Doble arroz especiado)</span>
                    <span className="font-mono text-[11px] text-[#5b403d] dark:text-[#94a3b8]">Cambio: +0.00 Bs</span>
                  </div>
                </label>
              )}

              {allowedSidesList.includes('smiles') && (
                <label className={`flex items-center gap-2.5 p-2.5 bg-white dark:bg-[#131b2e] rounded-lg border cursor-pointer hover:bg-[#e9edff] dark:hover:bg-[#243050] transition-colors ${
                  sideOption === 'smiles' ? 'border-[#af101a] dark:border-[#f87171]' : 'border-[#e2e8f0] dark:border-[#263554]'
                }`}>
                  <input
                    type="radio"
                    name="side-option"
                    value="smiles"
                    checked={sideOption === 'smiles'}
                    onChange={() => setSideOption('smiles')}
                    className="accent-[#af101a]"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-[#141b2b] dark:text-[#f8fafc]">Smiles McCain</span>
                    <span className="font-mono text-[11px] text-[#5b403d] dark:text-[#94a3b8]">Sustitución: +0.00 Bs</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Bebida 500ml Incluida & Temperatura (ONLY IF INCLUDED IN DISH) */}
        {hasDrink && (
          <div className="bg-[#f1f3ff] dark:bg-[#1a233b] p-4 rounded-xl border border-[#e1e8fd] dark:border-[#263554] flex flex-col gap-3">
            <span className="text-xs sm:text-sm font-bold text-[#141b2b] dark:text-[#f8fafc] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#005c8d] dark:text-[#38bdf8] text-[18px]">local_drink</span>
              3. Bebida 500ml Incluida &amp; Temperatura
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#5b403d] dark:text-[#94a3b8]">Bebida:</label>
                <select
                  value={drink}
                  onChange={(e) => setDrink(e.target.value)}
                  className="p-2.5 bg-white dark:bg-[#131b2e] text-[#141b2b] dark:text-[#f8fafc] rounded-lg border border-[#e1e8fd] dark:border-[#263554] text-xs font-semibold focus:outline-none focus:border-[#af101a]"
                >
                  {allowedDrinksList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#5b403d] dark:text-[#94a3b8]">Temperatura:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTemperature('FRÍA')}
                    className={`py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      temperature === 'FRÍA'
                        ? 'bg-[#005c8d] text-white shadow-xs'
                        : 'bg-white dark:bg-[#131b2e] text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] dark:hover:bg-[#243050] border border-[#e1e8fd] dark:border-[#263554]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">ac_unit</span>
                    FRÍA
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemperature('NATURAL')}
                    className={`py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      temperature === 'NATURAL'
                        ? 'bg-[#005c8d] text-white shadow-xs'
                        : 'bg-white dark:bg-[#131b2e] text-[#141b2b] dark:text-[#f8fafc] hover:bg-[#e1e8fd] dark:hover:bg-[#243050] border border-[#e1e8fd] dark:border-[#263554]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">thermostat</span>
                    NATURAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};
