"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";

export default function LandingNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStartedPath = !user ? "/role" : getDashboardPath(user.role);
  const dashboardPath = !user ? "/login" : getDashboardPath(user.role);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/80 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <span className="text-black font-bold text-xl">L</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              LevelUp Fitness
            </span>
          </Link>


          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href={dashboardPath}
                  className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href={getStartedPath}
                  className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30 text-sm"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
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

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/[0.05]">
            <nav className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link
                    href={dashboardPath}
                    className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={getStartedPath}
                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition-all text-sm text-center"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-300 hover:text-yellow-400 transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full transition-all text-sm text-center"
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
