"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/app/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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

    if (user.role === "admin") {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <span className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></span>
        <p className="text-muted font-mono text-sm tracking-wider">LOADING USER PROFILE...</p>
      </div>
    );
  }

  if (!user || user.role === "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Navbar Header */}
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-background focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
