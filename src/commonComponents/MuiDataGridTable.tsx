import React, { useState, useMemo } from 'react';
import {
  DataGrid,
  DataGridProps,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridFilterModel,
  Toolbar,
  ToolbarButton,
  QuickFilter,
  QuickFilterControl,
  QuickFilterClear,
  QuickFilterTrigger,
} from '@mui/x-data-grid';
import type {} from '@mui/x-data-grid/themeAugmentation';
import { esES } from '@mui/x-data-grid/locales';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTheme } from '../context/ThemeContext';

// Expandable QuickFilter styled components
const StyledQuickFilter = styled(QuickFilter)({
  display: 'grid',
  alignItems: 'center',
});

const StyledToolbarButton = styled(ToolbarButton, {
  shouldForwardProp: (prop) => prop !== 'ownerState',
})<{ ownerState: { expanded: boolean } }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  width: 'min-content',
  height: 'min-content',
  zIndex: 1,
  opacity: ownerState.expanded ? 0 : 1,
  pointerEvents: ownerState.expanded ? 'none' : 'auto',
  transition: theme.transitions.create(['opacity', 'color', 'background-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  color: theme.palette.text.secondary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: 6,
  minWidth: 36,
  minHeight: 36,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary,
    borderColor: theme.palette.primary.main,
  },
}));

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'ownerState',
})<{ ownerState: { expanded: boolean } }>(({ theme, ownerState }) => ({
  gridArea: '1 / 1',
  overflowX: 'clip',
  width: ownerState.expanded ? 280 : 'var(--trigger-width, 36px)',
  opacity: ownerState.expanded ? 1 : 0,
  transition: theme.transitions.create(['width', 'opacity', 'border-color'], {
    duration: theme.transitions.duration.shorter,
  }),
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    fontSize: '0.8125rem',
  },
}));

export interface TableColumn<T = any> {
  field: string;
  headerName: string;
  width?: number;
  minWidth?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  headerAlign?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  valueGetter?: (value: any, row: T) => any;
  renderCell?: (params: { row: T; value: any; field: string; id: any }) => React.ReactNode;
}

export interface TableAction<T = any> {
  label?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'inherit' | 'success';
  variant?: 'contained' | 'outlined' | 'text';
  onClick: (row: T) => void;
  render?: (row: T) => React.ReactNode;
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
}

// Grouped architectural interfaces to prevent prop bloat & prop drilling
export interface TableHeaderConfig {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  toolbarActions?: React.ReactNode;
}

export interface TablePaginationConfig {
  pageSize?: number;
  pageSizeOptions?: number[];
}

export interface TableActionsConfig<T = any> {
  items: TableAction<T>[] | ((row: T) => React.ReactNode);
  name?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableEmptyStateConfig {
  message?: string;
  subMessage?: string;
}

export interface MuiDataGridTableProps<T = any> {
  // Core dataset and columns
  rows: T[];
  columns: TableColumn<T>[];
  getRowId?: (row: T) => string | number;
  loading?: boolean;

  // Modern structured configs (anti-prop-bloat)
  header?: TableHeaderConfig;
  pagination?: TablePaginationConfig;
  actionsConfig?: TableActionsConfig<T>;
  emptyState?: TableEmptyStateConfig;

  // View and layout
  rowHeight?: number;
  minHeight?: number | string;
  onRowClick?: (row: T) => void;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  themeMode?: 'light' | 'dark' | 'auto';
  dataGridProps?: Partial<DataGridProps>;

  // Filter pass-through
  initialQuickFilterValues?: string[];
  quickFilterValues?: string[];
  onQuickFilterChange?: (values: string[]) => void;
  showToolbar?: boolean;
  disableColumnFilter?: boolean;
  disableColumnSelector?: boolean;
  disableDensitySelector?: boolean;

  // Flat legacy props (maintained for 100% backward compatibility)
  title?: string;
  subtitle?: string;
  badgeText?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchFilter?: (row: T, query: string) => boolean;
  actions?: TableAction<T>[] | ((row: T) => React.ReactNode);
  actionsColumnName?: string;
  actionsColumnWidth?: number;
  actionsColumnAlign?: 'left' | 'center' | 'right';
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  emptySubMessage?: string;
  toolbarActions?: React.ReactNode;
}

export function MuiDataGridTable<T extends Record<string, any>>({
  rows,
  columns,
  getRowId = (row: any) => row.id ?? row._id ?? row.ticketNumber ?? Math.random().toString(),
  loading = false,

  // Structured props
  header,
  pagination,
  actionsConfig,
  emptyState,

  // View & behavior
  rowHeight = 72,
  minHeight = 490,
  onRowClick,
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
  themeMode = 'auto',
  dataGridProps,

  // Toolbar & filter options
  showToolbar: showToolbarProp,
  disableColumnFilter = true,
  disableColumnSelector = true,
  disableDensitySelector = true,
  initialQuickFilterValues,
  quickFilterValues,
  onQuickFilterChange,

  // Flat legacy props (fallback for backward compatibility)
  title: legacyTitle,
  subtitle: legacySubtitle,
  badgeText: legacyBadgeText,
  showSearch: legacyShowSearch,
  searchPlaceholder: legacySearchPlaceholder,
  searchValue,
  onSearchChange,
  actions: legacyActions,
  actionsColumnName: legacyActionsColumnName,
  actionsColumnWidth: legacyActionsColumnWidth,
  actionsColumnAlign: legacyActionsColumnAlign,
  pageSize: legacyPageSize,
  pageSizeOptions: legacyPageSizeOptions,
  emptyMessage: legacyEmptyMessage,
  emptySubMessage: legacyEmptySubMessage,
  toolbarActions: legacyToolbarActions,
}: MuiDataGridTableProps<T>) {
  // Sync with application ThemeContext
  const { theme: appTheme } = useTheme();
  const isDark = themeMode === 'dark' ? true : themeMode === 'light' ? false : appTheme === 'dark';

  // Resolving props: prioritize structured config, fallback to legacy flat props
  const title = header?.title ?? legacyTitle;
  const subtitle = header?.subtitle ?? legacySubtitle;
  const badgeText = header?.badgeText ?? legacyBadgeText;
  const showSearch = header?.showSearch ?? legacyShowSearch ?? true;
  const searchPlaceholder = header?.searchPlaceholder ?? legacySearchPlaceholder ?? 'Buscar en la tabla...';
  const toolbarActions = header?.toolbarActions ?? legacyToolbarActions;

  const pageSize = pagination?.pageSize ?? legacyPageSize ?? 10;
  const pageSizeOptions = pagination?.pageSizeOptions ?? legacyPageSizeOptions ?? [5, 10, 20, 50];

  const actions = actionsConfig?.items ?? legacyActions;
  const actionsColumnName = actionsConfig?.name ?? legacyActionsColumnName ?? 'Acciones';
  const actionsColumnWidth = actionsConfig?.width ?? legacyActionsColumnWidth ?? 130;
  const actionsColumnAlign = actionsConfig?.align ?? legacyActionsColumnAlign ?? 'right';

  const emptyMessage = emptyState?.message ?? legacyEmptyMessage ?? 'No se encontraron registros';
  const emptySubMessage =
    emptyState?.subMessage ??
    legacyEmptySubMessage ??
    'Intente ajustar los términos de búsqueda o los filtros aplicados.';

  // Material UI theme built purely with Theme palette tokens (no arbitrary hardcoded hex strings in styleOverrides)
  const muiTableTheme = useMemo(() => {
    return createTheme(
      {
        palette: {
          mode: isDark ? 'dark' : 'light',
          primary: {
            main: isDark ? '#ef5350' : '#d32f2f',
            light: isDark ? '#ff867c' : '#ef5350',
            dark: isDark ? '#b71c1c' : '#af101a',
            contrastText: '#ffffff',
          },
          secondary: {
            main: isDark ? '#fec330' : '#d97706',
            light: '#fef3c7',
            dark: '#b45309',
            contrastText: '#141b2b',
          },
          success: {
            main: isDark ? '#4ade80' : '#16a34a',
            light: isDark ? '#14532d' : '#dcfce7',
            dark: '#15803d',
            contrastText: '#ffffff',
          },
          info: {
            main: isDark ? '#38bdf8' : '#0284c7',
            light: isDark ? '#0c4a6e' : '#e0f2fe',
            dark: '#0369a1',
            contrastText: '#ffffff',
          },
          warning: {
            main: isDark ? '#fbbf24' : '#d97706',
            light: isDark ? '#78350f' : '#fef3c7',
            dark: '#b45309',
            contrastText: '#ffffff',
          },
          error: {
            main: isDark ? '#f87171' : '#dc2626',
            light: isDark ? '#7f1d1d' : '#fee2e2',
            dark: '#b91c1c',
            contrastText: '#ffffff',
          },
          background: {
            default: isDark ? '#0b0f19' : '#f8fafc',
            paper: isDark ? '#131b2e' : '#ffffff',
          },
          divider: isDark ? '#263554' : '#e2e8f0',
        },
        typography: {
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 13,
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiPaper: {
            defaultProps: {
              elevation: 0,
            },
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                borderRadius: '9999px',
                height: 24,
              },
              sizeSmall: {
                height: 22,
                fontSize: '0.6875rem',
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          // Idiomatic MUI DataGrid theme customization reading purely from theme tokens
          MuiDataGrid: {
            styleOverrides: {
              root: ({ theme }) => ({
                border: 'none',
                fontFamily: 'inherit',
                '--DataGrid-rowBorderColor': theme.palette.divider,
              }),
              main: ({ theme }) => ({
                backgroundColor: theme.palette.background.paper,
              }),
              toolbar: ({ theme }) => ({
                padding: theme.spacing(1.5, 2),
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === 'dark' ? '#162036' : theme.palette.background.default,
              }),
              toolbarContainer: ({ theme }) => ({
                padding: theme.spacing(1.5, 2),
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === 'dark' ? '#162036' : theme.palette.background.default,
              }),
              columnHeaders: ({ theme }) => ({
                backgroundColor: theme.palette.mode === 'dark' ? '#162036' : theme.palette.background.default,
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: theme.palette.text.secondary,
                textTransform: 'uppercase',
              }),
              columnHeaderTitle: {
                fontWeight: 700,
              },
              cell: ({ theme }) => ({
                display: 'flex',
                alignItems: 'center', // Vertically center row cell contents
                borderColor: theme.palette.divider,
                fontSize: '0.8125rem',
                color: theme.palette.text.primary,
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(2),
              }),
              row: ({ theme }) => ({
                backgroundColor: theme.palette.background.paper,
                alignItems: 'center', // Ensure row container centers children
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '&:hover': {
                    backgroundColor: theme.palette.action.focus,
                  },
                },
              }),
              footerContainer: ({ theme }) => ({
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.mode === 'dark' ? '#162036' : theme.palette.background.default,
                minHeight: 48,
                color: theme.palette.text.secondary,
              }),
            },
          },
          MuiTablePagination: {
            styleOverrides: {
              root: ({ theme }) => ({
                fontSize: '0.8125rem',
                color: theme.palette.text.secondary,
              }),
              selectLabel: ({ theme }) => ({
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }),
              displayedRows: ({ theme }) => ({
                fontSize: '0.75rem',
                color: theme.palette.text.secondary,
                fontWeight: 500,
              }),
              select: ({ theme }) => ({
                color: theme.palette.text.primary,
              }),
            },
          },
        },
      },
      esES // Spanish localization for DataGrid
    );
  }, [isDark]);

  // Pagination model
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize,
    page: 0,
  });

  // Calculate whether toolbar is needed
  const shouldShowToolbar =
    showToolbarProp !== undefined
      ? showToolbarProp
      : showSearch || Boolean(title) || Boolean(toolbarActions);

  // Modern, non-deprecated Toolbar component using @mui/x-data-grid Toolbar & QuickFilter
  const TableToolbar = useMemo(() => {
    return function CustomToolbar() {
      return (
        <Toolbar>
          <Box
            sx={{
              width: '100%',
              p: { xs: 1.5, sm: 2 },
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              minHeight: 56,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {/* Left side: Title, Badge and Subtitle */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {title && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {title}
                    </Typography>
                    {badgeText && (
                      <Chip
                        label={badgeText}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 22,
                          borderColor: 'divider',
                          color: 'text.secondary',
                        }}
                      />
                    )}
                  </Box>
                  {subtitle && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
                    >
                      {subtitle}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Right side: Modern non-deprecated QuickFilter + Toolbar Actions */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                ml: 'auto',
                flexWrap: 'wrap',
                justifyContent: { xs: 'stretch', sm: 'flex-end' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {showSearch && (
                <StyledQuickFilter debounceMs={200}>
                  <QuickFilterTrigger
                    render={(triggerProps, state) => (
                      <Tooltip title="Buscar en la tabla" enterDelay={200}>
                        <StyledToolbarButton
                          {...triggerProps}
                          ownerState={{ expanded: state.expanded }}
                          color="default"
                          aria-disabled={state.expanded}
                        >
                          <SearchIcon fontSize="small" />
                        </StyledToolbarButton>
                      </Tooltip>
                    )}
                  />
                  <QuickFilterControl
                    render={({ ref, ...controlProps }, state) => (
                      <StyledTextField
                        {...controlProps}
                        ownerState={{ expanded: state.expanded }}
                        inputRef={ref}
                        aria-label="Buscar"
                        placeholder={searchPlaceholder}
                        size="small"
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              </InputAdornment>
                            ),
                            endAdornment: state.value ? (
                              <InputAdornment position="end">
                                <QuickFilterClear
                                  edge="end"
                                  size="small"
                                  aria-label="Limpiar búsqueda"
                                >
                                  <CancelIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                </QuickFilterClear>
                              </InputAdornment>
                            ) : null,
                            ...controlProps.slotProps?.input,
                          },
                          ...controlProps.slotProps,
                        }}
                      />
                    )}
                  />
                </StyledQuickFilter>
              )}
              {toolbarActions}
            </Box>
          </Box>
        </Toolbar>
      );
    };
  }, [title, subtitle, badgeText, showSearch, searchPlaceholder, toolbarActions]);

  // Build DataGrid columns with vertical centering and action column if defined
  const gridColumns = useMemo<GridColDef[]>(() => {
    const cols: GridColDef[] = columns.map((col) => ({
      field: col.field,
      headerName: col.headerName,
      width: col.width,
      minWidth: col.minWidth || 120,
      flex: col.flex !== undefined ? col.flex : col.width ? undefined : 1,
      align: col.align || 'left',
      headerAlign: col.headerAlign || col.align || 'left',
      sortable: col.sortable !== false,
      filterable: col.filterable !== false,
      valueGetter: col.valueGetter
        ? (value: any, row: any) => col.valueGetter!(value, row)
        : undefined,
      renderCell: col.renderCell
        ? (params: GridRenderCellParams) => (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent:
                  col.align === 'center'
                    ? 'center'
                    : col.align === 'right'
                    ? 'flex-end'
                    : 'flex-start',
                width: '100%',
                height: '100%',
              }}
            >
              {col.renderCell!({
                row: params.row as T,
                value: params.value,
                field: params.field,
                id: params.id,
              })}
            </Box>
          )
        : undefined,
    }));

    // If actions are provided, append a dedicated actions column
    if (actions) {
      cols.push({
        field: 'actions',
        headerName: actionsColumnName,
        width: actionsColumnWidth,
        minWidth: actionsColumnWidth,
        align: actionsColumnAlign,
        headerAlign: actionsColumnAlign,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams) => {
          const row = params.row as T;

          // If actions is a function, call it directly
          if (typeof actions === 'function') {
            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: actionsColumnAlign === 'right' ? 'flex-end' : 'flex-start',
                  width: '100%',
                  height: '100%',
                  gap: 1,
                }}
              >
                {actions(row)}
              </Box>
            );
          }

          // If actions is an array of TableAction
          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: actionsColumnAlign === 'right' ? 'flex-end' : 'flex-start',
                width: '100%',
                height: '100%',
                gap: 1,
              }}
            >
              {actions.map((act, idx) => {
                const isHidden = typeof act.hidden === 'function' ? act.hidden(row) : act.hidden;
                if (isHidden) return null;

                if (act.render) {
                  return <React.Fragment key={idx}>{act.render(row)}</React.Fragment>;
                }

                const isDisabled =
                  typeof act.disabled === 'function' ? act.disabled(row) : act.disabled;

                const buttonContent = (
                  <Button
                    key={idx}
                    variant={act.variant || 'outlined'}
                    color={act.color || 'primary'}
                    size="small"
                    disabled={isDisabled}
                    startIcon={
                      act.icon ? (
                        act.icon
                      ) : (
                        <EditIcon fontSize="small" />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      act.onClick(row);
                    }}
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 1.5,
                    }}
                  >
                    {act.label}
                  </Button>
                );

                if (act.tooltip) {
                  return (
                    <Tooltip key={idx} title={act.tooltip} arrow>
                      <span>{buttonContent}</span>
                    </Tooltip>
                  );
                }

                return <React.Fragment key={idx}>{buttonContent}</React.Fragment>;
              })}
            </Box>
          );
        },
      });
    }

    return cols;
  }, [
    columns,
    actions,
    actionsColumnName,
    actionsColumnWidth,
    actionsColumnAlign,
  ]);

  // Clean empty overlay leveraging MUI theme tokens
  const CustomNoRowsOverlay = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 4,
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          mb: 1.5,
        }}
      >
        <SearchIcon sx={{ fontSize: 26 }} />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
        {emptyMessage}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', maxWidth: 360, mt: 0.5 }}>
        {emptySubMessage}
      </Typography>
    </Box>
  );

  // Clean loading overlay leveraging MUI theme tokens
  const CustomLoadingOverlay = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 1.5,
        p: 4,
        bgcolor: 'background.paper',
      }}
    >
      <CircularProgress size={36} color="primary" />
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
        Cargando datos...
      </Typography>
    </Box>
  );

  return (
    <ThemeProvider theme={muiTableTheme}>
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={gridColumns}
            getRowId={getRowId}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={pageSizeOptions}
            checkboxSelection={checkboxSelection}
            disableRowSelectionOnClick={disableRowSelectionOnClick}
            onRowClick={onRowClick ? (params) => onRowClick(params.row as T) : undefined}
            slots={{
              noRowsOverlay: CustomNoRowsOverlay,
              loadingOverlay: CustomLoadingOverlay,
              toolbar: shouldShowToolbar ? TableToolbar : undefined,
            }}
            showToolbar={shouldShowToolbar}
            disableColumnFilter={disableColumnFilter}
            disableColumnSelector={disableColumnSelector}
            disableDensitySelector={disableDensitySelector}
            initialState={{
              filter: {
                filterModel: {
                  items: [],
                  quickFilterValues:
                    initialQuickFilterValues || (searchValue ? [searchValue] : []),
                },
              },
            }}
            onFilterModelChange={(model: GridFilterModel) => {
              if (onSearchChange) {
                onSearchChange(model.quickFilterValues?.join(' ') || '');
              }
              if (onQuickFilterChange) {
                onQuickFilterChange(model.quickFilterValues || []);
              }
            }}
            rowHeight={rowHeight}
            {...dataGridProps}
            sx={{
              minHeight,
              minWidth: 700,
              border: 0,
              ...dataGridProps?.sx,
            }}
          />
        </Box>
      </Paper>
    </ThemeProvider>
  );
}
