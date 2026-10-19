import React, { useState, useEffect } from 'react';
import { 
  AttendeeTicket, 
  EventSettings, 
  TicketTier 
} from '../types';
import { saveTicketTiers, saveEventSettings } from '../lib/storage';
import { 
  Lock, 
  DollarSign, 
  Users, 
  Ticket, 
  CheckCircle2, 
  Settings, 
  Plus, 
  Save, 
  RefreshCw, 
  Search, 
  Download, 
  Trash2, 
  Phone, 
  Key, 
  Eye, 
  EyeOff, 
  AlertCircle,
  TrendingUp,
  ScanLine,
  QrCode,
  Sparkles,
  Crown,
  Calendar,
  MapPin,
  Clock,
  Check,
  Timer,
  Zap,
  Tag,
  Hourglass,
  Palette,
  X
} from 'lucide-react';
import { TicketScanner } from './TicketScanner';
import { 
  isValidKenyanPhone, 
  normalizeKenyanPhone, 
  getPhoneValidationError, 
  isValidEmail, 
  getEmailValidationError 
} from '../utils/validation';

const LUXURY_PALETTES = [
  { name: 'Crimson Red', hex: '#9e1b32', bg: 'bg-[#9e1b32]' },
  { name: 'Gold Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Emerald Green', hex: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Royal Violet', hex: '#8b5cf6', bg: 'bg-purple-500' },
  { name: 'Electric Cyan', hex: '#06b6d4', bg: 'bg-cyan-500' },
  { name: 'Neon Rose', hex: '#f43f5e', bg: 'bg-rose-500' },
  { name: 'Silver White', hex: '#e5e5e5', bg: 'bg-neutral-200' },
  { name: 'Bronze Gold', hex: '#d97706', bg: 'bg-amber-600' },
];

interface OrganiserPortalProps {
  settings: EventSettings;
  tiers: TicketTier[];
  tickets: AttendeeTicket[];
  onUpdateSettings: (newSettings: EventSettings) => void;
  onUpdateTiers: (newTiers: TicketTier[]) => void;
  onUpdateTickets: (newTickets: AttendeeTicket[]) => void;
  onResetData: () => void;
  onCheckInTicket: (ticketId: string) => AttendeeTicket | null;
  onViewTicket: (ticket: AttendeeTicket) => void;
}

export const OrganiserPortal: React.FC<OrganiserPortalProps> = ({
  settings,
  tiers,
  tickets,
  onUpdateSettings,
  onUpdateTiers,
  onUpdateTickets,
  onResetData,
  onCheckInTicket,
  onViewTicket
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Active Organiser Sub-Tab (Default to 'scanner' for instant gate access without pass)
  const [subTab, setSubTab] = useState<'scanner' | 'overview' | 'passes' | 'pricing' | 'settings'>('scanner');

  // Passes View Mode: 'cards' or 'table'
  const [passViewMode, setPassViewMode] = useState<'cards' | 'table'>('cards');

  // Editable Tier State for Pricing & Seats Manager
  const [editableTiers, setEditableTiers] = useState<TicketTier[]>(tiers);
  const [tiersSavedAlert, setTiersSavedAlert] = useState(false);

  // Sync state if props update externally
  useEffect(() => {
    setEditableTiers(tiers);
  }, [tiers]);

  useEffect(() => {
    setEditableSettings(settings);
  }, [settings]);

  // Editable Event & Pochi Settings
  const [editableSettings, setEditableSettings] = useState<EventSettings>(settings);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // Attendee Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Quick Add Ticket Modal/Form
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newTierId, setNewTierId] = useState('vip');
  const [newMpesaCode, setNewMpesaCode] = useState('');

  // Add Custom Tier Modal/Form
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [newTierName, setNewTierName] = useState('');
  const [newTierPrice, setNewTierPrice] = useState(1000);
  const [newTierOriginalPrice, setNewTierOriginalPrice] = useState<number | undefined>(1200);
  const [newTierCapacity, setNewTierCapacity] = useState(50);
  const [newTierTag, setNewTierTag] = useState('');
  const [newTierDescription, setNewTierDescription] = useState('');
  const [newTierIsLimited, setNewTierIsLimited] = useState(false);
  const [newTierDurationHours, setNewTierDurationHours] = useState(48);

  // In-App Tier Deletion Modal State
  const [tierToDelete, setTierToDelete] = useState<TicketTier | null>(null);
  const [inlineConfirmTierId, setInlineConfirmTierId] = useState<string | null>(null);

  // Flexible Date & Time Parser
  const parseFlexibleDateTime = (raw: string): string | null => {
    if (!raw || !raw.trim()) return null;
    const trimmed = raw.trim();

    // 1. Direct Date constructor (handles ISO, standard JS formats)
    const directDate = new Date(trimmed);
    if (!isNaN(directDate.getTime())) {
      return directDate.toISOString();
    }

    // 2. Format DD/MM/YYYY or DD-MM-YYYY with optional time HH:MM
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 23;
      const min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 59;
      const d = new Date(year, month, day, hour, min, 0);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    }

    // 3. Format YYYY-MM-DD or YYYY/MM/DD with optional time
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const hour = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 23;
      const min = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 59;
      const d = new Date(year, month, day, hour, min, 0);
      if (!isNaN(d.getTime())) {
        return d.toISOString();
      }
    }

    return null;
  };

  const getIsoDatePart = (isoStr?: string): string => {
    if (!isoStr) {
      const d = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return '';
    }
  };

  const getIsoTimePart = (isoStr?: string): string => {
    if (!isoStr) return '23:59';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '23:59';
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '23:59';
    }
  };

  const formatReadableDateTime = (isoStr?: string): string => {
    if (!isoStr) return 'No expiration date configured (Never expires)';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return 'Invalid date format';
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ' at ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoStr;
    }
  };

  // Immediate Tier Change Handler (Auto-saves to parent and localStorage)
  const handleTierChange = (index: number, field: keyof TicketTier, value: any) => {
    const updated = [...editableTiers];
    updated[index] = { ...updated[index], [field]: value };
    setEditableTiers(updated);
    onUpdateTiers(updated);
    saveTicketTiers(updated);
    setTiersSavedAlert(true);
    setTimeout(() => setTiersSavedAlert(false), 2500);
  };

  // Handle direct text date input (e.g. 30/08/2026 23:59 or Aug 30 2026)
  const handleUpdateDirectDateText = (index: number, rawText: string) => {
    const parsed = parseFlexibleDateTime(rawText);
    if (parsed) {
      const updated = [...editableTiers];
      updated[index] = {
        ...updated[index],
        expiresAt: parsed,
        isLimitedTime: true
      };
      setEditableTiers(updated);
      onUpdateTiers(updated);
      saveTicketTiers(updated);
      setTiersSavedAlert(true);
      setTimeout(() => setTiersSavedAlert(false), 2500);
    }
  };

  const handleUpdateDatePart = (index: number, newDateStr: string) => {
    if (!newDateStr) return;
    const currentIso = editableTiers[index].expiresAt || new Date().toISOString();
    const timePart = getIsoTimePart(currentIso) || '23:59';
    const combined = new Date(`${newDateStr}T${timePart}`);
    if (!isNaN(combined.getTime())) {
      const updated = [...editableTiers];
      updated[index] = {
        ...updated[index],
        expiresAt: combined.toISOString(),
        isLimitedTime: true
      };
      setEditableTiers(updated);
      onUpdateTiers(updated);
      saveTicketTiers(updated);
      setTiersSavedAlert(true);
      setTimeout(() => setTiersSavedAlert(false), 2500);
    }
  };

  const handleUpdateTimePart = (index: number, newTimeStr: string) => {
    if (!newTimeStr) return;
    const currentIso = editableTiers[index].expiresAt || new Date().toISOString();
    const datePart = getIsoDatePart(currentIso);
    const combined = new Date(`${datePart}T${newTimeStr}`);
    if (!isNaN(combined.getTime())) {
      const updated = [...editableTiers];
      updated[index] = {
        ...updated[index],
        expiresAt: combined.toISOString(),
        isLimitedTime: true
      };
      setEditableTiers(updated);
      onUpdateTiers(updated);
      saveTicketTiers(updated);
      setTiersSavedAlert(true);
      setTimeout(() => setTiersSavedAlert(false), 2500);
    }
  };

  // Color selection handler for tickets
  const handleUpdateTierColor = (index: number, hexColor: string) => {
    const updated = [...editableTiers];
    updated[index] = {
      ...updated[index],
      accentColor: hexColor
    };
    setEditableTiers(updated);
    onUpdateTiers(updated);
    saveTicketTiers(updated);
    setTiersSavedAlert(true);
    setTimeout(() => setTiersSavedAlert(false), 2500);
  };

  const setTierSpecificDate = (index: number, year: number, month: number, day: number, hour = 23, minute = 59) => {
    const targetDate = new Date(year, month - 1, day, hour, minute, 0);
    const updated = [...editableTiers];
    updated[index] = {
      ...updated[index],
      isLimitedTime: true,
      expiresAt: targetDate.toISOString()
    };
    setEditableTiers(updated);
    onUpdateTiers(updated);
    saveTicketTiers(updated);
    setTiersSavedAlert(true);
    setTimeout(() => setTiersSavedAlert(false), 2500);
  };

  const getTierDurationRemainingText = (expiresAt?: string) => {
    if (!expiresAt) return 'No timer set';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired / Sale window ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h ${mins}m remaining`;
    return `${hours}h ${mins}m remaining`;
  };

  const setTierDurationHours = (index: number, hours: number) => {
    const expiry = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    const updated = [...editableTiers];
    updated[index] = {
      ...updated[index],
      isLimitedTime: true,
      expiresAt: expiry
    };
    setEditableTiers(updated);
    onUpdateTiers(updated);
    saveTicketTiers(updated);
    setTiersSavedAlert(true);
    setTimeout(() => setTiersSavedAlert(false), 2500);
  };

  const clearTierDuration = (index: number) => {
    const updated = [...editableTiers];
    updated[index] = {
      ...updated[index],
      isLimitedTime: false,
      expiresAt: undefined
    };
    setEditableTiers(updated);
    onUpdateTiers(updated);
    saveTicketTiers(updated);
    setTiersSavedAlert(true);
    setTimeout(() => setTiersSavedAlert(false), 2500);
  };

  // Instant Settings Field Update Handler
  const handleUpdateSettingField = (field: keyof EventSettings, value: string) => {
    const updated = {
      ...editableSettings,
      [field]: value
    };
    setEditableSettings(updated);
    onUpdateSettings(updated);
    saveEventSettings(updated);
    setSettingsSavedAlert(true);
    setTimeout(() => setSettingsSavedAlert(false), 2500);
  };

  const handleCreateCustomTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTierName.trim()) {
      return;
    }

    const generatedId = newTierName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `tier-${Date.now()}`;
    const newTier: TicketTier = {
      id: generatedId,
      name: newTierName.trim(),
      price: Number(newTierPrice),
      originalPrice: newTierOriginalPrice ? Number(newTierOriginalPrice) : undefined,
      capacity: Number(newTierCapacity),
      sold: 0,
      description: newTierDescription.trim() || `Access pass for ${newTierName}.`,
      perks: [
        "Access to Main Runway Stage",
        "Designer Pop-up Access",
        "Official After-Party Entry"
      ],
      groupSize: 1,
      badgeColor: "border-neutral-700 text-neutral-300 bg-neutral-900/80",
      tag: newTierTag.trim() || undefined,
      active: true,
      isLimitedTime: newTierIsLimited,
      expiresAt: newTierIsLimited ? new Date(Date.now() + newTierDurationHours * 60 * 60 * 1000).toISOString() : undefined
    };

    const updated = [...editableTiers, newTier];
    setEditableTiers(updated);
    saveTicketTiers(updated);
    onUpdateTiers(updated);
    setShowAddTierModal(false);
    setNewTierName('');
    setNewTierTag('');
    setNewTierDescription('');
    setTiersSavedAlert(true);
    setTimeout(() => setTiersSavedAlert(false), 3000);
  };

  const deleteTierDirectly = (tierId: string) => {
    const updated = editableTiers.filter(t => t.id !== tierId);
    setEditableTiers(updated);
    saveTicketTiers(updated);
    onUpdateTiers(updated);
    setTierToDelete(null);
    setInlineConfirmTierId(null);
    setTiersSavedAlert(true);
    setTimeout(() => setTiersSavedAlert(false), 3000);
  };

  const confirmDeleteTier = () => {
    if (!tierToDelete) return;
    deleteTierDirectly(tierToDelete.id);
  };

  // Handle Passcode Login (lvl.)
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = enteredPin.trim();
    if (
      clean === 'lvl.' || 
      clean === 'lvl' || 
      clean === 'LVL.' || 
      clean === 'LVL' ||
      clean === settings.organiserPin ||
      clean === '1234'
    ) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect Organiser passcode.');
    }
  };

  // KPI Calculations
  const totalRevenue = tickets
    .filter(t => t.status === 'confirmed')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalTicketsSold = tickets
    .filter(t => t.status === 'confirmed')
    .reduce((sum, t) => sum + t.quantity, 0);

  const totalSeatsAdmitted = tickets
    .filter(t => t.status === 'confirmed')
    .reduce((sum, t) => sum + t.admitCount, 0);

  const totalCheckedIn = tickets
    .filter(t => t.checkedIn)
    .reduce((sum, t) => sum + t.admitCount, 0);

  const totalCapacity = tiers.reduce((sum, t) => sum + (t.capacity * t.groupSize), 0);
  const checkInRate = totalSeatsAdmitted > 0 ? Math.round((totalCheckedIn / totalSeatsAdmitted) * 100) : 0;

  // Manual Save All Tiers Button
  const handleSaveTiers = () => {
    onUpdateTiers(editableTiers);
    saveTicketTiers(editableTiers);
    setTiersSavedAlert(true);
    setTimeout(() => setTiersSavedAlert(false), 3000);
  };

  // Handle Event & Pochi Settings Update
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = normalizeKenyanPhone(editableSettings.pochiNumber);
    const phoneErr = getPhoneValidationError(cleanPhone, true);
    if (phoneErr) {
      alert(`Invalid Pochi Number: ${phoneErr}`);
      return;
    }
    const updated = { ...editableSettings, pochiNumber: cleanPhone };
    setEditableSettings(updated);
    onUpdateSettings(updated);
    saveEventSettings(updated);
    setSettingsSavedAlert(true);
    setTimeout(() => setSettingsSavedAlert(false), 3000);
  };

  // Toggle Ticket Check-In
  const handleToggleCheckIn = (ticketId: string) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        const nextChecked = !t.checkedIn;
        return {
          ...t,
          checkedIn: nextChecked,
          checkedInAt: nextChecked ? new Date().toISOString() : undefined,
          checkedInBy: nextChecked ? 'Organiser Portal Manual' : undefined
        };
      }
      return t;
    });
    onUpdateTickets(updated);
  };

  // Delete Ticket
  const handleDeleteTicket = (ticketId: string) => {
    if (window.confirm(`Are you sure you want to delete ticket ${ticketId}?`)) {
      const updated = tickets.filter(t => t.id !== ticketId);
      onUpdateTickets(updated);
    }
  };

  // Add Manual / Complimentary Ticket
  const handleAddManualTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert('Please enter the customer full name');
      return;
    }

    const cleanPhone = normalizeKenyanPhone(newCustPhone);
    const phoneErr = getPhoneValidationError(newCustPhone, true);
    if (phoneErr) {
      alert(phoneErr);
      return;
    }

    if (newCustEmail.trim()) {
      const emailErr = getEmailValidationError(newCustEmail, false);
      if (emailErr) {
        alert(emailErr);
        return;
      }
    }

    const selectedTier = tiers.find(t => t.id === newTierId) || tiers[0];
    const newTicket: AttendeeTicket = {
      id: `LVL-${selectedTier.id.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`,
      tierId: selectedTier.id,
      tierName: selectedTier.name,
      customerName: newCustName.trim(),
      customerPhone: cleanPhone,
      customerEmail: newCustEmail.trim() || `${newCustName.toLowerCase().replace(/\s+/g, '')}@tickets.lvl`,
      quantity: 1,
      admitCount: selectedTier.groupSize,
      totalAmount: selectedTier.price,
      paymentMethod: 'mpesa_pochi',
      mpesaCode: newMpesaCode.trim().toUpperCase() || `DIR-${Math.floor(10000 + Math.random() * 90000)}`,
      mpesaPhone: cleanPhone,
      pochiNumber: settings.pochiNumber,
      status: 'confirmed',
      checkedIn: false,
      createdAt: new Date().toISOString(),
      attendeeNames: [newCustName.trim()]
    };

    onUpdateTickets([newTicket, ...tickets]);
    
    // Update sold count
    const updatedTiers = tiers.map(t => {
      if (t.id === selectedTier.id) {
        return { ...t, sold: t.sold + 1 };
      }
      return t;
    });
    onUpdateTiers(updatedTiers);
    setEditableTiers(updatedTiers);

    setShowAddTicket(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewMpesaCode('');
  };

  // Export Attendees CSV
  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Tier', 'Customer Name', 'Phone', 'Email', 'Admit Count', 'Total (KES)', 'M-Pesa Code', 'Checked In', 'Created At'];
    const rows = tickets.map(t => [
      t.id,
      `"${t.tierName}"`,
      `"${t.customerName}"`,
      t.customerPhone,
      t.customerEmail,
      t.admitCount,
      t.totalAmount,
      t.mpesaCode,
      t.checkedIn ? 'YES' : 'NO',
      t.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LVL_Attendees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Attendees
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerPhone.includes(searchTerm) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.mpesaCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTier = tierFilter === 'all' || t.tierId === tierFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'checked_in' && t.checkedIn) || 
      (statusFilter === 'pending_entry' && !t.checkedIn);

    return matchesSearch && matchesTier && matchesStatus;
  });

  // Reusable inline admin authentication prompt
  const renderAdminLockScreen = (featureName: string) => (
    <div id="organiser-login-view" className="py-12 max-w-md mx-auto px-4">
      <div className="bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-red-950/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-red-950/40 space-y-6 text-center">
        
        <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 mx-auto shadow-lg shadow-red-950/60">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-[10px] font-extrabold text-red-400 uppercase tracking-widest font-display">
            Organiser Protected
          </div>
          <h2 className="text-xl font-black text-white font-display uppercase tracking-tight">
            Unlock {featureName}
          </h2>
          <p className="text-xs text-neutral-400">
            Enter the organiser passcode to access revenue KPIs, attendee passes, pricing & seats, and Pochi settings.
          </p>
        </div>

        {pinError && (
          <div className="p-3.5 bg-red-950/90 border border-red-700 rounded-xl text-xs text-red-200 flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Organiser Passcode
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-center text-xl text-white font-mono tracking-widest focus:outline-none focus:border-red-500 shadow-inner"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-red-600/30 transition-all"
          >
            <Key className="w-4 h-4" />
            <span>Unlock Admin Dashboard</span>
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-900">
          <button
            type="button"
            onClick={() => setSubTab('scanner')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Open Gate Scanner (No Passcode Needed)</span>
          </button>
        </div>

      </div>
    </div>
  );

  return (
    <section id="organiser-portal-main" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Top Banner & Tab Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 font-bold uppercase tracking-wider">
              Organiser Control Room
            </span>
            <span className="text-xs text-neutral-400">
              Pochi: <strong className="text-white font-mono">{settings.pochiNumber}</strong> ({settings.pochiName})
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-display">
            LVL Runway Event Portal
          </h2>
        </div>

        {/* Primary Sub-Navigation Bar & Auth Status */}
        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-1 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 shadow-inner w-max">
            
            {/* GATE SCANNER (Always accessible without passcode) */}
            <button
              id="subtab-live-scanner"
              onClick={() => setSubTab('scanner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                subTab === 'scanner' 
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30' 
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-neutral-800'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Gate Scanner</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold hidden sm:inline">
                Open
              </span>
            </button>

            {/* OVERVIEW (Passcode protected) */}
            <button
              id="subtab-overview"
              onClick={() => setSubTab('overview')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                subTab === 'overview' 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {!isAuthenticated && <Lock className="w-3 h-3 text-neutral-400" />}
              <span>Overview</span>
            </button>

            {/* EVENT PASSES (Passcode protected) */}
            <button
              id="subtab-passes-directory"
              onClick={() => setSubTab('passes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                subTab === 'passes' 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {!isAuthenticated ? <Lock className="w-3 h-3 text-neutral-400" /> : <Ticket className="w-3.5 h-3.5" />}
              <span>Passes ({tickets.length})</span>
            </button>

            {/* PRICING & SEATS (Passcode protected) */}
            <button
              id="subtab-pricing-seats"
              onClick={() => setSubTab('pricing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                subTab === 'pricing' 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {!isAuthenticated && <Lock className="w-3 h-3 text-neutral-400" />}
              <span>Prices & Seats</span>
            </button>

            {/* POCHI SETTINGS (Passcode protected) */}
            <button
              id="subtab-settings"
              onClick={() => setSubTab('settings')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                subTab === 'settings' 
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {!isAuthenticated && <Lock className="w-3 h-3 text-neutral-400" />}
              <span>Pochi Settings</span>
            </button>

          </div>

          {/* Quick Lock / Unlock Status Toggle */}
          {isAuthenticated ? (
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Lock Organiser Dashboard"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Lock Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setSubTab('overview')}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Unlock Organiser Dashboard"
            >
              <Key className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Admin Login</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB: LIVE GATE SCANNER (Always open without passcode) */}
      {subTab === 'scanner' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-display mb-1">
                Gate Admission Terminal • Direct Access
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase">
                Live Gate QR Scanner
              </h3>
              <p className="text-xs text-neutral-400">
                Direct camera scanning & manual verification with anti-duplicate double-scan security.
              </p>
            </div>

            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ready for gate check-in</span>
            </div>
          </div>

          <TicketScanner
            tickets={tickets}
            onCheckInTicket={onCheckInTicket}
            onViewTicket={onViewTicket}
          />
        </div>
      )}

      {/* SUB-TAB 1: OVERVIEW & KPIS */}
      {subTab === 'overview' && (
        !isAuthenticated ? renderAdminLockScreen('Overview & Financials') : (
        <div className="space-y-8">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Revenue */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs uppercase font-bold tracking-wider">Total Pochi Revenue</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">
                <span className="text-xs text-neutral-400 mr-1">KES</span>
                {totalRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>100% verified via Pochi la Biashara</span>
              </div>
            </div>

            {/* Total Orders Sold */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs uppercase font-bold tracking-wider">Passes / Orders Sold</span>
                <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800/50">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">
                {totalTicketsSold} <span className="text-sm font-normal text-neutral-400">orders</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                Total {totalSeatsAdmitted} attendee admissions
              </div>
            </div>

            {/* Gate Attendance Check-in Rate */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs uppercase font-bold tracking-wider">Gate Checked-In</span>
                <div className="p-2 rounded-lg bg-rose-950 text-rose-400 border border-rose-800/50">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">
                {totalCheckedIn} / {totalSeatsAdmitted}
              </div>
              <div className="text-[11px] text-rose-300 font-semibold">
                {checkInRate}% check-in turnout
              </div>
            </div>

            {/* Total Venue Capacity */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs uppercase font-bold tracking-wider">Available Seats</span>
                <div className="p-2 rounded-lg bg-neutral-800 text-neutral-300">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-display">
                {Math.max(0, totalCapacity - totalSeatsAdmitted)} <span className="text-sm font-normal text-neutral-400">left</span>
              </div>
              <div className="text-[11px] text-neutral-400">
                {totalCapacity} total seat capacity
              </div>
            </div>

          </div>

          {/* Tier Performance Summary */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white uppercase font-display">
              Ticket Tier Breakdown & Sales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map(tier => {
                const tierTickets = tickets.filter(t => t.tierId === tier.id && t.status === 'confirmed');
                const tierRevenue = tierTickets.reduce((s, t) => s + t.totalAmount, 0);
                const seatsOccupied = tier.sold * tier.groupSize;
                const maxSeats = tier.capacity * tier.groupSize;
                const pct = Math.min(100, Math.round((seatsOccupied / (maxSeats || 1)) * 100));

                return (
                  <div key={tier.id} className="bg-black/70 border border-neutral-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{tier.name}</span>
                      <span className="text-xs font-mono text-red-400 font-bold">KES {tier.price.toLocaleString()}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>{seatsOccupied} / {maxSeats} seats</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="text-xs text-neutral-400 flex justify-between pt-1 border-t border-neutral-800/60">
                      <span>Total Sales:</span>
                      <span className="font-semibold text-white">KES {tierRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Gate Launch Card */}
          <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-black border-2 border-red-950 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-emerald-400" />
                Live Gate Admission Scanner
              </div>
              <div className="text-xs text-neutral-400">Instant QR camera scanner with automatic anti-duplicate double scan protection.</div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSubTab('scanner')}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <ScanLine className="w-4 h-4" />
                <span>Launch Gate Scanner</span>
              </button>
              <button
                onClick={() => setSubTab('passes')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>Browse Passes ({tickets.length})</span>
              </button>
            </div>
          </div>

        </div>
        )
      )}

      {/* SUB-TAB 2: ALL EVENT PASSES & ATTENDEES */}
      {subTab === 'passes' && (
        !isAuthenticated ? renderAdminLockScreen('Event Passes Directory') : (
        <div className="space-y-6">
          
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800 text-[10px] font-extrabold text-red-400 uppercase tracking-widest font-display mb-1">
                Digital Passes Directory
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase">
                All Event Passes & Attendees
              </h3>
              <p className="text-xs text-neutral-400">
                View digital QR passes, verify gate check-in status, search attendees, or export records to CSV.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-black p-1 rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPassViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    passViewMode === 'cards' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setPassViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    passViewMode === 'table' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Table
                </button>
              </div>

              <button
                onClick={() => setShowAddTicket(true)}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-red-950 hover:border-red-800 text-red-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Pass</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, phone, M-Pesa code, or ID..."
                className="w-full bg-black border border-neutral-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">All Ticket Tiers</option>
                {tiers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="all">All Gate Statuses</option>
                <option value="checked_in">Admitted (Checked In)</option>
                <option value="pending_entry">Pending Gate Entry</option>
              </select>
            </div>
          </div>

          {/* Add Direct Ticket Modal Form */}
          {showAddTicket && (
            <div className="p-5 bg-black border-2 border-red-900/80 rounded-2xl space-y-4 animate-in fade-in shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Issue Offline / Direct Event Pass
                </h4>
                <button 
                  onClick={() => setShowAddTicket(false)}
                  className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddManualTicket} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="Attendee name"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-neutral-400">Phone (07.. / 011..) *</label>
                    <span className={`text-[10px] font-mono ${
                      isValidKenyanPhone(newCustPhone) ? 'text-emerald-400 font-bold' : 'text-neutral-500'
                    }`}>
                      {newCustPhone.replace(/\D/g, '').length}/10
                    </span>
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="07XXXXXXXX or 011XXXXXXX"
                    className={`w-full bg-neutral-900 border rounded-xl px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none ${
                      isValidKenyanPhone(newCustPhone) 
                        ? 'border-emerald-500/80 focus:border-emerald-400' 
                        : newCustPhone.length > 0 && (!newCustPhone.startsWith('07') && !newCustPhone.startsWith('011'))
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-neutral-800 focus:border-red-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value.trim())}
                    placeholder="name@gmail.com"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">Select Tier *</label>
                  <select
                    value={newTierId}
                    onChange={(e) => setNewTierId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    {tiers.map(t => (
                      <option key={t.id} value={t.id}>{t.name} (KES {t.price})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">M-Pesa / Receipt Ref</label>
                  <input
                    type="text"
                    value={newMpesaCode}
                    onChange={(e) => setNewMpesaCode(e.target.value.toUpperCase())}
                    placeholder="Leave blank for auto"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-3 lg:col-span-5 flex items-center justify-between gap-2 pt-2 border-t border-neutral-900">
                  <div className="text-[11px] text-neutral-400">
                    Phone must start with <strong className="text-neutral-300">07</strong> or <strong className="text-neutral-300">011</strong> (10 digits). Email must end with a valid domain (e.g. <strong className="text-neutral-300">@gmail.com, @yahoo.com</strong>).
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer shrink-0 shadow-md"
                  >
                    Generate & Save Pass
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW MODE 1: PASS CARDS */}
          {passViewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTickets.length === 0 ? (
                <div className="col-span-full py-12 text-center text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
                  No event passes match your search filters.
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const isVip = ticket.tierId === 'vip';
                  const isGroup = ticket.admitCount > 1;

                  return (
                    <div
                      key={ticket.id}
                      className={`relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all ${
                        isVip 
                          ? 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-red-700/80 shadow-xl shadow-red-950/40' 
                          : isGroup
                          ? 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-rose-800/60 shadow-xl shadow-rose-950/30'
                          : 'bg-neutral-900/90 border border-neutral-800 shadow-xl shadow-black/80'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isVip ? 'bg-red-600 text-white' : isGroup ? 'bg-rose-700 text-white' : 'bg-neutral-800 text-neutral-200'
                        }`}>
                          {ticket.tierName}
                        </span>
                        <span className="font-mono text-xs font-bold text-neutral-400">
                          {ticket.id}
                        </span>
                      </div>

                      {/* Attendee Info */}
                      <div className="space-y-1.5 my-2">
                        <h4 className="text-base sm:text-lg font-black text-white font-display">
                          {ticket.customerName}
                        </h4>
                        <div className="text-xs text-neutral-400 flex flex-wrap items-center gap-2">
                          <span className="font-mono">{ticket.customerPhone}</span>
                          <span>•</span>
                          <span className="font-mono text-red-400 font-semibold">{ticket.mpesaCode}</span>
                        </div>
                        {ticket.attendeeNames && ticket.attendeeNames.length > 1 && (
                          <div className="text-[11px] text-rose-300/90 pt-1 line-clamp-2">
                            <strong>Table:</strong> {ticket.attendeeNames.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Status & Actions */}
                      <div className="pt-4 border-t border-neutral-800/80 mt-3 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleCheckIn(ticket.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            ticket.checkedIn
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{ticket.checkedIn ? 'Admitted' : 'Valid Pass'}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewTicket(ticket)}
                            className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View QR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW MODE 2: TABLE */}
          {passViewMode === 'table' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-black text-neutral-400 uppercase text-[10px] font-bold tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-3">Pass ID</th>
                      <th className="px-4 py-3">Attendee</th>
                      <th className="px-4 py-3">Tier</th>
                      <th className="px-4 py-3">M-Pesa Code</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Gate Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                          No attendees match your search filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-neutral-800/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-white whitespace-nowrap">
                            {ticket.id}
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-bold text-white">{ticket.customerName}</div>
                            <div className="text-[11px] text-neutral-400 font-mono">{ticket.customerPhone}</div>
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              ticket.tierId === 'vip' 
                                ? 'bg-red-950 text-red-400 border border-red-800/60' 
                                : ticket.admitCount > 1 
                                ? 'bg-rose-950 text-rose-400 border border-rose-800/60' 
                                : 'bg-neutral-800 text-neutral-300'
                            }`}>
                              {ticket.tierName} {ticket.admitCount > 1 && `(${ticket.admitCount}p)`}
                            </span>
                          </td>

                          <td className="px-4 py-3 font-mono text-red-400 font-bold whitespace-nowrap">
                            {ticket.mpesaCode}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap font-mono font-semibold">
                            KES {ticket.totalAmount.toLocaleString()}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleCheckIn(ticket.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                                ticket.checkedIn
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                              }`}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${ticket.checkedIn ? 'text-emerald-400' : 'text-neutral-500'}`} />
                              <span>{ticket.checkedIn ? 'Admitted' : 'Pending Entry'}</span>
                            </button>
                          </td>

                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onViewTicket(ticket)}
                                title="View Digital Pass & QR"
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                              >
                                <QrCode className="w-4 h-4 text-red-400" />
                              </button>
                              <button
                                onClick={() => handleDeleteTicket(ticket.id)}
                                title="Delete Record"
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
        )
      )}

      {/* SUB-TAB 3: LIVE GATE SCANNER (Embedded directly inside Organiser Portal without extra pass prompt!) */}
      {subTab === 'scanner' && (
        <div className="space-y-6">
          <div className="pb-4 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-display mb-1">
                Gate Admission Terminal
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase">
                Live Gate QR Scanner
              </h3>
              <p className="text-xs text-neutral-400">
                Direct camera scanning & manual verification with anti-duplicate double-scan security.
              </p>
            </div>

            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ready for gate check-in</span>
            </div>
          </div>

          <TicketScanner
            tickets={tickets}
            onCheckInTicket={onCheckInTicket}
            onViewTicket={onViewTicket}
          />
        </div>
      )}

      {/* SUB-TAB 4: PRICING & SEATS MANAGEMENT */}
      {subTab === 'pricing' && (
        !isAuthenticated ? (
          renderAdminLockScreen("Ticket Pricing & Capacity")
        ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-xl font-black text-white font-display uppercase">
                Ticket Pricing, Durations & Seats Manager
              </h3>
              <p className="text-xs text-neutral-400">
                Configure prices in KES, adjust total capacity, create custom tiers, and set limited-time countdown durations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddTierModal(true)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-red-400" />
                <span>Add New Tier</span>
              </button>

              <button
                id="btn-save-pricing"
                onClick={handleSaveTiers}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </div>

          {tiersSavedAlert && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ticket tiers, pricing, and live durations updated successfully! Changes are live on the store.</span>
            </div>
          )}

          {/* Delete Tier In-App Confirmation Modal (Fixed Viewport Overlay) */}
          {tierToDelete && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
              onClick={() => setTierToDelete(null)}
            >
              <div 
                className="relative w-full max-w-lg p-5 sm:p-6 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-red-600 rounded-2xl space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5 text-red-400">
                    <div className="p-2 rounded-xl bg-red-950/80 border border-red-800">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-white uppercase">
                        Confirm Deletion of Tier
                      </h4>
                      <p className="text-xs text-neutral-400">
                        Are you sure you want to remove <span className="text-white font-bold font-mono">"{tierToDelete.name}"</span> (KES {tierToDelete.price.toLocaleString()})?
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTierToDelete(null)}
                    className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3.5 bg-neutral-950/90 border border-neutral-800 rounded-xl text-xs text-neutral-300 space-y-1">
                  <p className="text-neutral-400">
                    This action will permanently delete this tier card from the storefront and customer checkout.
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-neutral-400">
                    <span>Tier ID: <strong className="text-white">{tierToDelete.id}</strong></span>
                    <span>•</span>
                    <span>Capacity: <strong className="text-white">{tierToDelete.capacity}</strong></span>
                    <span>•</span>
                    <span>Sold: <strong className="text-white">{tierToDelete.sold}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setTierToDelete(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Keep Tier
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteTier}
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-red-600/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Tier</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add New Custom Tier Modal */}
          {showAddTierModal && (
            <div className="p-5 sm:p-6 bg-gradient-to-b from-neutral-900 to-black border-2 border-red-800/80 rounded-2xl space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-red-400" />
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Create New Ticket Tier</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTierModal(false)}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateCustomTier} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">Tier Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Backstage Pass"
                      value={newTierName}
                      onChange={(e) => setNewTierName(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">Price in KES *</label>
                    <input
                      type="number"
                      required
                      value={newTierPrice}
                      onChange={(e) => setNewTierPrice(Number(e.target.value))}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">Original Price (for discount strikethrough)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1200"
                      value={newTierOriginalPrice || ''}
                      onChange={(e) => setNewTierOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">Capacity / Total Tickets *</label>
                    <input
                      type="number"
                      required
                      value={newTierCapacity}
                      onChange={(e) => setNewTierCapacity(Number(e.target.value))}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">Card Tag / Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. LIMITED FLASH, VIP ACCESS"
                      value={newTierTag}
                      onChange={(e) => setNewTierTag(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Short description of what the ticket includes..."
                    value={newTierDescription}
                    onChange={(e) => setNewTierDescription(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Duration Toggle for New Tier */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                  <label className="flex items-center gap-2 text-xs text-amber-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTierIsLimited}
                      onChange={(e) => setNewTierIsLimited(e.target.checked)}
                      className="rounded bg-black border-neutral-700 text-amber-500 focus:ring-amber-500"
                    />
                    <Timer className="w-3.5 h-3.5" />
                    <span>Set Limited-Time Duration (Live Countdown Timer)</span>
                  </label>

                  {newTierIsLimited && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-neutral-400">Duration Preset:</span>
                      <select
                        value={newTierDurationHours}
                        onChange={(e) => setNewTierDurationHours(Number(e.target.value))}
                        className="bg-black border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      >
                        <option value={24}>24 Hours (1 Day)</option>
                        <option value={48}>48 Hours (2 Days)</option>
                        <option value={72}>72 Hours (3 Days)</option>
                        <option value={120}>5 Days</option>
                        <option value={168}>7 Days (1 Week)</option>
                        <option value={336}>14 Days (2 Weeks)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTierModal(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-red-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create & Publish Tier</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Editable Tiers List */}
          <div className="space-y-4">
            {editableTiers.map((tier, idx) => {
              const isGroup = tier.groupSize > 1;
              const isFlash = tier.id === 'flash-sale';
              const isEarlyBird = tier.id === 'early-bird';
              const durationStatus = getTierDurationRemainingText(tier.expiresAt);
              const isExpired = tier.isLimitedTime && tier.expiresAt && (new Date(tier.expiresAt).getTime() <= Date.now());

              return (
                <div 
                  key={tier.id}
                  className={`bg-neutral-900 border ${
                    isFlash 
                      ? 'border-amber-800/60' 
                      : isEarlyBird 
                      ? 'border-emerald-800/60' 
                      : 'border-neutral-800'
                  } rounded-2xl p-5 sm:p-6 space-y-4`}
                >
                  {/* Tier Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black text-red-400 border border-red-950 uppercase">
                        {tier.id}
                      </span>
                      <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                        {isFlash && <Zap className="w-4 h-4 text-amber-400" />}
                        {isEarlyBird && <Clock className="w-4 h-4 text-emerald-400" />}
                        <span>{tier.name}</span>
                      </h4>
                      {isGroup && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 font-bold">
                          Group of 6
                        </span>
                      )}
                      {tier.isLimitedTime && (
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          isExpired 
                            ? 'bg-red-950 text-red-300 border-red-800' 
                            : 'bg-amber-950 text-amber-300 border-amber-700'
                        }`}>
                          <Timer className="w-3 h-3" />
                          {durationStatus}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tier.active}
                          onChange={(e) => handleTierChange(idx, 'active', e.target.checked)}
                          className="rounded bg-black border-neutral-700 text-red-600 focus:ring-red-500"
                        />
                        <span>Active for Sale</span>
                      </label>

                      {editableTiers.length > 1 ? (
                        inlineConfirmTierId === tier.id ? (
                          <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-500 rounded-xl px-2 py-1 shadow-lg shadow-red-950">
                            <span className="text-[11px] font-extrabold text-red-200">Delete?</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTierDirectly(tier.id);
                              }}
                              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-[11px] cursor-pointer shadow transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setInlineConfirmTierId(null);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-white cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setInlineConfirmTierId(tier.id)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-400 bg-red-950/40 hover:bg-red-950/80 border border-red-800/60 hover:border-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                            title={`Delete ${tier.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            <span>Delete Tier</span>
                          </button>
                        )
                      ) : (
                        <span className="text-[11px] text-neutral-500 italic">
                          (Min 1 Tier Required)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tier Pricing & Capacity Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {/* Name Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                        Tier Display Name
                      </label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Price Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                        Sale Price in KES *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                          KES
                        </span>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => handleTierChange(idx, 'price', Number(e.target.value))}
                          className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-3 py-2 text-xs font-black text-white focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Original Price Input (Optional Strikethrough) */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                        Original Price (Strikethrough)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                          KES
                        </span>
                        <input
                          type="number"
                          placeholder="e.g. 1200"
                          value={tier.originalPrice || ''}
                          onChange={(e) => handleTierChange(idx, 'originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full bg-black border border-neutral-800 rounded-xl pl-11 pr-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Total Capacity / Seats */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                        Total Capacity / Seats *
                      </label>
                      <input
                        type="number"
                        value={tier.capacity}
                        onChange={(e) => handleTierChange(idx, 'capacity', Number(e.target.value))}
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none focus:border-red-500 font-mono"
                      />
                      <p className="text-[10px] text-neutral-500 mt-1">
                        {tier.sold} sold ({Math.max(0, tier.capacity - tier.sold)} remaining)
                      </p>
                    </div>
                  </div>

                  {/* Badge & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                        Card Tag / Promotion Pill
                      </label>
                      <input
                        type="text"
                        value={tier.tag || ''}
                        onChange={(e) => handleTierChange(idx, 'tag', e.target.value)}
                        placeholder="e.g. FLASH SALE (KES 900), EARLY BIRD"
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-300 mb-1">
                        Tier Description
                      </label>
                      <input
                        type="text"
                        value={tier.description}
                        onChange={(e) => handleTierChange(idx, 'description', e.target.value)}
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* TICKET BORDER & ACCENT COLOUR EDITOR */}
                  <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                        <Palette className="w-4 h-4 text-red-400" />
                        <span>Ticket Border, Badge & Glow Colour</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-neutral-400">Current:</span>
                        <span
                          style={{ backgroundColor: tier.accentColor || '#9e1b32' }}
                          className="w-4 h-4 rounded-full border border-white/30 inline-block shadow-sm"
                        />
                        <span className="text-[11px] font-mono font-bold text-white uppercase">
                          {tier.accentColor || '#9e1b32'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Luxury Color Palette Swatches */}
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[11px] font-mono text-neutral-400">
                        Quick Colour Presets:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {LUXURY_PALETTES.map((palette) => {
                          const currentHex = (tier.accentColor || (
                            tier.id === 'flash-sale' ? '#f59e0b' :
                            tier.id === 'early-bird' ? '#10b981' :
                            tier.id === 'vip' ? '#9e1b32' :
                            tier.id === 'group-6' ? '#f43f5e' : '#e5e5e5'
                          )).toLowerCase();
                          const isSelected = currentHex === palette.hex.toLowerCase();
                          return (
                            <button
                              key={palette.hex}
                              type="button"
                              onClick={() => handleUpdateTierColor(idx, palette.hex)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                isSelected
                                  ? 'border-white text-white shadow-lg bg-neutral-800 scale-105 ring-2 ring-white/20'
                                  : 'border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700'
                              }`}
                            >
                              <span
                                style={{ backgroundColor: palette.hex }}
                                className="w-3 h-3 rounded-full border border-white/20 shadow-sm"
                              />
                              <span>{palette.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Color Picker & Hex Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-900">
                      <div className="flex items-center gap-2.5 bg-neutral-950 border border-neutral-800 rounded-xl p-2">
                        <label className="text-xs font-bold text-neutral-400 shrink-0">Custom Colour Picker:</label>
                        <input
                          type="color"
                          value={tier.accentColor || '#9e1b32'}
                          onChange={(e) => handleUpdateTierColor(idx, e.target.value)}
                          className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-neutral-300">Click to pick any shade</span>
                      </div>

                      <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2">
                        <label className="text-xs font-bold text-neutral-400 shrink-0">HEX Code:</label>
                        <input
                          type="text"
                          value={tier.accentColor || '#9e1b32'}
                          onChange={(e) => handleUpdateTierColor(idx, e.target.value)}
                          placeholder="#9e1b32"
                          className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none uppercase"
                        />
                      </div>
                    </div>

                    {/* Live Mini Preview of the Ticket Card */}
                    <div
                      style={{
                        borderColor: tier.accentColor || '#9e1b32',
                        boxShadow: `0 10px 30px -10px ${(tier.accentColor || '#9e1b32')}40`
                      }}
                      className="p-3.5 rounded-xl border-2 bg-gradient-to-b from-neutral-950 to-black flex items-center justify-between gap-4 mt-2 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          style={{
                            backgroundColor: tier.accentColor || '#9e1b32',
                            color: ['#f59e0b', '#10b981', '#06b6d4', '#e5e5e5', '#ffffff'].includes((tier.accentColor || '#9e1b32').toLowerCase()) ? '#000' : '#fff'
                          }}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0"
                        >
                          {tier.tag || tier.name}
                        </span>
                        <div className="truncate">
                          <span className="text-xs font-black text-white">{tier.name}</span>
                          <span className="text-[11px] text-neutral-400 ml-2 font-mono">KES {tier.price.toLocaleString()}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          background: `linear-gradient(135deg, ${tier.accentColor || '#9e1b32'}, ${(tier.accentColor || '#9e1b32')}cc)`,
                          color: ['#f59e0b', '#10b981', '#06b6d4', '#e5e5e5', '#ffffff'].includes((tier.accentColor || '#9e1b32').toLowerCase()) ? '#000' : '#fff'
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-black tracking-wide shrink-0"
                      >
                        Buy Pass
                      </div>
                    </div>
                  </div>

                  {/* TICKET DURATION / LIVE COUNTDOWN CONTROLS */}
                  <div className="p-4 bg-black/60 border border-neutral-800 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-amber-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(tier.isLimitedTime)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            handleTierChange(idx, 'isLimitedTime', isChecked);
                            if (isChecked && !tier.expiresAt) {
                              setTierDurationHours(idx, 48); // default 48h
                            }
                          }}
                          className="rounded bg-black border-neutral-700 text-amber-500 focus:ring-amber-500"
                        />
                        <Timer className="w-4 h-4 text-amber-400" />
                        <span>Limited-Time Duration & Live Countdown Timer</span>
                      </label>

                      {tier.isLimitedTime && (
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          isExpired ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
                        }`}>
                          {isExpired ? 'Status: Expired / Ended' : `Status: Live (${durationStatus})`}
                        </span>
                      )}
                    </div>

                    {tier.isLimitedTime && (
                      <div className="space-y-3 pt-2 border-t border-neutral-900">
                        {/* Live Formatted Status Display */}
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-neutral-400 uppercase font-mono block">Current Expiration Schedule:</span>
                            <span className="font-semibold text-amber-300">
                              {formatReadableDateTime(tier.expiresAt)}
                            </span>
                          </div>
                        </div>

                        {/* Separate Date and Time Selectors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                              📅 Expiration Date:
                            </label>
                            <input
                              type="date"
                              value={getIsoDatePart(tier.expiresAt)}
                              onChange={(e) => handleUpdateDatePart(idx, e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                              ⏰ Expiration Time:
                            </label>
                            <input
                              type="time"
                              value={getIsoTimePart(tier.expiresAt)}
                              onChange={(e) => handleUpdateTimePart(idx, e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                            />
                          </div>
                        </div>

                        {/* Direct Text Date Input */}
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                            ✍️ Or Type Any Date & Time Format Directly:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 30/08/2026 23:59 or 30 August 2026 18:00"
                            defaultValue={tier.expiresAt ? (getIsoDatePart(tier.expiresAt) + ' ' + getIsoTimePart(tier.expiresAt)) : ''}
                            onBlur={(e) => handleUpdateDirectDateText(idx, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleUpdateDirectDateText(idx, (e.target as HTMLInputElement).value);
                              }
                            }}
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>

                        {/* Quick Date Selection Presets */}
                        <div className="space-y-1.5 pt-1">
                          <span className="block text-[11px] font-mono text-neutral-400">
                            Quick Date Presets:
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setTierSpecificDate(idx, 2026, 8, 30, 23, 59)}
                              className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/80 text-[11px] font-bold text-amber-300 border border-amber-800 transition-colors cursor-pointer"
                              title="Set to Event Date (30 Aug 2026 23:59)"
                            >
                              30 Aug 2026 (Show Day)
                            </button>
                            <button
                              type="button"
                              onClick={() => setTierDurationHours(idx, 24)}
                              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
                            >
                              +24h
                            </button>
                            <button
                              type="button"
                              onClick={() => setTierDurationHours(idx, 48)}
                              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
                            >
                              +48h
                            </button>
                            <button
                              type="button"
                              onClick={() => setTierDurationHours(idx, 72)}
                              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
                            >
                              +3 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => setTierDurationHours(idx, 168)}
                              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
                            >
                              +7 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => clearTierDuration(idx)}
                              className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-[11px] text-red-300 border border-red-800 transition-colors cursor-pointer"
                            >
                              Remove Timer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-2 border-t border-neutral-950 flex items-center justify-between text-xs text-neutral-500">
                    <span className="font-mono text-[10px]">Tier ID: {tier.id}</span>
                    {editableTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteTierDirectly(tier.id)}
                        className="text-[11px] text-red-500/80 hover:text-red-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove "{tier.name}" Tier</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowAddTierModal(true)}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 border border-neutral-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-red-400" />
              <span>Add Another Tier</span>
            </button>

            <button
              onClick={handleSaveTiers}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Apply Pricing, Durations & Seats Changes</span>
            </button>
          </div>
        </div>
        )
      )}

      {/* SUB-TAB 5: POCHI LA BIASHARA & EVENT SETTINGS */}
      {subTab === 'settings' && (
        !isAuthenticated ? (
          renderAdminLockScreen("Settings & Security")
        ) : (
        <div className="max-w-3xl space-y-6">
          <div className="pb-4 border-b border-neutral-800">
            <h3 className="text-xl font-black text-white font-display uppercase">
              M-Pesa Pochi la Biashara & Event Configuration
            </h3>
            <p className="text-xs text-neutral-400">
              Update your merchant Pochi phone number, business name, venue location, and access passcode.
            </p>
          </div>

          {settingsSavedAlert && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Event configuration saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5">
            
            <div className="text-xs uppercase font-extrabold tracking-wider text-red-400 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Pochi la Biashara Payment Destination
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-neutral-300">
                    Pochi Merchant Phone Number *
                  </label>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {editableSettings.pochiNumber.replace(/\D/g, '').length}/10 digits
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={editableSettings.pochiNumber}
                  onChange={(e) => setEditableSettings({ ...editableSettings, pochiNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="07XXXXXXXX"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500 tracking-wider"
                />
                <p className="text-[11px] text-neutral-500 mt-1">
                  10-digit Safaricom line that receives the direct Pochi funds.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Business / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={editableSettings.pochiName}
                  onChange={(e) => setEditableSettings({ ...editableSettings, pochiName: e.target.value })}
                  placeholder="LVL FASHION HOUSE"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="text-xs uppercase font-extrabold tracking-wider text-red-400 flex items-center gap-2 pt-4 border-t border-neutral-800">
              <Settings className="w-4 h-4" />
              Event Showcase Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={editableSettings.eventName}
                  onChange={(e) => setEditableSettings({ ...editableSettings, eventName: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Edition / Subtitle
                </label>
                <input
                  type="text"
                  value={editableSettings.edition}
                  onChange={(e) => setEditableSettings({ ...editableSettings, edition: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Event Date & Time Schedule
                </label>
                <input
                  type="text"
                  value={editableSettings.date}
                  onChange={(e) => setEditableSettings({ ...editableSettings, date: e.target.value })}
                  placeholder="e.g. 30 August 2026 • 6:00 PM - Late"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <span className="text-[10px] text-neutral-500 font-mono">Quick Date:</span>
                  <button
                    type="button"
                    onClick={() => setEditableSettings({ ...editableSettings, date: '30 August 2026 • 6:00 PM - Late' })}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
                  >
                    30 Aug 2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditableSettings({ ...editableSettings, date: '05 September 2026 • 6:00 PM - Late' })}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
                  >
                    05 Sept 2026
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditableSettings({ ...editableSettings, date: '12 September 2026 • 7:00 PM - Late' })}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
                  >
                    12 Sept 2026
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Venue & Address
                </label>
                <input
                  type="text"
                  value={editableSettings.venue}
                  onChange={(e) => setEditableSettings({ ...editableSettings, venue: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Dress Code
                </label>
                <input
                  type="text"
                  value={editableSettings.dressCode}
                  onChange={(e) => setEditableSettings({ ...editableSettings, dressCode: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Organiser Access Passcode
                </label>
                <input
                  type="text"
                  value={editableSettings.organiserPin}
                  onChange={(e) => setEditableSettings({ ...editableSettings, organiserPin: e.target.value })}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all demo data and restore initial prices?')) {
                    onResetData();
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Database</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>

          </form>
        </div>
        )
      )}

    </section>
  );
};
