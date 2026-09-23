import { PresasCount } from '../../types';

export type PresaTab = 'rapido' | 'granular';

export interface PresasSectionProps {
  targetPresasRequired: number;
  totalPresas: number;
  isValid: boolean;
  presaTab: PresaTab;
  onPresaTabChange: (tab: PresaTab) => void;
  selectedQuickPreset: string;
  onSelectQuickPreset: (presetKey: string) => void;
  granularPresas: PresasCount;
  onAdjustPresa: (kind: keyof PresasCount, delta: number) => void;
}

export interface QuickPresetsSelectorProps {
  targetPresasRequired: number;
  selectedQuickPreset: string;
  onSelectQuickPreset: (presetKey: string) => void;
}

export interface GranularPresasSelectorProps {
  targetPresasRequired: number;
  totalPresas: number;
  granularPresas: PresasCount;
  onAdjustPresa: (kind: keyof PresasCount, delta: number) => void;
}

export interface SideSelectionSectionProps {
  allowedSides: string[];
  sideOption: string;
  onSideOptionChange: (side: string) => void;
}

export interface DrinkSelectionSectionProps {
  allowedDrinks: string[];
  drink: string;
  onDrinkChange: (drink: string) => void;
  temperature: 'FRÍA' | 'NATURAL';
  onTemperatureChange: (temp: 'FRÍA' | 'NATURAL') => void;
}
