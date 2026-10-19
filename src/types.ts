export interface TicketTier {
  id: string;
  name: string;
  price: number; // in KES
  originalPrice?: number;
  capacity: number;
  sold: number;
  description: string;
  perks: string[];
  groupSize: number; // 1 for single, 6 for group of 6
  badgeColor: string;
  tag?: string;
  active: boolean;
  accentColor?: string; // Hex color (e.g. #9e1b32, #f59e0b, #10b981) or theme key
  borderColor?: string;
  isLimitedTime?: boolean;
  expiresAt?: string; // ISO date-time string when ticket sale ends
  saleStart?: string;
}

export interface AttendeeTicket {
  id: string; // e.g. "LVL-VIP-8492"
  tierId: string;
  tierName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  quantity: number; // number of packages bought
  admitCount: number; // total people admitted (e.g., 6 for group)
  totalAmount: number; // in KES
  paymentMethod: 'mpesa_pochi' | 'mpesa_stk';
  mpesaCode: string; // e.g. "SL98PQ42LK"
  mpesaPhone: string;
  pochiNumber: string;
  status: 'confirmed' | 'pending' | 'refunded';
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  createdAt: string;
  attendeeNames?: string[];
  specialRequests?: string;
}

export interface EventSettings {
  eventName: string;
  tagline: string;
  edition: string;
  date: string;
  time: string;
  doorsOpen: string;
  venue: string;
  venueAddress: string;
  city: string;
  pochiNumber: string;
  pochiName: string;
  currency: string;
  organiserPin: string;
  dressCode: string;
  bannerImage: string;
}

export interface ScanResult {
  status: 'success' | 'already_used' | 'invalid' | 'idle';
  message: string;
  ticket?: AttendeeTicket;
  timestamp: string;
}
