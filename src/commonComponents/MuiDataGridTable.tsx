import React, { useState, useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

// Theme customization ensuring high-fidelity Material UI styling
const muiTableTheme = createTheme(
  {
    palette: {
      primary: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#af101a',
      },
      secondary: {
        main: '#475569',
      },
      text: {
        primary: '#1e293b',
        secondary: '#64748b',
      },
      background: {
        default: '#ffffff',
        paper: '#ffffff',
      },
      divider: '#e2e8f0',
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
}: MuiDataGridTableProps<T>) {
  // Search state (internal or controlled via props)
  const [internalSearch, setInternalSearch] = useState('');
  const query = searchValue !== undefined ? searchValue : internalSearch;

  const handleQueryChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  // Pagination model
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize,
    page: 0,
  });

  // Filtered rows based on search query
  const filteredRows = useMemo(() => {
    if (!showSearch || !query.trim()) return rows;

    const lowerQuery = query.toLowerCase().trim();

    if (searchFilter) {
      return rows.filter((r) => searchFilter(r, lowerQuery));
    }

    // Default global search across all fields of the row
    return rows.filter((row) =>
      Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') {
          return Object.values(val).some((nestedVal) =>
            String(nestedVal ?? '').toLowerCase().includes(lowerQuery)
          );
        }
        return String(val).toLowerCase().includes(lowerQuery);
      })
    );
  }, [rows, showSearch, query, searchFilter]);

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
                      borderColor: '#cbd5e1',
                      color: act.color === 'primary' ? '#d32f2f' : undefined,
                      '&:hover': {
                        borderColor: '#d32f2f',
                        backgroundColor: 'rgba(211, 47, 47, 0.05)',
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
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
          mb: 1.5,
        }}
      >
        <SearchIcon sx={{ fontSize: 26 }} />
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
        {emptyMessage}
      </Typography>
      <Typography variant="caption" sx={{ color: '#64748b', maxWidth: 360, mt: 0.5 }}>
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
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <CircularProgress size={36} sx={{ color: '#d32f2f' }} />
      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
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
          borderColor: '#e2e8f0',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Material UI Table Toolbar Header */}
        {(title || showSearch || toolbarActions) && (
          <Box
            sx={{
              p: { xs: 1.75, sm: 2 },
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Title and Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {title && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
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
                          backgroundColor: '#e2e8f0',
                          color: '#334155',
                          height: 22,
                        }}
                      />
                    )}
                  </Box>
                  {subtitle && (
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.25 }}>
                      {subtitle}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            {/* Right side: Search Box and Actions */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                justifyContent: { xs: 'stretch', sm: 'flex-end' },
              }}
            >
              {/* Material UI Outlined Search Input */}
              {showSearch && (
                <TextField
                  size="small"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  sx={{
                    minWidth: { xs: '100%', sm: 280 },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      fontSize: '0.8125rem',
                      '& fieldset': {
                        borderColor: '#cbd5e1',
                      },
                      '&:hover fieldset': {
                        borderColor: '#94a3b8',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#d32f2f',
                      },
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#64748b', fontSize: 19 }} />
                        </InputAdornment>
                      ),
                      endAdornment: query ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => handleQueryChange('')}
                            edge="end"
                            title="Limpiar búsqueda"
                          >
                            <CloseIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    },
                  }}
                />
              )}

              {/* Extra toolbar actions */}
              {toolbarActions}
            </Box>
          </Box>
        )}

        {/* Material UI DataGrid with full responsiveness */}
        <Box
          sx={{
            width: '100%',
            minHeight,
            overflowX: 'auto',
            '& .MuiDataGrid-root': {
              border: 'none',
              fontFamily: 'inherit',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#475569',
              textTransform: 'uppercase',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f1f5f9',
              fontSize: '0.8125rem',
              color: '#1e293b',
              paddingX: 2,
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#f8faff',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              minHeight: '48px',
            },
            '& .MuiTablePagination-root': {
              fontSize: '0.8125rem',
              color: '#475569',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 500,
            },
          }}
        >
          <DataGrid
            rows={filteredRows}
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
