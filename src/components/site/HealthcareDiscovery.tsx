import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";

export function HealthcareDiscovery() {
  const [activeTab, setActiveTab] = useState<
    "scans" | "treatments" | "diagnostics" | "compared" | "specialties"
  >("scans");

  const categories = {
    scans: [
      { name: "MRI Brain Scan", price: 6200, compared: "2.4k times", badge: "Best Savings" },
      { name: "CT Chest Scan", price: 4500, compared: "1.8k times", badge: "Most Booked" },
      { name: "Ultrasound Abdomen", price: 1500, compared: "3.2k times", badge: "Fast Slots" },
      { name: "X-Ray Chest", price: 800, compared: "2.1k times", badge: "Trending" },
    ],
    treatments: [
      { name: "Cataract Surgery", price: 25000, compared: "920 times", badge: "Most Booked" },
      { name: "Knee Replacement", price: 120000, compared: "640 times", badge: "Best Savings" },
      { name: "Dental Implants", price: 18000, compared: "1.2k times", badge: "Trending" },
      { name: "IVF Cycle Package", price: 95000, compared: "850 times", badge: "Fast Slots" },
    ],
    diagnostics: [
      { name: "Blood Test Panel", price: 600, compared: "5.1k times", badge: "Most Booked" },
      { name: "Lipid Profile", price: 500, compared: "2.8k times", badge: "Trending" },
      { name: "Thyroid Profile", price: 450, compared: "3.5k times", badge: "Best Savings" },
      { name: "HbA1c Diabetes Test", price: 390, compared: "4.2k times", badge: "Fast Slots" },
    ],
    compared: [
      { name: "MRI Spine Lumbar", price: 6800, compared: "3.1k times", badge: "Most Compared" },
      { name: "CT Scan Head", price: 3500, compared: "2.5k times", badge: "Trending" },
      { name: "Full Body Checkup", price: 3900, compared: "6.0k times", badge: "Best Savings" },
      { name: "Cardiac Consultation", price: 1200, compared: "1.9k times", badge: "Most Booked" },
    ],
    specialties: [
      { name: "Cardiology Center", price: 1200, compared: "3.8k times", badge: "Trending" },
      { name: "Neurology Care", price: 1500, compared: "2.1k times", badge: "Most Booked" },
      { name: "Orthopedic Surgeon", price: 1000, compared: "2.9k times", badge: "Fast Slots" },
      { name: "Oncology Care", price: 1800, compared: "1.5k times", badge: "Best Savings" },
    ],
  };

  const tabs = [
    { id: "scans" as const, label: "Most Booked Scans" },
    { id: "treatments" as const, label: "Trending Treatments" },
    { id: "diagnostics" as const, label: "Popular Diagnostics" },
    { id: "compared" as const, label: "Most Compared" },
    { id: "specialties" as const, label: "Top Specialties" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-border">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Discover Services</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">Popular Healthcare Discovery</h2>
        <p className="mt-2 text-muted-foreground text-sm">
          Browse verified starting prices and real comparison volume for in-demand services.
        </p>

        {/* Dynamic Tab Selector */}
        <div className="mt-6 inline-flex flex-wrap justify-center rounded-2xl bg-secondary/60 p-1.5 dark:bg-secondary/40 border border-border/40 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Cards Grid */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories[activeTab].map((item) => (
          <Link
            key={item.name}
            to="/compare"
            search={{ q: item.name, city: "" }}
            className="group relative rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/20 hover:shadow-elevated"
          >
            <div className="flex justify-between items-start">
              <span className="rounded-full bg-primary-soft/85 px-2.5 py-0.5 text-[9px] font-bold text-primary dark:bg-primary-soft/10">
                {item.badge}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                <Search className="h-3.5 w-3.5 text-primary/80" /> {item.compared}
              </div>
            </div>

            <h3 className="mt-5 text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
              {item.name}
            </h3>

            <div className="mt-6 flex items-baseline justify-between border-t border-border/40 pt-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Starting At
                </p>
                <p className="text-base font-extrabold text-foreground mt-0.5">
                  ₹{item.price.toLocaleString()}
                </p>
              </div>
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0">
                Compare <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
