# 🩺 MediCompare – AI-Powered Healthcare Price Transparency Platform

<div align="center">

# MediCompare

### Find Quality Healthcare at the Right Price

Compare treatment costs • Discover trusted hospitals • Book appointments • Make informed healthcare decisions

**Built for healthcare transparency in India**

</div>

---

## 📌 Problem Statement

Healthcare pricing in India is often fragmented and difficult for patients to understand before seeking treatment. Patients frequently struggle to:

* Compare treatment costs across hospitals
* Find affordable healthcare options
* Access transparent pricing information
* Discover quality healthcare providers nearby
* Make informed healthcare decisions based on budget and ratings

This lack of transparency can lead to unexpected medical expenses and poor decision-making.

---

## 💡 Solution

**MediCompare** is an AI-powered healthcare comparison platform that enables users to:

* Compare medical service prices across hospitals
* View ratings, reviews, and hospital details
* Discover nearby healthcare providers
* Book appointments online
* Track healthcare spending and savings
* Receive AI-based hospital recommendations

The platform combines healthcare accessibility, affordability, and transparency into a single user-friendly interface.

---

## 🚀 Key Features

### 🔍 Smart Healthcare Search

* Real-time hospital search
* Filter by city, service type, rating, distance, and budget
* Compare healthcare providers side-by-side
* Sort results by cost, ratings, availability, and distance

### 🏥 Hospital Comparison Engine

* Treatment-wise price comparison
* Hospital ratings and reviews
* Service availability information
* Specialty and facility overview
* Distance-based recommendations

### 🤖 AI Recommendation System

* Suggests optimal hospitals based on:

  * Cost efficiency
  * Ratings
  * Distance
  * Service quality
* Provides reasoning behind recommendations
* Helps users make data-driven healthcare decisions

### 📅 Appointment Booking System

* Multi-step booking workflow
* Date and time slot selection
* Patient information management
* Booking confirmation generation
* Appointment tracking dashboard

### 👤 Patient Dashboard

* Upcoming appointments
* Healthcare savings analytics
* Review management
* Saved hospitals
* Profile and account settings

### ⭐ Review & Rating System

* Hospital reviews
* Star-based rating system
* Community feedback
* Verified patient experiences

### 🏨 Hospital Admin Panel

* Service management
* Revenue tracking
* Appointment analytics
* Operational insights dashboard

---

## 🎯 Impact

### For Patients

✅ Price transparency

✅ Better healthcare decisions

✅ Reduced treatment costs

✅ Easier hospital discovery

✅ Convenient appointment booking

### For Healthcare Providers

✅ Increased visibility

✅ Better patient engagement

✅ Service analytics

✅ Appointment management

---

## 🛠 Technology Stack

### Frontend

* React 19
* TypeScript
* TanStack Router
* Tailwind CSS v4
* Shadcn UI
* Radix UI
* Recharts
* Lucide Icons

### State Management

* React Context API
* TanStack Query
* Local Storage Persistence

### Development Tools

* Vite
* ESLint
* Prettier

---

## 🏗 Architecture

```text
User
 │
 ▼
Frontend (React + TypeScript)
 │
 ├── Authentication Layer
 ├── Search & Filtering Engine
 ├── Comparison Module
 ├── Booking System
 ├── Dashboard Module
 └── AI Recommendation Engine
 │
 ▼
Data Layer
 │
 ├── Hospital Data
 ├── Services Data
 ├── Reviews Data
 └── Appointment Data
```

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
## 📂 Major Modules

### 1. Authentication Module

* User Registration
* Login System
* Session Management
* Protected Routes

### 2. Hospital Discovery Module

* Search
* Filtering
* Sorting
* Comparison

### 3. Booking Module

* Appointment Scheduling
* Slot Selection
* Booking Confirmation

### 4. Analytics Module

* Savings Tracking
* Appointment Statistics
* Usage Insights

### 5. AI Recommendation Module

* Cost Analysis
* Quality Scoring
* Recommendation Generation

---

## 📸 Screens Included

* Landing Page
* Hospital Comparison Dashboard
* Hospital Details Page
* Appointment Booking Wizard
* Patient Dashboard
* Reviews Page
* Admin Panel

---

## 🔮 Future Enhancements

* Real Hospital APIs Integration
* Google Maps Integration
* Online Payment Gateway
* Doctor Consultation System
* Electronic Medical Records
* AI Chatbot Assistant
* Insurance Cost Estimation
* Healthcare Cost Prediction
* Mobile Application
* Machine Learning Recommendation Engine

---

## ⚙️ Installation

```bash
git clone https://github.com/your-username/medicompare.git

cd medicompare

npm install

npm run dev
```

Application runs at:

```bash
http://localhost:5173
```

---

## 📈 Why This Project Stands Out

Unlike traditional hospital directories, MediCompare focuses on:

* Healthcare price transparency
* Data-driven decision making
* Cost comparison
* Patient empowerment
* AI-assisted recommendations

This makes it a practical healthcare technology solution addressing a real-world problem faced by millions of patients.

---

## 👨‍💻 Developed By

**Ansh Pandey**

B.Tech Student

Passionate about building technology solutions that solve real-world problems through AI, data visualization, and modern web development.

---


### Making Healthcare Transparent, Accessible, and Affordable for Everyone.
