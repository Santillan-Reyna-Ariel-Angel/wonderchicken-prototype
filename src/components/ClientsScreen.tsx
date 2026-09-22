import React, { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';
import { Customer, UserRole } from '../types';
import { AppModal } from '../commonComponents/AppModal';
import { MuiDataGridTable, TableColumn, TableAction } from '../commonComponents/MuiDataGridTable';

interface ClientsScreenProps {
  customers: Customer[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer?: (customer: Customer) => void;
  onSelectCustomerForPOS: (customer: Customer) => void;
  onBackToPOS: () => void;
  userRole?: UserRole;
}

export const ClientsScreen: React.FC<ClientsScreenProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onBackToPOS,
}) => {
  // Theme context for MUI components
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const datePickerTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: isDark ? '#ef5350' : '#d32f2f',
          light: isDark ? '#ff867c' : '#ef5350',
          dark: isDark ? '#b71c1c' : '#af101a',
        },
        background: {
          paper: isDark ? '#162036' : '#ffffff',
          default: isDark ? '#131b2e' : '#ffffff',
        },
        text: {
          primary: isDark ? '#f8fafc' : '#1e293b',
          secondary: isDark ? '#94a3b8' : '#64748b',
        },
        divider: isDark ? '#263554' : '#e2e8f0',
      },
    });
  }, [isDark]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form states (independent of any branch)
  const [ci, setCi] = useState('');
  const [isCorporate, setIsCorporate] = useState(false);
  const [nit, setNit] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Hombre' | 'Mujer'>('Hombre');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState('');

  // Toast notification
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const resetForm = () => {
    setCi('');
    setIsCorporate(false);
    setNit('');
    setBusinessName('');
    setFirstName('');
    setLastName('');
    setGender('Hombre');
    setPhone('');
    setEmail('');
    setBirthdate('');
    setEditingCustomer(null);
  };

  const handleOpenNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setCi(cust.ci || '');
    setIsCorporate(Boolean(cust.isCorporate));
    setNit(cust.nit || '');
    setBusinessName(cust.businessName || '');
    setFirstName(cust.firstName || '');
    setLastName(cust.lastName || '');
    setGender(cust.gender || 'Hombre');
    setPhone(cust.phone === '-' ? '' : cust.phone);
    setEmail(cust.email || '');
    setBirthdate(cust.birthdate || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSaveCustomer = () => {
    if (!ci && !nit) {
      alert('Debe ingresar un número de CI o NIT.');
      return;
    }

    const calculatedFullName = isCorporate && businessName
      ? businessName
      : `${firstName} ${lastName}`.trim() || ci || 'Cliente Registrado';

    if (editingCustomer) {
      // Editing existing customer
      const updated: Customer = {
        ...editingCustomer,
        ci: ci.trim(),
        ciExt: undefined,
        nit: isCorporate ? nit.trim() : undefined,
        fullName: calculatedFullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: isCorporate ? businessName.trim() : undefined,
        gender,
        phone: phone.trim() || '+591 70000000',
        email: email.trim() || undefined,
        birthdate: birthdate || undefined,
        isCorporate,
      };

      if (onUpdateCustomer) {
        onUpdateCustomer(updated);
      } else {
        onAddCustomer(updated);
      }
      showToast(`Datos del cliente "${updated.fullName}" actualizados exitosamente.`);
    } else {
      // Creating new customer (global, available across any branch)
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        ci: ci.trim(),
        ciExt: undefined,
        nit: isCorporate ? nit.trim() : undefined,
        fullName: calculatedFullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: isCorporate ? businessName.trim() : undefined,
        gender,
        phone: phone.trim() || '+591 70000000',
        email: email.trim() || undefined,
        birthdate: birthdate || undefined,
        isCorporate,
        lastOrderTime: 'Reciente',
        lastOrderAmount: 0,
      };

      onAddCustomer(newCust);
      showToast(`Cliente "${newCust.fullName}" registrado exitosamente.`);
    }

    handleCloseModal();
  };

  // Column definitions for MuiDataGridTable
  const clientColumns: TableColumn<Customer>[] = useMemo(
    () => [
      {
        field: 'fullName',
        headerName: 'Cliente / Razón Social',
        minWidth: 320,
        flex: 2,
        valueGetter: (_, row) => `${row.fullName} ${row.email || ''}`,
        renderCell: ({ row }) => (
          <div className="flex flex-col justify-center min-w-0 w-full py-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-[#0f172a] dark:text-[#f8fafc] leading-tight">
                {row.fullName}
              </span>
              {row.isCorporate ? (
                <span className="bg-[#fef3c7] dark:bg-amber-950/40 text-[#92400e] dark:text-[#fcd34d] border border-[#fde68a] dark:border-amber-800/60 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded leading-none shrink-0">
                  CORP
                </span>
              ) : (
                <span className="bg-[#f1f5f9] dark:bg-slate-800 text-[#475569] dark:text-[#cbd5e1] border border-transparent dark:border-slate-700 font-mono text-[10px] font-medium px-1.5 py-0.5 rounded leading-none shrink-0">
                  NATURAL
                </span>
              )}
            </div>
            {row.email ? (
              <span className="text-xs text-[#64748b] dark:text-[#94a3b8] leading-tight mt-1 truncate">
                {row.email}
              </span>
            ) : (
              <span className="text-xs text-[#94a3b8] dark:text-[#64748b] italic leading-tight mt-1">
                Sin correo registrado
              </span>
            )}
          </div>
        ),
      },
      {
        field: 'document',
        headerName: 'Documento (CI / NIT)',
        minWidth: 160,
        flex: 1,
        valueGetter: (_, row) => row.nit || row.ci || '',
        renderCell: ({ row }) => (
          <div className="flex flex-col justify-center text-xs">
            {row.nit ? (
              <div className="flex items-center gap-1.5 font-mono">
                <span className="bg-[#fee2e2] dark:bg-rose-950/40 text-[#991b1b] dark:text-[#fca5a5] border border-transparent dark:border-rose-900/60 font-bold text-[10px] px-1.5 py-0.5 rounded">
                  NIT
                </span>
                <span className="font-bold text-[#b91c1c] dark:text-[#f87171]">{row.nit}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-mono text-[#1e293b] dark:text-[#f8fafc]">
                <span className="bg-[#f1f5f9] dark:bg-slate-800 text-[#475569] dark:text-[#cbd5e1] border border-transparent dark:border-slate-700 font-semibold text-[10px] px-1.5 py-0.5 rounded">
                  CI
                </span>
                <span className="font-semibold">{row.ci || '-'}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        field: 'phone',
        headerName: 'Contacto',
        minWidth: 150,
        flex: 0.9,
        valueGetter: (_, row) => row.phone || '',
        renderCell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-[#334155] dark:text-[#cbd5e1] font-mono">
            <span className="material-symbols-outlined text-[#16a34a] dark:text-[#4ade80] text-[16px]">
              call
            </span>
            <span className="font-medium">{row.phone || '-'}</span>
          </div>
        ),
      },
      {
        field: 'demographics',
        headerName: 'Datos Demográficos',
        minWidth: 170,
        flex: 1,
        valueGetter: (_, row) => `${row.gender || ''} ${row.birthdate || ''}`,
        renderCell: ({ row }) => (
          <div className="flex flex-col justify-center min-w-0 w-full py-1">
            <span className="font-semibold text-xs text-[#0f172a] dark:text-[#f8fafc] leading-tight">
              {row.gender || 'Hombre'}
            </span>
            {row.birthdate ? (
              <span className="font-mono text-[11px] text-[#64748b] dark:text-[#94a3b8] leading-tight mt-1">
                Nac: {row.birthdate}
              </span>
            ) : (
              <span className="text-[11px] text-[#94a3b8] dark:text-[#64748b] italic leading-tight mt-1">
                Sin fecha registrada
              </span>
            )}
          </div>
        ),
      },
    ],
    []
  );

  // Reusable actions configuration: triggers editing customer modal
  const clientActions: TableAction<Customer>[] = useMemo(
    () => [
      {
        label: 'Editar',
        tooltip: 'Editar datos del cliente',
        color: 'primary',
        variant: 'outlined',
        onClick: (cust) => handleOpenEditModal(cust),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {feedback && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#131b2e] p-4 sm:p-5 rounded-xl border border-[#e2e8f0] dark:border-[#263554] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#fff1f2] dark:bg-rose-950/40 border border-[#fecdd3] dark:border-rose-900/60 flex items-center justify-center text-[#d32f2f] dark:text-[#ef5350]">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#1e293b] dark:text-[#f8fafc]">
                Directorio Global de Clientes
              </h1>
              <p className="text-xs text-[#64748b] dark:text-[#94a3b8]">
                Base de datos centralizada e independiente de sucursal • Accesible desde cualquier terminal POS
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onBackToPOS}
            className="px-3.5 py-2 bg-white dark:bg-[#1a233b] hover:bg-[#f1f5f9] dark:hover:bg-[#243050] text-[#334155] dark:text-[#f8fafc] font-mono text-xs font-semibold rounded-lg border border-[#cbd5e1] dark:border-[#263554] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Volver a Ventas POS (F1)
          </button>

          <button
            type="button"
            onClick={handleOpenNewModal}
            className="px-4 py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Reusable MUI X DataGrid Table Component */}
      <MuiDataGridTable<Customer>
        rows={customers}
        columns={clientColumns}
        actions={clientActions}
        actionsColumnName="Acciones"
        actionsColumnWidth={140}
        rowHeight={64}
        title="Directorio Central de Clientes"
        badgeText={`${customers.length} registrados`}
        showSearch={true}
        searchPlaceholder="Buscar por nombre, CI, NIT, teléfono..."
        emptyMessage="No se encontraron clientes"
        emptySubMessage="Intente ajustar los términos de búsqueda ingresados."
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        minHeight={500}
      />

      {/* Modal: Nuevo Cliente / Editar Datos de Cliente */}
      <AppModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        icon={editingCustomer ? 'edit' : 'person_add'}
        title={editingCustomer ? 'Editar Datos del Cliente' : 'Registrar Nuevo Cliente'}
        description={
          editingCustomer
            ? `Actualización de ficha tributaria y contacto para ${editingCustomer.fullName}`
            : 'Ficha de datos para facturación electrónica y directorio central'
        }
        maxWidth="md"
        onConfirm={handleSaveCustomer}
        confirmLabel={editingCustomer ? 'Guardar Cambios' : 'Guardar Cliente'}
        confirmIcon={editingCustomer ? 'save' : 'person_add'}
        showCancel={true}
        cancelLabel="Cancelar"
      >
        <div className="flex flex-col gap-4">
          {/* Row 1: CI + Toggle Razón Social */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2.5">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1e293b] dark:text-[#f8fafc]">
                Cédula de Identidad (CI) * <span className="text-[#ba1a1a] dark:text-[#f87171] font-normal">(Obligatorio)</span>
              </label>
              <input
                type="text"
                required
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                placeholder="Ej. 8493021"
                className="w-full px-3 py-2 rounded-lg border border-[#cbd5e1] dark:border-[#263554] bg-white dark:bg-[#1a233b] text-xs font-mono font-bold text-[#1e293b] dark:text-[#f8fafc] outline-none focus:border-[#d32f2f] dark:focus:border-[#ef5350]"
              />
            </div>

            {/* Toggle Razón Social */}
            <div className="shrink-0 flex items-end">
              <label className="flex items-center gap-2 px-2.5 py-2 bg-[#f8f9fc] dark:bg-[#1a233b] rounded-lg border border-[#cbd5e1] dark:border-[#263554] cursor-pointer text-xs font-bold text-[#1e293b] dark:text-[#f8fafc] hover:bg-[#f1f5f9] dark:hover:bg-[#243050] transition-colors whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={isCorporate}
                  onChange={(e) => setIsCorporate(e.target.checked)}
                  className="accent-[#d32f2f] rounded w-4 h-4 cursor-pointer"
                />
                <span>¿Razón Social?</span>
              </label>
            </div>
          </div>

          {/* If Corporate: NIT and Business Name */}
          {isCorporate && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#fff8f7] dark:bg-rose-950/20 rounded-lg border border-[#fecdd3] dark:border-rose-900/60 animate-fade-in">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#ba1a1a] dark:text-[#f87171]">NIT Fiscal:</label>
                <input
                  type="text"
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  placeholder="Ej. 1029384019"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1a233b] text-xs font-mono font-bold text-[#1e293b] dark:text-[#f8fafc] rounded border border-[#cbd5e1] dark:border-[#263554] outline-none focus:border-[#d32f2f] dark:focus:border-[#ef5350]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#ba1a1a] dark:text-[#f87171]">Razón Social:</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej. Quiroga Catering SRL"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1a233b] text-xs font-semibold text-[#1e293b] dark:text-[#f8fafc] rounded border border-[#cbd5e1] dark:border-[#263554] outline-none focus:border-[#d32f2f] dark:focus:border-[#ef5350]"
                />
              </div>
            </div>
          )}

          {/* Nombres & Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1e293b] dark:text-[#f8fafc]">Nombres *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej. Mauricio Esteban"
                className="w-full px-3 py-2 bg-white dark:bg-[#1a233b] text-xs font-medium text-[#1e293b] dark:text-[#f8fafc] rounded-lg border border-[#cbd5e1] dark:border-[#263554] outline-none focus:border-[#d32f2f] dark:focus:border-[#ef5350]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1e293b] dark:text-[#f8fafc]">Apellidos *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej. Villarroel Ramos"
                className="w-full px-3 py-2 bg-white dark:bg-[#1a233b] text-xs font-medium text-[#1e293b] dark:text-[#f8fafc] rounded-lg border border-[#cbd5e1] dark:border-[#263554] outline-none focus:border-[#d32f2f] dark:focus:border-[#ef5350]"
              />
            </div>
          </div>

          {/* Género */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-[#475569] dark:text-[#94a3b8]">Sexo / Género:</label>
            <div className="grid grid-cols-2 gap-2 sm:w-72">
              <button
                type="button"
                onClick={() => setGender('Hombre')}
                className={`py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  gender === 'Hombre'
                    ? 'bg-[#d32f2f] dark:bg-[#ef5350] text-white shadow-2xs'
                    : 'bg-[#f1f5f9] dark:bg-[#1a233b] text-[#475569] dark:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#263554]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">male</span>
                Hombre
              </button>
              <button
                type="button"
                onClick={() => setGender('Mujer')}
                className={`py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  gender === 'Mujer'
                    ? 'bg-[#d32f2f] dark:bg-[#ef5350] text-white shadow-2xs'
                    : 'bg-[#f1f5f9] dark:bg-[#1a233b] text-[#475569] dark:text-[#cbd5e1] hover:bg-[#e2e8f0] dark:hover:bg-[#263554]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">female</span>
                Mujer
              </button>
            </div>
          </div>

          {/* Celular & Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#475569] dark:text-[#94a3b8]">
                Celular de Contacto / WhatsApp:
              </label>
              <div className="flex items-center bg-white dark:bg-[#1a233b] rounded-lg border border-[#cbd5e1] dark:border-[#263554] px-2.5 py-1.5 focus-within:border-[#d32f2f] dark:focus-within:border-[#ef5350]">
                <span className="material-symbols-outlined text-[#15803d] dark:text-[#4ade80] text-[18px] mr-1">
                  call
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+591 71234567"
                  className="w-full text-xs font-mono font-medium outline-none bg-transparent text-[#1e293b] dark:text-[#f8fafc]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-[#475569] dark:text-[#94a3b8]">Correo Electrónico:</label>
              <div className="flex items-center bg-white dark:bg-[#1a233b] rounded-lg border border-[#cbd5e1] dark:border-[#263554] px-2.5 py-1.5 focus-within:border-[#d32f2f] dark:focus-within:border-[#ef5350]">
                <span className="material-symbols-outlined text-[#64748b] dark:text-[#94a3b8] text-[18px] mr-1">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full text-xs font-medium outline-none bg-transparent text-[#1e293b] dark:text-[#f8fafc]"
                />
              </div>
            </div>
          </div>

          {/* Birthdate with MUI X DatePicker */}
          <div className="flex flex-col gap-1">
            <ThemeProvider theme={datePickerTheme}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                  label="Fecha de Nacimiento (Opcional - Fidelización)"
                  value={birthdate ? dayjs(birthdate) : null}
                  onChange={(newValue: Dayjs | null) => {
                    if (newValue && newValue.isValid()) {
                      setBirthdate(newValue.format('YYYY-MM-DD'));
                    } else {
                      setBirthdate('');
                    }
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      helperText: 'DD/MM/AAAA',
                      fullWidth: true,
                      sx: {
                        maxWidth: { sm: 300 },
                        '& .MuiInputBase-root': {
                          backgroundColor: isDark ? '#1a233b' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#1e293b',
                          fontSize: '0.8125rem',
                          borderRadius: '8px',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: isDark ? '#263554' : '#cbd5e1',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: isDark ? '#3b4d75' : '#94a3b8',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: isDark ? '#ef5350' : '#d32f2f',
                        },
                        '& .MuiInputLabel-root': {
                          color: isDark ? '#94a3b8' : '#64748b',
                          fontSize: '0.8125rem',
                          '&.Mui-focused': {
                            color: isDark ? '#ef5350' : '#d32f2f',
                          },
                        },
                        '& .MuiFormHelperText-root': {
                          color: isDark ? '#64748b' : '#94a3b8',
                          fontSize: '0.7rem',
                        },
                        '& .MuiIconButton-root': {
                          color: isDark ? '#94a3b8' : '#64748b',
                        },
                      },
                    },
                    popper: {
                      sx: {
                        zIndex: 99999,
                        '& .MuiPaper-root': {
                          backgroundColor: isDark ? '#162036' : '#ffffff',
                          color: isDark ? '#f8fafc' : '#1e293b',
                          border: '1px solid',
                          borderColor: isDark ? '#263554' : '#e2e8f0',
                          borderRadius: '12px',
                          boxShadow: isDark
                            ? '0 10px 30px rgba(0,0,0,0.6)'
                            : '0 10px 25px rgba(0,0,0,0.1)',
                        },
                        '& .MuiPickersDay-root': {
                          color: isDark ? '#f8fafc' : '#1e293b',
                          '&:hover': {
                            backgroundColor: isDark ? '#263554' : '#f1f5f9',
                          },
                          '&.Mui-selected': {
                            backgroundColor: isDark ? '#ef5350 !important' : '#d32f2f !important',
                            color: '#ffffff',
                          },
                        },
                        '& .MuiDayCalendar-weekDayLabel': {
                          color: isDark ? '#94a3b8' : '#64748b',
                        },
                        '& .MuiPickersCalendarHeader-label': {
                          color: isDark ? '#f8fafc' : '#1e293b',
                          fontWeight: 600,
                        },
                        '& .MuiPickersArrowSwitcher-button': {
                          color: isDark ? '#94a3b8' : '#64748b',
                        },
                      },
                    },
                  }}
                />
              </LocalizationProvider>
            </ThemeProvider>
          </div>

          {/* Legal Notice SIN Bolivia */}
          <div className="p-3 bg-[#f8f9fc] dark:bg-[#162036] rounded-lg border border-[#e2e8f0] dark:border-[#263554] flex items-start gap-2">
            <span className="material-symbols-outlined text-[#d32f2f] dark:text-[#ef5350] text-[18px] shrink-0 mt-0.5">
              verified
            </span>
            <p className="text-[11px] text-[#475569] dark:text-[#94a3b8] leading-relaxed">
              <strong>Nota Legal RND 102100000011 (Servicio de Impuestos Nacionales):</strong>{' '}
              Facturación nominada obligatoria para consumos superiores a Bs. 1.000,00. El NIT o CI queda registrado y sincronizado en la base de datos central accesible desde cualquier sucursal y caja de la red.
            </p>
          </div>
        </div>
      </AppModal>
    </div>
  );
};
