import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BoltIcon from '@mui/icons-material/Bolt';
import TuneIcon from '@mui/icons-material/Tune';
import { PresasSectionProps } from './types';
import { QuickPresetsSelector } from './QuickPresetsSelector';
import { GranularPresasSelector } from './GranularPresasSelector';

export const PresasSection: React.FC<PresasSectionProps> = ({
  targetPresasRequired,
  totalPresas,
  isValid,
  presaTab,
  onPresaTabChange,
  selectedQuickPreset,
  onSelectQuickPreset,
  granularPresas,
  onAdjustPresa,
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Header with Title and Count Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RestaurantIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
            1. Selección de Presas (Total requeridas: {targetPresasRequired})
          </Typography>
        </Box>

        <Chip
          label={`${totalPresas} / ${targetPresasRequired} Seleccionadas`}
          size="small"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            bgcolor: isValid ? 'primary.main' : 'error.main',
            color: '#ffffff',
            boxShadow: isValid ? 'none' : '0 0 0 2px rgba(186, 26, 26, 0.2)',
          }}
        />
      </Box>

      {/* Description Text */}
      <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
        {targetPresasRequired === 4
          ? 'Seleccione una combinación estándar rápida o personalice individualmente las 4 presas exactas.'
          : 'Seleccione un par tradicional rápido (1 clic) o personalice individualmente las 2 presas exactas.'}
      </Typography>

      {/* Mode Toggle Tabs */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 0.5,
          p: 0.5,
          borderRadius: 2,
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#e2e8f0'),
        }}
      >
        <Button
          type="button"
          onClick={() => onPresaTabChange('rapido')}
          startIcon={<BoltIcon sx={{ fontSize: 16 }} />}
          sx={{
            py: 0.75,
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            textTransform: 'none',
            borderRadius: 1.5,
            transition: 'all 0.15s ease',
            bgcolor: presaTab === 'rapido' ? 'background.default' : 'transparent',
            color: presaTab === 'rapido' ? 'primary.main' : 'text.secondary',
            boxShadow: presaTab === 'rapido' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            '&:hover': {
              bgcolor: presaTab === 'rapido' ? 'background.default' : 'action.hover',
              color: 'text.primary',
            },
          }}
        >
          {targetPresasRequired === 4 ? 'Combinación Rápida (4 presas)' : 'Pares Tradicionales (Rápido)'}
        </Button>

        <Button
          type="button"
          onClick={() => onPresaTabChange('granular')}
          startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
          sx={{
            py: 0.75,
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: 'inherit',
            textTransform: 'none',
            borderRadius: 1.5,
            transition: 'all 0.15s ease',
            bgcolor: presaTab === 'granular' ? 'background.default' : 'transparent',
            color: presaTab === 'granular' ? 'primary.main' : 'text.secondary',
            boxShadow: presaTab === 'granular' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            '&:hover': {
              bgcolor: presaTab === 'granular' ? 'background.default' : 'action.hover',
              color: 'text.primary',
            },
          }}
        >
          Selección Granular ({targetPresasRequired} exactas)
        </Button>
      </Box>

      {/* Tab View Content */}
      {presaTab === 'rapido' ? (
        <QuickPresetsSelector
          targetPresasRequired={targetPresasRequired}
          selectedQuickPreset={selectedQuickPreset}
          onSelectQuickPreset={onSelectQuickPreset}
        />
      ) : (
        <GranularPresasSelector
          targetPresasRequired={targetPresasRequired}
          totalPresas={totalPresas}
          granularPresas={granularPresas}
          onAdjustPresa={onAdjustPresa}
        />
      )}
    </Paper>
  );
};
