import React, { useState } from 'react';
import { TicketTier, EventSettings, AttendeeTicket } from '../types';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  AlertCircle, 
  Users, 
  Loader2,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  AlertTriangle,
  Mail,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EVENT_RULES } from './TermsAndConditions';
import { 
  isValidKenyanPhone, 
  normalizeKenyanPhone, 
  getPhoneValidationError, 
  isValidEmail, 
  getEmailValidationError 
} from '../utils/validation';

interface MpesaPaymentModalProps {
  tier: TicketTier;
  quantity: number;
  settings: EventSettings;
  onClose: () => void;
  onSuccess: (newTicket: AttendeeTicket) => void;
}

export const MpesaPaymentModal: React.FC<MpesaPaymentModalProps> = ({
  tier,
  quantity,
  settings,
  onClose,
  onSuccess
}) => {
  const totalAmount = tier.price * quantity;
  const totalAdmitCount = tier.groupSize * quantity;

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [groupNames, setGroupNames] = useState<string[]>(Array(totalAdmitCount).fill(''));

  // Manual Pochi M-Pesa Code Input
  const [manualMpesaCode, setManualMpesaCode] = useState('');
  const [copiedPochi, setCopiedPochi] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [expandedTermsInline, setExpandedTermsInline] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyPochi = () => {
    navigator.clipboard.writeText(settings.pochiNumber.replace(/\s+/g, ''));
    setCopiedPochi(true);
    setTimeout(() => setCopiedPochi(false), 2000);
  };

  const handleGroupNameChange = (index: number, val: string) => {
    const updated = [...groupNames];
    updated[index] = val;
    setGroupNames(updated);
  };

  // Generate random Kenyan M-Pesa code
  const generateMockMpesaCode = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const digits = '0123456789';
    let code = 'SL';
    for (let i = 0; i < 4; i++) code += digits.charAt(Math.floor(Math.random() * digits.length));
    for (let i = 0; i < 4; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    return code;
  };

  // Generate unique Ticket ID
  const generateTicketId = () => {
    const prefix = tier.id === 'vip' ? 'LVL-VIP' : tier.id.includes('group') ? 'LVL-GRP' : 'LVL-REG';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${rand}`;
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#ef4444', '#f87171', '#ffffff']
      });
    } catch (e) {
      console.debug('Confetti error', e);
    }
  };

  // Complete Payment and Issue Ticket
  const handleCompleteOrder = (codeToUse?: string) => {
    setIsSubmitting(true);
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name');
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = normalizeKenyanPhone(customerPhone);
    const phoneError = getPhoneValidationError(customerPhone, true);
    if (phoneError) {
      setErrorMessage(phoneError);
      setIsSubmitting(false);
      return;
    }

    // Email validation if entered
    if (customerEmail.trim()) {
      const emailError = getEmailValidationError(customerEmail, false);
      if (emailError) {
        setErrorMessage(emailError);
        setIsSubmitting(false);
        return;
      }
    }

    const finalMpesaCode = (codeToUse || manualMpesaCode).trim().toUpperCase();

    if (!agreedToTerms) {
      setErrorMessage('You must agree to the LVL Event Terms & Admission Regulations to proceed');
      setIsSubmitting(false);
      return;
    }

    if (!finalMpesaCode || finalMpesaCode.length < 8) {
      setErrorMessage('Please enter the 10-character M-Pesa transaction code received after sending money (e.g. SL74KG89P1)');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const newTicket: AttendeeTicket = {
        id: generateTicketId(),
        tierId: tier.id,
        tierName: tier.name,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || `${customerName.toLowerCase().replace(/\s+/g, '')}@tickets.lvl`,
        quantity,
        admitCount: totalAdmitCount,
        totalAmount,
        paymentMethod: 'mpesa_pochi',
        mpesaCode: finalMpesaCode,
        mpesaPhone: cleanPhone,
        pochiNumber: settings.pochiNumber,
        status: 'confirmed',
        checkedIn: false,
        createdAt: new Date().toISOString(),
        attendeeNames: totalAdmitCount > 1 
          ? groupNames.filter(n => n.trim().length > 0).length > 0 
            ? groupNames.filter(n => n.trim().length > 0)
            : [customerName] 
          : [customerName]
      };

      setIsSubmitting(false);
      triggerConfetti();
      onSuccess(newTicket);
    }, 900);
  };

  return (
    <div id="mpesa-payment-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-display">M-Pesa Pochi Checkout</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                  Pochi la Biashara
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {tier.name} • {quantity}x {tier.groupSize > 1 ? `(${totalAdmitCount} Guests)` : 'Pass'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Order Summary Pill */}
          <div className="bg-black border border-red-950/80 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <div className="text-xs text-neutral-400">Total Payable:</div>
              <div className="text-2xl font-black text-red-400 font-display flex items-baseline gap-1">
                <span className="text-sm font-normal text-neutral-400">KES</span>
                {totalAmount.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-400">Recipient Pochi:</div>
              <div className="text-xs font-semibold text-neutral-200">{settings.pochiName}</div>
              <div className="text-xs font-mono text-red-300">{settings.pochiNumber}</div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-red-950/80 border border-red-700/80 rounded-xl text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Buyer Information */}
          <div className="space-y-4">
            <div className="text-xs uppercase font-bold tracking-wider text-red-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-950 text-red-300 border border-red-700/60 flex items-center justify-center text-[10px]">1</span>
              Buyer Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Full Name (Primary Guest) *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Amina Odhiambo"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-300">
                    M-Pesa Phone Number *
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${
                    isValidKenyanPhone(customerPhone) 
                      ? 'text-emerald-400' 
                      : customerPhone.length > 0 
                      ? 'text-amber-400' 
                      : 'text-neutral-400'
                  }`}>
                    {customerPhone.replace(/\D/g, '').length}/10 digits
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setCustomerPhone(digits);
                  }}
                  placeholder="07XXXXXXXX or 011XXXXXXX"
                  className={`w-full bg-black border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none font-mono tracking-wider transition-colors ${
                    customerPhone.length > 0 && isValidKenyanPhone(customerPhone)
                      ? 'border-emerald-500/70 focus:border-emerald-400'
                      : customerPhone.length > 0 && (!customerPhone.startsWith('07') && !customerPhone.startsWith('011'))
                      ? 'border-red-500/80 focus:border-red-400'
                      : 'border-neutral-800 focus:border-red-500'
                  }`}
                />
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  {isValidKenyanPhone(customerPhone) ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 inline" /> Valid (Starts with {customerPhone.slice(0, customerPhone.startsWith('011') ? 3 : 2)})
                    </span>
                  ) : customerPhone.length > 0 && (!customerPhone.startsWith('07') && !customerPhone.startsWith('011')) ? (
                    <span className="text-red-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 inline" /> Must start with 07 or 011
                    </span>
                  ) : (
                    <span className="text-neutral-400">
                      Must start with <strong className="text-neutral-300">07</strong> or <strong className="text-neutral-300">011</strong> (10 digits)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-neutral-300">
                  Email Address (Optional, for ticket confirmation & PDF)
                </label>
                {customerEmail.trim().length > 0 && (
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${
                    isValidEmail(customerEmail) ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {isValidEmail(customerEmail) ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Valid Domain
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> Must end with valid domain (e.g. .com, .ke)
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value.trim())}
                  placeholder="name@gmail.com or name@yahoo.com"
                  className={`w-full bg-black border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors ${
                    customerEmail.trim().length > 0 && isValidEmail(customerEmail)
                      ? 'border-emerald-500/70 focus:border-emerald-400'
                      : customerEmail.trim().length > 0 && !isValidEmail(customerEmail)
                      ? 'border-amber-500/70 focus:border-amber-400'
                      : 'border-neutral-800 focus:border-red-500'
                  }`}
                />
              </div>

              {/* Quick Email Domain Presets */}
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-neutral-400 font-mono">Quick Endings:</span>
                {[
                  '@gmail.com',
                  '@yahoo.com',
                  '@outlook.com',
                  '@icloud.com'
                ].map(suffix => (
                  <button
                    key={suffix}
                    type="button"
                    onClick={() => {
                      const userPart = customerEmail.includes('@') 
                        ? customerEmail.split('@')[0] 
                        : (customerEmail || customerName.toLowerCase().replace(/\s+/g, ''));
                      setCustomerEmail(`${userPart}${suffix}`);
                    }}
                    className="px-2 py-0.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-[10px] font-mono text-neutral-300 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
                  >
                    {suffix}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Attendee Names for Group tickets */}
            {totalAdmitCount > 1 && (
              <div className="bg-black/60 border border-neutral-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>Group Attendees Names ({totalAdmitCount} Guests)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.from({ length: totalAdmitCount }).map((_, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={groupNames[idx] || ''}
                      onChange={(e) => handleGroupNameChange(idx, e.target.value)}
                      placeholder={idx === 0 ? `Guest 1 (You: ${customerName || 'Primary'})` : `Guest ${idx + 1} Name`}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Pochi Payment Instructions & M-Pesa Code Entry */}
          <div className="space-y-4 pt-2 border-t border-neutral-800">
            <div className="text-xs uppercase font-bold tracking-wider text-red-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-red-950 text-red-300 border border-red-700/60 flex items-center justify-center text-[10px]">2</span>
                Payment via Pochi la Biashara
              </span>
            </div>

            <div className="space-y-4 bg-black/60 p-4 rounded-2xl border border-neutral-800">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-200">How to pay via Pochi la Biashara:</div>
                <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside">
                  <li>Open M-Pesa (or dial <span className="font-mono text-red-400 font-bold">*334#</span>)</li>
                  <li>Select <strong className="text-white">Send Money</strong> &gt; <strong className="text-white">Pochi la Biashara</strong></li>
                  <li>
                    Enter Phone Number:
                    <div className="inline-flex items-center gap-1.5 ml-1.5 px-2 py-0.5 rounded bg-neutral-900 text-red-300 border border-red-950 font-mono font-bold">
                      <span>{settings.pochiNumber}</span>
                      <button
                        type="button"
                        onClick={handleCopyPochi}
                        className="hover:text-white cursor-pointer"
                        title="Copy Number"
                      >
                        {copiedPochi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </li>
                  <li>Enter Amount: <strong className="text-red-400 font-mono">KES {totalAmount.toLocaleString()}</strong></li>
                  <li>Enter your M-Pesa PIN and complete transfer</li>
                </ol>
              </div>

              {/* Input for M-Pesa Code */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Enter M-Pesa Confirmation Code * (e.g. SL74KG89P1)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualMpesaCode}
                    onChange={(e) => setManualMpesaCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SL74KG89P1"
                    className="flex-1 bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 font-mono uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setManualMpesaCode(generateMockMpesaCode())}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs cursor-pointer"
                    title="Use sample code for quick testing"
                  >
                    Fill Sample
                  </button>
                </div>
              </div>

              {/* Terms and Conditions Accordion / Acknowledgment */}
              <div className="pt-2">
                <div className="p-3.5 bg-neutral-950 border border-red-950/80 rounded-2xl space-y-3 text-xs shadow-inner">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold text-red-400 uppercase tracking-wide flex items-center gap-1.5 font-display">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      Important Event Admission Terms
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-800 text-[10px] font-bold text-red-200 transition-colors cursor-pointer"
                      title="Open full terms and conditions in a modal"
                    >
                      <span>Read Full Terms</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Summary Bullets */}
                  <ul className="text-[11px] text-neutral-300 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li><strong className="text-white">No Alcohol Provided:</strong> LVL does not supply alcohol. No unauthorized beverages allowed.</li>
                    <li><strong className="text-white">Disorderly Conduct:</strong> Any unruly behavior results in immediate ejection with <strong className="text-red-400">no refunds</strong>.</li>
                    <li><strong className="text-white">Identity Visibility:</strong> No balaclavas, ski masks, or full-face coverings allowed at entry.</li>
                  </ul>

                  {/* Inline Toggle for All Rules */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedTermsInline(!expandedTermsInline)}
                      className="text-[11px] font-semibold text-neutral-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {expandedTermsInline ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Hide extra house rules</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>View all 6 admission regulations inline</span>
                        </>
                      )}
                    </button>

                    {expandedTermsInline && (
                      <div className="mt-2.5 pt-2.5 border-t border-neutral-900 grid grid-cols-1 gap-2 animate-in fade-in duration-150">
                        {EVENT_RULES.map((rule) => (
                          <div key={rule.id} className="p-2 rounded-xl bg-black/60 border border-neutral-800/80 text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{rule.title}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-mono">{rule.highlight}</span>
                            </div>
                            <p className="text-neutral-400 text-[10px] leading-snug">{rule.desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-2.5 pt-2 border-t border-neutral-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded bg-black border-neutral-700 text-red-600 focus:ring-red-500 cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-neutral-200">
                      I and my guests have read and agree to all{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsModal(true);
                        }}
                        className="text-red-400 hover:text-red-300 underline font-bold cursor-pointer inline"
                      >
                        LVL Event Terms, Code of Conduct & No Refund Policies
                      </button>.
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCompleteOrder(manualMpesaCode)}
                disabled={isSubmitting || !manualMpesaCode || !agreedToTerms}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Issuing Pass...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Verify Code & Generate Ticket Pass</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 text-center flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            256-bit Secure Gate QR Encryption
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>

      {/* Full Terms & Conditions Modal Overlay */}
      {showTermsModal && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-neutral-950 border border-red-900/80 rounded-3xl shadow-2xl overflow-hidden text-neutral-100 flex flex-col max-h-[88vh]">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-950 via-neutral-900 to-black border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-black text-white font-display uppercase tracking-wide">
                    Terms of Admission & Code of Conduct
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Official LVL Event Regulations • Safety & Entry Protocols
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body with All 6 Rules */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center gap-2.5 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>
                  Please read and understand these terms. All tickets are subject to strict adherence at the gate.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EVENT_RULES.map((rule) => {
                  const Icon = rule.icon;
                  return (
                    <div
                      key={rule.id}
                      className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-8 h-8 rounded-xl bg-red-950 text-red-400 border border-red-800/60 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-red-300 border border-neutral-800">
                            {rule.highlight}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white font-display">{rule.title}</h5>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">{rule.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-black border-t border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-400 hidden sm:inline">
                Applies to all ticket holders & guests.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setAgreedToTerms(true);
                    setShowTermsModal(false);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30"
                >
                  <Check className="w-4 h-4" />
                  <span>I Understand & Agree</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
