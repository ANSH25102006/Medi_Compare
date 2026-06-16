import { getItemSafe } from "./storage";

export type Hospital = {
  id: string;
  name: string;
  type: string;
  image: string;
  rating: number;
  reviews: number;
  distance: number;
  address: string;
  phone: string;
  city: string;
  specialties: string[];
  services: { name: string; price: number; duration: string }[];
  doctors: { name: string; specialty: string; experience: number; avatar: string }[];
  slots: string[];
  about: string;
};

const img = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

const avatar = (n: number) => `https://i.pravatar.cc/120?img=${n}`;

export const hospitalDefaults: Record<
  string,
  {
    type: string;
    distance: number;
    specialties: string[];
    services: { name: string; price: number; duration: string }[];
    doctors: { name: string; specialty: string; experience: number; avatar: string }[];
    slots: string[];
    reviewsCount: number;
    rating: number;
  }
> = {
  "apollo-central": {
    type: "Specialty Hospital",
    distance: 1.2,
    reviewsCount: 2143,
    rating: 4.8,
    specialties: ["Cardiology", "Oncology", "Neurology"],
    services: [
      { name: "Full Body Health Checkup", price: 4500, duration: "2 hrs" },
      { name: "MRI Scan", price: 7800, duration: "45 min" },
      { name: "Cardiac Consultation", price: 1200, duration: "30 min" },
      { name: "Blood Test Panel", price: 850, duration: "15 min" },
    ],
    doctors: [
      { name: "Dr. Anjali Mehra", specialty: "Cardiologist", experience: 18, avatar: avatar(47) },
      { name: "Dr. Rohan Kapoor", specialty: "Neurologist", experience: 14, avatar: avatar(12) },
    ],
    slots: ["09:00", "10:30", "12:00", "14:30", "16:00", "17:30"],
  },
  "fortis-greens": {
    type: "Medical Center",
    distance: 2.8,
    reviewsCount: 1856,
    rating: 4.7,
    specialties: ["Orthopedics", "Pediatrics", "Radiology"],
    services: [
      { name: "Full Body Health Checkup", price: 3900, duration: "2 hrs" },
      { name: "MRI Scan", price: 7200, duration: "45 min" },
      { name: "Orthopedic Consultation", price: 1000, duration: "30 min" },
      { name: "Ultrasound", price: 1500, duration: "25 min" },
    ],
    doctors: [
      {
        name: "Dr. Vikram Shah",
        specialty: "Orthopedic Surgeon",
        experience: 22,
        avatar: avatar(33),
      },
      { name: "Dr. Neha Iyer", specialty: "Pediatrician", experience: 11, avatar: avatar(45) },
    ],
    slots: ["08:30", "10:00", "11:30", "15:00", "16:30"],
  },
  "max-superspecialty": {
    type: "Super Speciality",
    distance: 4.5,
    reviewsCount: 3120,
    rating: 4.9,
    specialties: ["Oncology", "Transplants", "Cardiac"],
    services: [
      { name: "Full Body Health Checkup", price: 5200, duration: "2.5 hrs" },
      { name: "CT Scan", price: 5400, duration: "30 min" },
      { name: "Oncology Consultation", price: 1800, duration: "45 min" },
      { name: "ECG", price: 450, duration: "15 min" },
    ],
    doctors: [
      { name: "Dr. Sameer Rao", specialty: "Oncologist", experience: 20, avatar: avatar(60) },
      { name: "Dr. Priya Nair", specialty: "Cardiologist", experience: 16, avatar: avatar(48) },
    ],
    slots: ["09:30", "11:00", "13:00", "15:30", "17:00"],
  },
  "manipal-city": {
    type: "General Hospital",
    distance: 3.1,
    reviewsCount: 1442,
    rating: 4.6,
    specialties: ["Gastroenterology", "ENT", "Dermatology"],
    services: [
      { name: "Full Body Health Checkup", price: 4100, duration: "2 hrs" },
      { name: "Endoscopy", price: 6200, duration: "40 min" },
      { name: "Dermatology Consultation", price: 900, duration: "20 min" },
      { name: "Lipid Profile", price: 600, duration: "10 min" },
    ],
    doctors: [
      {
        name: "Dr. Karthik Reddy",
        specialty: "Gastroenterologist",
        experience: 13,
        avatar: avatar(15),
      },
      { name: "Dr. Aisha Khan", specialty: "Dermatologist", experience: 9, avatar: avatar(32) },
    ],
    slots: ["09:00", "10:30", "12:30", "14:00", "16:00"],
  },
  kokilaben: {
    type: "Super Speciality",
    distance: 5.4,
    reviewsCount: 2580,
    rating: 4.8,
    specialties: ["Neurosurgery", "Cardiac", "Transplants"],
    services: [
      { name: "Full Body Health Checkup", price: 5800, duration: "3 hrs" },
      { name: "MRI Scan", price: 8200, duration: "45 min" },
      { name: "Neurology Consultation", price: 2000, duration: "40 min" },
      { name: "Echocardiogram", price: 2500, duration: "30 min" },
    ],
    doctors: [
      { name: "Dr. Suresh Pillai", specialty: "Neurosurgeon", experience: 25, avatar: avatar(52) },
      { name: "Dr. Maya Banerjee", specialty: "Cardiologist", experience: 17, avatar: avatar(20) },
    ],
    slots: ["08:00", "09:30", "11:30", "14:00", "16:30"],
  },
  medanta: {
    type: "Super Speciality",
    distance: 6.2,
    reviewsCount: 1980,
    rating: 4.7,
    specialties: ["Cardiac", "Orthopedics", "Liver"],
    services: [
      { name: "Full Body Health Checkup", price: 4800, duration: "2.5 hrs" },
      { name: "CT Scan", price: 5600, duration: "30 min" },
      { name: "Orthopedic Consultation", price: 1100, duration: "30 min" },
      { name: "Liver Function Test", price: 700, duration: "10 min" },
    ],
    doctors: [
      { name: "Dr. Anil Verma", specialty: "Cardiac Surgeon", experience: 28, avatar: avatar(56) },
      { name: "Dr. Ritu Sharma", specialty: "Hepatologist", experience: 15, avatar: avatar(41) },
    ],
    slots: ["09:00", "10:00", "12:00", "15:00", "17:00"],
  },
  "apollo-chennai": {
    type: "Specialty Hospital",
    distance: 2.5,
    reviewsCount: 1680,
    rating: 4.7,
    specialties: ["Oncology", "Cardiology", "Neurology"],
    services: [
      { name: "Full Body Health Checkup", price: 4600, duration: "2 hrs" },
      { name: "MRI Scan", price: 7500, duration: "45 min" },
      { name: "Cardiac Consultation", price: 1100, duration: "30 min" },
      { name: "Blood Test Panel", price: 800, duration: "15 min" },
    ],
    doctors: [
      { name: "Dr. Suresh Raman", specialty: "Oncologist", experience: 19, avatar: avatar(51) },
      {
        name: "Dr. Priya Vasudevan",
        specialty: "Cardiologist",
        experience: 15,
        avatar: avatar(36),
      },
    ],
    slots: ["09:00", "10:30", "14:00", "15:30", "17:00"],
  },
  "fortis-malar-chennai": {
    type: "General Hospital",
    distance: 4.2,
    reviewsCount: 1120,
    rating: 4.5,
    specialties: ["Cardiology", "Pediatrics", "Gynecology"],
    services: [
      { name: "Full Body Health Checkup", price: 3800, duration: "2 hrs" },
      { name: "Ultrasound", price: 1400, duration: "25 min" },
      { name: "Orthopedic Consultation", price: 1000, duration: "30 min" },
      { name: "Blood Test Panel", price: 750, duration: "15 min" },
    ],
    doctors: [
      { name: "Dr. Rajesh Iyer", specialty: "Cardiologist", experience: 16, avatar: avatar(24) },
      { name: "Dr. Neha Sharma", specialty: "Pediatrician", experience: 12, avatar: avatar(28) },
    ],
    slots: ["08:30", "10:00", "11:30", "15:00", "16:30"],
  },
  "care-hyderabad": {
    type: "Specialty Hospital",
    distance: 3.4,
    reviewsCount: 1250,
    rating: 4.6,
    specialties: ["Cardiology", "Nephrology", "Orthopedics"],
    services: [
      { name: "Full Body Health Checkup", price: 3500, duration: "2 hrs" },
      { name: "MRI Scan", price: 7000, duration: "45 min" },
      { name: "Cardiac Consultation", price: 900, duration: "30 min" },
      { name: "Ultrasound", price: 1200, duration: "25 min" },
    ],
    doctors: [
      { name: "Dr. K. S. Rao", specialty: "Cardiologist", experience: 15, avatar: avatar(59) },
      {
        name: "Dr. V. Srinivas",
        specialty: "Orthopedic Surgeon",
        experience: 17,
        avatar: avatar(18),
      },
    ],
    slots: ["09:00", "10:30", "12:00", "14:30", "16:00"],
  },
  "continental-hyderabad": {
    type: "Super Speciality",
    distance: 5.1,
    reviewsCount: 980,
    rating: 4.8,
    specialties: ["Gastroenterology", "Oncology", "Pulmonology"],
    services: [
      { name: "Full Body Health Checkup", price: 4200, duration: "2.5 hrs" },
      { name: "CT Scan", price: 5000, duration: "30 min" },
      { name: "Blood Test Panel", price: 600, duration: "10 min" },
      { name: "Endoscopy", price: 5800, duration: "40 min" },
    ],
    doctors: [
      {
        name: "Dr. Sandeep Prasad",
        specialty: "Gastroenterologist",
        experience: 12,
        avatar: avatar(42),
      },
      { name: "Dr. Arundhati Sen", specialty: "Oncologist", experience: 14, avatar: avatar(31) },
    ],
    slots: ["09:30", "11:00", "13:00", "15:30", "17:00"],
  },
  "fortis-bangalore": {
    type: "Super Speciality",
    distance: 3.5,
    reviewsCount: 2210,
    rating: 4.8,
    specialties: ["Cardiology", "Orthopedics", "Neurology"],
    services: [
      { name: "Full Body Health Checkup", price: 4300, duration: "2 hrs" },
      { name: "MRI Scan", price: 7600, duration: "45 min" },
      { name: "Cardiac Consultation", price: 1100, duration: "30 min" },
      { name: "Ultrasound", price: 1450, duration: "25 min" },
    ],
    doctors: [
      {
        name: "Dr. Vivek Jawali",
        specialty: "Cardiothoracic Surgeon",
        experience: 32,
        avatar: avatar(54),
      },
      {
        name: "Dr. Sandeep Vaishya",
        specialty: "Neurosurgeon",
        experience: 21,
        avatar: avatar(55),
      },
    ],
    slots: ["09:00", "10:00", "12:00", "14:30", "16:00"],
  },
};

export function getFallbackHospitalDefaults(id: string, name: string, city: string) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const distance = Math.round((1.0 + (hash % 80) / 10) * 10) / 10;
  const rating = Math.round((4.0 + (hash % 10) / 10) * 10) / 10;
  const reviewsCount = 100 + (hash % 900);

  return {
    type: "General Hospital",
    distance,
    rating,
    reviewsCount,
    specialties: ["General Medicine", "Pediatrics", "Radiology"],
    services: [
      { name: "Full Body Health Checkup", price: 3000 + (hash % 20) * 100, duration: "2 hrs" },
      { name: "MRI Scan", price: 7000 + (hash % 15) * 100, duration: "45 min" },
      { name: "Cardiac Consultation", price: 800 + (hash % 10) * 50, duration: "30 min" },
      { name: "Blood Test Panel", price: 500 + (hash % 10) * 30, duration: "15 min" },
    ],
    doctors: [
      {
        name: "Dr. Rajesh Sen",
        specialty: "General Physician",
        experience: 10 + (hash % 15),
        avatar: avatar(hash % 70),
      },
    ],
    slots: ["09:00", "10:30", "14:00", "16:00"],
  };
}

export function getSlugFromName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("omr")) return "apollo-chennai";
  if (n.includes("apollo specialty") || n.includes("apollo specialty hospital"))
    return "apollo-central";
  if (n.includes("fortis greens")) return "fortis-greens";
  if (n.includes("max super speciality") || n.includes("saket")) return "max-superspecialty";
  if (n.includes("manipal city")) return "manipal-city";
  if (n.includes("kokilaben")) return "kokilaben";
  if (n.includes("medanta")) return "medanta";
  if (n.includes("fortis malar")) return "fortis-malar-chennai";
  if (n.includes("care hospital")) return "care-hyderabad";
  if (n.includes("continental")) return "continental-hyderabad";
  if (n.includes("fortis hospital") && (n.includes("bannerghatta") || n.includes("bangalore")))
    return "fortis-bangalore";
  return n.replace(/[^a-z0-9]+/g, "-");
}

export function mapSupabaseHospital(db: any): Hospital {
  if (!db) return {} as Hospital;
  const id = db.id;
  const name = db.name || "Unnamed Hospital";
  const city = db.city || "Unknown";
  const rating = db.rating ? Number(db.rating) : 4.5;
  const image =
    db.image_url ||
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80";
  const about = db.description || "Healthcare facility delivering quality care.";
  const address = db.address || "Main Street, " + city;
  const phone = db.phone || "+91 80 1234 5678";

  const slug = getSlugFromName(name);
  const defaults =
    hospitalDefaults[id] || hospitalDefaults[slug] || getFallbackHospitalDefaults(id, name, city);

  return {
    id,
    name,
    city,
    rating,
    image,
    about,
    address,
    phone,
    reviews: defaults.reviewsCount,
    type: defaults.type,
    distance: defaults.distance,
    specialties: defaults.specialties,
    services: defaults.services,
    doctors: defaults.doctors,
    slots: defaults.slots,
  };
}

export const services = [
  "Full Body Health Checkup",
  "MRI Scan",
  "CT Scan",
  "Cardiac Consultation",
  "Blood Test Panel",
  "Orthopedic Consultation",
  "Dermatology Consultation",
  "Endoscopy",
  "ECG",
  "Ultrasound",
];

export const cities = [
  "Bengaluru",
  "Mumbai",
  "New Delhi",
  "Gurugram",
  "Noida",
  "Hyderabad",
  "Chennai",
];

export const testimonials = [
  {
    name: "Ananya Sharma",
    role: "Patient",
    avatar: avatar(25),
    text: "MediCompare saved me 40% on my MRI scan. The booking process was effortless and the hospital was top-notch.",
  },
  {
    name: "Rahul Verma",
    role: "Patient",
    avatar: avatar(11),
    text: "Finally a transparent way to compare hospital prices. I trusted the reviews and had a great experience.",
  },
  {
    name: "Dr. Kavita Iyer",
    role: "Cardiologist",
    avatar: avatar(49),
    text: "As a provider, MediCompare helps us reach patients who value transparency and quality care.",
  },
];

export const faqs = [
  {
    q: "Is MediCompare free to use?",
    a: "Yes, comparing prices and browsing hospital information is completely free for patients.",
  },
  {
    q: "How are hospital prices verified?",
    a: "We work directly with partner hospitals and validate pricing every 30 days through our clinical operations team.",
  },
  {
    q: "Can I cancel an appointment?",
    a: "Yes, you can cancel or reschedule any appointment up to 4 hours before the scheduled time, free of charge.",
  },
  {
    q: "Are the reviews authentic?",
    a: "Every review on MediCompare is tied to a verified appointment booking on our platform.",
  },
  {
    q: "Do you offer insurance support?",
    a: "Many partner hospitals accept leading insurance providers. You can filter by insurance coverage on the search page.",
  },
];

export const partners = [
  "Apollo",
  "Fortis",
  "Max Healthcare",
  "Manipal",
  "Medanta",
  "Kokilaben",
  "AIIMS",
  "Narayana",
];

export const userAppointments = [
  {
    id: "A-1024",
    date: "2026-06-12",
    hospital: "Apollo Specialty Hospital",
    service: "Cardiac Consultation",
    status: "Upcoming" as const,
  },
  {
    id: "A-1019",
    date: "2026-06-04",
    hospital: "Fortis Greens Medical Center",
    service: "MRI Scan",
    status: "Confirmed" as const,
  },
  {
    id: "A-0998",
    date: "2026-05-21",
    hospital: "Manipal City Hospital",
    service: "Full Body Checkup",
    status: "Completed" as const,
  },
  {
    id: "A-0976",
    date: "2026-05-09",
    hospital: "Max Super Speciality",
    service: "Blood Test Panel",
    status: "Completed" as const,
  },
  {
    id: "A-0951",
    date: "2026-04-28",
    hospital: "Medanta The Medicity",
    service: "Orthopedic Consultation",
    status: "Cancelled" as const,
  },
];

export const adminAppointmentsTrend = [
  { month: "Jan", appointments: 320, revenue: 480000 },
  { month: "Feb", appointments: 410, revenue: 612000 },
  { month: "Mar", appointments: 388, revenue: 580000 },
  { month: "Apr", appointments: 502, revenue: 745000 },
  { month: "May", appointments: 612, revenue: 910000 },
  { month: "Jun", appointments: 698, revenue: 1042000 },
];

export const servicePopularity = [
  { service: "Health Checkup", bookings: 412 },
  { service: "MRI Scan", bookings: 286 },
  { service: "Cardiac Consult", bookings: 244 },
  { service: "Blood Test", bookings: 198 },
  { service: "Dermatology", bookings: 156 },
];

// ---- Price comparison helpers ----
export function getServiceAverage(serviceName: string, customList?: Hospital[]): number {
  const list = getCachedOrDefaultHospitals(customList);
  const prices = list.flatMap((h) =>
    h.services.filter((s) => s.name === serviceName).map((s) => s.price),
  );
  if (!prices.length) return 0;
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
}

export function getServiceMin(serviceName: string, customList?: Hospital[]): number {
  const list = getCachedOrDefaultHospitals(customList);
  const prices = list.flatMap((h) =>
    h.services.filter((s) => s.name === serviceName).map((s) => s.price),
  );
  return prices.length ? Math.min(...prices) : 0;
}

export type PopularService = {
  slug: string;
  name: string;
  icon: string; // lucide icon name
  startingAt: number;
  bookings: string;
  bookingCount: number;
  tint: string;
};

export const popularServices: PopularService[] = [
  {
    slug: "mri",
    name: "MRI Scan",
    icon: "Brain",
    startingAt: 7200,
    bookings: "2.4k",
    bookingCount: 2400,
    tint: "from-blue-500/15 to-blue-500/0",
  },
  {
    slug: "ct",
    name: "CT Scan",
    icon: "ScanLine",
    startingAt: 5400,
    bookings: "1.8k",
    bookingCount: 1800,
    tint: "from-indigo-500/15 to-indigo-500/0",
  },
  {
    slug: "blood",
    name: "Blood Test",
    icon: "TestTube",
    startingAt: 600,
    bookings: "5.1k",
    bookingCount: 5100,
    tint: "from-rose-500/15 to-rose-500/0",
  },
  {
    slug: "xray",
    name: "X-Ray",
    icon: "Bone",
    startingAt: 800,
    bookings: "3.2k",
    bookingCount: 3200,
    tint: "from-cyan-500/15 to-cyan-500/0",
  },
  {
    slug: "ultrasound",
    name: "Ultrasound",
    icon: "Activity",
    startingAt: 1500,
    bookings: "2.0k",
    bookingCount: 2000,
    tint: "from-violet-500/15 to-violet-500/0",
  },
  {
    slug: "ecg",
    name: "ECG",
    icon: "HeartPulse",
    startingAt: 450,
    bookings: "4.4k",
    bookingCount: 4400,
    tint: "from-pink-500/15 to-pink-500/0",
  },
  {
    slug: "dental",
    name: "Dental Care",
    icon: "Smile",
    startingAt: 500,
    bookings: "3.7k",
    bookingCount: 3700,
    tint: "from-amber-500/15 to-amber-500/0",
  },
  {
    slug: "fullbody",
    name: "Full Body Checkup",
    icon: "Stethoscope",
    startingAt: 3900,
    bookings: "6.0k",
    bookingCount: 6000,
    tint: "from-emerald-500/15 to-emerald-500/0",
  },
];

export const recentSearches = [
  { id: "rs-1", query: "MRI Scan", location: "Bengaluru", when: "2 days ago" },
  { id: "rs-2", query: "Cardiac Consultation", location: "Mumbai", when: "5 days ago" },
  { id: "rs-3", query: "Full Body Checkup", location: "Gurugram", when: "1 week ago" },
];

export const medicalRecords = [
  {
    id: "mr-1",
    name: "MRI Brain Report.pdf",
    date: "May 14, 2026",
    size: "1.4 MB",
    type: "Radiology",
  },
  {
    id: "mr-2",
    name: "Blood Panel Results.pdf",
    date: "May 02, 2026",
    size: "320 KB",
    type: "Pathology",
  },
  {
    id: "mr-3",
    name: "Cardiology Consult Notes.pdf",
    date: "Apr 18, 2026",
    size: "210 KB",
    type: "Consultation",
  },
  {
    id: "mr-4",
    name: "Prescription_Apollo.pdf",
    date: "Apr 10, 2026",
    size: "98 KB",
    type: "Prescription",
  },
];

export const savingsTrend = [
  { m: "Jan", saved: 1200 },
  { m: "Feb", saved: 1800 },
  { m: "Mar", saved: 900 },
  { m: "Apr", saved: 2400 },
  { m: "May", saved: 3100 },
  { m: "Jun", saved: 4200 },
];

export const healthSpendingBreakdown = [
  { name: "Consultations", value: 40, fill: "oklch(0.60 0.17 250)" },
  { name: "Diagnostics", value: 35, fill: "oklch(0.70 0.13 200)" },
  { name: "Medicines", value: 25, fill: "oklch(0.66 0.16 160)" },
];

export const aiRecommendation = {
  query: "Affordable MRI scan near Bengaluru with same-day availability",
  hospitalId: "fortis-greens",
  service: "MRI Scan",
  confidence: 94,
  matchReasons: ["Best Price", "Available Today", "Nearest"],
  rationale:
    "Best balance of price, 4.7★ rating and availability within 5km. ~₹1,300 below the city average.",
};

export const aiAlternatives = [
  {
    query: "Best cardiac hospital in Mumbai with top-rated cardiologist",
    hospitalId: "kokilaben",
    service: "Echocardiogram",
    confidence: 91,
    matchReasons: ["High Rating", "Top Hospital", "Quick Slots"],
    rationale:
      "Kokilaben leads cardiac care in Mumbai with the highest rating (4.8★) and same-day slots.",
  },
  {
    query: "Full body checkup under ₹4000 in Noida",
    hospitalId: "fortis-greens",
    service: "Full Body Health Checkup",
    confidence: 88,
    matchReasons: ["Lowest Price", "Available Today", "Nearest"],
    rationale:
      "Fortis Greens offers the lowest full-body checkup price (₹3,900) with 5 slots available today.",
  },
  {
    query: "CT scan with quick results near Delhi",
    hospitalId: "max-superspecialty",
    service: "CT Scan",
    confidence: 96,
    matchReasons: ["Highest Rated", "Same-day Slots", "Insurance Covered"],
    rationale:
      "Max Super Speciality has the highest rating (4.9★) and fastest CT turnaround in New Delhi.",
  },
];

// ---- Additional price helpers ----
export function getServiceMax(serviceName: string, customList?: Hospital[]): number {
  const list = getCachedOrDefaultHospitals(customList);
  const prices = list.flatMap((h) =>
    h.services.filter((s) => s.name === serviceName).map((s) => s.price),
  );
  return prices.length ? Math.max(...prices) : 0;
}

export function getHospitalCountForService(serviceName: string, customList?: Hospital[]): number {
  const list = getCachedOrDefaultHospitals(customList);
  return list.filter((h) => h.services.some((s) => s.name === serviceName)).length;
}

// ---- Unified Review Persistence & Rating Math Utilities ----

export type PatientReview = {
  id: string;
  hospitalId: string;
  hospitalName: string;
  userName: string;
  userEmail: string;
  rating: number;
  text: string;
  date: string;
};

export const defaultHospitalReviews: Record<
  string,
  { name: string; text: string; rating: number; date: string }[]
> = {
  "apollo-central": [
    {
      name: "Pooja S.",
      text: "Quick admission, professional staff and the surgery was a complete success.",
      rating: 5,
      date: "10 May 2026",
    },
    {
      name: "Arjun K.",
      text: "Pricing was clear from MediCompare and matched what the hospital charged.",
      rating: 5,
      date: "15 May 2026",
    },
    {
      name: "Meera D.",
      text: "Very clean facility and the consultation was thorough.",
      rating: 4,
      date: "20 May 2026",
    },
  ],
  "fortis-greens": [
    {
      name: "Rajesh M.",
      text: "Very supportive doctors. The MRI scan was done quickly and reports were sent online.",
      rating: 4,
      date: "12 May 2026",
    },
    {
      name: "Sunita R.",
      text: "NABL accreditation is visible in hygiene and processes. Highly satisfied.",
      rating: 5,
      date: "18 May 2026",
    },
  ],
  "max-superspecialty": [
    {
      name: "Vikram A.",
      text: "Top-class equipment. The oncology consultation was detailed and helpful.",
      rating: 5,
      date: "09 May 2026",
    },
    {
      name: "Sneha J.",
      text: "Highly professional service. Rates matched exactly with MediCompare listings.",
      rating: 5,
      date: "24 May 2026",
    },
    {
      name: "Anil K.",
      text: "Very neat, but slightly long waiting times in the OPD department.",
      rating: 4,
      date: "01 Jun 2026",
    },
  ],
  "manipal-city": [
    {
      name: "Kiran P.",
      text: "Excellent diagnostic center. Dr. Aisha Khan is highly skilled and detailed.",
      rating: 5,
      date: "14 May 2026",
    },
    {
      name: "Gaurav S.",
      text: "Budget-friendly checkups. Smooth checkin and fast results.",
      rating: 4,
      date: "28 May 2026",
    },
  ],
  kokilaben: [
    {
      name: "Hasmukh Patel",
      text: "Amazing quaternary care facility. Advanced surgical care was excellent.",
      rating: 5,
      date: "04 May 2026",
    },
    {
      name: "Kirti S.",
      text: "World class doctors. Pricing was highly transparent.",
      rating: 5,
      date: "16 May 2026",
    },
  ],
  medanta: [
    {
      name: "Vicky S.",
      text: "Very large medical city, well managed. Got consultation from Dr. Anil Verma.",
      rating: 5,
      date: "11 May 2026",
    },
    {
      name: "Ruchi T.",
      text: "Affordable full body health checkup package. Friendly support staff.",
      rating: 4,
      date: "22 May 2026",
    },
  ],
};

export function getCachedOrDefaultHospitals(customList?: Hospital[]): Hospital[] {
  if (customList && customList.length > 0) {
    return customList;
  }
  try {
    const cached = getItemSafe<any[]>("medicompare_hospitals_cache", []);
    if (cached && cached.length > 0) {
      return cached.map(mapSupabaseHospital);
    }
  } catch (e) {
    // ignore cache retrieval errors
  }

  const baseKeys = Object.keys(hospitalDefaults);
  const defaultNames: Record<string, string> = {
    "apollo-central": "Apollo Specialty Hospital",
    "fortis-greens": "Fortis Greens Medical Center",
    "max-superspecialty": "Max Super Speciality Hospital",
    "manipal-city": "Manipal City Hospital",
    kokilaben: "Kokilaben Dhirubhai Ambani Hospital",
    medanta: "Medanta The Medicity",
    "apollo-chennai": "Apollo Specialty Hospital, OMR",
    "fortis-malar-chennai": "Fortis Malar Hospital",
    "care-hyderabad": "Care Hospitals, Banjara Hills",
    "continental-hyderabad": "Continental Hospitals",
    "fortis-bangalore": "Fortis Hospital, Bannerghatta Road",
  };
  return baseKeys.map((id) => {
    return mapSupabaseHospital({
      id,
      name: defaultNames[id] || id,
      city: id.includes("chennai")
        ? "Chennai"
        : id.includes("hyderabad")
          ? "Hyderabad"
          : id.includes("greens")
            ? "Noida"
            : id.includes("superspecialty")
              ? "New Delhi"
              : id.includes("medanta")
                ? "Gurugram"
                : id.includes("kokilaben")
                  ? "Mumbai"
                  : "Bengaluru",
      rating: hospitalDefaults[id].rating,
      image_url: `https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80`,
      description: "Default mock hospital information.",
      address: "Main Street",
      phone: "+91 80 1234 5678",
    });
  });
}

export function getHospitalIdByName(name: string, customList?: Hospital[]): string {
  const list = getCachedOrDefaultHospitals(customList);
  const h = list.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.id : "unknown";
}

export function getHospitalNameById(id: string, customList?: Hospital[]): string {
  const list = getCachedOrDefaultHospitals(customList);
  const h = list.find((x) => x.id === id);
  return h ? h.name : "Unknown Hospital";
}

export function getHospitalRatingDetails(
  hospitalId: string,
  customList?: Hospital[],
): {
  rating: number;
  reviewsCount: number;
} {
  const list = getCachedOrDefaultHospitals(customList);
  const h = list.find((x) => x.id === hospitalId);
  if (!h) return { rating: 0, reviewsCount: 0 };

  const storedReviews = getItemSafe<PatientReview[]>("medicompare_reviews", []);
  const customReviews = storedReviews.filter(
    (r: PatientReview) => r.hospitalId === hospitalId || r.hospitalName === h.name,
  );

  const N_0 = h.reviews;
  const R_0 = h.rating;
  const N_custom = customReviews.length;
  const sum_custom = customReviews.reduce((sum, r) => sum + r.rating, 0);

  const totalReviews = N_0 + N_custom;
  const averageRating =
    totalReviews > 0 ? Math.round(((R_0 * N_0 + sum_custom) / totalReviews) * 10) / 10 : R_0;

  return { rating: averageRating, reviewsCount: totalReviews };
}

export function getReviewsForHospital(
  hospitalId: string,
  customList?: Hospital[],
): PatientReview[] {
  const list = getCachedOrDefaultHospitals(customList);
  const h = list.find((x) => x.id === hospitalId);
  if (!h) return [];

  // 1. Get base reviews
  const base = (
    defaultHospitalReviews[hospitalId] || [
      {
        name: "Priya S.",
        text: "Great consultation and clean facility. Verified pricing.",
        rating: 5,
        date: "10 Jun 2026",
      },
    ]
  ).map((r, i) => ({
    id: `default-${hospitalId}-${i}`,
    hospitalId,
    hospitalName: h.name,
    userName: r.name,
    userEmail: "anonymous@example.com",
    rating: r.rating,
    text: r.text,
    date: r.date,
  }));

  // 2. Get custom reviews
  const storedReviews = getItemSafe<PatientReview[]>("medicompare_reviews", []);
  const custom = storedReviews.filter(
    (r: PatientReview) => r.hospitalId === hospitalId || r.hospitalName === h.name,
  );

  return [...custom, ...base];
}

export function getAllReviews(customList?: Hospital[]): PatientReview[] {
  const list = getCachedOrDefaultHospitals(customList);
  const custom = getItemSafe<PatientReview[]>("medicompare_reviews", []);

  const base: PatientReview[] = [];
  list.forEach((h) => {
    const reviews = defaultHospitalReviews[h.id] || [
      {
        name: "Priya S.",
        text: "Great consultation and clean facility. Verified pricing.",
        rating: 5,
        date: "10 Jun 2026",
      },
    ];
    reviews.forEach((r, i) => {
      base.push({
        id: `default-${h.id}-${i}`,
        hospitalId: h.id,
        hospitalName: h.name,
        userName: r.name,
        userEmail: "anonymous@example.com",
        rating: r.rating,
        text: r.text,
        date: r.date,
      });
    });
  });

  return [...custom, ...base];
}
