import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Checkbox from '@mui/material/Checkbox';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import LockIcon from '@mui/icons-material/Lock';
import { Product } from '../types';
import { AppModal } from '../commonComponents/AppModal';
import { useTheme } from '../context/ThemeContext';

export interface ProductRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

type TabType = 'presas' | 'sides' | 'drinks';

export const ProductRulesModal: React.FC<ProductRulesModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const rules = product?.variantRules;
  const targetPresasRequired =
    rules?.presCount ||
    Number(product?.piecesBadge?.match(/\d+/)?.[0] || 2);

  // Check if each dimension is configured/applicable for this product
  const hasPresas = Boolean(
    rules?.presCount ||
      rules?.allowedPresas ||
      product?.piecesBadge?.toLowerCase().includes('presa') ||
      product?.configurable
  );
  const hasSides = Boolean(
    rules?.hasIncludedSide !== undefined
      ? rules.hasIncludedSide
      : (rules?.allowedSides && rules.allowedSides.length > 0) || rules?.defaultSide
  );
  const hasDrinks = Boolean(
    rules?.hasIncludedDrink !== undefined
      ? rules.hasIncludedDrink
      : (rules?.allowedDrinks && rules.allowedDrinks.length > 0)
  );

  // Build the list of active/applicable tabs
  const availableTabs = useMemo(() => {
    const list: { key: TabType; label: string; icon: React.ReactElement }[] = [];
    if (hasPresas) {
      list.push({
        key: 'presas',
        label: '1. Presas Obligatorias',
        icon: <LunchDiningIcon sx={{ fontSize: 18 }} />,
      });
    }
    if (hasSides) {
      list.push({
        key: 'sides',
        label: `${list.length + 1}. Acompañamiento y Sustituciones`,
        icon: <RamenDiningIcon sx={{ fontSize: 18 }} />,
      });
    }
    if (hasDrinks) {
      list.push({
        key: 'drinks',
        label: `${list.length + 1}. Bebida y Extras Incluidos`,
        icon: <LocalDrinkIcon sx={{ fontSize: 18 }} />,
      });
    }
    // Fallback if none configured
    if (list.length === 0) {
      list.push({
        key: 'presas',
        label: '1. Presas Obligatorias',
        icon: <LunchDiningIcon sx={{ fontSize: 18 }} />,
      });
    }
    return list;
  }, [hasPresas, hasSides, hasDrinks]);

  const [activeTab, setActiveTab] = useState<TabType>(availableTabs[0]?.key || 'presas');

  // Reset tab to first available when modal opens or product changes
  useEffect(() => {
    if (isOpen && availableTabs.length > 0) {
      setActiveTab(availableTabs[0].key);
    }
  }, [isOpen, product?.id, availableTabs]);

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
            main: '#0284c7',
            dark: '#0369a1',
            light: '#38bdf8',
          },
          success: {
            main: '#15803d',
            light: '#4ade80',
          },
          background: {
            default: isDark ? '#131b2e' : '#ffffff',
            paper: isDark ? '#162036' : '#f8f9fc',
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

  if (!isOpen || !product) return null;

  // Presas data
  const presasConfig = rules?.allowedPresas || {
    pecho: true,
    ala: true,
    pierna: true,
    entrepierna: true,
  };

  const presasItems = [
    { key: 'pecho', name: 'Pecho', desc: 'Blanca / Magra', allowed: presasConfig.pecho },
    { key: 'ala', name: 'Ala', desc: 'Crocante', allowed: presasConfig.ala },
    { key: 'pierna', name: 'Pierna', desc: 'Jugosa', allowed: presasConfig.pierna },
    { key: 'entrepierna', name: 'Entrepierna', desc: 'Tradicional', allowed: presasConfig.entrepierna },
  ];

  // Sides data
  const defaultSideRaw = rules?.defaultSide || 'mixto';
  const getSideLabel = (id: string) => {
    switch (id) {
      case 'solo-papa':
        return 'Solo Papas Fritas (Doble Ración De Papa)';
      case 'solo-arroz':
        return 'Solo Arroz Con Queso (Doble Ración De Arroz)';
      case 'smiles':
        return 'Sustitución Por Smiles McCain (Caritas De Papa)';
      case 'mixto':
      default:
        return 'Mixto (Papa Frita Rústica + Arroz con Queso)';
    }
  };

  const allowedSidesList = rules?.allowedSides || ['mixto', 'solo-papa', 'solo-arroz', 'smiles'];

  // Drinks data
  const defaultDrink = rules?.defaultDrink || 'Coca Cola 500ml';
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
        icon="schema"
        title={`Reglas de Armado — ${product.name}`}
        description="Ficha Técnica Operativa • Reglas de ensamble y componentes autorizados para cocina y POS"
        maxWidth="2xl"
        showCancel={true}
        cancelLabel="Cerrar Ficha"
        confirmLabel=""
        onConfirm={undefined}
        footerExtra={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                color: 'text.secondary',
              }}
            >
              Modo Ficha Técnica (Solo Lectura)
            </Typography>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Top Notice Banner: Summary chips */}
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(2, 132, 199, 0.12)'
                  : 'rgba(2, 132, 199, 0.06)',
              borderColor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(56, 189, 248, 0.25)'
                  : 'rgba(2, 132, 199, 0.25)',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoOutlinedIcon sx={{ color: 'info.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.primary' }}>
                <strong>Ficha Registrada:</strong> Especificaciones oficiales vigentes para el cajero y cocinero.
              </Typography>
            </Box>

            {/* Quick scope badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              <Chip
                label={`${targetPresasRequired} Presas`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  bgcolor: (t) => (t.palette.mode === 'dark' ? '#263554' : '#e2e8f0'),
                  color: 'text.primary',
                }}
              />
              <Chip
                label={hasSides ? 'Con Guarnición' : 'Sin Guarnición'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  bgcolor: hasSides
                    ? (t) => (t.palette.mode === 'dark' ? 'rgba(21, 128, 61, 0.2)' : '#dcfce7')
                    : (t) => (t.palette.mode === 'dark' ? 'rgba(100, 116, 139, 0.2)' : '#f1f5f9'),
                  color: hasSides ? 'success.main' : 'text.secondary',
                }}
              />
              <Chip
                label={hasDrinks ? 'Bebida 500ml' : 'Sin Bebida'}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.6875rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  bgcolor: hasDrinks
                    ? (t) => (t.palette.mode === 'dark' ? 'rgba(2, 132, 199, 0.2)' : '#e0f2fe')
                    : (t) => (t.palette.mode === 'dark' ? 'rgba(100, 116, 139, 0.2)' : '#f1f5f9'),
                  color: hasDrinks ? 'info.main' : 'text.secondary',
                }}
              />
            </Box>
          </Paper>

          {/* Navigation Tabs (Only showing applicable tabs) */}
          {availableTabs.length > 1 && (
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : '#f1f5f9'),
                borderRadius: 2,
                px: 1,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, newVal) => setActiveTab(newVal)}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  minHeight: 44,
                  '& .MuiTab-root': {
                    minHeight: 44,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontFamily: 'inherit',
                    py: 1,
                    gap: 1,
                  },
                }}
              >
                {availableTabs.map((t) => (
                  <Tab
                    key={t.key}
                    value={t.key}
                    label={t.label}
                    icon={t.icon}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Box>
          )}

          {/* Tab 1: Presas Obligatorias */}
          {activeTab === 'presas' && hasPresas && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Total Presas Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
                    Total de Presas por Ración:
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    El cajero debe completar exactamente esta cantidad antes de emitir comanda.
                  </Typography>
                </Box>
                <Paper
                  variant="outlined"
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: (t) => (t.palette.mode === 'dark' ? '#131b2e' : '#ffffff'),
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'primary.main',
                    }}
                  >
                    {targetPresasRequired} Presas
                  </Typography>
                </Paper>
              </Paper>

              {/* Presas 2x2 Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                {presasItems.map((item) => (
                  <Paper
                    key={item.key}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: item.allowed ? 1 : 0.45,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Checkbox
                        checked={item.allowed}
                        readOnly
                        size="small"
                        icon={<RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />}
                        checkedIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                        sx={{
                          p: 0,
                          color: 'primary.main',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                          cursor: 'default',
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              {/* Requirement Rule Banner */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(245, 158, 11, 0.08)',
                  borderColor: (t) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.25,
                }}
              >
                <VerifiedIcon sx={{ color: 'secondary.main', fontSize: 20, mt: 0.25, shrink: 0 }} />
                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.primary', lineHeight: 1.4 }}>
                  <strong>Regla Operativa (PDR FR-002):</strong> Se habilitará tanto el selector rápido de combinaciones tradicionales (Pecho-Ala / Pierna-Entrepierna) como la suma libre granular en caja.
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Tab 2: Acompañamiento y Sustituciones */}
          {activeTab === 'sides' && hasSides && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Inclusion Status Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Checkbox
                    checked={hasSides}
                    readOnly
                    size="small"
                    icon={<RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />}
                    checkedIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    sx={{ p: 0, color: 'primary.main', cursor: 'default' }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
                      ¿Este plato/combo incluye acompañamiento en su composición?
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Ejemplo: Porción Media y Combos incluyen papas y arroz sin costo adicional (PDR §2.1).
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={hasSides ? 'ACOMPAÑAMIENTO INCLUIDO' : 'SIN ACOMPAÑAMIENTO'}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    bgcolor: hasSides
                      ? (t) => (t.palette.mode === 'dark' ? 'rgba(21, 128, 61, 0.2)' : '#dcfce7')
                      : (t) => (t.palette.mode === 'dark' ? 'rgba(100, 116, 139, 0.2)' : '#f1f5f9'),
                    color: hasSides ? 'success.main' : 'text.secondary',
                    border: 1,
                    borderColor: hasSides ? 'success.light' : 'divider',
                  }}
                />
              </Paper>

              {/* Base Side Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
                  Acompañamiento Base:
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
                      {getSideLabel(defaultSideRaw)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Estándar por defecto sin costo adicional
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      color: 'success.main',
                    }}
                  >
                    Bs. 0.00
                  </Typography>
                </Paper>
              </Box>

              {/* Allowed Substitutions List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
                  Sustituciones Permitidas (PDR §2.1 — Sin cambio de precio):
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {allowedSidesList.map((s) => (
                    <Paper
                      key={s}
                      variant="outlined"
                      sx={{
                        p: 1.25,
                        px: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.primary' }}>
                        {getSideLabel(s)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: 'success.main',
                        }}
                      >
                        Bs. 0.00
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Tab 3: Bebidas y Extras Incluidos */}
          {activeTab === 'drinks' && hasDrinks && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Inclusion Status Card matching image */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Checkbox
                    checked={hasDrinks}
                    readOnly
                    size="small"
                    icon={<RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />}
                    checkedIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                    sx={{ p: 0, color: 'primary.main', cursor: 'default' }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
                      ¿Este plato/combo incluye bebida en su composición?
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Ejemplo: Combo Wonder incluye bebida 500ml ya en su precio base (PDR §2.2).
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={hasDrinks ? 'BEBIDA INCLUIDA' : 'SIN BEBIDA'}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    bgcolor: hasDrinks
                      ? (t) => (t.palette.mode === 'dark' ? 'rgba(21, 128, 61, 0.2)' : '#dcfce7')
                      : (t) => (t.palette.mode === 'dark' ? 'rgba(100, 116, 139, 0.2)' : '#f1f5f9'),
                    color: hasDrinks ? 'success.main' : 'text.secondary',
                    border: 1,
                    borderColor: hasDrinks ? 'success.light' : 'divider',
                  }}
                />
              </Paper>

              {/* Drinks List Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8125rem' }}>
                  Bebidas Disponibles en el Combo (500ml):
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 1.25,
                  }}
                >
                  {allowedDrinksList.map((d) => {
                    const isDefault = d === defaultDrink;
                    return (
                      <Paper
                        key={d}
                        variant="outlined"
                        sx={{
                          p: 1.25,
                          px: 1.5,
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          borderColor: isDefault ? 'success.main' : 'divider',
                          borderWidth: isDefault ? 2 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.primary', fontWeight: isDefault ? 700 : 500 }}>
                          {d}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: 'success.main',
                          }}
                        >
                          {isDefault ? 'Por Defecto' : 'Incluida'}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>

              {/* Temperature Requirements Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>
                    Opciones de Temperatura de Servicio
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    Obligatorio en mostrador para despacho
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 1.5,
                      bgcolor: (t) => (t.palette.mode === 'dark' ? '#131b2e' : '#ffffff'),
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: 'info.main' }}>
                      FRÍA
                    </Typography>
                  </Paper>
                  <Paper
                    variant="outlined"
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 1.5,
                      bgcolor: (t) => (t.palette.mode === 'dark' ? '#131b2e' : '#ffffff'),
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}>
                      NATURAL
                    </Typography>
                  </Paper>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </AppModal>
    </ThemeProvider>
  );
};
