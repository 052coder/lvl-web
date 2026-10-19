import React, { useState } from 'react';
import { AttendeeTicket, EventSettings } from '../types';
import { ShoppingBag, QrCode, Search, Calendar, MapPin, CheckCircle2, ShieldCheck, Ticket as TicketIcon } from 'lucide-react';

interface MyTicketsProps {
  tickets: AttendeeTicket[];
  settings: EventSettings;
  onViewTicket: (ticket: AttendeeTicket) => void;
  onGoToBuy: () => void;
}

export const MyTickets: React.FC<MyTicketsProps> = ({
  tickets,
  settings,
  onViewTicket,
  onGoToBuy
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTickets = tickets.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerPhone.includes(searchTerm) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.mpesaCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="my-tickets-section" className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#801424]/20 border border-[#9e1b32]/40 text-red-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShoppingBag className="w-3.5 h-3.5" />
            Your Digital Passes
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-display">
            My Atelier LVL Passes
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Show your encrypted digital QR pass at the entrance gate for instant runway admission.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone or ID..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-500 mx-auto">
            <TicketIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Tickets Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              {searchTerm ? 'No passes matched your search query.' : 'You have not purchased any passes yet.'}
            </p>
          </div>
          <button
            onClick={onGoToBuy}
            className="px-5 py-2.5 rounded-full bg-[#801424] hover:bg-[#9e1b32] text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-[#801424]/40"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Browse Event Passes</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTickets.map((t) => {
            const isVip = t.tierId === 'vip';
            const isGroup = t.admitCount > 1;

            return (
              <div
                key={t.id}
                id={`my-ticket-card-${t.id}`}
                onClick={() => onViewTicket(t)}
                className="bg-neutral-900 border border-neutral-800 hover:border-red-600/60 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-red-950/20 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0 ${
                        isVip
                          ? 'bg-[#9e1b32] text-white font-extrabold shadow-sm'
                          : isGroup
                          ? 'bg-[#801424] text-white border border-[#9e1b32]'
                          : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                      }`}>
                        {t.tierName}
                      </span>
                      <span className="text-xs font-mono font-bold text-white tracking-wider">
                        {t.id}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-neutral-800 text-red-400 group-hover:bg-[#801424] group-hover:text-white transition-colors">
                      <QrCode className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="text-base font-bold text-white mb-1">
                    {t.customerName}
                  </div>
                  <div className="text-xs text-neutral-400 flex items-center gap-2 font-mono">
                    <span>{t.customerPhone}</span>
                    <span>•</span>
                    <span className="text-red-300">M-Pesa: {t.mpesaCode}</span>
                  </div>

                  {isGroup && t.attendeeNames && (
                    <div className="text-[11px] text-rose-300 mt-2">
                      Table of 6: {t.attendeeNames.join(', ')}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {t.checkedIn ? (
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-600" />
                        Checked In
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Valid Pass • Admits {t.admitCount}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-red-400 group-hover:translate-x-0.5 transition-transform">
                    View QR Pass &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
