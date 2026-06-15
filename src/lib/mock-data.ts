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

export const hospitals: Hospital[] = [
  {
    id: "apollo-central",
    name: "Apollo Specialty Hospital",
    type: "Specialty Hospital",
    image: img("photo-1587351021759-3e566b6af7cc"),
    rating: 4.8,
    reviews: 2143,
    distance: 1.2,
    address: "21 MG Road, Bengaluru, KA 560001",
    phone: "+91 80 4567 8900",
    city: "Bengaluru",
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
    about:
      "Apollo Specialty Hospital is a JCI-accredited multi-specialty facility delivering world-class care across 30+ specialties.",
  },
  {
    id: "fortis-greens",
    name: "Fortis Greens Medical Center",
    type: "Medical Center",
    image: img("photo-1538108149393-fbbd81895907"),
    rating: 4.7,
    reviews: 1856,
    distance: 2.8,
    address: "Sector 62, Noida, UP 201301",
    phone: "+91 120 678 4500",
    city: "Noida",
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
    about:
      "Fortis Greens combines advanced diagnostics with compassionate care, serving over 200,000 patients annually.",
  },
  {
    id: "max-superspecialty",
    name: "Max Super Speciality Hospital",
    type: "Super Speciality",
    image: img("photo-1586773860418-d37222d8fce3"),
    rating: 4.9,
    reviews: 3120,
    distance: 4.5,
    address: "Saket District, New Delhi, DL 110017",
    phone: "+91 11 2651 5050",
    city: "New Delhi",
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
    about:
      "Max Super Speciality Hospital is recognized as one of India's top tertiary care centers with cutting-edge robotics.",
  },
  {
    id: "manipal-city",
    name: "Manipal City Hospital",
    type: "General Hospital",
    image: img("photo-1551076805-e1869033e561"),
    rating: 4.6,
    reviews: 1442,
    distance: 3.1,
    address: "Old Airport Road, Bengaluru, KA 560017",
    phone: "+91 80 2502 4444",
    city: "Bengaluru",
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
    about:
      "Manipal City Hospital delivers integrated multi-specialty care backed by 70+ years of clinical excellence.",
  },
  {
    id: "kokilaben",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    type: "Super Speciality",
    image: img("photo-1631815588090-d4bfec5b1ccb"),
    rating: 4.8,
    reviews: 2580,
    distance: 5.4,
    address: "Four Bunglows, Andheri West, Mumbai, MH 400053",
    phone: "+91 22 4269 6969",
    city: "Mumbai",
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
    about:
      "Kokilaben Hospital is a quaternary care facility recognized for excellence in advanced surgical specialties.",
  },
  {
    id: "medanta",
    name: "Medanta The Medicity",
    type: "Super Speciality",
    image: img("photo-1519494026892-80bbd2d6fd0d"),
    rating: 4.7,
    reviews: 1980,
    distance: 6.2,
    address: "Sector 38, Gurugram, HR 122001",
    phone: "+91 124 414 1414",
    city: "Gurugram",
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
    about:
      "Medanta is a multi-super-specialty institute built around clinical, surgical, and research excellence.",
  },
  {
    id: "apollo-chennai",
    name: "Apollo Specialty Hospital, OMR",
    type: "Specialty Hospital",
    image: img("photo-1587351021759-3e566b6af7cc"),
    rating: 4.7,
    reviews: 1680,
    distance: 2.5,
    address: "OMR Road, Karapakkam, Chennai, TN 600097",
    phone: "+91 44 2496 5000",
    city: "Chennai",
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
    about:
      "Apollo Specialty Hospital Chennai OMR is a leading facility for cancer care and cardiac treatments in Tamil Nadu.",
  },
  {
    id: "fortis-malar-chennai",
    name: "Fortis Malar Hospital",
    type: "General Hospital",
    image: img("photo-1538108149393-fbbd81895907"),
    rating: 4.5,
    reviews: 1120,
    distance: 4.2,
    address: "Gandhi Nagar, Adyar, Chennai, TN 600020",
    phone: "+91 44 4242 4242",
    city: "Chennai",
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
    about:
      "Fortis Malar Hospital Chennai is a premier multi-specialty hospital offering comprehensive medical care.",
  },
  {
    id: "care-hyderabad",
    name: "Care Hospitals, Banjara Hills",
    type: "Specialty Hospital",
    image: img("photo-1551076805-e1869033e561"),
    rating: 4.6,
    reviews: 1250,
    distance: 3.4,
    address: "Road No 1, Banjara Hills, Hyderabad, TG 500034",
    phone: "+91 40 6165 6565",
    city: "Hyderabad",
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
    about:
      "Care Hospitals, Banjara Hills is a multi-specialty center of excellence, highly regarded for cardiac care in South India.",
  },
  {
    id: "continental-hyderabad",
    name: "Continental Hospitals",
    type: "Super Speciality",
    image: img("photo-1586773860418-d37222d8fce3"),
    rating: 4.8,
    reviews: 980,
    distance: 5.1,
    address: "Gachibowli, Hyderabad, TG 500032",
    phone: "+91 40 6700 0000",
    city: "Hyderabad",
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
    about:
      "Continental Hospitals is a JCI and NABH accredited tertiary care facility located in Gachibowli IT Corridor.",
  },
  {
    id: "fortis-bangalore",
    name: "Fortis Hospital, Bannerghatta Road",
    type: "Super Speciality",
    image: img("photo-1519494026892-80bbd2d6fd0d"),
    rating: 4.8,
    reviews: 2210,
    distance: 3.5,
    address: "Bannerghatta Road, Bengaluru, KA 560076",
    phone: "+91 80 6621 4444",
    city: "Bengaluru",
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
    about:
      "Fortis Hospital Bannerghatta Road is a multi-speciality tertiary care hospital known for its state-of-the-art infrastructure.",
  },
];

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
export function getServiceAverage(serviceName: string): number {
  const prices = hospitals.flatMap((h) =>
    h.services.filter((s) => s.name === serviceName).map((s) => s.price),
  );
  if (!prices.length) return 0;
  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
}

export function getServiceMin(serviceName: string): number {
  const prices = hospitals.flatMap((h) =>
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
export function getServiceMax(serviceName: string): number {
  const prices = hospitals.flatMap((h) =>
    h.services.filter((s) => s.name === serviceName).map((s) => s.price),
  );
  return prices.length ? Math.max(...prices) : 0;
}

export function getHospitalCountForService(serviceName: string): number {
  return hospitals.filter((h) => h.services.some((s) => s.name === serviceName)).length;
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

export function getHospitalIdByName(name: string): string {
  const h = hospitals.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h ? h.id : "unknown";
}

export function getHospitalNameById(id: string): string {
  const h = hospitals.find((x) => x.id === id);
  return h ? h.name : "Unknown Hospital";
}

export function getHospitalRatingDetails(hospitalId: string): {
  rating: number;
  reviewsCount: number;
} {
  const h = hospitals.find((x) => x.id === hospitalId);
  if (!h) return { rating: 0, reviewsCount: 0 };

  let customReviews: PatientReview[] = [];
  try {
    const stored = localStorage.getItem("medicompare_reviews");
    if (stored) {
      customReviews = JSON.parse(stored).filter(
        (r: PatientReview) => r.hospitalId === hospitalId || r.hospitalName === h.name
      );
    }
  } catch {}

  const N_0 = h.reviews;
  const R_0 = h.rating;
  const N_custom = customReviews.length;
  const sum_custom = customReviews.reduce((sum, r) => sum + r.rating, 0);

  const totalReviews = N_0 + N_custom;
  const averageRating =
    totalReviews > 0 ? Math.round(((R_0 * N_0 + sum_custom) / totalReviews) * 10) / 10 : R_0;

  return { rating: averageRating, reviewsCount: totalReviews };
}

export function getReviewsForHospital(hospitalId: string): PatientReview[] {
  const h = hospitals.find((x) => x.id === hospitalId);
  if (!h) return [];

  // 1. Get base reviews
  const base = (defaultHospitalReviews[hospitalId] || [
    {
      name: "Priya S.",
      text: "Great consultation and clean facility. Verified pricing.",
      rating: 5,
      date: "10 Jun 2026",
    },
  ]).map((r, i) => ({
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
  let custom: PatientReview[] = [];
  try {
    const stored = localStorage.getItem("medicompare_reviews");
    if (stored) {
      custom = JSON.parse(stored).filter(
        (r: PatientReview) => r.hospitalId === hospitalId || r.hospitalName === h.name
      );
    }
  } catch {}

  return [...custom, ...base];
}

export function getAllReviews(): PatientReview[] {
  let custom: PatientReview[] = [];
  try {
    const stored = localStorage.getItem("medicompare_reviews");
    if (stored) {
      custom = JSON.parse(stored);
    }
  } catch {}

  const base: PatientReview[] = [];
  hospitals.forEach((h) => {
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

