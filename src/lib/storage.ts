import { AttendeeTicket, EventSettings, TicketTier } from '../types';
import { initialDemoTickets, initialEventSettings, initialTicketTiers } from '../data/initialData';

const SETTINGS_KEY = 'lvl_fashion_event_settings_v3';
const TIERS_KEY = 'lvl_fashion_ticket_tiers_v3';
const TICKETS_KEY = 'lvl_fashion_attendee_tickets_v3';

export function loadEventSettings(): EventSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) || localStorage.getItem('lvl_fashion_event_settings_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.organiserPin === '1234') {
        parsed.organiserPin = 'lvl.';
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load settings from storage', e);
  }
  return initialEventSettings;
}

export function saveEventSettings(settings: EventSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage', e);
  }
}

export function loadTicketTiers(): TicketTier[] {
  try {
    const rawV3 = localStorage.getItem(TIERS_KEY);
    if (rawV3) {
      return JSON.parse(rawV3);
    }
    const rawV2 = localStorage.getItem('lvl_fashion_ticket_tiers_v2');
    if (rawV2) {
      const parsed: TicketTier[] = JSON.parse(rawV2);
      const merged = [...initialTicketTiers];
      parsed.forEach(savedTier => {
        const idx = merged.findIndex(m => m.id === savedTier.id);
        if (idx !== -1) {
          merged[idx] = { ...merged[idx], ...savedTier };
        }
      });
      localStorage.setItem(TIERS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.error('Failed to load tiers from storage', e);
  }
  return initialTicketTiers;
}

export function saveTicketTiers(tiers: TicketTier[]): void {
  try {
    localStorage.setItem(TIERS_KEY, JSON.stringify(tiers));
  } catch (e) {
    console.error('Failed to save tiers to storage', e);
  }
}

export function loadTickets(): AttendeeTicket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('please wait : fetching ', e);
  }
  return initialDemoTickets;
}

export function saveTickets(tickets: AttendeeTicket[]): void {
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save tickets to storage', e);
  }
}

export function resetToDefaults(): { settings: EventSettings; tiers: TicketTier[]; tickets: AttendeeTicket[] } {
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem(TIERS_KEY);
  localStorage.removeItem(TICKETS_KEY);
  return {
    settings: initialEventSettings,
    tiers: initialTicketTiers,
    tickets: initialDemoTickets
  };
}
