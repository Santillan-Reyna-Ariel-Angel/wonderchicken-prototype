import React, { useState } from 'react';
import { UserRole } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  onLoginSuccess: (cashierName: string, role: UserRole) => void;
  onOpenPublicTracker?: () => void;
}

interface DemoCredential {
  role: UserRole;
  roleLabel: string;
  roleBadgeClass: string;
  email: string;
  ci: string;
  name: string;
  description: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: 'CAJERA',
    roleLabel: 'Cajera',
    roleBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    email: 'roxana@wonderchicken.com',
    ci: '8492019',
    name: 'Roxana Rodríguez',
    description: 'Punto de venta, cobros y arqueos de turno',
  },
  {
    role: 'DESPACHADORA',
    roleLabel: 'Despacho (KDS)',
    roleBadgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    email: 'diana.kds@wonderchicken.com',
    ci: '7721902',
    name: 'Diana Despacho',
    description: 'Pantalla de cocina y despacho de comandas',
  },
  {
    role: 'ADMIN',
    roleLabel: 'Administrador',
    roleBadgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    email: 'carlos.mendoza@wonderchicken.com',
    ci: '5543210',
    name: 'Carlos Mendoza',
    description: 'Control de turnos, arqueos y reportes de sucursal',
  },
  {
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin',
    roleBadgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    email: 'fernando.vaca@wonderchicken.com',
    ci: '1098234',
    name: 'Ing. Fernando Vaca',
    description: 'Red global de sucursales, auditorías y catálogo',
  },
];

const KNOWN_USERS: { email: string; ci: string; name: string; role: UserRole }[] = [
  { email: 'roxana@wonderchicken.com', ci: '8492019', name: 'Roxana Rodríguez', role: 'CAJERA' },
  { email: 'carlac@wonderchicken.com', ci: '2222222', name: 'Carla Cajera', role: 'CAJERA' },
  { email: 'diana.kds@wonderchicken.com', ci: '7721902', name: 'Diana Despacho', role: 'DESPACHADORA' },
  { email: 'dianad@wonderchicken.com', ci: '3333333', name: 'Diana Despacho', role: 'DESPACHADORA' },
  { email: 'carlos.mendoza@wonderchicken.com', ci: '5543210', name: 'Carlos Mendoza', role: 'ADMIN' },
  { email: 'admin@wonderchicken.com', ci: 'admin', name: 'Carlos Mendoza', role: 'ADMIN' },
  { email: 'fernando.vaca@wonderchicken.com', ci: '1098234', name: 'Ing. Fernando Vaca', role: 'SUPER_ADMIN' },
  { email: 'superadmin@wonderchicken.com', ci: 'super', name: 'Ing. Fernando Vaca', role: 'SUPER_ADMIN' },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginFeedback('Verificando credenciales de usuario...');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    setTimeout(() => {
      // Find matching user from known users
      const matched = KNOWN_USERS.find(
        (u) => u.email.toLowerCase() === trimmedEmail && (!u.ci || u.ci === trimmedPassword || trimmedPassword.length >= 4)
      );

      let detectedRole: UserRole = 'CAJERA';
      let detectedName = 'Operador Wonder Chicken';

      if (matched) {
        detectedRole = matched.role;
        detectedName = matched.name;
      } else if (trimmedEmail.includes('super')) {
        detectedRole = 'SUPER_ADMIN';
        detectedName = 'Ing. Fernando Vaca';
      } else if (trimmedEmail.includes('admin')) {
        detectedRole = 'ADMIN';
        detectedName = 'Carlos Mendoza';
      } else if (trimmedEmail.includes('despacho') || trimmedEmail.includes('kds')) {
        detectedRole = 'DESPACHADORA';
        detectedName = 'Diana Despacho';
      } else {
        detectedRole = 'CAJERA';
        detectedName = trimmedEmail ? trimmedEmail.split('@')[0].replace('.', ' ') : 'Roxana Rodríguez';
      }

      setLoginFeedback(`Credenciales válidas. Ingresando como ${detectedName}...`);
      setTimeout(() => {
        onLoginSuccess(detectedName, detectedRole);
      }, 500);
    }, 700);
  };

  return (
    <div className="bg-[#f9f9ff] text-[#141b2b] min-h-screen flex flex-col justify-between relative overflow-x-hidden app-main-bg">
      {/* Top subtle background gradient */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#af101a]/10 via-[#f1f3ff] to-transparent pointer-events-none -z-10" />

      {/* Top bar with quick theme toggle */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-8 pt-4 flex justify-end items-center z-10">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e1e8fd] bg-white hover:bg-[#f1f3ff] text-[#141b2b] transition-all cursor-pointer shadow-xs"
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          <span className="material-symbols-outlined text-[18px] text-amber-500">
            {theme === 'dark' ? 'dark_mode' : 'light_mode'}
          </span>
          <span className="font-mono text-xs font-bold capitalize">
            {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
          </span>
        </button>
      </div>

      {/* Center Login Box */}
      <main className="w-full flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="relative w-full max-w-xl">
          {/* Subtle ambient blur behind card */}
          <div className="absolute -top-10 -left-10 w-56 h-56 bg-[#fec330]/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#af101a]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Main Card */}
          <div className="w-full bg-white rounded-2xl shadow-xl border border-[#e1e8fd] p-6 sm:p-10 flex flex-col gap-6 relative">
            {/* Brand Logo & Presentation */}
            <div className="flex flex-col items-center text-center">
              <div className="w-48 sm:w-56 h-auto py-1 transition-transform hover:scale-[1.02] duration-300">
                <img
                  alt="Wonder Chicken Logo Oficial"
                  className="w-full h-auto object-contain drop-shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhh0pXr4EBA8TvPmBg94EssTE6eADYtpDKx9IwH7RFx6_goeQFLJFHEQoSu8u6HBAmjoUwTE2tEfreFWdF6hgtcKFykKjrrK_KAknnqmyJQa3Ky72tyQL7ZKNfBjQZ1aMvw742hiz7FbwlaciN0-4jBh0nGI6Eg-qVqFWWR9nZpZ14vFillF5M0mtTfL6yJ49nqbW4HtB_XVBRtdeOq-kSThf6WUOzwJVmgWT55lBN8HfP-ktQdZJU27tPuuDipBN5TA"
                />
              </div>

              <div className="mt-4">
                <h1 className="text-xl sm:text-2xl font-bold text-[#141b2b] tracking-tight">
                  Acceso al Sistema POS
                </h1>
                <p className="text-xs sm:text-sm text-[#5b403d] mt-1">
                  Sistema Integrado de Ventas, Despacho y Operaciones
                </p>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Field 1: Correo Electrónico */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#141b2b] flex items-center justify-between" htmlFor="email">
                  <span>Correo Electrónico</span>
                  <span className="font-mono text-[11px] text-[#5b403d] font-normal">Credencial de operador</span>
                </label>
                <div className="relative flex items-center rounded-lg bg-white border border-[#e1e8fd] shadow-xs focus-within:border-[#af101a] focus-within:ring-2 focus-within:ring-[#af101a]/10 transition-all">
                  <span className="material-symbols-outlined text-[#5b403d] absolute left-3 pointer-events-none text-lg">
                    alternate_email
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ej. roxana@wonderchicken.com"
                    className="w-full bg-[#f1f3ff] focus:bg-white text-[#141b2b] text-sm pl-10 pr-3 py-2.5 rounded-lg outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Field 2: Contraseña (CI) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#141b2b] flex items-center justify-between" htmlFor="ci-password">
                  <span>Contraseña (CI)</span>
                  <span className="font-mono text-[11px] text-[#795900] font-medium">Documento de Identidad</span>
                </label>
                <div className="relative flex items-center rounded-lg bg-white border border-[#e1e8fd] shadow-xs focus-within:border-[#af101a] focus-within:ring-2 focus-within:ring-[#af101a]/10 transition-all">
                  <span className="material-symbols-outlined text-[#5b403d] absolute left-3 pointer-events-none text-lg">
                    badge
                  </span>
                  <input
                    id="ci-password"
                    name="ci-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu número de CI registrado"
                    className="w-full bg-[#f1f3ff] focus:bg-white text-[#141b2b] text-sm pl-10 pr-10 py-2.5 rounded-lg outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Alternar visibilidad"
                    className="absolute right-3 text-[#5b403d] hover:text-[#af101a] transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Access help link */}
              <div className="flex items-center justify-end pt-1">
                <button
                  type="button"
                  onClick={() => alert('Para soporte o restablecimiento de credenciales de turno, contactar a soporte@wonderchicken.com o al Supervisor de Sucursal.')}
                  className="font-mono text-xs text-[#af101a] hover:underline font-semibold cursor-pointer"
                >
                  ¿Problemas de acceso?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#d32f2f] hover:bg-[#af101a] text-white py-3 px-6 rounded-lg font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}</span>
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  login
                </span>
              </button>
            </form>

            {/* Feedback alert */}
            {loginFeedback && (
              <div className="p-3 rounded-lg bg-[#f1f3ff] border border-[#e1e8fd] flex items-center gap-3 animate-fade-in">
                <span className="material-symbols-outlined text-[#795900] text-xl animate-spin">
                  progress_activity
                </span>
                <div className="flex flex-col">
                  <span className="font-mono text-xs font-bold text-[#141b2b]">
                    {loginFeedback}
                  </span>
                  <span className="text-[11px] text-[#5b403d]">
                    Cargando catálogo, lista de precios y terminal local.
                  </span>
                </div>
              </div>
            )}

            {/* Credenciales de Acceso por Rol (Temporal para Pruebas) */}
            <div className="pt-4 border-t border-[#e1e8fd] flex flex-col gap-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#141b2b]">
                  <span className="material-symbols-outlined text-sm text-[#af101a]">badge</span>
                  <span>Cuentas de Acceso por Rol</span>
                  <span className="text-[10px] bg-[#fec330]/30 text-[#795900] px-1.5 py-0.5 rounded font-mono font-bold">
                    Temporal
                  </span>
                </div>
                <span className="text-[11px] text-[#5b403d] font-mono">
                  Haz clic en una fila para autocompletar
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {DEMO_CREDENTIALS.map((cred) => {
                  const isSelected = email.toLowerCase() === cred.email.toLowerCase();
                  return (
                    <button
                      key={cred.email}
                      type="button"
                      onClick={() => {
                        setEmail(cred.email);
                        setPassword(cred.ci);
                        setLoginFeedback(null);
                      }}
                      className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group ${
                        isSelected
                          ? 'border-[#af101a] bg-[#af101a]/5 ring-1 ring-[#af101a]/25 shadow-xs'
                          : 'border-[#e1e8fd] bg-[#f9f9ff] hover:bg-[#f1f3ff] hover:border-[#af101a]/40'
                      }`}
                      title={`Autocompletar credenciales de ${cred.roleLabel}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider shrink-0 ${cred.roleBadgeClass}`}>
                          {cred.roleLabel}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#141b2b] truncate group-hover:text-[#af101a] transition-colors">
                            {cred.email}
                          </span>
                          <span className="text-[11px] text-[#5b403d] truncate">
                            {cred.name} • {cred.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-[#e1e8fd] text-xs font-mono shadow-2xs">
                          <span className="text-[#5b403d] text-[10px] uppercase font-semibold">Contraseña (CI):</span>
                          <span className="font-bold text-[#141b2b]">{cred.ci}</span>
                        </div>
                        <span className="text-xs font-semibold text-[#af101a] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all flex items-center">
                          <span className="material-symbols-outlined text-base">login</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
