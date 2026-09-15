import React, { useState } from 'react';
import { useOrdersStore } from '../features/orders/stores/orders.store';
import { useTheme } from '../context/ThemeContext';

interface PublicOrderScreenProps {
  initialTicketId?: string;
  onBackToApp: () => void;
}

export const PublicOrderScreen: React.FC<PublicOrderScreenProps> = ({
  initialTicketId = '105',
  onBackToApp,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [searchToken, setSearchToken] = useState(initialTicketId);
  const { kdsTickets } = useOrdersStore();

  const currentTicket = kdsTickets.find(
    (t) =>
      t.id === searchToken ||
      t.ticketNumber.replace('#', '') === searchToken.replace('#', '')
  ) || kdsTickets[0];

  const getStepProgress = () => {
    if (!currentTicket) return 1;
    if (currentTicket.status === 'DELIVERED') return 4;
    if (currentTicket.status === 'READY') return 3;
    if (currentTicket.status === 'PREPARING') return 2;
    return 1;
  };

  const progress = getStepProgress();

  return (
    <div className="min-h-screen bg-[#f1f3ff] text-[#141b2b] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-xs border border-[#e1e8fd]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white shadow-xs p-1 flex items-center justify-center border border-[#e1e8fd]">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1UeU-dPW2xV51uDn6xjSYBx5aQ_phV1RW0qXrx1lh6__UO10EB8Q-Vo_iXTafRjk1G-tU-pg7ElZlfVyedi1YFPkh46MiMI7E4HJnbgYzS2ILQq1si0Dmb-dpRQJB0a7rWkZHIF8rtEgs0YW3NB9k9Pey6ki6L9uX9kRj5QDjf4sWTKlQUpz-5o2zh3qLOJy9c23bvWq-ZaN6RFE8_hvoHmMbRthFwyDqJcM3F8v78bIBRFYFLWrAww25KdAjmjcoKltSVNVyalaQ"
              alt="Wonder Chicken Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-bold text-base text-[#af101a] tracking-tight leading-none">
              Wonder Chicken
            </div>
            <div className="font-mono text-[10px] text-[#5b403d] tracking-wide uppercase font-semibold mt-0.5">
              Monitor de Estado de Comanda en Vivo
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToApp}
          className="px-3.5 py-1.5 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors cursor-pointer"
        >
          Volver al Sistema
        </button>
      </header>

      {/* Main Tracker Container */}
      <main className="max-w-3xl w-full mx-auto my-6 flex flex-col gap-6">
        {/* Token Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#e1e8fd] shadow-xs flex items-center gap-3">
          <span className="material-symbols-outlined text-[#5b403d] text-[22px]">confirmation_number</span>
          <input
            type="text"
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            placeholder="Ingrese número de ticket (ej. 105, 103, 102)..."
            className="flex-1 bg-[#f1f3ff] px-4 py-2 text-sm font-mono font-bold text-[#141b2b] rounded-lg border border-[#e1e8fd] outline-none focus:border-[#af101a]"
          />
          <span className="text-xs text-[#5b403d] font-mono hidden sm:inline">
            Actualización automática
          </span>
        </div>

        {currentTicket ? (
          <div className="bg-white rounded-2xl border border-[#e1e8fd] shadow-md overflow-hidden flex flex-col">
            {/* Ticket Header Banner */}
            <div
              className={`p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                progress === 3
                  ? 'bg-[#15803d]'
                  : progress === 2
                  ? 'bg-[#d32f2f]'
                  : 'bg-[#141b2b]'
              }`}
            >
              <div>
                <span className="font-mono text-xs uppercase opacity-90 tracking-wider">
                  Ticket de Pedido
                </span>
                <div className="font-mono text-3xl sm:text-4xl font-black tracking-tight">
                  {currentTicket.ticketNumber}
                </div>
                <div className="text-sm opacity-95 mt-1">
                  Cliente: <strong className="font-bold">{currentTicket.customerName}</strong>
                </div>
              </div>

              <div className="flex flex-col sm:items-end">
                <span className="bg-white/20 px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  {currentTicket.orderType} • {currentTicket.tableOrChannel}
                </span>
                <span className="font-mono text-xs opacity-90 mt-2">
                  Hora de Orden: {currentTicket.timestamp} ({currentTicket.timeElapsed})
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="p-6 bg-[#f9f9ff] border-b border-[#e1e8fd]">
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      progress >= 1
                        ? 'bg-[#d32f2f] text-white shadow-xs'
                        : 'bg-white text-[#5b403d] border border-[#e1e8fd]'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[11px] font-bold text-[#141b2b]">Confirmado</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      progress >= 2
                        ? 'bg-[#d32f2f] text-white shadow-xs'
                        : 'bg-white text-[#5b403d] border border-[#e1e8fd]'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-[11px] font-bold text-[#141b2b]">En Preparación</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      progress >= 3
                        ? 'bg-[#15803d] text-white shadow-xs animate-bounce'
                        : 'bg-white text-[#5b403d] border border-[#e1e8fd]'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-[11px] font-bold text-[#15803d]">¡Listo!</span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      progress >= 4
                        ? 'bg-[#141b2b] text-white shadow-xs'
                        : 'bg-white text-[#5b403d] border border-[#e1e8fd]'
                    }`}
                  >
                    4
                  </div>
                  <span className="text-[11px] font-bold text-[#5b403d]">Entregado</span>
                </div>
              </div>

              {/* Status Message Banner */}
              <div className="mt-5 p-4 rounded-xl text-center flex flex-col items-center justify-center">
                {progress === 3 ? (
                  <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 w-full p-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-emerald-700">
                      notifications_active
                    </span>
                    <span>¡Tu pedido está listo para ser retirado en el mostrador!</span>
                  </div>
                ) : progress === 2 ? (
                  <div className="bg-amber-100 text-amber-900 border border-amber-300 w-full p-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-amber-700 animate-spin">
                      outdoor_grill
                    </span>
                    <span>Tu pollo crujiente está en fritura y preparación activa...</span>
                  </div>
                ) : progress === 4 ? (
                  <div className="bg-neutral-100 text-neutral-800 border border-neutral-300 w-full p-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-neutral-600">
                      check_circle
                    </span>
                    <span>Pedido entregado. ¡Gracias por elegir Wonder Chicken!</span>
                  </div>
                ) : (
                  <div className="bg-blue-100 text-blue-900 border border-blue-300 w-full p-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-blue-700">
                      receipt_long
                    </span>
                    <span>Comanda registrada en el sistema. Pasando a línea de cocina.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-bold text-xs uppercase font-mono text-[#5b403d] tracking-wider">
                Detalle de la Comanda
              </h3>
              <div className="flex flex-col gap-3 divide-y divide-[#f1f3ff]">
                {currentTicket.items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between font-bold text-sm text-[#141b2b]">
                      <span>
                        {item.qty}x {item.name}
                      </span>
                    </div>
                    {item.details && item.details.length > 0 && (
                      <div className="pl-3 border-l-2 border-[#af101a] text-xs text-[#5b403d] flex flex-col gap-0.5">
                        {item.details.map((d, dIdx) => (
                          <span key={dIdx}>• {d}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-xl text-center border border-[#e1e8fd]">
            <span className="material-symbols-outlined text-[48px] text-[#5b403d]">search_off</span>
            <h3 className="font-bold text-base text-[#141b2b] mt-2">
              No se encontró la comanda con el código ingresado
            </h3>
            <p className="text-xs text-[#5b403d] mt-1">
              Verifique el número impreso en su comprobante o consulte en el mostrador.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-3xl w-full mx-auto text-center font-mono text-xs text-[#5b403d] py-3">
        Wonder Chicken Fast-Casual System • Consulta Pública de Turno
      </footer>
    </div>
  );
};
