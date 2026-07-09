"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CoachAthletesTable from "@/components/coach/CoachAthletesTable";
import CoachWorkoutPlans from "@/components/coach/CoachWorkoutPlans";
import CoachAnalytics from "@/components/coach/CoachAnalytics";
import CoachEarnings from "@/components/coach/CoachEarnings";
import { coachAPI } from "@/lib/api";

function CoachDashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tab === "dashboard") {
      fetchDashboardStats();
    }
  }, [tab]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await coachAPI.getDashboardStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (tab === "athletes") {
    return <CoachAthletesTable />;
  }

  if (tab === "workout-plans") {
    return <CoachWorkoutPlans />;
  }

  if (tab === "analytics") {
    return <CoachAnalytics />;
  }

  if (tab === "earnings") {
    return <CoachEarnings />;
  }

  if (tab === "settings") {
    return (
      <div className="space-y-6">
        <section className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
            Settings
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Manage your coach settings.</p>
        </section>
        <div className="bg-[#0e0e12]/40 border border-zinc-800/80 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Coming Soon</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            This section is currently disabled.
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Athletes",
      value: stats?.totalAthletes?.toString() || "0",
      change: "Active athletes",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Workout Plans",
      value: stats?.totalWorkoutPlans?.toString() || "0",
      change: `${stats?.publishedPlans || 0} published`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: "Assigned Plans",
      value: stats?.assignedPlans?.toString() || "0",
      change: "Currently active",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Completed Workouts",
      value: stats?.totalCompletedWorkouts?.toString() || "0",
      change: "Total completed",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Avg Athlete Level",
      value: stats?.averageAthleteLevel?.toString() || "0",
      change: "Average level",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4--4-6 6" />
        </svg>
      ),
    },
    {
      label: "Published Plans",
      value: stats?.publishedPlans?.toString() || "0",
      change: "Available to assign",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <section className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide">
            Welcome Back,{" "}
            <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.15)]">
              Coach
            </span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Manage your athletes and workout plans.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
                </div>
                <div className="w-11 h-11 rounded-xl bg-zinc-800 animate-pulse shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <section className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide">
            Welcome Back,{" "}
            <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.15)]">
              Coach
            </span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Manage your athletes and workout plans.
          </p>
        </section>

        <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-wide">
          Welcome Back,{" "}
          <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.15)]">
            Coach
          </span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2">
          Manage your athletes and workout plans.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg hover:border-yellow-400/30 hover:shadow-[0_0_20px_rgba(250,204,21,0.05)] transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {card.label}
                </p>
                <p className="text-3xl lg:text-4xl font-black text-white group-hover:text-yellow-400 transition-colors">
                  {card.value}
                </p>
                <p className="text-xs text-zinc-500">{card.change}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 shrink-0">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CoachDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-white">
          <span className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-zinc-500 font-mono text-xs tracking-wider uppercase">
            Loading views...
          </p>
        </div>
      }
    >
      <CoachDashboardContent />
    </Suspense>
  );
}
