import React, { useState, useEffect, useRef } from 'react';

export interface ReadyTurnOrder {
  id: string;
  ticketNumber: string;
  orderType: 'MESA' | 'LLEVAR';
  customerName: string;
  cashRegister?: string; // e.g. 'caja01', 'caja02', 'Caja 01'
  pickupPoint?: string;  // e.g. 'Ventanilla 01', 'Mostrador'
  timeElapsed?: string;
  readyTimestamp?: string;
  isCalling?: boolean;
}

interface OrderTurnsBankDisplayProps {
  orders: ReadyTurnOrder[];
  onClose?: () => void;
  branchName?: string;
  standalone?: boolean;
}

export const OrderTurnsBankDisplay: React.FC<OrderTurnsBankDisplayProps> = ({
  orders,
  onClose,
  branchName = 'Sucursal Central — Cochabamba',
  standalone = false,
}) => {
  const [mediaMode, setMediaMode] = useState<'video' | 'logo'>('video');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter STRICTLY for ready orders
  const readyOrders = orders.filter((o) => Boolean(o.ticketNumber));

  // Audio Chime (Bank/Airport style Ding-Dong using Web Audio API lasting 3 seconds)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Note 1 ("Ding"): E5 (659.25 Hz) + pure bell harmonic
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.85);

      // Note 2 ("Dong"): C5 (523.25 Hz) with 3-second sustained reverberation
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, now + 0.35);
      gain2.gain.setValueAtTime(0.35, now + 0.35);
      // Gentle exponential decay lasting exactly 3 seconds
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.35);
      osc2.stop(now + 3.0);

      // Subtle warm sub-harmonic for deep acoustic bell body
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(261.63, now + 0.35); // C4
      subGain.gain.setValueAtTime(0.12, now + 0.35);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.9);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now + 0.35);
      subOsc.stop(now + 3.0);
    } catch (e) {
      console.warn('Audio chime note could not play:', e);
    }
  };

  // Clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('es-BO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Trigger chime when a ticket calls
  const handleCallOrder = (orderId: string) => {
    setActiveCallId(orderId);
    playChime();
    setTimeout(() => {
      setActiveCallId(null);
    }, 3000);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${
        standalone ? 'min-h-screen' : 'fixed inset-0 z-50'
      } bg-[#0b0f19] text-[#f8fafc] flex flex-col p-3 sm:p-5 lg:p-6 overflow-y-auto select-none font-sans`}
    >
      {/* Upper Control Bar (Header of TV monitor) */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-[#1e293b]">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0 border border-amber-400">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1UeU-dPW2xV51uDn6xjSYBx5aQ_phV1RW0qXrx1lh6__UO10EB8Q-Vo_iXTafRjk1G-tU-pg7ElZlfVyedi1YFPkh46MiMI7E4HJnbgYzS2ILQq1si0Dmb-dpRQJB0a7rWkZHIF8rtEgs0YW3NB9k9Pey6ki6L9uX9kRj5QDjf4sWTKlQUpz-5o2zh3qLOJy9c23bvWq-ZaN6RFE8_hvoHmMbRthFwyDqJcM3F8v78bIBRFYFLWrAww25KdAjmjcoKltSVNVyalaQ"
              alt="Wonder Chicken Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-[#fec330] uppercase">
                WONDER CHICKEN
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#15803d]/30 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                PANTALLA DE TURNOS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              {branchName} • Pedidos listos para recoger
            </p>
          </div>
        </div>

        {/* Center: Live Digital Clock */}
        <div className="hidden md:flex items-center gap-3 bg-[#131b2e] px-4 py-1.5 rounded-xl border border-[#263554]">
          <span className="material-symbols-outlined text-[#fec330] text-[20px]">schedule</span>
          <div className="flex flex-col text-right">
            <span className="font-mono text-base font-bold text-white tracking-widest leading-tight">
              {currentTime || '00:00:00'}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold capitalize">
              {currentDate || 'Hoy'}
            </span>
          </div>
        </div>

        {/* Right: Controls (Video / Logo toggle, Sound, Fullscreen, Close) */}
        <div className="flex items-center gap-2">
          {/* Media Mode Toggle */}
          <div className="flex items-center bg-[#131b2e] p-1 rounded-lg border border-[#263554]">
            <button
              type="button"
              onClick={() => setMediaMode('video')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mediaMode === 'video'
                  ? 'bg-[#af101a] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">smart_display</span>
              <span className="hidden sm:inline">Video</span>
            </button>
            <button
              type="button"
              onClick={() => setMediaMode('logo')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                mediaMode === 'logo'
                  ? 'bg-[#af101a] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">branding_watermark</span>
              <span className="hidden sm:inline">Logo</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Silenciar sonido de turno' : 'Activar sonido de turno'}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                : 'bg-[#131b2e] border-[#263554] text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Pantalla Completa"
            className="p-2 bg-[#131b2e] hover:bg-[#1e293b] text-slate-300 hover:text-white rounded-lg border border-[#263554] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>

          {/* Close button if provided */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-[#af101a]/20 hover:bg-[#af101a]/40 text-[#f87171] hover:text-white font-mono text-xs font-bold rounded-lg border border-[#af101a]/40 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span className="hidden sm:inline">Cerrar</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Grid: TOP (LOGO WONDER O VIDEO) + BOTTOM (FICHAS DE BANCO) */}
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        {/* ============================================================== */}
        {/* TOP SECTION: "LOGO WONDER O VIDEO" (as in user wireframe)      */}
        {/* ============================================================== */}
        <section
          aria-label="Área Multimedia - Logo Wonder o Video"
          className="relative w-full h-[32vh] sm:h-[36vh] lg:h-[40vh] min-h-[220px] max-h-[460px] rounded-2xl overflow-hidden border-2 border-[#263554] bg-[#070b13] shadow-2xl flex items-center justify-center shrink-0"
        >
          {mediaMode === 'video' ? (
            /* VIDEO PLAYER MODE */
            <div className="w-full h-full relative flex items-center justify-center overflow-hidden bg-black">
              {/* Fallback & video simulation with high-res brand animation */}
              <video
                className="w-full h-full object-cover opacity-90"
                autoPlay
                loop
                muted
                playsInline
                poster="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=1600&q=80"
              >
                {/* Free high-quality culinary chicken footage */}
                <source
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Video Overlay with Wonder Chicken branding overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-black/25 to-black/60 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                    <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                      EN VIVO • WONDER TV
                    </span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/30 backdrop-blur-md">
                    ¡El auténtico pollo broaster!
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-md tracking-tight uppercase">
                      Sabor Inigualable, Siempre Caliente
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 drop-shadow max-w-xl">
                      Preparado en freidoras de alta presión con nuestra receta secreta de especias crujientes.
                    </p>
                  </div>
                  <div className="hidden sm:block text-right font-mono text-xs text-amber-300 font-bold bg-black/60 px-3 py-1 rounded-lg border border-amber-500/20 backdrop-blur-md">
                    Atención en Cajas 01 y 02
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* LOGO & BRAND SHOWCASE MODE */
            <div className="w-full h-full relative flex flex-col items-center justify-center p-6 bg-radial from-[#1e293b]/70 via-[#0d1424] to-[#070b13] text-center overflow-hidden">
              {/* Subtle animated chicken glow */}
              <div className="absolute -top-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-2 shadow-2xl border-2 border-amber-400 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="https://lh3.googleusercontent.com/aida/AEtjO1UeU-dPW2xV51uDn6xjSYBx5aQ_phV1RW0qXrx1lh6__UO10EB8Q-Vo_iXTafRjk1G-tU-pg7ElZlfVyedi1YFPkh46MiMI7E4HJnbgYzS2ILQq1si0Dmb-dpRQJB0a7rWkZHIF8rtEgs0YW3NB9k9Pey6ki6L9uX9kRj5QDjf4sWTKlQUpz-5o2zh3qLOJy9c23bvWq-ZaN6RFE8_hvoHmMbRthFwyDqJcM3F8v78bIBRFYFLWrAww25KdAjmjcoKltSVNVyalaQ"
                    alt="Wonder Chicken Logo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#fec330] tracking-tight mt-3 uppercase drop-shadow-md">
                  WONDER CHICKEN
                </h2>

                <p className="font-mono text-xs sm:text-sm text-slate-300 uppercase tracking-widest font-semibold mt-1">
                  Pollo Broaster Crujiente • Sabor Familiar • Cochabamba
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <span className="bg-red-600/30 text-red-200 border border-red-500/40 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    Combo Familiar 8 Presas
                  </span>
                  <span className="bg-amber-500/30 text-amber-200 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    Papas Rústicas & Smiles
                  </span>
                  <span className="bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold font-mono">
                    Salsa Tártara Casera
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* BOTTOM SECTION: FICHAS DE BANCO (BANK TICKETS AS IN WIREFRAME) */}
        {/* Wireframe layout: 3 columns x 2 rows                           */}
        {/* ticket XX ---> caja01 | ticket XX ---> caja01 | ticket XX ---> caja01 */}
        {/* ticket XX ---> caja02 | ticket XX ---> caja02 | ticket XX ---> caja02 */}
        {/* ============================================================== */}
        <section
          aria-label="Fichas de Turnos de Banco"
          className="flex-1 flex flex-col min-h-0 bg-[#0d1424] rounded-2xl border-2 border-[#1e293b] p-3 sm:p-5 shadow-xl"
        >
          {/* Header of the Turn Tokens board */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1e293b]">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse"></span>
              <h3 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                <span>PEDIDOS LISTOS PARA RECOGER</span>
                <span className="bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                  {readyOrders.length} {readyOrders.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-slate-400">
              <span className="hidden sm:inline">Por favor acérquese a la caja indicada con su ticket</span>
              <button
                type="button"
                onClick={playChime}
                title="Probar sonido de campana"
                className="px-2 py-1 bg-[#1e293b] hover:bg-[#2d3d59] text-amber-300 font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                <span className="hidden md:inline">Timbre</span>
              </button>
            </div>
          </div>

          {/* Tokens Grid: 3 columns with bank-style tokens */}
          {readyOrders.length === 0 ? (
            /* Empty state when no orders are ready yet */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#070b13]/60 rounded-xl border border-dashed border-[#1e293b]">
              <div className="w-16 h-16 rounded-full bg-[#131b2e] flex items-center justify-center text-amber-400 mb-3 border border-[#263554]">
                <span className="material-symbols-outlined text-[36px] animate-pulse">
                  restaurant
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Preparando pedidos en cocina...
              </h4>
              <p className="text-xs text-slate-400 max-w-md mt-1 font-mono">
                Los pedidos listos aparecerán automáticamente aquí anunciando su número de ticket y la caja de entrega asignada.
              </p>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 p-2 sm:p-3 overflow-y-auto overflow-x-hidden">
              {readyOrders.map((ord, idx) => {
                const isCalling = activeCallId === ord.id;
                // Assign alternate cash desk if not explicit: caja01 or caja02
                const cashRegisterNumber = ord.cashRegister
                  ? ord.cashRegister.toLowerCase().replace(/\s+/g, '')
                  : idx % 2 === 0
                  ? 'caja01'
                  : 'caja02';

                const formattedCashDesk =
                  cashRegisterNumber.includes('01') ? 'CAJA 01' : 'CAJA 02';

                return (
                  <div
                    key={ord.id || ord.ticketNumber}
                    onClick={() => handleCallOrder(ord.id)}
                    className={`relative group flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 transition-colors cursor-pointer select-none ${
                      isCalling
                        ? 'bg-gradient-to-r from-[#15803d]/35 via-[#0d1424] to-[#15803d]/35 border-emerald-400 ring-2 ring-emerald-500/50 shadow-[0_0_18px_rgba(34,197,94,0.3)]'
                        : 'bg-[#101726] hover:bg-[#151f33] border-[#263554] hover:border-emerald-500/50 shadow-sm'
                    }`}
                  >
                    {/* Pulsing indicator if currently calling - inside boundary so no overflow/scroll */}
                    {isCalling && (
                      <span className="absolute top-1.5 right-2 z-10 bg-emerald-500 text-black font-black text-[9px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                        ¡Llamando!
                      </span>
                    )}

                    {/* Left: TICKET NUMBER (ticket XX) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#070b13] border border-amber-500/40 flex items-center justify-center text-amber-400 font-mono shadow-inner shrink-0">
                        <span className="material-symbols-outlined text-[18px] sm:text-[20px]">confirmation_number</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                          TICKET
                        </span>
                        <span className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
                          {ord.ticketNumber.startsWith('#')
                            ? ord.ticketNumber
                            : `#${ord.ticketNumber}`}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate mt-0.5 max-w-[100px] sm:max-w-[130px]">
                          {ord.customerName || 'Cliente'}
                        </span>
                      </div>
                    </div>

                    {/* Center: DIRECTIONAL ARROW (MUI arrow_right_alt) */}
                    <div className="flex flex-col items-center justify-center px-1.5 shrink-0">
                      <div className="flex items-center justify-center text-emerald-400 font-bold animate-pulse">
                        <span className="material-symbols-outlined text-[28px] sm:text-[34px] leading-none select-none">
                          arrow_right_alt
                        </span>
                      </div>
                      <span className="font-mono text-[8px] uppercase tracking-wider text-emerald-300 font-semibold -mt-0.5">
                        ENTREGA
                      </span>
                    </div>

                    {/* Right: CASH REGISTER (caja01 / caja02) as in wireframe */}
                    <div className="flex flex-col items-end shrink-0">
                      <div
                        className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-mono text-[11px] sm:text-xs font-black tracking-wider uppercase border shadow-sm flex items-center gap-1 ${
                          cashRegisterNumber.includes('01')
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">point_of_sale</span>
                        <span>{formattedCashDesk}</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400 mt-0.5 uppercase">
                        {ord.orderType === 'LLEVAR' ? 'Para Llevar' : 'En Salón'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer ticker info */}
          <div className="pt-3 mt-3 border-t border-[#1e293b] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[16px]">info</span>
              <span>Haga clic en cualquier ficha para volver a llamar el turno con sonido de campana.</span>
            </div>
            <div className="text-slate-400">
              Wonder Chicken • Sistema de Turnos de Despacho PDR
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
