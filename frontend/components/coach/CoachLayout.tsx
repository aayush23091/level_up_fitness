"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getDashboardPath } from "@/lib/auth";

interface CoachLayoutProps {
  children: ReactNode;
}

export default function CoachLayout({ children }: CoachLayoutProps) {
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
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-4 text-white">
        <span className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
        <p className="text-zinc-500 font-mono text-sm tracking-wider uppercase">
          LOADING...
        </p>
      </div>
    );
  }

  if (!user || user.role !== "coach") {
    return null;
  }

  return <>{children}</>;
}
