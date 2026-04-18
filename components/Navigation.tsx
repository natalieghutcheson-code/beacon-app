"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { label: "Discover", href: "/discover" },
  { label: "My Grants", href: "/my-grants" },
  { label: "Categories", href: "/categories" },
  { label: "Resources", href: "/resources" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-cream border-b border-[#E8E0D0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <SignalIcon />
              {/* Glowing amber pulse dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber" />
              </span>
            </div>
            <span className="text-forest font-bold text-xl tracking-tight">Beacon</span>
          </Link>

          {/* Center nav — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    active
                      ? "text-forest font-semibold"
                      : "text-charcoal/70 hover:text-forest hover:bg-forest/5"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-forest rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right actions — desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button
              aria-label="Search"
              className="p-2 rounded-md text-charcoal/60 hover:text-forest hover:bg-forest/5 transition-colors"
            >
              <SearchIcon />
            </button>
            <button
              aria-label="Notifications"
              className="p-2 rounded-md text-charcoal/60 hover:text-forest hover:bg-forest/5 transition-colors"
            >
              <BellIcon />
            </button>
            <Link
              href="/my-grants"
              className="ml-1 px-4 py-2 border border-forest text-forest text-sm font-semibold rounded-lg hover:bg-forest/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/discover"
              className="px-4 py-2 bg-forest text-white text-sm font-semibold rounded-lg hover:bg-forest/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-charcoal/60 hover:text-forest"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E8E0D0] bg-cream px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? "text-forest bg-forest/10 font-semibold"
                    : "text-charcoal/70 hover:text-forest hover:bg-forest/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#E8E0D0] flex items-center gap-2 flex-wrap">
            <button aria-label="Search" className="p-2 text-charcoal/60 hover:text-forest">
              <SearchIcon />
            </button>
            <button aria-label="Notifications" className="p-2 text-charcoal/60 hover:text-forest">
              <BellIcon />
            </button>
            <Link
              href="/my-grants"
              className="ml-auto px-3 py-2 border border-forest text-forest text-sm font-semibold rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/discover"
              className="px-3 py-2 bg-forest text-white text-sm font-semibold rounded-lg"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ── Inline SVG icons ── */

function SignalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" fill="#2D4A2D" />
      <path
        d="M7 12a5 5 0 0 1 5-5M17 12a5 5 0 0 1-5 5"
        stroke="#2D4A2D"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M4 12a8 8 0 0 1 8-8M20 12a8 8 0 0 1-8 8"
        stroke="#C4A35A"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
