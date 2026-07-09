"use client";

import React, { useState, useEffect } from "react";
import {
  coachAPI,
  AnalyticsOverviewResponse,
  AnalyticsAthletesResponse,
  AnalyticsPlansResponse,
} from "@/lib/api";

const statusStyles: Record<string, string> = {
  Published:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Draft: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

function getStatusStyle(status: string) {
  return statusStyles[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CoachAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverviewResponse["data"] | null>(null);
  const [athletes, setAthletes] = useState<AnalyticsAthletesResponse["data"]>([]);
  const [plans, setPlans] = useState<AnalyticsPlansResponse["data"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, athletesRes, plansRes] = await Promise.all([
        coachAPI.getAnalyticsOverview(),
        coachAPI.getAnalyticsAthletes(),
        coachAPI.getAnalyticsPlans(),
      ]);

      if (!overviewRes.success) throw new Error(overviewRes.message);
      if (!athletesRes.success) throw new Error(athletesRes.message);
      if (!plansRes.success) throw new Error(plansRes.message);

      setOverview(overviewRes.data);
      setAthletes(athletesRes.data);
      setPlans(plansRes.data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const overviewCards = overview
    ? [
        {
          label: "Total Athletes",
          value: overview.totalAthletes.toString(),
          change: `${overview.activeAthletes} active`,
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          label: "Total Workout Plans",
          value: overview.totalWorkoutPlans.toString(),
          change: `${overview.publishedPlans} published`,
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
        },
        {
          label: "Assigned Plans",
          value: overview.assignedPlans.toString(),
          change: "Currently active",
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          label: "Total Revenue",
          value: `$${overview.totalRevenue.toLocaleString()}`,
          change: "From active clients",
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          label: "Avg Athlete Level",
          value: overview.averageAthleteLevel.toString(),
          change: "Across active athletes",
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ),
        },
        {
          label: "Draft Plans",
          value: overview.draftPlans.toString(),
          change: "Not yet published",
          icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
        },
      ]
    : [];

  const activityIcon = (type: string) => {
    switch (type) {
      case "client_hire":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case "plan_created":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case "plan_assigned":
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <section className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
            Analytics
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Insights across your coaching business.</p>
        </section>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg">
              <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
              <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse mt-3" />
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse mt-3" />
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
          <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
            Analytics
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Insights across your coaching business.</p>
        </section>
        <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchAnalytics}
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
        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
          Analytics
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Insights across your coaching business.</p>
      </section>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {overviewCards.map((card) => (
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Activity Timeline */}
        <div className="xl:col-span-1">
          <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-5 lg:p-6">
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-5">
              Recent Activity
            </h2>
            {overview && overview.recentActivities.length > 0 ? (
              <ol className="relative border-l border-zinc-800 ml-3 space-y-6">
                {overview.recentActivities.map((activity, idx) => (
                  <li key={idx} className="ml-5">
                    <span className="absolute -left-[9px] flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
                      {activityIcon(activity.type)}
                    </span>
                    <p className="text-sm font-semibold text-white leading-snug">
                      {activity.title}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{activity.description}</p>
                    <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">
                      {formatDateTime(activity.date)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="text-center py-10">
                <span className="text-2xl">📈</span>
                <p className="text-xs text-zinc-500 mt-2">No recent activity yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Athlete Table */}
        <div className="xl:col-span-2">
          <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-zinc-800">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Athletes
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Your active coaching clients.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                    <th className="px-6 py-4">Athlete</th>
                    <th className="px-6 py-4">Level</th>
                    <th className="px-6 py-4">XP</th>
                    <th className="px-6 py-4">Coins</th>
                    <th className="px-6 py-4">Plans</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-sm">
                  {athletes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="space-y-3">
                          <span className="text-3xl">👥</span>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                            No athletes found
                          </h4>
                          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                            You don&apos;t have any active athletes yet.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    athletes.map((athlete, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/30 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                              {getInitials(athlete.name)}
                            </div>
                            <div>
                              <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                                {athlete.name}
                              </p>
                              <p className="text-zinc-500 text-xs">@{athlete.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                          {athlete.level}
                        </td>
                        <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                          {athlete.xp}
                        </td>
                        <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                          {athlete.coins}
                        </td>
                        <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                          {athlete.assignedPlans}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-xs">
                          {formatDate(athlete.joinedDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Workout Plan Performance Table */}
      <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Workout Plan Performance
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Engagement and assignment stats for your plans.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Exercises</th>
                <th className="px-6 py-4">Assigned</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-sm">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">📋</span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        No workout plans found
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        Create a workout plan to see its performance here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((plan, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/20 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                        {plan.title}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                      {plan.difficulty}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(
                          plan.status
                        )}`}
                      >
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                      {plan.exerciseCount}
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                      {plan.assignedCount}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {formatDate(plan.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
