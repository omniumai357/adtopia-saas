// src/components/LandingLayout.tsx
'use client';
import { ReactNode } from "react";

interface LandingLayoutProps {
  children: ReactNode;
  brand?: "adtopia" | "bizbox";
}

export default function LandingLayout({ children, brand = "adtopia" }: LandingLayoutProps) {
  const theme =
    brand === "bizbox"
      ? "from-white via-indigo-50 to-indigo-100 text-gray-900"
      : "from-white via-gray-50 to-gray-100 text-gray-900";

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${theme} font-sans antialiased flex flex-col items-center`}
    >
      <header className="w-full text-center py-4 border-b bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <h1 className="text-2xl font-bold tracking-tight">
          {brand === "bizbox" ? "BizBox AI — Partner Portal" : "AdTopia — AI Ad Platform"}
        </h1>
      </header>

      <main className="flex-grow w-full max-w-6xl px-4 sm:px-8">{children}</main>

      <footer className="w-full text-center py-8 border-t text-sm opacity-70">
        © {new Date().getFullYear()} Omnia Group LLC • Powered by Supabase & Stripe
      </footer>
    </div>
  );
}
