export type Hospital = {
  id: string;
  name: string;
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

const avatar = (n: number) =>
  `https://i.pravatar.cc/120?img=${n}`;

export const hospitals: Hospital[] = [
  {
    id: "apollo-central",
    name: "Apollo Specialty Hospital",
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
      { name: "Dr. Vikram Shah", specialty: "Orthopedic Surgeon", experience: 22, avatar: avatar(33) },
      { name: "Dr. Neha Iyer", specialty: "Pediatrician", experience: 11, avatar: avatar(45) },
    ],
    slots: ["08:30", "10:00", "11:30", "15:00", "16:30"],
    about:
      "Fortis Greens combines advanced diagnostics with compassionate care, serving over 200,000 patients annually.",
  },
  {
    id: "max-superspecialty",
    name: "Max Super Speciality Hospital",
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
      { name: "Dr. Karthik Reddy", specialty: "Gastroenterologist", experience: 13, avatar: avatar(15) },
      { name: "Dr. Aisha Khan", specialty: "Dermatologist", experience: 9, avatar: avatar(32) },
    ],
    slots: ["09:00", "10:30", "12:30", "14:00", "16:00"],
    about:
      "Manipal City Hospital delivers integrated multi-specialty care backed by 70+ years of clinical excellence.",
  },
  {
    id: "kokilaben",
    name: "Kokilaben Dhirubhai Ambani Hospital",
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

export const cities = ["Bengaluru", "Mumbai", "New Delhi", "Gurugram", "Noida", "Hyderabad"];

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
  "Apollo", "Fortis", "Max Healthcare", "Manipal", "Medanta", "Kokilaben", "AIIMS", "Narayana",
];

export const userAppointments = [
  { id: "A-1024", date: "2026-06-12", hospital: "Apollo Specialty Hospital", service: "Cardiac Consultation", status: "Upcoming" as const },
  { id: "A-1019", date: "2026-06-04", hospital: "Fortis Greens Medical Center", service: "MRI Scan", status: "Confirmed" as const },
  { id: "A-0998", date: "2026-05-21", hospital: "Manipal City Hospital", service: "Full Body Checkup", status: "Completed" as const },
  { id: "A-0976", date: "2026-05-09", hospital: "Max Super Speciality", service: "Blood Test Panel", status: "Completed" as const },
  { id: "A-0951", date: "2026-04-28", hospital: "Medanta The Medicity", service: "Orthopedic Consultation", status: "Cancelled" as const },
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
