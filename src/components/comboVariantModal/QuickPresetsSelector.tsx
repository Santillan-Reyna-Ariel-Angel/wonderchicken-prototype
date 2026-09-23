import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import Chip from '@mui/material/Chip';
import { QuickPresetsSelectorProps } from './types';

interface PresetItem {
  key: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeVariant?: 'standard' | 'favorite' | 'white' | 'juicy';
}

export const QuickPresetsSelector: React.FC<QuickPresetsSelectorProps> = ({
  targetPresasRequired,
  selectedQuickPreset,
  onSelectQuickPreset,
}) => {
  const is4Presas = targetPresasRequired === 4;

  const presets4: PresetItem[] = [
    {
      key: 'completo',
      title: 'Medio Completo',
      subtitle: '1 Pecho + 1 Ala + 1 Pierna + 1 Entrepierna',
      badgeText: 'Estándar',
      badgeVariant: 'standard',
    },
    {
      key: 'doble-pecho-ala',
      title: 'Doble Pecho + Ala',
      subtitle: '2 Pechos + 2 Alas',
      badgeText: 'Blanca',
      badgeVariant: 'white',
    },
    {
      key: 'doble-pierna-entrepierna',
      title: 'Doble Pierna + Entrep.',
      subtitle: '2 Piernas + 2 Entrepiernas',
      badgeText: 'Jugosa',
      badgeVariant: 'juicy',
    },
  ];

  const presets2: PresetItem[] = [
    {
      key: 'pecho-ala',
      title: 'Pecho - Ala',
      subtitle: '1 Pecho + 1 Ala (Tradicional dorada)',
      badgeText: 'Favorito',
      badgeVariant: 'favorite',
    },
    {
      key: 'pierna-entrepierna',
      title: 'Pierna - Entrepierna',
      subtitle: '1 Pierna + 1 Entrepierna (Jugosa)',
    },
  ];

  const items = is4Presas ? presets4 : presets2;

  const renderBadge = (item: PresetItem) => {
    if (!item.badgeText) return null;

    if (item.badgeVariant === 'standard' || item.badgeVariant === 'favorite') {
      return (
        <Chip
          label={item.badgeText}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.625rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.25)' : '#fef3c7'),
            color: (t) => (t.palette.mode === 'dark' ? '#fbbf24' : '#92400e'),
            border: '1px solid',
            borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.4)' : '#fde68a'),
          }}
        />
      );
    }

    return (
      <Chip
        label={item.badgeText}
        size="small"
        sx={{
          height: 20,
          fontSize: '0.625rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontFamily: 'monospace',
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.2)' : '#ffebee'),
          color: (t) => (t.palette.mode === 'dark' ? '#ef5350' : '#c62828'),
          border: '1px solid',
          borderColor: (t) => (t.palette.mode === 'dark' ? 'rgba(239, 83, 80, 0.3)' : '#ffcdd2'),
        }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: is4Presas
            ? { xs: '1fr', sm: 'repeat(3, 1fr)' }
            : { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 1.5,
        }}
      >
        {items.map((item) => {
          const isSelected = selectedQuickPreset === item.key;
          return (
            <Paper
              key={item.key}
              variant="outlined"
              onClick={() => onSelectQuickPreset(item.key)}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                bgcolor: (t) =>
                  isSelected
                    ? t.palette.mode === 'dark'
                      ? 'rgba(211, 47, 47, 0.15)'
                      : '#fff5f5'
                    : t.palette.background.default,
                borderColor: (t) =>
                  isSelected
                    ? t.palette.primary.main
                    : t.palette.divider,
                borderWidth: isSelected ? 2 : 1,
                boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                '&:hover': {
                  borderColor: (t) => (isSelected ? t.palette.primary.main : t.palette.primary.light),
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: is4Presas ? { xs: 'row', sm: 'column' } : 'row',
                  alignItems: is4Presas ? { xs: 'center', sm: 'flex-start' } : 'center',
                  gap: 1.25,
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio
                      checked={isSelected}
                      value={item.key}
                      name="preset-selection"
                      size="small"
                      sx={{
                        p: 0,
                        color: 'text.secondary',
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        color: 'text.primary',
                        lineHeight: 1.2,
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                  {renderBadge(item)}
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    pl: is4Presas ? { xs: 0, sm: 3 } : 0,
                    lineHeight: 1.3,
                  }}
                >
                  {item.subtitle}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Typography
        variant="caption"
        sx={{
          fontFamily: 'monospace',
          fontSize: '0.6875rem',
          color: 'text.secondary',
          textAlign: 'right',
          fontStyle: 'italic',
        }}
      >
        * Selección en 1 clic para acelerar la atención en caja
      </Typography>
    </Box>
  );
};
