"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";

export default function LandingNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath = !user ? "/login" : getDashboardPath(user.role);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <span className="text-gray-900 font-bold text-xl">L</span>
            </div>
            <span className="text-foreground font-bold text-xl tracking-tight">
              LevelUp Fitness
            </span>
          </Link>


          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href={dashboardPath}
                  className="text-muted hover:text-accent transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/role"
                  className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-gray-900 font-semibold rounded-full transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 text-sm"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-muted hover:text-accent transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/role"
                  className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-gray-900 font-semibold rounded-full transition-all shadow-lg shadow-accent/20 hover:shadow-accent/30 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted hover:text-foreground"
            >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link
                    href={dashboardPath}
                    className="text-muted hover:text-accent transition-colors text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/role"
                    className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-gray-900 font-semibold rounded-full transition-all text-sm text-center"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-muted hover:text-accent transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/role"
                    className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-gray-900 font-semibold rounded-full transition-all text-sm text-center"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
