"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CoachAthletesTable from "@/components/coach/CoachAthletesTable";

const statCards = [
  {
    label: "Assigned Athletes",
    value: "24",
    change: "+3 this month",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: "Workout Plans",
    value: "12",
    change: "4 active programs",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: "Weekly Sessions",
    value: "38",
    change: "6 scheduled today",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Workout Completion",
    value: "87%",
    change: "+5% vs last week",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const recentActivity = [
  {
    athlete: "Marcus Chen",
    action: "Completed Upper Body Strength",
    time: "12 min ago",
  },
  {
    athlete: "Sarah Williams",
    action: "Logged nutrition for Day 14",
    time: "45 min ago",
  },
  {
    athlete: "James Rodriguez",
    action: "Missed scheduled HIIT session",
    time: "1 hour ago",
  },
  {
    athlete: "Emily Park",
    action: "Hit new PR on deadlift — 140 kg",
    time: "2 hours ago",
  },
  {
    athlete: "David Okonkwo",
    action: "Submitted weekly progress check-in",
    time: "3 hours ago",
  },
];

const upcomingSessions = [
  {
    athlete: "Marcus Chen",
    session: "Hypertrophy — Push Day",
    time: "Today, 2:00 PM",
    type: "In-Person",
  },
  {
    athlete: "Sarah Williams",
    session: "Mobility & Recovery",
    time: "Today, 4:30 PM",
    type: "Virtual",
  },
  {
    athlete: "Emily Park",
    session: "Strength Assessment",
    time: "Tomorrow, 9:00 AM",
    type: "In-Person",
  },
  {
    athlete: "James Rodriguez",
    session: "Cardio Endurance Block",
    time: "Tomorrow, 11:30 AM",
    type: "Virtual",
  },
];

function CoachDashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  if (tab === "athletes") {
    return <CoachAthletesTable />;
  }

  if (tab === "workout-plans" || tab === "analytics" || tab === "settings") {
    const getTabName = () => {
      switch (tab) {
        case "workout-plans":
          return "Workout Plans";
        case "analytics":
          return "Analytics";
        case "settings":
          return "Settings";
        default:
          return tab;
      }
    };
    return (
      <div className="space-y-6">
        <section className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
            {getTabName()}
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Manage your coach {tab}.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-3 flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
            Recent Activity
          </h2>
          <div className="space-y-1">
            {recentActivity.map((item) => (
              <div
                key={`${item.athlete}-${item.time}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-zinc-800/80 last:border-0 hover:bg-zinc-800/30 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{item.athlete}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.action}</p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono shrink-0">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-3 flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-yellow-400 rounded-full" />
            Upcoming Sessions
          </h2>
          <div className="space-y-1">
            {upcomingSessions.map((session) => (
              <div
                key={`${session.athlete}-${session.time}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 border-b border-zinc-800/80 last:border-0 hover:bg-zinc-800/30 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{session.athlete}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{session.session}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-1 shrink-0">
                  <span className="text-[11px] text-zinc-500 font-mono">{session.time}</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 w-fit">
                    {session.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
