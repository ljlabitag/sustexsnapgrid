// App.jsx
import React from "react";
import Grid from "./components/Grid";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-dvh bg-brand-surface/60">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-brand-surface/90 backdrop-blur border-b border-brand-ink/10">
        <div className="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full bg-white shadow-[var(--shadow-soft-2)] grid place-items-center text-brand-teal">
              <svg
                className="w-8 h-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-2h8l2 2h3a2 2 0 0 1 2 2v10z" />
                <circle cx="12" cy="14" r="4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-semibold text-brand-ink leading-tight">SustEx BINGO Card</h1>
              <p className="muted text-sm sm:text-lg leading-snug">
                Welcome to the Sustainability Expo 2025!<br/> Snap photos, complete card, WIN a prize!
              </p>
            </div>
          </div>
          {/* Progress placeholder (wired inside Grid later if desired)
          <div className="hidden sm:block w-40">
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: "0%" }} />
            </div>
          </div> */}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-xl px-4 py-4">
          <Grid />
          <Footer />
      </main>
    </div>
  );
}
