<div align="center">

<img src="https://img.shields.io/badge/MediCompare-Healthcare%20Platform-0ea5e9?style=for-the-badge&logo=heart&logoColor=white" alt="MediCompare" />

# MediCompare — AI-Powered Healthcare Price Transparency Platform

**A full-stack-ready healthcare comparison and booking platform built with React, TanStack Router, and TailwindCSS v4.**

Compare medical service costs · Discover trusted hospitals · Book appointments instantly · Make informed decisions

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://typescriptlang.org)
[![TanStack Router](https://img.shields.io/badge/TanStack%20Router-1.x-FF4154?logo=react-query&logoColor=white&style=flat-square)](https://tanstack.com/router)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Live Features](#-live-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Pages & Routes](#-pages--routes)
- [Authentication](#-authentication)
- [Design System](#-design-system)
- [Data Layer](#-data-layer)
- [Developed By](#-developed-by)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🩺 Overview

**MediCompare** is a modern healthcare comparison platform tailored for the Indian market. It enables patients to transparently compare hospital prices for scans, diagnostics, and consultations, read verified patient reviews, and book appointments directly — with zero hidden fees.

The application is built as a client-side SPA powered by TanStack Start (SSR-ready), with a full authentication flow backed by `localStorage`, real-time filtering, interactive charts, multi-step booking, and a patient dashboard.

---

## 📌 Problem Statement

Healthcare pricing in India is often fragmented and difficult for patients to understand before seeking treatment. Patients frequently struggle to:

* Compare treatment costs across different hospitals.
* Find affordable care options suited to their budgets.
* Access transparent pricing information without hidden costs.
* Discover quality healthcare providers nearby.
* Make informed decisions based on ratings and verified reviews.

This lack of transparency can lead to unexpected medical expenses and poor decision-making during critical times.

---

## 💡 Solution

MediCompare offers a transparent healthcare discovery experience where users can:

* **Compare Prices:** Search and compare costs for scans (MRI, CT, Ultrasound) and treatments side by side.
* **Filter Dynamically:** Refine searches by city, service type, maximum price, minimum rating, and distance.
* **Consult Doctor Profiles:** Review credentials, experience, and slots for active specialists.
* **Book Instantly:** Confirm appointments in a few clicks with real-time slot availability.
* **Track Analytics:** Monitor healthcare spending, trends, and patient savings in a visual dashboard.
* **AI Assistance:** Get recommendations on the best value (price-to-rating ratio) hospitals.

---

## ✨ Live Features

### 🔍 Search & Compare
- **Price Comparison Table** — sort dynamically by price, rating, distance, or earliest slot.
- **Advanced Filters** — max price slider, min rating, max distance, city, specialty, hospital type, and availability toggles.
- **Visual Layouts** — switch between dense Table view and rich Grid view.
- **Synonym Normalization** — transparently maps search terms like "Delhi" -> "New Delhi" and "Bangalore" -> "Bengaluru".

### 🏥 Hospital Profiles & Details
- Specialized hospital landing pages displaying ratings, coordinates, and contact details.
- **Tabbed Interface** — Overview, Services & Pricing, Reviews, and Doctors.
- **Sticky Booking Sidebar** — choose a date and slot directly from the hospital's page.

### 📅 Multi-Step Booking Flow
- 5-step wizard: Service Selection → Date selection → Slot selection → Patient Details → Mock Payment/Confirmation.
- Pre-fills patient data from user context; generates a unique confirmation ID upon completion.

### 👤 Patient Dashboard
- **Overview:** Displays metrics, spending breakdowns (Area chart), savings trends (Bar chart), bookmarked hospitals, and recent searches.
- **Appointments:** Manage past and upcoming bookings, and initiate cancellations.
- **Reviews:** Leave ratings and feedback for hospitals.
- **Settings:** Manage profiles, update credentials, toggle notifications, or delete accounts.

### 🏨 Hospital Admin Panel (`/admin`)
- Operations overview showing appointments, revenue trends, and service popularity charts.
- Live service management to add, update, or remove services instantly.

---

## 🏗 Architecture

```text
User
 │
 ▼
Frontend (React + TypeScript)
 │
 ├── Authentication Layer (React Context / localStorage)
 ├── Search & Filtering Engine (Synonym mapper & multi-param criteria)
 ├── Comparison Module (Grid / Table layouts with sort state)
 ├── Booking System (Wizard state machine)
 ├── Dashboard Module (Spending and saving charts via Recharts)
 └── AI Recommendation Engine (Cost-to-quality heuristic recommendations)
 │
 ▼
Data Layer
 │
 ├── Hospital Records (types, addresses, specialties, pricing)
 ├── Services list (MRI, CT, consultations, blood panels)
 ├── Patient reviews (stars, timestamps, text)
 └── Appointment history
```

---

## 🛠 Tech Stack

| Category          | Technology                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| **Framework**     | [TanStack Start](https://tanstack.com/start) (React 19 + SSR-ready)    |
| **Routing**       | [TanStack Router](https://tanstack.com/router) — file-based, type-safe |
| **Styling**       | [TailwindCSS v4](https://tailwindcss.com) with custom design tokens    |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)               |
| **Charts**        | [Recharts](https://recharts.org) — Area & Bar charts                   |
| **Icons**         | [Lucide React](https://lucide.dev)                                     |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/)                                |
| **Build Tool**    | [Vite 7](https://vitejs.dev)                                           |
| **Language**      | TypeScript 5.8 (strict)                                                |

---

## 📁 Project Structure

```
health-compare-hub/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── DashboardShell.tsx      # Sidebar layout for dashboard pages
│   │   ├── site/
│   │   │   ├── AIRecommendation.tsx    # AI-powered hospital suggestion widget
│   │   │   ├── ComparisonTable.tsx     # Sortable hospital comparison table
│   │   │   ├── FloatingSearch.tsx      # Search bar with live filtering
│   │   │   ├── Footer.tsx              # Site footer with nav links
│   │   │   ├── HospitalCard.tsx        # Hospital card for grid views
│   │   │   ├── Navbar.tsx              # Sticky nav with auth-aware user menu
│   │   │   ├── NearbyMap.tsx           # "Hospitals near you" section
│   │   │   └── SiteShell.tsx           # Wraps Navbar + Footer
│   │   └── ui/                         # shadcn/ui components (Button, Input, etc.)
│   ├── lib/
│   │   ├── auth.tsx                    # Auth context (login, signup, logout)
│   │   ├── mock-data.ts               # All hospitals, services, testimonials, FAQs
│   │   └── utils.ts                   # cn() utility
│   ├── routes/
│   │   ├── __root.tsx                  # Root layout (QueryClient + AuthProvider)
│   │   ├── index.tsx                   # Landing page (Hero, Features, How it works)
│   │   ├── compare.tsx                 # Price comparison with filters
│   │   ├── hospitals.index.tsx         # Hospital listing
│   │   ├── hospitals.$hospitalId.tsx   # Hospital detail page
│   │   ├── book.tsx                    # Multi-step appointment booking
│   │   ├── login.tsx                   # Login page
│   │   ├── signup.tsx                  # Signup with password strength
│   │   ├── dashboard.tsx               # Patient dashboard overview
│   │   ├── dashboard.appointments.tsx  # Appointment management
│   │   ├── dashboard.reviews.tsx       # Write & view reviews
│   │   ├── dashboard.saved.tsx         # Saved / bookmarked hospitals
│   │   ├── dashboard.settings.tsx      # Account settings
│   │   ├── admin.tsx                   # Hospital admin panel
│   │   ├── reviews.tsx                 # Public reviews page
│   │   └── contact.tsx                 # Contact form
│   ├── router.tsx                      # Router configuration
│   └── styles.css                      # Global styles + Tailwind v4 tokens
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/ANSH25102006/health-compare-hub.git
cd health-compare-hub

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open **http://localhost:5173** to run the app locally.

### Available Commands

```bash
npm run dev        # Starts Vite dev server with HMR
npm run build      # Compiles production bundle (client & SSR)
npm run preview    # Previews production build locally
npm run lint       # Runs ESLint lint checks
npm run format     # Formats code with Prettier
```

---

## 🗺 Pages & Routes

| Route                     | Description                                                 | Auth Required |
| ------------------------- | ----------------------------------------------------------- | :-----------: |
| `/`                       | Landing page — hero, features, hospitals, testimonials, FAQ |      ❌       |
| `/compare`                | Hospital price comparison with filters                      |      ❌       |
| `/hospitals`              | All hospitals listing                                       |      ❌       |
| `/hospitals/:hospitalId`  | Individual hospital detail page                             |      ❌       |
| `/book`                   | Multi-step appointment booking wizard                       |      ❌       |
| `/login`                  | Login form                                                  |      ❌       |
| `/signup`                 | Registration with password strength                         |      ❌       |
| `/reviews`                | Public patient reviews with write-a-review form             |      ❌       |
| `/contact`                | Contact form with success state                             |      ❌       |
| `/dashboard`              | Patient dashboard overview                                  |      ✅       |
| `/dashboard/appointments` | Manage appointments                                         |      ✅       |
| `/dashboard/reviews`      | Write and view personal reviews                             |      ✅       |
| `/dashboard/saved`        | Bookmarked hospitals                                        |      ✅       |
| `/dashboard/settings`     | Account settings & security                                 |      ✅       |
| `/admin`                  | Hospital admin panel (demo)                                 |      ❌       |

---

## 🔐 Authentication

Authentication is handled via React Context and `localStorage` persistence.

- **Demo Credentials:** Use any password containing at least 6 characters.
- **Predefined Roles:**
  - Patient: `patient@medicompare.com`
  - Doctor: `doctor@medicompare.com`
  - Admin: `admin@medicompare.com`

Avatars are deterministically generated from email hash values using [pravatar.cc](https://pravatar.cc).

---

## 🎨 Design System

MediCompare is built with **TailwindCSS v4** and customized design tokens in `src/styles.css`.

### Tokens & Gradients

- `bg-primary-gradient`: Linear gradient (blue/violet) for major elements, buttons, and visual focus points.
- `bg-hero-gradient`: Calm backdrop radial gradient for headers.
- `shadow-elevated`: Deep premium card shadow.
- `shadow-soft`: Micro shadow for standard UI widgets.
- `glass`: Frost glassmorphism styling (`backdrop-blur`).

---

## 📦 Data Layer

Data schema and mock records are exported from [`src/lib/mock-data.ts`](src/lib/mock-data.ts).

### Hospital Data Schema

```ts
type Hospital = {
  id: string;
  name: string;
  type: string; // "Specialty Hospital" | "Super Speciality" | "Medical Center" | "General Hospital"
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
```

---

## 👨‍💻 Developed By

**Ansh Pandey**

*Passionate about building technology solutions that solve real-world problems through AI, data visualization, and modern web development.*

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/your-feature`)
3. Make your changes and verify with `npm run lint` and type-checking
4. Commit your changes (`git commit -m "feat: description"`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

<div align="center">

Built with ❤️ for healthcare transparency.

</div>
