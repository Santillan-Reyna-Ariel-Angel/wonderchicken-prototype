import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Product, ComboConfiguration, PresasCount } from '../types';
import { AppModal } from '../commonComponents/AppModal';
import { useTheme } from '../context/ThemeContext';
import { PresasSection } from './comboVariantModal/PresasSection';
import { SideSelectionSection } from './comboVariantModal/SideSelectionSection';
import { DrinkSelectionSection } from './comboVariantModal/DrinkSelectionSection';
import { PresaTab } from './comboVariantModal/types';

export interface ComboVariantModalProps {
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Determine product specs & rules with sensible defaults
  const targetProduct = useMemo(
    () =>
      product || {
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
          allowedDrinks: [
            'Coca Cola 500ml',
            'Coca Cola Zero 500ml',
            'Fanta Naranja 500ml',
            'Sprite 500ml',
            'Mocochinchi Casero 500ml',
          ],
        },
      },
    [product]
  );

  const rules = targetProduct.variantRules;
  const targetPresasRequired = rules?.presCount ?? 2;

  // Has side included? ONLY if product explicitly defines allowedSides or defaultSide
  const hasSide = Boolean(rules?.allowedSides && rules.allowedSides.length > 0) || Boolean(rules?.defaultSide);
  // Has drink included?
  const hasDrink = Boolean(rules?.hasIncludedDrink);

  const [presaTab, setPresaTab] = useState<PresaTab>('rapido');
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
  }, [isOpen, targetProduct.id, targetPresasRequired, rules]);

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

  // MUI Theme customized with Wonder Chicken palette
  const modalTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: {
            main: '#d32f2f',
            dark: '#af101a',
            light: '#ef5350',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#f59e0b',
            dark: '#b45309',
            light: '#fcd34d',
          },
          info: {
            main: '#005c8d',
            dark: '#004368',
            light: '#38bdf8',
          },
          success: {
            main: '#15803d',
            light: '#4ade80',
          },
          error: {
            main: '#ba1a1a',
            light: '#f87171',
          },
          background: {
            default: isDark ? '#131b2e' : '#ffffff',
            paper: isDark ? '#1a233b' : '#f8f9fc',
          },
          text: {
            primary: isDark ? '#f8fafc' : '#141b2b',
            secondary: isDark ? '#94a3b8' : '#5b403d',
          },
          divider: isDark ? '#263554' : '#e2e8f0',
        },
        typography: {
          fontFamily: 'inherit',
        },
      }),
    [isDark]
  );

  if (!isOpen) return null;

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
    <ThemeProvider theme={modalTheme}>
      <AppModal
        isOpen={isOpen}
        onClose={onClose}
        icon="tune"
        title={`Configurar Variante: ${targetProduct.name}`}
        description={modalDescription}
        maxWidth="2xl"
        footerExtra={
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem' }}>
              Precio Final:
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'primary.main',
                fontSize: '1.125rem',
              }}
            >
              Bs. {targetProduct.price.toFixed(2)}
            </Typography>
          </Box>
        }
        onConfirm={handleAdd}
        confirmLabel={`Agregar a la Orden (Bs. ${targetProduct.price.toFixed(2)})`}
        confirmIcon="add_shopping_cart"
        confirmDisabled={!isValid}
        showCancel={true}
        cancelLabel="Cancelar"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Step 1: Chicken Presas Selection */}
          <PresasSection
            targetPresasRequired={targetPresasRequired}
            totalPresas={totalPresas}
            isValid={isValid}
            presaTab={presaTab}
            onPresaTabChange={setPresaTab}
            selectedQuickPreset={selectedQuickPreset}
            onSelectQuickPreset={handleSelectQuickPreset}
            granularPresas={granularPresas}
            onAdjustPresa={adjustPresa}
          />

          {/* Step 2: Sides & Substitution (ONLY IF INCLUDED IN DISH) */}
          {hasSide && (
            <SideSelectionSection
              allowedSides={allowedSidesList}
              sideOption={sideOption}
              onSideOptionChange={setSideOption}
            />
          )}

          {/* Step 3: Drinks & Temperature (ONLY IF INCLUDED IN DISH) */}
          {hasDrink && (
            <DrinkSelectionSection
              allowedDrinks={allowedDrinksList}
              drink={drink}
              onDrinkChange={setDrink}
              temperature={temperature}
              onTemperatureChange={setTemperature}
            />
          )}
        </Box>
      </AppModal>
    </ThemeProvider>
  );
};
