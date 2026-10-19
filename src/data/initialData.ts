import { EventSettings, TicketTier, AttendeeTicket } from '../types';

export const initialEventSettings: EventSettings = {
  eventName: "METAMORPHOSIS: AUTUMN / WINTER 2026",
  tagline: "An avant-garde exploration of structural metamorphosis, fusing haute couture tailoring with the raw kinetic energy of Nairobi streetwear and contemporary African luxury.",
  edition: "ATELIER LVL KENYA • AW26",
  date: "Saturday, Apr. 18, 2026",
  time: "7:00 PM EAT",
  doorsOpen: "6:30 PM",
  venue: "Nairobi National Museum / Arts Pavilion",
  venueAddress: "Museum Hill, Kipande Rd, Nairobi, Kenya",
  city: "Nairobi",
  pochiNumber: "0712345678",
  pochiName: "ATELIER LVL (Pochi la Biashara)",
  currency: "KES",
  organiserPin: "lvl.",
  dressCode: "Avant-Garde Street Couture & Architectural Tailoring",
  bannerImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop"
};

const now = Date.now();
const defaultFlashSaleExpiry = new Date(now + 48 * 60 * 60 * 1000).toISOString(); // 48 hours from now
const defaultEarlyBirdExpiry = new Date(now + 6 * 24 * 60 * 60 * 1000).toISOString(); // 6 days from now

export const initialTicketTiers: TicketTier[] = [
  {
    id: "flash-sale",
    name: "Flash Sale Pass",
    price: 900,
    originalPrice: 1200,
    capacity: 60,
    sold: 38,
    description: "Ultra limited-time flash discount pass. General runway admission and after-party entry at our lowest promotional rate.",
    perks: [
      "Access to Main Runway Stage",
      "Designer Pop-up Showcase",
      "Digital Event Lookbook",
      "Official After-Party Entry",
      "Lowest Guaranteed Rate (Save KES 300)"
    ],
    groupSize: 1,
    badgeColor: "border-amber-600/80 text-amber-300 bg-amber-950/60",
    accentColor: "#f59e0b",
    tag: "FLASH SALE (KES 900)",
    active: true,
    isLimitedTime: true,
    expiresAt: defaultFlashSaleExpiry
  },
  {
    id: "early-bird",
    name: "Early Bird Pass",
    price: 1000,
    originalPrice: 1200,
    capacity: 120,
    sold: 74,
    description: "Special early bird admission for fashion enthusiasts reserving their spot ahead of the showcase.",
    perks: [
      "Access to Main Runway Stage",
      "Complimentary Welcome Drink",
      "Designer Pop-up & Exhibition Access",
      "Official After-Party Entry",
      "Early Admission Savings (Save KES 200)"
    ],
    groupSize: 1,
    badgeColor: "border-emerald-600/80 text-emerald-300 bg-emerald-950/60",
    accentColor: "#10b981",
    tag: "EARLY BIRD (KES 1,000)",
    active: true,
    isLimitedTime: true,
    expiresAt: defaultEarlyBirdExpiry
  },
  {
    id: "regular",
    name: "Regular Runway Pass",
    price: 1200,
    capacity: 250,
    sold: 142,
    description: "Standard access to the main runway hall, designer showcase booths, and the official after-party.",
    perks: [
      "Access to Main Runway Stage",
      "Designer Pop-up & Exhibition Access",
      "Digital Event Lookbook",
      "Official After-Party Entry"
    ],
    groupSize: 1,
    badgeColor: "border-neutral-700 text-neutral-300 bg-neutral-900/80",
    accentColor: "#a3a3a3",
    tag: "STANDARD",
    active: true
  },
  {
    id: "vip",
    name: "VIP Front Row Pass",
    price: 2000,
    capacity: 100,
    sold: 78,
    description: "Front-row catwalk seating with red carpet reception, welcome champagne cocktail, and VIP lounge access.",
    perks: [
      "Front-Row Runway Reserved Seating",
      "Red Carpet VIP Arrival & Photo Wall",
      "Complimentary Champagne & Canapés",
      "Exclusive VIP Lounge & Bar Access",
      "Curated LVL Designer Gift Tote"
    ],
    groupSize: 1,
    badgeColor: "border-red-600/80 text-red-300 bg-red-950/60",
    accentColor: "#9e1b32",
    tag: "VIP EXPERIENCE",
    active: true
  },
  {
    id: "group-6",
    name: "Squad Table (Group of 6)",
    price: 6300,
    capacity: 25, // 25 tables of 6 = 150 guests
    sold: 16,
    description: "Dedicated reserved high-table lounge for 6 people with premium bottle service and personalized hostess.",
    perks: [
      "Admits 6 Guests Together",
      "Dedicated Elevated VIP Table & Seating",
      "1x Bottle of Premium Wine / Sparkling Rosé",
      "Dedicated Cocktail Hostess",
      "Group Runway Photo Shoot with House Photographer",
      "Save KES 900 vs individual passes"
    ],
    groupSize: 6,
    badgeColor: "border-rose-700/80 text-rose-300 bg-rose-950/50",
    accentColor: "#f43f5e",
    tag: "GROUP VALUE (SAVE KES 900)",
    active: true
  }
];

export const initialDemoTickets: AttendeeTicket[] = [
  {
    id: "LVL-VIP-8492",
    tierId: "vip",
    tierName: "VIP Front Row Pass",
    customerName: "Amina Odhiambo",
    customerPhone: "0722123456",
    customerEmail: "amina.o@example.com",
    quantity: 1,
    admitCount: 1,
    totalAmount: 2000,
    paymentMethod: "mpesa_pochi",
    mpesaCode: "SL74KG89P1",
    mpesaPhone: "0722123456",
    pochiNumber: "0712345678",
    status: "confirmed",
    checkedIn: false,
    createdAt: "2026-08-26T14:23:00.000Z",
    attendeeNames: ["Amina Odhiambo"],
    specialRequests: "Dietary: Vegetarian cocktail"
  },
  {
    id: "LVL-REG-3190",
    tierId: "regular",
    tierName: "Regular Runway Pass",
    customerName: "Brian Mwangi",
    customerPhone: "0711987654",
    customerEmail: "brian.m@example.com",
    quantity: 2,
    admitCount: 2,
    totalAmount: 2400,
    paymentMethod: "mpesa_pochi",
    mpesaCode: "SL92MN41X7",
    mpesaPhone: "0711987654",
    pochiNumber: "0712345678",
    status: "confirmed",
    checkedIn: true,
    checkedInAt: "2026-08-27T00:15:30.000Z",
    checkedInBy: "Gate Scanner Alpha",
    createdAt: "2026-08-25T11:10:00.000Z",
    attendeeNames: ["Brian Mwangi", "Cynthia Wanjiru"]
  },
  {
    id: "LVL-GRP-7721",
    tierId: "group-6",
    tierName: "Squad Table (Group of 6)",
    customerName: "Zawadi Fashion Collective",
    customerPhone: "0733456789",
    customerEmail: "zawadi.collective@example.com",
    quantity: 1,
    admitCount: 6,
    totalAmount: 6300,
    paymentMethod: "mpesa_pochi",
    mpesaCode: "SL11JK04Q9",
    mpesaPhone: "0733456789",
    pochiNumber: "0712345678",
    status: "confirmed",
    checkedIn: false,
    createdAt: "2026-08-26T19:45:00.000Z",
    attendeeNames: [
      "Zawadi Kariuki",
      "Esther Ndunge",
      "Kevin Otieno",
      "Linda Chebet",
      "Felix Mutua",
      "Grace Achieng"
    ]
  }
];
