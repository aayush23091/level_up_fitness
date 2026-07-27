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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <span className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></span>
        <p className="text-muted font-mono text-sm tracking-wider uppercase">
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
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
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}