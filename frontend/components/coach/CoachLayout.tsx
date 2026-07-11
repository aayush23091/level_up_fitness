"use client";

import React, { ReactNode, useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";
import CoachSidebar from "./CoachSidebar";
import CoachNavbar from "./CoachNavbar";

interface CoachLayoutProps {
  children: ReactNode;
}

function CoachSidebarFallback() {
  return (
    <aside className="hidden lg:block w-64 bg-card border-r border-border shrink-0" />
  );
}

export default function CoachLayout({ children }: CoachLayoutProps) {
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

    if (user.role !== "coach") {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground">
        <span className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-muted font-mono text-sm tracking-wider uppercase">
          LOADING...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "coach") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <CoachNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={<CoachSidebarFallback />}>
          <CoachSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </Suspense>

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
