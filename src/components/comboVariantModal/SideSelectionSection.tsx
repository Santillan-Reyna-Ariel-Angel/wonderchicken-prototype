import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { SideSelectionSectionProps } from './types';

interface SideOptionItem {
  id: string;
  title: string;
  desc: string;
}

const SIDE_OPTIONS: SideOptionItem[] = [
  {
    id: 'mixto',
    title: 'Mixto: Papa y Arroz',
    desc: 'Estándar equilibrado',
  },
  {
    id: 'solo-papa',
    title: 'Solo Papa (Doble papa rústica)',
    desc: 'Cambio: +0.00 Bs',
  },
  {
    id: 'solo-arroz',
    title: 'Solo Arroz (Doble arroz especiado)',
    desc: 'Cambio: +0.00 Bs',
  },
  {
    id: 'smiles',
    title: 'Smiles McCain',
    desc: 'Sustitución: +0.00 Bs',
  },
];

export const SideSelectionSection: React.FC<SideSelectionSectionProps> = ({
  allowedSides,
  sideOption,
  onSideOptionChange,
}) => {
  const visibleSides = SIDE_OPTIONS.filter((opt) => allowedSides.includes(opt.id));

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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SwapHorizIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
            2. Acompañamiento Incluido (1 sustitución sin costo adicional)
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          +0.00 Bs
        </Typography>
      </Box>

      {/* Side Options Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.25,
        }}
      >
        {visibleSides.map((item) => {
          const isSelected = sideOption === item.id;
          return (
            <Paper
              key={item.id}
              variant="outlined"
              onClick={() => onSideOptionChange(item.id)}
              sx={{
                p: 1.25,
                borderRadius: 2,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
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
                '&:hover': {
                  borderColor: (t) => (isSelected ? t.palette.primary.main : t.palette.primary.light),
                },
              }}
            >
              <Radio
                checked={isSelected}
                value={item.id}
                name="side-option"
                size="small"
                sx={{
                  p: 0,
                  color: 'text.secondary',
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                  {item.desc}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
};
