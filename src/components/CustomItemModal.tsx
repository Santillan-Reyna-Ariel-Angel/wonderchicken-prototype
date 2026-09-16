import React, { useState } from 'react';
import { OrderItem } from '../types';
import { AppModal } from '../commonComponents/AppModal';

interface CustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomItem: (item: OrderItem) => void;
}

interface PieceItem {
  id: 'pecho' | 'pierna' | 'entrepierna' | 'ala';
  name: string;
  desc: string;
  icon: string;
  price: number;
}

interface SideItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: number;
}

interface DrinkItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  price: number;
}

const AVAILABLE_PIECES: PieceItem[] = [
  { id: 'pecho', name: 'Pecho', desc: 'Pechuga jugosa con hueso', icon: 'lunch_dining', price: 11.00 },
  { id: 'pierna', name: 'Pierna', desc: 'Pierna tradicional dorada', icon: 'set_meal', price: 10.00 },
  { id: 'entrepierna', name: 'Entrepierna', desc: 'Muslo jugoso con hueso', icon: 'dinner_dining', price: 10.00 },
  { id: 'ala', name: 'Ala', desc: 'Ala crocante a la brasa', icon: 'kebab_dining', price: 8.50 },
];

const AVAILABLE_SIDES: SideItem[] = [
  { id: 'papas', name: 'Porción Papas Fritas', desc: 'Corte rústico crocante', icon: 'fastfood', price: 12.00 },
  { id: 'arroz', name: 'Porción Arroz', desc: 'Arroz especiado receta Wonder', icon: 'rice_bowl', price: 8.00 },
  { id: 'mixto', name: 'Guarnición Mixta', desc: 'Mitad papas fritas y mitad arroz', icon: 'swap_horiz', price: 10.00 },
  { id: 'smiles', name: 'Smiles McCain', desc: 'Caritas de papa horneadas', icon: 'sentiment_satisfied', price: 12.00 },
  { id: 'ensalada', name: 'Ensalada Fresca', desc: 'Lechuga, tomate y aderezo', icon: 'nutrition', price: 6.00 },
];

const AVAILABLE_DRINKS: DrinkItem[] = [
  { id: 'coca', name: 'Coca Cola 500ml', desc: 'Botella personal clásica', icon: 'local_drink', price: 8.00 },
  { id: 'mocochinchi', name: 'Mocochinchi 500ml', desc: 'Artesanal con canela y clavo', icon: 'local_cafe', price: 6.00 },
  { id: 'sprite', name: 'Sprite 500ml', desc: 'Botella sabor lima-limón', icon: 'local_drink', price: 8.00 },
  { id: 'fanta', name: 'Fanta 500ml', desc: 'Botella sabor naranja', icon: 'local_drink', price: 8.00 },
  { id: 'agua', name: 'Agua Mineral 500ml', desc: 'Sin gas purificada', icon: 'water_drop', price: 5.00 },
];

export const CustomItemModal: React.FC<CustomItemModalProps> = ({
  isOpen,
  onClose,
  onAddCustomItem,
}) => {
  if (!isOpen) return null;

  // Active step in modal: 1 = Presas, 2 = Acompañantes, 3 = Bebidas
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Step 1: Quantities for pieces
  const [piecesQty, setPiecesQty] = useState<Record<string, number>>({
    pecho: 0,
    pierna: 0,
    entrepierna: 0,
    ala: 0,
  });

  // Step 2: Quantities for sides
  const [sidesQty, setSidesQty] = useState<Record<string, number>>({
    papas: 0,
    arroz: 0,
    mixto: 0,
    smiles: 0,
    ensalada: 0,
  });

  // Step 3: Quantities & temperature for drinks
  const [drinksQty, setDrinksQty] = useState<Record<string, number>>({
    coca: 0,
    mocochinchi: 0,
    sprite: 0,
    fanta: 0,
    agua: 0,
  });
  const [drinkTemps, setDrinkTemps] = useState<Record<string, 'FRÍA' | 'NATURAL'>>({
    coca: 'FRÍA',
    mocochinchi: 'FRÍA',
    sprite: 'FRÍA',
    fanta: 'FRÍA',
    agua: 'FRÍA',
  });

  // Notes
  const [specialNotes, setSpecialNotes] = useState('');

  // Handlers for adjust
  const handleAdjustPiece = (id: string, delta: number) => {
    setPiecesQty((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handleAdjustSide = (id: string, delta: number) => {
    setSidesQty((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handleAdjustDrink = (id: string, delta: number) => {
    setDrinksQty((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const toggleDrinkTemp = (id: string) => {
    setDrinkTemps((prev) => ({
      ...prev,
      [id]: prev[id] === 'FRÍA' ? 'NATURAL' : 'FRÍA',
    }));
  };

  // Calculations
  const totalPiecesCount: number = Object.values(piecesQty).reduce<number>((acc, q) => acc + (Number(q) || 0), 0);
  const piecesSubtotal: number = AVAILABLE_PIECES.reduce(
    (acc, p) => acc + (piecesQty[p.id] || 0) * p.price,
    0
  );

  const totalSidesCount: number = Object.values(sidesQty).reduce<number>((acc, q) => acc + (Number(q) || 0), 0);
  const sidesSubtotal: number = AVAILABLE_SIDES.reduce(
    (acc, s) => acc + (sidesQty[s.id] || 0) * s.price,
    0
  );

  const totalDrinksCount: number = Object.values(drinksQty).reduce<number>((acc, q) => acc + (Number(q) || 0), 0);
  const drinksSubtotal: number = AVAILABLE_DRINKS.reduce(
    (acc, d) => acc + (drinksQty[d.id] || 0) * d.price,
    0
  );

  const grandTotal: number = piecesSubtotal + sidesSubtotal + drinksSubtotal;
  const totalItemsCount: number = totalPiecesCount + totalSidesCount + totalDrinksCount;

  // Reset helper
  const handleReset = () => {
    setPiecesQty({ pecho: 0, pierna: 0, entrepierna: 0, ala: 0 });
    setSidesQty({ papas: 0, arroz: 0, mixto: 0, smiles: 0, ensalada: 0 });
    setDrinksQty({ coca: 0, mocochinchi: 0, sprite: 0, fanta: 0, agua: 0 });
    setSpecialNotes('');
    setActiveStep(1);
  };

  // Final submission
  const handleConfirmOrder = () => {
    if (grandTotal <= 0) return;

    // Generate detailed bullet points
    const lines: string[] = [];

    // Presas
    const pieceLines: string[] = [];
    AVAILABLE_PIECES.forEach((p) => {
      const q = piecesQty[p.id] || 0;
      if (q > 0) pieceLines.push(`${q}x ${p.name}`);
    });
    if (pieceLines.length > 0) {
      lines.push(`• Presas: ${pieceLines.join(', ')}`);
    }

    // Sides
    const sideLines: string[] = [];
    AVAILABLE_SIDES.forEach((s) => {
      const q = sidesQty[s.id] || 0;
      if (q > 0) sideLines.push(`${q}x ${s.name}`);
    });
    if (sideLines.length > 0) {
      lines.push(`• Acompañamiento: ${sideLines.join(', ')}`);
    }

    // Drinks
    const drinkLines: string[] = [];
    AVAILABLE_DRINKS.forEach((d) => {
      const q = drinksQty[d.id] || 0;
      if (q > 0) {
        const temp = drinkTemps[d.id] || 'FRÍA';
        drinkLines.push(`${q}x ${d.name} (${temp})`);
      }
    });
    if (drinkLines.length > 0) {
      lines.push(`• Bebidas: ${drinkLines.join(', ')}`);
    }

    if (specialNotes.trim()) {
      lines.push(`• Obs: ${specialNotes.trim()}`);
    }

    // Dynamic Title based on selection
    const titleParts: string[] = [];
    if (totalPiecesCount > 0) titleParts.push(`${totalPiecesCount} Presa${totalPiecesCount > 1 ? 's' : ''}`);
    if (totalSidesCount > 0) titleParts.push(`${totalSidesCount} Acomp.`);
    if (totalDrinksCount > 0) titleParts.push(`${totalDrinksCount} Bebida${totalDrinksCount > 1 ? 's' : ''}`);

    const customTitle = titleParts.length > 0
      ? `Venta Custom (${titleParts.join(' + ')})`
      : 'Venta Customizada Wonder';

    const newItem: OrderItem = {
      id: 'custom-' + Date.now(),
      name: customTitle,
      unitPrice: grandTotal,
      quantity: 1,
      isCombo: totalPiecesCount > 0 && totalSidesCount > 0,
      config: {
        presas: {
          ala: piecesQty.ala || 0,
          pecho: piecesQty.pecho || 0,
          pierna: piecesQty.pierna || 0,
          entrepierna: piecesQty.entrepierna || 0,
        },
        side: 'mixto',
        drink: drinkLines[0] || 'Sin bebida',
        temperature: 'FRÍA',
        notes: lines.join('\n'),
      },
      customDetails: 'Venta custom calculada por porción [FR-002b]',
    };

    onAddCustomItem(newItem);
    handleReset();
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon="tune"
      title="Venta Custom: Configuración a Medida"
      description="Presas independientes + Acompañantes + Bebidas con cálculo en tiempo real"
      maxWidth="2xl"
      customFooter={
        <div className="flex flex-col gap-3 w-full">
          {/* Breakdown summary */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1.5 px-2 bg-white rounded-xl border border-[#e2e8f0]">
            <div className="flex flex-col">
              <span className="text-[#5b403d] text-[10px]">1. Presas ({totalPiecesCount})</span>
              <span className="font-bold text-[#af101a]">Bs. {piecesSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex flex-col border-x border-[#e2e8f0]">
              <span className="text-[#5b403d] text-[10px]">2. Acomp. ({totalSidesCount})</span>
              <span className="font-bold text-[#795900]">Bs. {sidesSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[#5b403d] text-[10px]">3. Bebidas ({totalDrinksCount})</span>
              <span className="font-bold text-[#005c8d]">Bs. {drinksSubtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#5b403d] font-semibold">TOTAL CALCULADO:</span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#af101a] leading-none">
                Bs. {grandTotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl text-xs font-mono text-[#5b403d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-colors cursor-pointer"
                title="Reiniciar selección"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white text-[#334155] hover:bg-[#f1f5f9] hover:text-[#0f172a] border border-[#cbd5e1] font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={grandTotal <= 0}
                onClick={handleConfirmOrder}
                className="px-5 py-2.5 rounded-xl bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                <span>Añadir a Orden ({totalItemsCount})</span>
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="flex flex-col -mt-2 -mx-2">
        {/* Step Navigation Bar */}
        <div className="bg-[#f8f9ff] border-b border-[#e1e8fd] px-3 sm:px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto rounded-t-lg">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Step 1 Tab */}
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                activeStep === 1
                  ? 'bg-[#af101a] text-white shadow-xs'
                  : 'bg-white text-[#5b403d] hover:bg-[#e9edff] border border-[#e1e8fd]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">1</span>
              <span>1. Presas ({totalPiecesCount})</span>
            </button>

            <span className="material-symbols-outlined text-[#5b403d]/40 text-sm">chevron_right</span>

            {/* Step 2 Tab */}
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                activeStep === 2
                  ? 'bg-[#af101a] text-white shadow-xs'
                  : 'bg-white text-[#5b403d] hover:bg-[#e9edff] border border-[#e1e8fd]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">2</span>
              <span>2. Acompañantes ({totalSidesCount})</span>
            </button>

            <span className="material-symbols-outlined text-[#5b403d]/40 text-sm">chevron_right</span>

            {/* Step 3 Tab */}
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                activeStep === 3
                  ? 'bg-[#af101a] text-white shadow-xs'
                  : 'bg-white text-[#5b403d] hover:bg-[#e9edff] border border-[#e1e8fd]'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">3</span>
              <span>3. Bebidas ({totalDrinksCount})</span>
            </button>
          </div>

          <span className="font-mono text-xs font-bold text-[#af101a] bg-red-50 px-2 py-1 rounded border border-red-200 shrink-0">
            Total: Bs. {grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-3 sm:p-4 flex flex-col gap-4 overflow-y-auto max-h-[55vh]">
          {/* STEP 1: PRESAS INDEPENDIENTES */}
          {activeStep === 1 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#e1e8fd] pb-2">
                <div>
                  <h3 className="font-bold text-sm text-[#141b2b] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#af101a] text-[20px]">kebab_dining</span>
                    Paso 1: Presas de Pollo Independientes
                  </h3>
                  <p className="text-xs text-[#5b403d]">
                    Elija cualquier presa y la cantidad deseada. Cada una se suma a su precio unitario.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#af101a] block">
                    {totalPiecesCount} presas
                  </span>
                  <span className="text-[11px] text-[#5b403d]">
                    Bs. {piecesSubtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Pieces Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_PIECES.map((piece) => {
                  const qty = piecesQty[piece.id] || 0;
                  const itemSubtotal = qty * piece.price;
                  const isSelected = qty > 0;

                  return (
                    <div
                      key={piece.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#af101a]/60 bg-[#fff5f5] shadow-xs'
                          : 'border-[#e1e8fd] bg-white hover:border-[#af101a]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#af101a] text-white' : 'bg-[#f1f3ff] text-[#5b403d]'
                        }`}>
                          <span className="material-symbols-outlined text-[22px]">{piece.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[#141b2b]">{piece.name}</span>
                          <span className="text-[11px] text-[#5b403d]">{piece.desc}</span>
                          <span className="font-mono text-xs font-bold text-[#af101a] mt-0.5">
                            Bs. {piece.price.toFixed(2)} c/u
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 bg-white px-1.5 py-1 rounded-lg border border-[#e1e8fd] shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleAdjustPiece(piece.id, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="font-mono text-sm font-bold text-[#141b2b] w-6 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustPiece(piece.id, 1)}
                            className="w-7 h-7 rounded bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-bold flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        {qty > 0 && (
                          <span className="font-mono text-[10px] text-[#af101a] font-bold">
                            = Bs. {itemSubtotal.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation button to Step 2 */}
              <div className="flex justify-between items-center pt-2 mt-1">
                <span className="text-xs text-[#5b403d] italic">
                  * Puedes continuar a Acompañantes o finalizar la orden
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2 bg-[#141b2b] hover:bg-[#293040] text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Paso 2: Acompañantes</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ACOMPAÑANTES */}
          {activeStep === 2 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#e1e8fd] pb-2">
                <div>
                  <h3 className="font-bold text-sm text-[#141b2b] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#795900] text-[20px]">swap_horiz</span>
                    Paso 2: Elegir Acompañantes y Cantidad
                  </h3>
                  <p className="text-xs text-[#5b403d]">
                    Seleccione las porciones de guarnición requeridas para la venta.
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#795900] block">
                    {totalSidesCount} porciones
                  </span>
                  <span className="text-[11px] text-[#5b403d]">
                    Bs. {sidesSubtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Sides List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_SIDES.map((side) => {
                  const qty = sidesQty[side.id] || 0;
                  const itemSubtotal = qty * side.price;
                  const isSelected = qty > 0;

                  return (
                    <div
                      key={side.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#795900]/50 bg-[#fffdf0] shadow-xs'
                          : 'border-[#e1e8fd] bg-white hover:border-[#795900]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#795900] text-white' : 'bg-[#f1f3ff] text-[#5b403d]'
                        }`}>
                          <span className="material-symbols-outlined text-[22px]">{side.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-[#141b2b]">{side.name}</span>
                          <span className="text-[11px] text-[#5b403d]">{side.desc}</span>
                          <span className="font-mono text-xs font-bold text-[#795900] mt-0.5">
                            Bs. {side.price.toFixed(2)} c/u
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5 bg-white px-1.5 py-1 rounded-lg border border-[#e1e8fd] shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleAdjustSide(side.id, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-bold flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="font-mono text-sm font-bold text-[#141b2b] w-6 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustSide(side.id, 1)}
                            className="w-7 h-7 rounded bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-bold flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        {qty > 0 && (
                          <span className="font-mono text-[10px] text-[#795900] font-bold">
                            = Bs. {itemSubtotal.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center pt-2 mt-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e1e8fd]"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Volver a Presas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-4 py-2 bg-[#141b2b] hover:bg-[#293040] text-white font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Paso 3: Bebidas</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BEBIDAS Y TEMPERATURA */}
          {activeStep === 3 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#e1e8fd] pb-2">
                <div>
                  <h3 className="font-bold text-sm text-[#141b2b] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#005c8d] text-[20px]">local_drink</span>
                    Paso 3: Elegir Bebidas y Cantidad
                  </h3>
                  <p className="text-xs text-[#5b403d]">
                    Seleccione gaseosas o refrescos artesanales, indicando temperatura (Fría / Natural).
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-[#005c8d] block">
                    {totalDrinksCount} bebidas
                  </span>
                  <span className="text-[11px] text-[#5b403d]">
                    Bs. {drinksSubtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Drinks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_DRINKS.map((drink) => {
                  const qty = drinksQty[drink.id] || 0;
                  const temp = drinkTemps[drink.id] || 'FRÍA';
                  const itemSubtotal = qty * drink.price;
                  const isSelected = qty > 0;

                  return (
                    <div
                      key={drink.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'border-blue-400 bg-blue-50/40 shadow-xs'
                          : 'border-[#e1e8fd] bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#005c8d] text-white' : 'bg-[#f1f3ff] text-[#5b403d]'
                          }`}>
                            <span className="material-symbols-outlined text-[20px]">{drink.icon}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs sm:text-sm text-[#141b2b]">{drink.name}</span>
                            <span className="text-[10px] text-[#5b403d]">{drink.desc}</span>
                            <span className="font-mono text-xs font-bold text-[#005c8d]">
                              Bs. {drink.price.toFixed(2)} c/u
                            </span>
                          </div>
                        </div>

                        {/* Quantity Controller */}
                        <div className="flex items-center gap-1.5 bg-white px-1.5 py-1 rounded-lg border border-[#e1e8fd] shadow-xs shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAdjustDrink(drink.id, -1)}
                            disabled={qty === 0}
                            className="w-6 h-6 rounded bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold text-[#141b2b] w-5 text-center">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustDrink(drink.id, 1)}
                            className="w-6 h-6 rounded bg-[#f1f3ff] hover:bg-[#e1e8fd] text-[#141b2b] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Temperature selector & subtotal */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-[#e1e8fd]/60">
                        <button
                          type="button"
                          onClick={() => toggleDrinkTemp(drink.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                            temp === 'FRÍA'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                          title="Haga clic para alternar Fría / Natural"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {temp === 'FRÍA' ? 'ac_unit' : 'thermostat'}
                          </span>
                          <span>{temp}</span>
                        </button>

                        <span className="font-mono text-xs font-bold text-[#005c8d]">
                          {qty > 0 ? `Bs. ${itemSubtotal.toFixed(2)}` : '0.00 Bs'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation button */}
              <div className="flex justify-start items-center pt-2 mt-1">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e1e8fd]"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                  <span>Volver a Acompañantes</span>
                </button>
              </div>
            </div>
          )}

          {/* Special Notes & Observations for Kitchen */}
          <div className="bg-[#f1f3ff] p-3.5 rounded-xl border border-[#e1e8fd] flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-bold text-[#141b2b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#af101a]">notes</span>
              Observaciones de Cocina / Personalización (Opcional):
            </label>
            <input
              type="text"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="Ej. Pollo bien dorado, salsas aparte, sin picante..."
              className="p-2 bg-white rounded-lg text-xs text-[#141b2b] border border-[#e1e8fd] focus:outline-none focus:border-[#af101a]"
            />
          </div>
        </div>
      </div>
    </AppModal>
  );
};
