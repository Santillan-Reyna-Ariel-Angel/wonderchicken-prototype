import React, { useState } from 'react';
import { ComboConfiguration, PresasCount } from '../types';

interface ComboVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: ComboConfiguration) => void;
}

export const ComboVariantModal: React.FC<ComboVariantModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const [presaTab, setPresaTab] = useState<'pares' | 'granular'>('pares');
  const [selectedPair, setSelectedPair] = useState<'pecho-ala' | 'pierna-entrepierna'>('pecho-ala');
  const [granularPresas, setGranularPresas] = useState<PresasCount>({
    ala: 1,
    pecho: 1,
    pierna: 0,
    entrepierna: 0,
  });

  const [sideOption, setSideOption] = useState<'mixto' | 'solo-arroz' | 'solo-papa' | 'smiles'>('mixto');
  const [drink, setDrink] = useState('Coca Cola 500ml');
  const [temperature, setTemperature] = useState<'FRÍA' | 'NATURAL'>('FRÍA');

  // Calculate current total presas
  const totalPresas =
    presaTab === 'pares'
      ? 2
      : granularPresas.ala + granularPresas.pecho + granularPresas.pierna + granularPresas.entrepierna;

  const isValid = totalPresas === 2;

  const adjustPresa = (kind: keyof PresasCount, delta: number) => {
    const currentVal = granularPresas[kind];
    if (delta < 0 && currentVal <= 0) return;
    if (delta > 0 && totalPresas >= 2) return;

    setGranularPresas((prev) => ({
      ...prev,
      [kind]: prev[kind] + delta,
    }));
  };

  const handleSelectPair = (pair: 'pecho-ala' | 'pierna-entrepierna') => {
    setSelectedPair(pair);
    if (pair === 'pecho-ala') {
      setGranularPresas({ ala: 1, pecho: 1, pierna: 0, entrepierna: 0 });
    } else {
      setGranularPresas({ ala: 0, pecho: 0, pierna: 1, entrepierna: 1 });
    }
  };

  const handleAdd = () => {
    if (!isValid) return;

    let sideLabel = 'Mixto (Papa y Arroz)';
    if (sideOption === 'solo-arroz') sideLabel = 'Solo Arroz';
    if (sideOption === 'solo-papa') sideLabel = 'Solo Papa';
    if (sideOption === 'smiles') sideLabel = 'Smiles McCain';

    const presasToSave = presaTab === 'pares'
      ? selectedPair === 'pecho-ala'
        ? { ala: 1, pecho: 1, pierna: 0, entrepierna: 0 }
        : { ala: 0, pecho: 0, pierna: 1, entrepierna: 1 }
      : granularPresas;

    const presasList: string[] = [];
    if (presasToSave.ala) presasList.push(`${presasToSave.ala}x Ala`);
    if (presasToSave.pecho) presasList.push(`${presasToSave.pecho}x Pecho`);
    if (presasToSave.pierna) presasList.push(`${presasToSave.pierna}x Pierna`);
    if (presasToSave.entrepierna) presasList.push(`${presasToSave.entrepierna}x Entrepierna`);

    const notes = `• ${presasList.join(', ')}\n• 1x ${drink} (${temperature})\n• Acompañamiento: ${sideLabel}`;

    onConfirm({
      presas: presasToSave,
      side: sideOption,
      drink,
      temperature,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#293040]/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] border border-[#e1e8fd]">
        {/* Modal Header */}
        <div className="bg-[#d32f2f] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">tune</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                Configurar Variante: Combo Wonder
              </h2>
              <span className="font-mono text-xs text-white/85">
                Selección de 2 presas + Acompañamiento con sustitución + Bebida 500ml
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Rule 1: Presas Requeridas */}
          <div className="bg-[#f1f3ff] p-4 rounded-xl border border-[#e1e8fd] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#141b2b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#af101a] text-[18px]">kebab_dining</span>
                1. Selección de Presas (Total requeridas: 2)
              </span>
              <span
                className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  isValid ? 'bg-[#d32f2f] text-white' : 'bg-[#ba1a1a] text-white animate-pulse'
                }`}
              >
                {totalPresas} / 2 Seleccionadas
              </span>
            </div>
            <p className="text-xs text-[#5b403d]">
              Seleccione un par tradicional rápido o personalice individualmente las 2 presas.
            </p>

            {/* Navigation Tabs Header */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#e9edff] rounded-lg">
              <button
                type="button"
                onClick={() => setPresaTab('pares')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  presaTab === 'pares'
                    ? 'bg-white text-[#af101a] shadow-xs'
                    : 'text-[#5b403d] hover:text-[#141b2b]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                Pares Tradicionales (Rápido)
              </button>
              <button
                type="button"
                onClick={() => setPresaTab('granular')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  presaTab === 'granular'
                    ? 'bg-white text-[#af101a] shadow-xs'
                    : 'text-[#5b403d] hover:text-[#141b2b]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Selección Granular
              </button>
            </div>

            {/* Tab 1: Pares Tradicionales */}
            {presaTab === 'pares' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Option 1: Pecho - Ala */}
                  <label
                    onClick={() => handleSelectPair('pecho-ala')}
                    className={`relative flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPair === 'pecho-ala'
                        ? 'border-[#af101a] bg-white shadow-xs'
                        : 'border-[#e1e8fd] bg-white/70 hover:border-[#af101a]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="pair-selection"
                        checked={selectedPair === 'pecho-ala'}
                        onChange={() => handleSelectPair('pecho-ala')}
                        className="accent-[#af101a] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#141b2b]">Pecho - Ala</span>
                          <span className="bg-[#fec330] text-[#6f5100] font-mono text-[10px] px-1.5 py-0.2 rounded font-bold uppercase">
                            Favorito
                          </span>
                        </div>
                        <span className="text-xs text-[#5b403d]">
                          1 Pecho + 1 Ala (Tradicional dorada)
                        </span>
                      </div>
                    </div>
                    {selectedPair === 'pecho-ala' ? (
                      <span className="material-symbols-outlined text-[#af101a] text-[22px]">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#5b403d]/30 text-[22px]">radio_button_unchecked</span>
                    )}
                  </label>

                  {/* Option 2: Pierna - Entrepierna */}
                  <label
                    onClick={() => handleSelectPair('pierna-entrepierna')}
                    className={`relative flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPair === 'pierna-entrepierna'
                        ? 'border-[#af101a] bg-white shadow-xs'
                        : 'border-[#e1e8fd] bg-white/70 hover:border-[#af101a]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="pair-selection"
                        checked={selectedPair === 'pierna-entrepierna'}
                        onChange={() => handleSelectPair('pierna-entrepierna')}
                        className="accent-[#af101a] w-4 h-4 cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#141b2b]">Pierna - Entrepierna</span>
                        <span className="text-xs text-[#5b403d]">
                          1 Pierna + 1 Entrepierna (Jugosa)
                        </span>
                      </div>
                    </div>
                    {selectedPair === 'pierna-entrepierna' ? (
                      <span className="material-symbols-outlined text-[#af101a] text-[22px]">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#5b403d]/30 text-[22px]">radio_button_unchecked</span>
                    )}
                  </label>
                </div>
                <span className="font-mono text-[11px] text-[#5b403d] text-right italic">
                  * Selección en 1 clic para acelerar la atención en caja
                </span>
              </div>
            )}

            {/* Tab 2: Granular */}
            {presaTab === 'granular' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Ala */}
                  <div className={`p-3 rounded-lg flex flex-col items-center justify-between gap-2 shadow-xs border bg-white ${
                    granularPresas.ala > 0 ? 'border-[#af101a]/60 bg-[#fff2f0]' : 'border-[#e1e8fd]'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-[#af101a] text-[20px]">kebab_dining</span>
                      <span className="font-bold text-xs text-[#141b2b]">Ala</span>
                      <span className="text-[10px] text-[#5b403d]">Crocante</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#f1f3ff] px-2 py-1 rounded">
                      <button
                        type="button"
                        onClick={() => adjustPresa('ala', -1)}
                        className="w-7 h-7 bg-white rounded font-bold text-[#141b2b] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-[#141b2b] w-4 text-center">
                        {granularPresas.ala}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustPresa('ala', 1)}
                        className="w-7 h-7 bg-white rounded font-bold text-[#141b2b] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pecho */}
                  <div className={`p-3 rounded-lg flex flex-col items-center justify-between gap-2 shadow-xs border bg-white ${
                    granularPresas.pecho > 0 ? 'border-[#af101a]/60 bg-[#fff2f0]' : 'border-[#e1e8fd]'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-[#af101a] text-[20px]">lunch_dining</span>
                      <span className="font-bold text-xs text-[#141b2b]">Pecho</span>
                      <span className="text-[10px] text-[#5b403d]">Tradicional</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#f1f3ff] px-2 py-1 rounded">
                      <button
                        type="button"
                        onClick={() => adjustPresa('pecho', -1)}
                        className="w-7 h-7 bg-white rounded font-bold text-[#141b2b] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-[#141b2b] w-4 text-center">
                        {granularPresas.pecho}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustPresa('pecho', 1)}
                        className="w-7 h-7 bg-white rounded font-bold text-[#141b2b] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pierna */}
                  <div className={`p-3 rounded-lg flex flex-col items-center justify-between gap-2 shadow-xs border bg-white ${
                    granularPresas.pierna > 0 ? 'border-[#af101a]/60 bg-[#fff2f0]' : 'border-[#e1e8fd]'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-[#af101a] text-[20px]">set_meal</span>
                      <span className="font-bold text-xs text-[#141b2b]">Pierna</span>
                      <span className="text-[10px] text-[#5b403d]">Jugosa</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#f1f3ff] px-2 py-1 rounded">
                      <button
                        type="button"
                        onClick={() => adjustPresa('pierna', -1)}
                        className="w-7 h-7 bg-white rounded font-bold text-[#141b2b] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-[#141b2b] w-4 text-center">
                        {granularPresas.pierna}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustPresa('pierna', 1)}
                        className="w-7 h-7 bg-white rounded font-bold text-[#141b2b] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Entrepierna */}
                  <div className={`p-3 rounded-lg flex flex-col items-center justify-between gap-2 shadow-xs border bg-white ${
                    granularPresas.entrepierna > 0 ? 'border-[#af101a]/60 bg-[#fff2f0]' : 'border-[#e1e8fd]'
                  }`}>
                    <div className="flex flex-col items-center text-center">
                      <span className="material-symbols-outlined text-[#af101a] text-[20px]">dinner_dining</span>
                      <span className="font-bold text-xs text-[#141b2b]">Entrepierna</span>
                      <span className="text-[10px] text-[#5b403d]">Con hueso</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#f1f3ff] px-2 py-1 rounded">
                      <button
                        type="button"
                        onClick={() => adjustPresa('entrepierna', -1)}
                        className="w-7 h-7 bg-white rounded font-bold text-[#141b2b] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-bold text-[#141b2b] w-4 text-center">
                        {granularPresas.entrepierna}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustPresa('entrepierna', 1)}
                        className="w-7 h-7 bg-white rounded font-bold text-[#141b2b] hover:bg-[#e1e8fd] shadow-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-[#5b403d] text-right italic">
                  * Ajuste las cantidades individuales hasta completar las presas requeridas
                </span>
              </div>
            )}
          </div>

          {/* Rule 2: Acompañamiento y Sustitución */}
          <div className="bg-[#f1f3ff] p-4 rounded-xl border border-[#e1e8fd] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#141b2b] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#795900] text-[18px]">swap_horiz</span>
                2. Acompañamiento (Regla: 1 sustitución máx, sin costo adicional)
              </span>
              <span className="font-mono text-xs text-[#5b403d] font-bold">0.00 Bs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-[#e1e8fd] cursor-pointer hover:bg-[#e9edff] transition-colors">
                <input
                  type="radio"
                  name="side-option"
                  value="mixto"
                  checked={sideOption === 'mixto'}
                  onChange={() => setSideOption('mixto')}
                  className="accent-[#af101a] text-[#af101a]"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#141b2b]">Mixto: Papa y Arroz</span>
                  <span className="text-[11px] text-[#5b403d]">Por defecto del combo</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-[#e1e8fd] cursor-pointer hover:bg-[#e9edff] transition-colors">
                <input
                  type="radio"
                  name="side-option"
                  value="solo-arroz"
                  checked={sideOption === 'solo-arroz'}
                  onChange={() => setSideOption('solo-arroz')}
                  className="accent-[#af101a] text-[#af101a]"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#141b2b]">Solo Arroz (Doble)</span>
                  <span className="font-mono text-[11px] text-[#5b403d]">Cambio: +0.00 Bs</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-[#e1e8fd] cursor-pointer hover:bg-[#e9edff] transition-colors">
                <input
                  type="radio"
                  name="side-option"
                  value="solo-papa"
                  checked={sideOption === 'solo-papa'}
                  onChange={() => setSideOption('solo-papa')}
                  className="accent-[#af101a] text-[#af101a]"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#141b2b]">Solo Papa (Doble)</span>
                  <span className="font-mono text-[11px] text-[#5b403d]">Cambio: +0.00 Bs</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border border-[#e1e8fd] cursor-pointer hover:bg-[#e9edff] transition-colors">
                <input
                  type="radio"
                  name="side-option"
                  value="smiles"
                  checked={sideOption === 'smiles'}
                  onChange={() => setSideOption('smiles')}
                  className="accent-[#af101a] text-[#af101a]"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-[#141b2b]">Smiles McCain</span>
                  <span className="font-mono text-[11px] text-[#5b403d]">Sustitución: +0.00 Bs</span>
                </div>
              </label>
            </div>
          </div>

          {/* Rule 3: Bebida 500ml y Temperatura */}
          <div className="bg-[#f1f3ff] p-4 rounded-xl border border-[#e1e8fd] flex flex-col gap-3">
            <span className="text-xs sm:text-sm font-bold text-[#141b2b] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#005c8d] text-[18px]">local_drink</span>
              3. Bebida 500ml Incluida &amp; Temperatura
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#5b403d]">Bebida:</label>
                <select
                  value={drink}
                  onChange={(e) => setDrink(e.target.value)}
                  className="p-2.5 bg-white text-[#141b2b] rounded-lg border border-[#e1e8fd] text-xs font-semibold focus:outline-none focus:border-[#af101a]"
                >
                  <option value="Coca Cola 500ml">Coca Cola 500ml</option>
                  <option value="Coca Cola Zero 500ml">Coca Cola Zero 500ml</option>
                  <option value="Fanta Naranja 500ml">Fanta Naranja 500ml</option>
                  <option value="Sprite 500ml">Sprite 500ml</option>
                  <option value="Mocochinchi Casero 500ml">Mocochinchi Casero 500ml</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-[#5b403d]">Temperatura:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTemperature('FRÍA')}
                    className={`py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      temperature === 'FRÍA'
                        ? 'bg-[#005c8d] text-white shadow-xs'
                        : 'bg-white text-[#141b2b] hover:bg-[#e1e8fd] border border-[#e1e8fd]'
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
                        : 'bg-white text-[#141b2b] hover:bg-[#e1e8fd] border border-[#e1e8fd]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">thermostat</span>
                    NATURAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#e9edff] px-6 py-4 flex items-center justify-between border-t border-[#e1e8fd]">
          <div className="flex flex-col">
            <span className="font-mono text-xs text-[#5b403d]">Precio Final Combo:</span>
            <span className="font-mono text-lg font-bold text-[#af101a]">Bs. 36.00</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white text-[#141b2b] font-medium text-xs hover:bg-[#f1f3ff] border border-[#e1e8fd] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={handleAdd}
              className="px-5 py-2.5 rounded-lg bg-[#d32f2f] text-white font-bold text-xs shadow-md hover:bg-[#af101a] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Agregar a la Orden (Bs. 36.00)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
