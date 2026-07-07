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
    <aside className="hidden lg:block w-64 bg-zinc-950 border-r border-zinc-800 shrink-0" />
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
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4 text-white">
        <span className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 font-mono text-sm tracking-wider uppercase">
          LOADING...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "coach") {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden">
      <CoachNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={<CoachSidebarFallback />}>
          <CoachSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </Suspense>

        <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
