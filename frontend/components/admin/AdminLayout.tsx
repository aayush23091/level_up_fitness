"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-4 text-white">
        <span className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
        <p className="text-zinc-500 font-mono text-sm tracking-wider uppercase">
          LOADING...
        </p>
      </div>
    );
  }

  // Don't render until login status is known
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col font-sans overflow-hidden">
      {/* Top Navbar */}
      <AdminNavbar
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#08080a] p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}