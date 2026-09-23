import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import { DrinkSelectionSectionProps } from './types';

export const DrinkSelectionSection: React.FC<DrinkSelectionSectionProps> = ({
  allowedDrinks,
  drink,
  onDrinkChange,
  temperature,
  onTemperatureChange,
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
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalDrinkIcon sx={{ color: 'info.main', fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
          3. Bebida 500ml Incluida &amp; Temperatura
        </Typography>
      </Box>

      {/* Drink + Temperature Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {/* Drink Dropdown */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          >
            Bebida:
          </Typography>
          <FormControl size="small" fullWidth>
            <Select
              value={drink}
              onChange={(e) => onDrinkChange(e.target.value)}
              sx={{
                bgcolor: 'background.default',
                borderRadius: 2,
                fontSize: '0.8125rem',
                fontWeight: 600,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              {allowedDrinks.map((d) => (
                <MenuItem key={d} value={d} sx={{ fontSize: '0.8125rem' }}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Temperature Toggle */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'text.secondary',
            }}
          >
            Temperatura:
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 1,
            }}
          >
            <Button
              type="button"
              variant={temperature === 'FRÍA' ? 'contained' : 'outlined'}
              onClick={() => onTemperatureChange('FRÍA')}
              startIcon={<AcUnitIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 1,
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                textTransform: 'none',
                borderColor: 'divider',
                bgcolor: temperature === 'FRÍA' ? 'info.main' : 'background.default',
                color: temperature === 'FRÍA' ? '#ffffff' : 'text.primary',
                '&:hover': {
                  bgcolor: temperature === 'FRÍA' ? 'info.dark' : 'action.hover',
                  borderColor: 'divider',
                },
              }}
            >
              FRÍA
            </Button>

            <Button
              type="button"
              variant={temperature === 'NATURAL' ? 'contained' : 'outlined'}
              onClick={() => onTemperatureChange('NATURAL')}
              startIcon={<DeviceThermostatIcon sx={{ fontSize: 16 }} />}
              sx={{
                py: 1,
                borderRadius: 2,
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                textTransform: 'none',
                borderColor: 'divider',
                bgcolor: temperature === 'NATURAL' ? 'info.main' : 'background.default',
                color: temperature === 'NATURAL' ? '#ffffff' : 'text.primary',
                '&:hover': {
                  bgcolor: temperature === 'NATURAL' ? 'info.dark' : 'action.hover',
                  borderColor: 'divider',
                },
              }}
            >
              NATURAL
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
