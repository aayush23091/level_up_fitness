"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { getProfileImageUrl } from "@/lib/getProfileImageUrl";
import { coachAPI } from "@/lib/api";
import CoinBalance from "../CoinBalance";
import ThemeToggle from "@/app/components/ThemeToggle";

interface CoachNavbarProps {
  onMenuToggle: () => void;
}

export default function CoachNavbar({ onMenuToggle }: CoachNavbarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [coinLoading, setCoinLoading] = useState(true);

  const fetchCoachEarnings = async () => {
    try {
      const response = await coachAPI.getEarnings();
      setCoinBalance(response.data.totalEarnings);
    } catch (err) {
      setCoinBalance(0);
    } finally {
      setCoinLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachEarnings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const avatarUrl = getProfileImageUrl(user?.profilePhoto);

  const getInitials = () => {
    if (!user?.name) return "CO";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 w-full">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-muted hover:text-foreground lg:hidden hover:bg-card-secondary transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-foreground text-sm md:text-base font-semibold tracking-wide uppercase truncate">
            Coach Dashboard
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Coin Balance */}
        <CoinBalance amount={coinBalance} loading={coinLoading} />

        {/* Theme Toggle */}
        <ThemeToggle />
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none group text-left"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name || "Coach avatar"}
                className="w-9 h-9 rounded-full object-cover border border-accent/20 group-hover:border-accent transition-all shadow-[0_0_10px_rgba(234,179,8,0.1)]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/10 to-accent/30 text-accent border border-accent/20 group-hover:border-accent flex items-center justify-center text-xs font-black font-mono tracking-wider transition-all">
                {getInitials()}
              </div>
            )}
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors uppercase tracking-wider">
                {user?.name || "Coach"}
              </p>
              <p className="text-[9px] text-muted font-bold uppercase tracking-widest mt-0.5">
                {user?.role || "Coach"}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-muted group-hover:text-foreground transition-colors hidden sm:block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-52 rounded-xl bg-card border border-border shadow-2xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-border mb-1">
                <p className="text-xs font-black text-foreground truncate uppercase tracking-wide">
                  {user?.name || "Coach"}
                </p>
                <p className="text-[10px] text-muted truncate mt-0.5">
                  {user?.email || "coach@levelup.com"}
                </p>
              </div>

              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-accent hover:bg-card-secondary transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>

              <Link
                href="/coach-dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-accent hover:bg-card-secondary transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </Link>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
