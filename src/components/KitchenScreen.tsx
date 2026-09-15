import React, { useState } from 'react';
import { CompletedOrder } from '../types';

interface KitchenScreenProps {
  orders: CompletedOrder[];
  onUpdateOrderStatus: (ticketNumber: string, status: 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO') => void;
  onBackToPOS: () => void;
}

interface KDSTicket {
  id: string;
  ticketNumber: string;
  orderType: 'MESA' | 'LLEVAR';
  tableOrChannel: string;
  customerName: string;
  channelSub?: string;
  timeElapsed: string;
  status: 'NUEVO' | 'EN_PREPARACION' | 'LISTO' | 'ANUNCIADO' | 'ENTREGADO';
  isPendingPayment?: boolean;
  items: {
    name: string;
    qty: number;
    details: string[];
  }[];
}

const INITIAL_KDS_ORDERS: KDSTicket[] = [
  {
    id: '105',
    ticketNumber: '#105',
    orderType: 'MESA',
    tableOrChannel: 'Mesa 06',
    customerName: 'Carlos Mendoza',
    timeElapsed: 'Hace 1 min',
    status: 'NUEVO',
    items: [
      {
        name: 'Combo Familiar 8 Presas',
        qty: 1,
        details: [
          '4x Pierna, 4x Entrepierna',
          'Acompañamiento: Doble porción de papas rústicas',
          'Bebida: 1x Gaseosa 2L Guaraná',
        ],
      },
    ],
  },
  {
    id: '103',
    ticketNumber: '#103',
    orderType: 'LLEVAR',
    tableOrChannel: 'Delivery Ya • Repartidor #14',
    customerName: 'Marco Ortega',
    channelSub: 'Ventanilla Express 2',
    timeElapsed: 'Hace 6 min',
    status: 'EN_PREPARACION',
    isPendingPayment: true,
    items: [
      {
        name: 'Porción Media Broaster',
        qty: 3,
        details: [
          '1x Pecho - Ala',
          '2x Pierna - Entrepierna',
          'Sustitución: Arroz con queso en vez de papas',
        ],
      },
    ],
  },
  {
    id: '102',
    ticketNumber: '#102',
    orderType: 'MESA',
    tableOrChannel: 'Mesa 04',
    customerName: 'Luis Iglesias',
    timeElapsed: 'Hace 9 min',
    status: 'LISTO',
    items: [
      {
        name: 'Combo Wonder',
        qty: 2,
        details: [
          '2x Pecho-Ala',
          '1x Coca Cola 500ml Fría, 1x Mocochinchi Frío',
          'Acompañamiento: Mixto (Papa y Arroz)',
        ],
      },
      {
        name: 'Smiles McCain',
        qty: 1,
        details: ['Extra crocante'],
      },
    ],
  },
  {
    id: '101',
    ticketNumber: '#101',
    orderType: 'MESA',
    tableOrChannel: 'Mesa 02',
    customerName: 'Fredy Arévalo',
    timeElapsed: 'Hace 14 min',
    status: 'ANUNCIADO',
    items: [
      {
        name: 'Cuarto de Pollo Broaster',
        qty: 1,
        details: [
          'Pecho - Ala',
          'Solo Papas',
          'Extra Salsa Tártara',
        ],
      },
    ],
  },
];

export const KitchenScreen: React.FC<KitchenScreenProps> = ({ onBackToPOS }) => {
  const [tickets, setTickets] = useState<KDSTicket[]>(INITIAL_KDS_ORDERS);
  const [filter, setFilter] = useState<'ALL' | 'EN_PREPARACION' | 'LISTO' | 'MESA' | 'LLEVAR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPublicScreen, setShowPublicScreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: KDSTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    if (newStatus === 'EN_PREPARACION') showToast(`Comanda #${id} en preparación en freidora`);
    if (newStatus === 'LISTO') showToast(`Comanda #${id} marcada lista para entrega`);
    if (newStatus === 'ANUNCIADO') showToast(`Comanda #${id} proyectada en Pantalla Pública`);
    if (newStatus === 'ENTREGADO') showToast(`Comanda #${id} retirada de cola (Entregado)`);
  };

  const filteredTickets = tickets.filter((t) => {
    if (t.status === 'ENTREGADO') return false;

    let matchesFilter = true;
    if (filter === 'EN_PREPARACION') matchesFilter = t.status === 'EN_PREPARACION' || t.status === 'NUEVO';
    if (filter === 'LISTO') matchesFilter = t.status === 'LISTO' || t.status === 'ANUNCIADO';
    if (filter === 'MESA') matchesFilter = t.orderType === 'MESA';
    if (filter === 'LLEVAR') matchesFilter = t.orderType === 'LLEVAR';

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.tableOrChannel.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#141b2b] text-white px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-mono border border-white/10 animate-fade-in">
          <span className="material-symbols-outlined text-[#fec330] text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#af101a] text-[26px]">outdoor_grill</span>
            <h1 className="text-lg sm:text-xl font-bold text-[#141b2b]">
              Despacho de Cocina — KDS (Kitchen Display System)
            </h1>
          </div>
          <p className="text-xs text-[#5b403d] mt-1">
            Monitor de línea de brasa, sustituciones de guarnición y despacho de pedidos.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPublicScreen(true)}
            className="px-3.5 py-2 bg-[#141b2b] hover:bg-[#293040] text-white font-mono text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#fec330] text-[18px]">tv</span>
            Pantalla Turnos PDR
          </button>
          <button
            type="button"
            onClick={onBackToPOS}
            className="px-3.5 py-2 bg-[#f1f3ff] hover:bg-[#e9edff] text-[#141b2b] font-mono text-xs font-bold rounded-lg border border-[#e1e8fd] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            Volver a POS
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-[#e1e8fd] shadow-xs">
        <div className="flex items-center gap-1 bg-[#f1f3ff] p-1 rounded-lg border border-[#e1e8fd] overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'ALL' ? 'bg-white text-[#af101a] shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Todos ({tickets.filter((t) => t.status !== 'ENTREGADO').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('EN_PREPARACION')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'EN_PREPARACION' ? 'bg-[#d32f2f] text-white shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            En Preparación
          </button>
          <button
            type="button"
            onClick={() => setFilter('LISTO')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'LISTO' ? 'bg-[#15803d] text-white shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            Listo para Entrega
          </button>
          <button
            type="button"
            onClick={() => setFilter('MESA')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'MESA' ? 'bg-white text-[#141b2b] shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            MESA
          </button>
          <button
            type="button"
            onClick={() => setFilter('LLEVAR')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === 'LLEVAR' ? 'bg-white text-[#141b2b] shadow-xs' : 'text-[#5b403d]'
            }`}
          >
            LLEVAR
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#5b403d] text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar comanda o cliente..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#f1f3ff] rounded-lg text-xs border border-[#e1e8fd] outline-none"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {filteredTickets.map((t) => {
          const isReady = t.status === 'LISTO' || t.status === 'ANUNCIADO';
          const isPrep = t.status === 'EN_PREPARACION';
          const isNew = t.status === 'NUEVO';

          return (
            <div
              key={t.id}
              className={`bg-white rounded-xl border-2 shadow-xs flex flex-col justify-between overflow-hidden transition-all relative ${
                t.isPendingPayment
                  ? 'border-amber-400'
                  : isReady
                  ? 'border-[#15803d]'
                  : isPrep
                  ? 'border-[#af101a]'
                  : 'border-[#e1e8fd]'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className={`h-1.5 w-full ${
                  t.isPendingPayment
                    ? 'bg-amber-500'
                    : isReady
                    ? 'bg-[#15803d]'
                    : isPrep
                    ? 'bg-[#af101a]'
                    : 'bg-[#5b403d]'
                }`}
              />

              <div className="p-4 flex flex-col gap-3">
                {/* Header card */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl font-bold text-[#af101a]">
                        {t.ticketNumber}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#f1f3ff] text-[#141b2b] uppercase">
                        {t.orderType}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-[#141b2b] block mt-0.5">
                      {t.customerName}
                    </span>
                    <span className="text-xs text-[#5b403d] block">
                      {t.tableOrChannel}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-mono text-[11px] text-[#5b403d] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {t.timeElapsed}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase ${
                        isReady
                          ? 'bg-[#15803d]/15 text-[#15803d]'
                          : isPrep
                          ? 'bg-[#af101a]/15 text-[#af101a]'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-2 bg-[#f9f9ff] rounded-lg p-2.5 text-xs">
                  {t.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1 border-b border-[#e1e8fd] pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between font-bold text-[#141b2b]">
                        <span>{item.qty}x {item.name}</span>
                      </div>
                      <div className="pl-2 border-l-2 border-[#af101a]/40 text-[11px] text-[#5b403d] flex flex-col gap-0.5">
                        {item.details.map((d, dIdx) => (
                          <span key={dIdx}>• {d}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pago pendiente rule alert */}
                {t.isPendingPayment && (
                  <div className="bg-amber-50 border border-amber-300 p-2 rounded-lg text-amber-950 text-[10px] font-mono leading-tight flex items-start gap-1">
                    <span className="material-symbols-outlined text-amber-700 text-[14px] shrink-0 mt-0.5">
                      warning
                    </span>
                    <span>
                      <strong>REGLA FR-011: PAGO PENDIENTE:</strong> Cobrar en caja antes de entregar el paquete al repartidor.
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons based on status */}
              <div className="p-3 bg-[#f1f3ff] border-t border-[#e1e8fd] flex flex-col gap-2">
                {isNew && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(t.id, 'EN_PREPARACION')}
                    className="w-full py-2 bg-[#d32f2f] hover:bg-[#af101a] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">outdoor_grill</span>
                    Iniciar Preparación
                  </button>
                )}

                {isPrep && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(t.id, 'LISTO')}
                    className="w-full py-2 bg-[#15803d] hover:bg-[#166534] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Marcar Listo para Entrega
                  </button>
                )}

                {t.status === 'LISTO' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(t.id, 'ANUNCIADO')}
                    className="w-full py-2 bg-[#141b2b] hover:bg-[#293040] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#fec330] text-[16px]">campaign</span>
                    Avisar a Pantalla (Llamar Turno)
                  </button>
                )}

                {t.status === 'ANUNCIADO' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(t.id, 'ENTREGADO')}
                    className="w-full py-2 bg-[#5b403d] hover:bg-[#382624] text-white font-mono text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    Marcar Entregado (Retirar de Cola)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Pantalla Pública de Turnos (PDR §2.8 / FR-007) */}
      {showPublicScreen && (
        <div className="fixed inset-0 z-50 bg-[#141b2b] text-white flex flex-col p-6 sm:p-10 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white p-1">
                <img
                  src="https://lh3.googleusercontent.com/aida/AEtjO1UeU-dPW2xV51uDn6xjSYBx5aQ_phV1RW0qXrx1lh6__UO10EB8Q-Vo_iXTafRjk1G-tU-pg7ElZlfVyedi1YFPkh46MiMI7E4HJnbgYzS2ILQq1si0Dmb-dpRQJB0a7rWkZHIF8rtEgs0YW3NB9k9Pey6ki6L9uX9kRj5QDjf4sWTKlQUpz-5o2zh3qLOJy9c23bvWq-ZaN6RFE8_hvoHmMbRthFwyDqJcM3F8v78bIBRFYFLWrAww25KdAjmjcoKltSVNVyalaQ"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fec330]">
                  WONDER CHICKEN — TURNOS DE PEDIDOS
                </h2>
                <span className="font-mono text-xs text-[#e1e8fd]">
                  PDR §2.8 / FR-007 • Pantalla Pública para Comensales y Delivery
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPublicScreen(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold rounded-lg cursor-pointer"
            >
              Cerrar Monitor Público (Esc)
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Left: PEDIDOS LISTOS */}
            <div className="bg-emerald-950/40 border-2 border-[#15803d] rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between border-b border-emerald-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#15803d] animate-ping"></span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#15803d]">
                    PEDIDOS LISTOS PARA RECOGER
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-300">Mesón de Entrega</span>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-[#15803d] text-white p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl">
                  <span className="font-mono text-5xl sm:text-7xl font-extrabold tracking-tighter">
                    #101
                  </span>
                  <span className="font-mono text-sm font-bold uppercase mt-2 bg-black/20 px-3 py-1 rounded-full">
                    MESA 02 • DESPACHADO
                  </span>
                </div>

                <div className="bg-[#15803d] text-white p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-xl">
                  <span className="font-mono text-5xl sm:text-7xl font-extrabold tracking-tighter">
                    #102
                  </span>
                  <span className="font-mono text-sm font-bold uppercase mt-2 bg-black/20 px-3 py-1 rounded-full">
                    MESA 04 • LISTO
                  </span>
                </div>
              </div>
            </div>

            {/* Right: EN PREPARACIÓN */}
            <div className="bg-[#293040]/40 border-2 border-amber-500/50 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#fec330] text-[24px]">outdoor_grill</span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#fec330]">
                    EN PREPARACIÓN (LÍNEA DE BRASA)
                  </h3>
                </div>
                <span className="text-xs font-mono text-amber-200">Tiempo est. 4-8 min</span>
              </div>

              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-4xl sm:text-6xl font-bold text-gray-200">
                    #103
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase mt-2 text-amber-400">
                    LLEVAR • ESPERANDO
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-4xl sm:text-6xl font-bold text-gray-200">
                    #105
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase mt-2 text-amber-400">
                    MESA 06 • EN LÍNEA
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center font-mono text-xs text-gray-400 mt-4">
            Wonder Chicken Bolivia • Sistema Centralizado de Línea de Producción KDS
          </div>
        </div>
      )}
    </div>
  );
};
