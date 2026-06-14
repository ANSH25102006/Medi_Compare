<div align="center">

<img src="https://img.shields.io/badge/MediCompare-Healthcare%20Platform-0ea5e9?style=for-the-badge&logo=heart&logoColor=white" alt="MediCompare" />

# MediCompare — Find Quality Healthcare at the Right Price

**A full-stack-ready healthcare comparison and booking platform built with React, TanStack Router, and TailwindCSS v4.**

Compare medical service costs · Discover trusted hospitals · Book appointments instantly

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://typescriptlang.org)
[![TanStack Router](https://img.shields.io/badge/TanStack%20Router-1.x-FF4154?logo=react-query&logoColor=white&style=flat-square)](https://tanstack.com/router)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Features](#-live-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Pages & Routes](#-pages--routes)
- [Authentication](#-authentication)
- [Design System](#-design-system)
- [Data Layer](#-data-layer)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🩺 Overview

**MediCompare** is a modern healthcare comparison platform for the Indian market. It lets patients transparently compare hospital prices, read verified reviews, and book appointments — all without hidden fees.

The application is built as a **client-side SPA** powered by TanStack Start (SSR-ready), with a full authentication flow backed by `localStorage`, real-time filtering, interactive charts, multi-step booking, and a patient dashboard.

> **Demo credentials:** Any valid email + password ≥ 6 characters. No real backend required.

---

## ✨ Live Features

### 🔍 Search & Compare

- **Price Comparison Table** — sort by price, rating, distance, or earliest availability
- **Advanced Filters** — max price slider, min rating, max distance, city, service type, available-today toggle
- **Grid / Table view toggle** on the compare page
- **Floating search bar** with real-time filtering

### 🏥 Hospital Profiles

- Full hospital detail pages with hero image, specialty badges, ratings
- **Tabbed interface** — Overview, Services & Pricing, Reviews, Doctors
- **Sticky booking sidebar** with date picker and time slot selector
- Direct "Book" buttons per service linking into the booking flow

### 📅 Multi-Step Booking Flow

- 5-step wizard: Service → Date → Time Slot → Patient Details → Confirmation
- Animated progress bar with step indicators
- Pre-fills patient name & email from logged-in user
- Booking confirmation screen with generated booking ID

### 👤 Authentication

- **Sign Up** — full name, email, password with live strength indicator (Weak / Good / Strong)
- **Login** — inline error messages, loading states, "Forgot password" toast
- Sessions persist across refreshes via `localStorage`
- Protected routes redirect to `/login` with return URL preserved

### 📊 Patient Dashboard

| Section             | What it shows                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| **Overview**        | Stats cards, visits area chart, savings bar chart, saved hospitals, recent searches, medical records |
| **Appointments**    | Full table of past & upcoming with status badges and cancel actions                                  |
| **Reviews**         | Interactive star picker, hospital selector, live review submission                                   |
| **Saved Hospitals** | Bookmarked hospital cards                                                                            |
| **Settings**        | Profile editing, notification toggles, security options, delete account                              |

### 🏨 Hospital Admin Panel (`/admin`)

- Operations overview with metrics (appointments, revenue, rating, services)
- Dual chart — appointments & revenue trend, service popularity bar chart
- Live service management — add services via dialog, delete with instant table update

### ⭐ Reviews Page

- Interactive star rating widget with hover effects
- Hospital selector dropdown
- New reviews appear instantly in the grid (no page reload)
- Logged-out users prompted to sign in

### 📬 Contact Page

- Pre-fills name & email from auth context
- Loading spinner on submit
- Full success confirmation screen (no toast-only feedback)

### 🤖 AI Recommendation Widget

- Simulates an AI-powered hospital recommendation with rationale
- Highlights best price-to-rating ratio options

---

## 🛠 Tech Stack

| Category          | Technology                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| **Framework**     | [TanStack Start](https://tanstack.com/start) (React 19 + SSR-ready)    |
| **Routing**       | [TanStack Router](https://tanstack.com/router) — file-based, type-safe |
| **Styling**       | [TailwindCSS v4](https://tailwindcss.com) with custom design tokens    |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)               |
| **Charts**        | [Recharts](https://recharts.org) — Area, Bar charts                    |
| **Icons**         | [Lucide React](https://lucide.dev)                                     |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/)                                |
| **Build Tool**    | [Vite 7](https://vitejs.dev)                                           |
| **Language**      | TypeScript 5.8 (strict)                                                |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query)                           |
| **State**         | React Context + `useState` + `localStorage`                            |
| **Linting**       | ESLint + Prettier                                                      |

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
│   │   │   ├── PopularServices.tsx     # Popular services grid
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
│   ├── routeTree.gen.ts               # Auto-generated route tree (do not edit)
│   ├── server.ts                       # Server entry point
│   ├── start.ts                        # App start
│   └── styles.css                      # Global styles + Tailwind v4 tokens
├── components.json                     # shadcn/ui config
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or pnpm / yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/health-compare-hub.git
cd health-compare-hub

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Available Scripts

```bash
npm run dev        # Start Vite dev server with HMR
npm run build      # Production build
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
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

Authentication is handled entirely client-side via React Context + `localStorage`. This makes it fully functional for demos without any backend.

**File:** [`src/lib/auth.tsx`](src/lib/auth.tsx)

### How it works

```ts
const { user, isLoggedIn, login, signup, logout } = useAuth();
```

| Method                          | Behaviour                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `signup(name, email, password)` | Stores account in `localStorage`, sets user context                              |
| `login(email, password)`        | Validates credentials (≥ 6 char password), restores name if previously signed up |
| `logout()`                      | Clears user context and localStorage                                             |

- User sessions **persist across browser refreshes**
- Avatars are deterministically generated from email hash via [pravatar.cc](https://pravatar.cc)
- Protected routes redirect to `/login?redirect=<path>` and return the user after login

> **To extend:** Replace the `login()` / `signup()` internals with real API calls (e.g., `fetch('/api/auth/login', ...)`). The context interface stays the same.

---

## 🎨 Design System

MediCompare uses a custom design system built on **TailwindCSS v4** with CSS custom properties defined in `src/styles.css`.

### Key Design Tokens

| Token                 | Usage                                           |
| --------------------- | ----------------------------------------------- |
| `bg-primary-gradient` | Blue gradient for hero sections, cards, buttons |
| `bg-hero-gradient`    | Soft background gradient for page headers       |
| `shadow-elevated`     | Deep shadow for cards that need prominence      |
| `shadow-soft`         | Subtle shadow for regular cards                 |
| `text-success`        | Green for savings, confirmations                |
| `text-warning`        | Amber for star ratings                          |
| `glass`               | Frosted glass effect (backdrop-blur)            |

### Typography

- **Body:** [Inter](https://rsms.me/inter/) — weights 400, 500, 600, 700
- **Display:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) — weights 600, 700, 800

### Component Library

Built on [shadcn/ui](https://ui.shadcn.com) with Radix UI:
`Button`, `Input`, `Label`, `Badge`, `Dialog`, `Select`, `Slider`, `Checkbox`, `Table`, `Tabs`, `Accordion`, `Sidebar`, `Toaster`, and more.

---

## 📦 Data Layer

All data is in [`src/lib/mock-data.ts`](src/lib/mock-data.ts). Replacing with real API calls requires only changing the import sources — the components accept the same typed interfaces.

### Key Exports

```ts
export const hospitals: Hospital[]; // 6 major Indian hospitals with services, doctors, slots
export const services: string[]; // 10 service types for filtering
export const testimonials: Testimonial[]; // Patient reviews
export const faqs: FAQ[]; // FAQ accordion data
export const popularServices: PopularService[]; // Service cards on homepage
export const userAppointments: Appointment[]; // Mock patient appointments
export const savingsTrend: SavingsData[]; // Chart data for dashboard
export const medicalRecords: Record[]; // Patient document list

// Utility functions
export function getServiceAverage(serviceName: string): number;
export function getServiceMin(serviceName: string): number;
```

### Hospital Type

```ts
type Hospital = {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  distance: number; // km from user
  address: string;
  phone: string;
  city: string;
  specialties: string[];
  services: { name: string; price: number; duration: string }[];
  doctors: { name: string; specialty: string; experience: number; avatar: string }[];
  slots: string[]; // Available time slots
  about: string;
};
```

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes following the existing code style
4. Run type-check: `npx tsc --noEmit`
5. Run lint: `npm run lint`
6. Commit: `git commit -m "feat: add your feature"`
7. Push and open a **Pull Request**

### Coding Conventions

- **TypeScript** — all new files must be fully typed, no `any`
- **Components** — colocate component-specific logic with the component file
- **Routes** — use TanStack Router's file-based convention (`route.tsx`, `route.subroute.tsx`)
- **Styling** — use Tailwind utility classes; add new design tokens to `styles.css` only when needed
- **State** — prefer local `useState` for UI state; use Context only for cross-cutting concerns (e.g., auth)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for better healthcare decisions in India.

**[⭐ Star this repo](https://github.com/YOUR_USERNAME/health-compare-hub)** if you found it useful!

</div>
