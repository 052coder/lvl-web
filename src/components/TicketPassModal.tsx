import React, { useEffect, useState } from 'react';
import { AttendeeTicket, EventSettings } from '../types';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Crown, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ScanLine, 
  Copy, 
  Check
} from 'lucide-react';
import { generateQrDataUrl } from '../lib/qrHelper';
import pantherLogoImg from '../assets/images/IMG_2935 (1).jpeg';

interface TicketPassModalProps {
  ticket: AttendeeTicket;
  settings: EventSettings;
  onClose: () => void;
  onOpenScannerWithCode?: (ticketId: string) => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  ticket,
  settings,
  onClose,
  onOpenScannerWithCode
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    // Generate QR containing the ticket ID & metadata
    const qrPayload = JSON.stringify({
      id: ticket.id,
      name: ticket.customerName,
      tier: ticket.tierId,
      admits: ticket.admitCount,
      mpesa: ticket.mpesaCode
    });
    generateQrDataUrl(qrPayload).then(setQrDataUrl);
  }, [ticket]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticket.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `🎉 I got my ticket to LVL Fashion Runway Event 2026! Ticket ID: ${ticket.id} (${ticket.tierName}). See you there!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isVip = ticket.tierId === 'vip';
  const isGroup = ticket.admitCount > 1;

  return (
    <div id="ticket-pass-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-6 pb-safe pt-safe touch-scroll">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Verified Digital Pass
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              title="Print Pass"
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Container */}
        <div id="printable-ticket" className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Ticket Card Component */}
          <div className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
            isVip
              ? 'border-[#801424] bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 shadow-2xl shadow-[#801424]/30'
              : isGroup
              ? 'border-[#9e1b32]/80 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 shadow-2xl shadow-[#9e1b32]/20'
              : 'border-neutral-700 bg-neutral-950'
          }`}>
            
            {/* Holographic Header Strip */}
            <div className={`p-4 sm:p-5 flex items-center justify-between gap-3 border-b ${
              isVip
                ? 'bg-gradient-to-r from-[#801424]/30 via-[#9e1b32]/20 to-[#801424]/30 border-[#801424]/50'
                : isGroup
                ? 'bg-gradient-to-r from-[#801424]/20 via-[#9e1b32]/10 to-[#801424]/20 border-[#801424]/40'
                : 'bg-neutral-900 border-neutral-800'
            }`}>
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-[#801424] border border-[#9e1b32] overflow-hidden flex items-center justify-center shadow-inner">
                  <img 
                    src={pantherLogoImg} 
                    alt="Atelier LVL Logo" 
                    className="w-full h-full object-cover scale-110" 
                  />
                </div>
              </div>

              {/* Tier Badge - High Contrast, Single-Line, Unwrapped */}
              <div className="shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap shadow-md ${
                  isVip
                    ? 'bg-[#9e1b32] text-white border border-red-400/40 shadow-[#9e1b32]/50'
                    : isGroup
                    ? 'bg-[#801424] text-white border border-[#9e1b32] shadow-[#801424]/30'
                    : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                }`}>
                  {isVip && <Crown className="w-3.5 h-3.5 text-red-200 shrink-0" />}
                  {isGroup && <Users className="w-3.5 h-3.5 text-red-200 shrink-0" />}
                  <span>{ticket.tierName}</span>
                </span>
              </div>
            </div>

            {/* Middle Section: QR Code & Status */}
            <div className="p-6 text-center space-y-4">
              
              {/* QR Code Presentation with Low Transparency Panther Watermark */}
              <div className="relative inline-block p-3.5 bg-white rounded-2xl shadow-xl shadow-black/60 border-4 border-neutral-900">
                {qrDataUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${ticket.id}`}
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain block"
                    />
                    
                    {/* Full-Cover Brand Watermark with Enhanced Panther Visibility */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-lg">
                      <img 
                        src={pantherLogoImg} 
                        alt="Atelier Panther Logo Watermark" 
                        className="w-full h-full object-cover opacity-50 mix-blend-multiply contrast-125 scale-105" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs">
                    Generating Gate QR...
                  </div>
                )}
              </div>

              {/* Ticket ID & Copy Button */}
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-base sm:text-lg font-black text-white tracking-widest px-3 py-1 bg-neutral-900 rounded-lg border border-neutral-800">
                  {ticket.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                  title="Copy Ticket ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Admission Status */}
              <div className="flex items-center justify-center gap-2">
                {ticket.checkedIn ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
                    <CheckCircle2 className="w-4 h-4 text-neutral-500" />
                    USED • CHECKED IN {ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleTimeString() : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    VALID ENTRY • ADMITS {ticket.admitCount} {ticket.admitCount > 1 ? 'PERSONS' : 'PERSON'}
                  </span>
                )}
              </div>

            </div>

            {/* Perforated Divider */}
            <div className="relative flex items-center justify-between px-2">
              <div className="w-5 h-5 -ml-5 rounded-full bg-neutral-900 border-r border-neutral-700" />
              <div className="w-full border-t-2 border-dashed border-neutral-800" />
              <div className="w-5 h-5 -mr-5 rounded-full bg-neutral-900 border-l border-neutral-700" />
            </div>

            {/* Bottom Pass Details */}
            <div className="p-5 sm:p-6 bg-neutral-950/90 space-y-4 text-left">
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-neutral-500 uppercase text-[10px] font-semibold">Attendee</div>
                  <div className="text-sm font-bold text-white truncate">{ticket.customerName}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{ticket.customerPhone}</div>
                </div>

                <div>
                  <div className="text-neutral-500 uppercase text-[10px] font-semibold">M-Pesa Pochi Ref</div>
                  <div className="text-sm font-bold text-red-400 font-mono">{ticket.mpesaCode}</div>
                  <div className="text-[11px] text-neutral-400">Paid KES {ticket.totalAmount.toLocaleString()}</div>
                </div>
              </div>

              {/* Group Attendees List if present */}
              {ticket.attendeeNames && ticket.attendeeNames.length > 1 && (
                <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800 text-xs">
                  <div className="text-[10px] text-rose-300 uppercase font-semibold mb-1">
                    Table Guests ({ticket.attendeeNames.length}):
                  </div>
                  <div className="text-[11px] text-neutral-300 flex flex-wrap gap-1.5">
                    {ticket.attendeeNames.map((name, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700/60">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">{settings.date}</div>
                    <div className="text-[11px] text-neutral-400">{settings.time}</div>
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-white">{settings.venue}</div>
                    <div className="text-[11px] text-neutral-400">{settings.city}</div>
                  </div>
                </div>
              </div>

              {/* Pass Terms Disclaimer */}
              <div className="pt-2 border-t border-neutral-900 text-[10px] text-neutral-400 space-y-1">
                <div className="font-semibold text-neutral-300">Admission Rules:</div>
                <p>
                  • Strictly No Alcohol Provided • Zero tolerance for disorderly conduct (ejection with no refunds) • Facial identity must remain uncovered at security. Single entry pass.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Action Controls Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row gap-2.5 justify-between items-center no-print">
          {onOpenScannerWithCode && (
            <button
              onClick={() => {
                onClose();
                onOpenScannerWithCode(ticket.id);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Test Gate Scan with This Pass</span>
            </button>
          )}

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-[#801424] hover:bg-[#9e1b32] text-white font-bold text-xs flex items-center justify-center shadow-md shadow-[#801424]/40"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

