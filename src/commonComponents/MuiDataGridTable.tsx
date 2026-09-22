import React, { useState, useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
  GridFilterModel,
  GridToolbarQuickFilter,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme } from '../context/ThemeContext';

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

export interface MuiDataGridTableProps<T = any> {
  rows: T[];
  columns: TableColumn<T>[];
  getRowId?: (row: T) => string | number;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchFilter?: (row: T, query: string) => boolean;
  initialQuickFilterValues?: string[];
  quickFilterValues?: string[];
  onQuickFilterChange?: (values: string[]) => void;
  showToolbar?: boolean;
  disableColumnFilter?: boolean;
  disableColumnSelector?: boolean;
  disableDensitySelector?: boolean;
  actions?: TableAction<T>[] | ((row: T) => React.ReactNode);
  actionsColumnName?: string;
  actionsColumnWidth?: number;
  actionsColumnAlign?: 'left' | 'center' | 'right';
  pageSize?: number;
  pageSizeOptions?: number[];
  rowHeight?: number;
  minHeight?: number | string;
  emptyMessage?: string;
  emptySubMessage?: string;
  toolbarActions?: React.ReactNode;
  onRowClick?: (row: T) => void;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  themeMode?: 'light' | 'dark' | 'auto';
}

export function MuiDataGridTable<T extends Record<string, any>>({
  rows,
  columns,
  getRowId = (row: any) => row.id ?? row._id ?? row.ticketNumber ?? Math.random().toString(),
  loading = false,
  title,
  subtitle,
  badgeText,
  showSearch = true,
  searchPlaceholder = 'Buscar en la tabla...',
  searchValue,
  onSearchChange,
  searchFilter,
  initialQuickFilterValues,
  quickFilterValues,
  onQuickFilterChange,
  showToolbar: showToolbarProp,
  disableColumnFilter = true,
  disableColumnSelector = true,
  disableDensitySelector = true,
  actions,
  actionsColumnName = 'Acciones',
  actionsColumnWidth = 130,
  actionsColumnAlign = 'right',
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  rowHeight = 72,
  minHeight = 490,
  emptyMessage = 'No se encontraron registros',
  emptySubMessage = 'Intente ajustar los términos de búsqueda o los filtros aplicados.',
  toolbarActions,
  onRowClick,
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
  themeMode = 'auto',
}: MuiDataGridTableProps<T>) {
  // Sync with application ThemeContext
  const { theme: appTheme } = useTheme();
  const isDark = themeMode === 'dark' ? true : themeMode === 'light' ? false : appTheme === 'dark';

  // Dynamic Material UI theme matching application light and dark palette
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
            main: isDark ? '#94a3b8' : '#475569',
          },
          text: {
            primary: isDark ? '#f8fafc' : '#1e293b',
            secondary: isDark ? '#94a3b8' : '#64748b',
            disabled: isDark ? '#64748b' : '#94a3b8',
          },
          background: {
            default: isDark ? '#0b0f19' : '#ffffff',
            paper: isDark ? '#131b2e' : '#ffffff',
          },
          divider: isDark ? '#263554' : '#e2e8f0',
          action: {
            hover: isDark ? '#1e293b' : '#f8faff',
            selected: isDark ? '#243050' : '#f1f5f9',
            disabled: isDark ? '#475569' : '#cbd5e1',
          },
        },
        typography: {
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: 13,
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
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

  // Custom Toolbar component leveraging native MUI GridToolbarContainer and GridToolbarQuickFilter
  const TableToolbar = useMemo(() => {
    return function CustomToolbar() {
      return (
        <GridToolbarContainer
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderBottom: '1px solid',
            borderColor: isDark ? '#263554' : '#e2e8f0',
            backgroundColor: isDark ? '#162036' : '#f8fafc',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            minHeight: 56,
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
                      color: isDark ? '#f8fafc' : '#1e293b',
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
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        backgroundColor: isDark ? '#263554' : '#e2e8f0',
                        color: isDark ? '#cbd5e1' : '#334155',
                        border: isDark ? '1px solid #334155' : 'none',
                        height: 22,
                      }}
                    />
                  )}
                </Box>
                {subtitle && (
                  <Typography
                    variant="caption"
                    sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', mt: 0.25 }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Right side: Native MUI DataGrid Quick Filter + Toolbar Actions */}
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
              <Box
                sx={{
                  minWidth: { xs: '100%', sm: 280 },
                  '& .MuiInputBase-root': {
                    backgroundColor: isDark ? '#131b2e' : '#ffffff',
                    color: isDark ? '#f8fafc' : '#1e293b',
                    fontSize: '0.8125rem',
                    borderRadius: '8px',
                    '& fieldset': {
                      borderColor: isDark ? '#263554' : '#cbd5e1',
                    },
                    '&:hover fieldset': {
                      borderColor: isDark ? '#3b4d75' : '#94a3b8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: isDark ? '#ef5350' : '#d32f2f',
                    },
                    '& .MuiSvgIcon-root': {
                      color: isDark ? '#94a3b8' : '#64748b',
                    },
                    '& input': {
                      color: isDark ? '#f8fafc' : '#1e293b',
                      '&::placeholder': {
                        color: isDark ? '#64748b' : '#94a3b8',
                        opacity: 1,
                      },
                    },
                  },
                }}
              >
                <GridToolbarQuickFilter
                  debounceMs={200}
                  slotProps={{
                    root: {
                      placeholder: searchPlaceholder,
                      size: 'small',
                    },
                  }}
                />
              </Box>
            )}
            {toolbarActions}
          </Box>
        </GridToolbarContainer>
      );
    };
  }, [title, subtitle, badgeText, showSearch, searchPlaceholder, toolbarActions, isDark]);

  // Build DataGrid columns with action column if defined
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
        ? (params: GridRenderCellParams) =>
            col.renderCell!({
              row: params.row as T,
              value: params.value,
              field: params.field,
              id: params.id,
            })
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
                      py: 0.75,
                      px: 1.5,
                      borderRadius: 1.5,
                      borderColor: act.variant === 'outlined' ? (isDark ? '#3b4d75' : '#cbd5e1') : undefined,
                      color: act.color === 'primary' ? (isDark ? '#ef5350' : '#d32f2f') : undefined,
                      '&:hover': {
                        borderColor: isDark ? '#ef5350' : '#d32f2f',
                        backgroundColor: isDark ? 'rgba(239, 83, 80, 0.12)' : 'rgba(211, 47, 47, 0.05)',
                      },
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
    isDark,
  ]);

  // Custom empty overlay
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
        backgroundColor: isDark ? '#131b2e' : '#ffffff',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: isDark ? '#1a233b' : '#f1f5f9',
          border: '1px solid',
          borderColor: isDark ? '#263554' : '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDark ? '#94a3b8' : '#94a3b8',
          mb: 1.5,
        }}
      >
        <SearchIcon sx={{ fontSize: 26 }} />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#334155' }}>
        {emptyMessage}
      </Typography>
      <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', maxWidth: 360, mt: 0.5 }}>
        {emptySubMessage}
      </Typography>
    </Box>
  );

  // Custom loading overlay
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
        backgroundColor: isDark ? 'rgba(19, 27, 46, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <CircularProgress size={36} sx={{ color: isDark ? '#ef5350' : '#d32f2f' }} />
      <Typography variant="caption" sx={{ fontWeight: 600, color: isDark ? '#94a3b8' : '#475569' }}>
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
          borderRadius: 3,
          borderColor: isDark ? '#263554' : '#e2e8f0',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: isDark ? '#131b2e' : '#ffffff',
          boxShadow: isDark
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.4)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Material UI DataGrid with native quick filtering and toolbar */}
        <Box
          sx={{
            width: '100%',
            minHeight,
            overflowX: 'auto',
            backgroundColor: isDark ? '#131b2e' : '#ffffff',
            '& .MuiDataGrid-root': {
              border: 'none',
              fontFamily: 'inherit',
              color: isDark ? '#f8fafc' : '#1e293b',
              '--DataGrid-rowBorderColor': isDark ? '#263554' : '#f1f5f9',
            },
            '& .MuiDataGrid-main': {
              backgroundColor: isDark ? '#131b2e' : '#ffffff',
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: { xs: '12px 14px', sm: '12px 16px' },
              borderBottom: '1px solid',
              borderColor: isDark ? '#263554' : '#e2e8f0',
              backgroundColor: isDark ? '#162036' : '#f8fafc',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDark ? '#162036' : '#f8fafc',
              borderBottom: '1px solid',
              borderColor: isDark ? '#263554' : '#e2e8f0',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: isDark ? '#94a3b8' : '#475569',
              textTransform: 'uppercase',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              color: isDark ? '#cbd5e1' : '#475569',
            },
            '& .MuiDataGrid-iconButtonContainer .MuiIconButton-root, & .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIcon .MuiIconButton-root': {
              color: isDark ? '#94a3b8' : '#64748b',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: isDark ? '#1e293b' : '#f1f5f9',
              fontSize: '0.8125rem',
              color: isDark ? '#f8fafc' : '#1e293b',
              paddingX: 2,
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: isDark ? '#131b2e' : '#ffffff',
              transition: 'background-color 0.15s ease',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: isDark ? '#1e293b !important' : '#f8faff !important',
            },
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: isDark ? '#243050 !important' : '#f1f5f9 !important',
            },
            '& .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: isDark ? '#2c3b63 !important' : '#e2e8f0 !important',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: isDark ? '#263554' : '#e2e8f0',
              backgroundColor: isDark ? '#162036' : '#f8fafc',
              minHeight: '48px',
              color: isDark ? '#94a3b8' : '#475569',
            },
            '& .MuiTablePagination-root': {
              fontSize: '0.8125rem',
              color: isDark ? '#94a3b8' : '#475569',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.75rem',
              color: isDark ? '#94a3b8' : '#64748b',
              fontWeight: 500,
            },
            '& .MuiTablePagination-select': {
              color: isDark ? '#f8fafc' : '#1e293b',
            },
            '& .MuiTablePagination-actions .MuiIconButton-root': {
              color: isDark ? '#cbd5e1' : '#475569',
              '&.Mui-disabled': {
                color: isDark ? '#334155' : '#cbd5e1',
              },
            },
          }}
        >
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
            slotProps={{
              toolbar: {
                showQuickFilter: showSearch,
                quickFilterProps: {
                  debounceMs: 200,
                  slotProps: {
                    root: {
                      placeholder: searchPlaceholder,
                    },
                  },
                },
              },
            }}
            rowHeight={rowHeight}
            sx={{
              minWidth: 700, // Enables clean horizontal scrolling on smaller viewports
            }}
          />
        </Box>
      </Paper>
    </ThemeProvider>
  );
}
