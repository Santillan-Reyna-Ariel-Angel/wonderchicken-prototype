import React, { useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';

export interface MuiDatePickerProps {
  label: string;
  value?: string | null; // ISO YYYY-MM-DD or empty
  onChange: (dateStr: string) => void;
  helperText?: string;
  placeholder?: string;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  className?: string;
  themeMode?: 'light' | 'dark' | 'auto';
  maxWidth?: number | string;
}

export const MuiDatePicker: React.FC<MuiDatePickerProps> = ({
  label,
  value,
  onChange,
  helperText = 'DD/MM/AAAA',
  size = 'small',
  fullWidth = true,
  disabled = false,
  minDate,
  maxDate,
  className = '',
  themeMode = 'auto',
  maxWidth,
}) => {
  const { theme: appTheme } = useTheme();
  const isDark = themeMode === 'dark' ? true : themeMode === 'light' ? false : appTheme === 'dark';

  const muiPickerTheme = useMemo(() => {
    const primaryColor = isDark ? '#ef5350' : '#d32f2f';
    const paperBg = isDark ? '#162036' : '#ffffff';
    const inputBg = isDark ? '#1a233b' : '#ffffff';
    const borderColor = isDark ? '#263554' : '#cbd5e1';
    const borderHover = isDark ? '#3b4d75' : '#94a3b8';
    const textColor = isDark ? '#f8fafc' : '#1e293b';
    const textSecondary = isDark ? '#94a3b8' : '#64748b';

    return createTheme({
      palette: {
        mode: isDark ? 'dark' : 'light',
        primary: {
          main: primaryColor,
          light: isDark ? '#ff867c' : '#ef5350',
          dark: isDark ? '#b71c1c' : '#af101a',
          contrastText: '#ffffff',
        },
        background: {
          paper: paperBg,
          default: inputBg,
        },
        text: {
          primary: textColor,
          secondary: textSecondary,
          disabled: isDark ? '#64748b' : '#94a3b8',
        },
        divider: isDark ? '#263554' : '#e2e8f0',
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 13,
      },
      components: {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              backgroundColor: inputBg,
              borderRadius: 8,
              fontSize: '0.8125rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: borderColor,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: borderHover,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: primaryColor,
                borderWidth: 1.5,
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: paperBg,
              borderRadius: 12,
              border: `1px solid ${isDark ? '#263554' : '#e2e8f0'}`,
              boxShadow: isDark
                ? '0 10px 30px rgba(0,0,0,0.6)'
                : '0 10px 25px rgba(0,0,0,0.08)',
            },
          },
        },
        MuiPickerDay: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontSize: '0.8125rem',
              color: textColor,
              '&:hover': {
                backgroundColor: isDark ? '#263554' : '#f1f5f9',
              },
              '&.Mui-selected': {
                backgroundColor: `${primaryColor} !important`,
                color: '#ffffff',
                fontWeight: 700,
              },
              '&.MuiPickerDay-today': {
                borderColor: primaryColor,
              },
            },
          },
        },
      },
    });
  }, [isDark]);

  const parsedValue = useMemo(() => {
    if (!value) return null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  }, [value]);

  const handleChange = (newValue: Dayjs | null) => {
    if (newValue && newValue.isValid()) {
      onChange(newValue.format('YYYY-MM-DD'));
    } else {
      onChange('');
    }
  };

  return (
    <ThemeProvider theme={muiPickerTheme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <div className={`flex flex-col ${className}`} style={{ maxWidth: maxWidth || undefined }}>
          <DatePicker
            label={label}
            value={parsedValue}
            onChange={handleChange}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            slotProps={{
              textField: {
                size,
                fullWidth,
                helperText,
              },
              popper: {
                sx: {
                  zIndex: 99999,
                },
              },
            }}
          />
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};
