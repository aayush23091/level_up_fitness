"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { adminAPI } from "@/lib/api";
import CoinBalance from "../CoinBalance";

interface AdminNavbarProps {
  onMenuToggle: () => void;
}

export default function AdminNavbar({ onMenuToggle }: AdminNavbarProps) {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [coinLoading, setCoinLoading] = useState(true);

  const fetchAdminCommission = async () => {
    try {
      const response = await adminAPI.getTransactions();
      setCoinBalance(response.data.adminCommission);
    } catch (err) {
      setCoinBalance(0);
    } finally {
      setCoinLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminCommission();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getAvatarUrl = () => {
    if (user?.profilePhoto) {
      return user.profilePhoto.startsWith("http")
        ? user.profilePhoto
        : `http://localhost:5000${user.profilePhoto}`;
    }
    return null;
  };

  const getInitials = () => {
    if (!user?.name) return "AD";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-[#0a0a0c] border-b border-[#1e1e24] px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 w-full">
      {/* Left: Mobile Toggle & Logo/Dashboard Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger menu toggle */}
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white lg:hidden hover:bg-zinc-900 transition-colors focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand Logo & Context */}
        <div className="flex items-center gap-3">
          <Link href="/admin-dashboard" className="flex items-center">
            <span className="text-lg md:text-xl font-black text-white tracking-wider uppercase font-sans">
              LevelUp <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.15)]">Fitness</span>
            </span>
          </Link>
          
          <span className="h-4 w-[1px] bg-zinc-800 hidden sm:block"></span>
          
          <span className="text-zinc-400 text-xs md:text-sm font-semibold tracking-wide uppercase hidden sm:block">
            Admin Dashboard
          </span>
        </div>
      </div>

      {/* Right: Coin Balance, Settings & Admin Profile Icon */}
      <div className="flex items-center gap-4">
        {/* Coin Balance */}
        <CoinBalance amount={coinBalance} loading={coinLoading} />
        {/* Settings Button */}
        <Link
          href="/admin-dashboard?tab=settings"
          className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-[#121216]/60 rounded-xl transition-all"
          title="Admin Settings"
        >
          <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>

        {/* Divider */}
        <span className="h-6 w-px bg-zinc-800 hidden sm:block"></span>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none group text-left"
          >
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()!}
                alt={user?.name || "Admin avatar"}
                className="w-9 h-9 rounded-full object-cover border border-yellow-500/20 group-hover:border-yellow-400 transition-all shadow-[0_0_10px_rgba(234,179,8,0.1)] group-hover:shadow-[0_0_15px_rgba(234,179,8,0.2)]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/30 text-yellow-400 border border-yellow-500/20 group-hover:border-yellow-400 flex items-center justify-center text-xs font-black font-mono tracking-wider transition-all shadow-[0_0_10px_rgba(234,179,8,0.05)] group-hover:shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                {getInitials()}
              </div>
            )}
            <div className="hidden md:block">
              <p className="text-xs font-bold text-white group-hover:text-yellow-400 transition-colors uppercase tracking-wider">
                {user?.name || "Admin User"}
              </p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                {user?.role || "Administrator"}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Admin Context Menu Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-52 rounded-xl bg-[#0e0e12] border border-[#1e1e24] shadow-2xl py-2 z-50 transform origin-top-right transition-all">
              <div className="px-4 py-2.5 border-b border-[#1e1e24] mb-1">
                <p className="text-xs font-black text-white truncate uppercase tracking-wide">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                  {user?.email || "admin@levelup.com"}
                </p>
              </div>

              <Link
                href="/admin-dashboard?tab=settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-yellow-400 hover:bg-[#121216] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                Admin Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
