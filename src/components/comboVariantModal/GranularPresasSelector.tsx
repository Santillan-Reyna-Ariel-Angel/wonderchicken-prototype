import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import SetMealIcon from '@mui/icons-material/SetMeal';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { PresasCount } from '../../types';
import { GranularPresasSelectorProps } from './types';

interface PresaCardConfig {
  key: keyof PresasCount;
  name: string;
  desc: string;
  icon: React.ReactNode;
}

const PRESA_CONFIGS: PresaCardConfig[] = [
  {
    key: 'pecho',
    name: 'Pecho',
    desc: 'Tradicional',
    icon: <LunchDiningIcon sx={{ fontSize: 22 }} />,
  },
  {
    key: 'ala',
    name: 'Ala',
    desc: 'Crocante',
    icon: <RestaurantIcon sx={{ fontSize: 22 }} />,
  },
  {
    key: 'pierna',
    name: 'Pierna',
    desc: 'Jugosa',
    icon: <SetMealIcon sx={{ fontSize: 22 }} />,
  },
  {
    key: 'entrepierna',
    name: 'Entrepierna',
    desc: 'Con hueso',
    icon: <DinnerDiningIcon sx={{ fontSize: 22 }} />,
  },
];

export const GranularPresasSelector: React.FC<GranularPresasSelectorProps> = ({
  targetPresasRequired,
  totalPresas,
  granularPresas,
  onAdjustPresa,
}) => {
  const isLimitReached = totalPresas >= targetPresasRequired;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1.5,
        }}
      >
        {PRESA_CONFIGS.map((config) => {
          const count = granularPresas[config.key];
          const isSelected = count > 0;

          return (
            <Paper
              key={config.key}
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
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
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Box
                  sx={{
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0.5,
                  }}
                >
                  {config.icon}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
                  {config.name}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                  {config.desc}
                </Typography>
              </Box>

              {/* Counter Controls */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f1f5f9'),
                  px: 1,
                  py: 0.5,
                  borderRadius: 2,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onAdjustPresa(config.key, -1)}
                  disabled={count <= 0}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#131b2e' : '#ffffff'),
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.35,
                    },
                  }}
                  aria-label={`Disminuir ${config.name}`}
                >
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>

                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: 'text.primary',
                    width: 24,
                    textAlign: 'center',
                  }}
                >
                  {count}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => onAdjustPresa(config.key, 1)}
                  disabled={isLimitReached}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#131b2e' : '#ffffff'),
                    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.35,
                    },
                  }}
                  aria-label={`Aumentar ${config.name}`}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
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
        * Debe completar exactamente {targetPresasRequired} presas (actualmente {totalPresas}/{targetPresasRequired})
      </Typography>
    </Box>
  );
};
