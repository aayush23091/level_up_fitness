"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";

  // Tab Header Details
  const getTabDetails = () => {
    switch (tab) {
      case "users":
        return {
          title: "User Management",
          subtitle: "Oversee registered fitness accounts and user activity.",
        };
      case "coaches":
        return {
          title: "Coach Approvals",
          subtitle: "Verify incoming trainer credentials and approve public profiles.",
        };
      case "settings":
        return {
          title: "System Settings",
          subtitle: "Configure global application defaults, API limits, and credentials.",
        };
      case "dashboard":
      default:
        return {
          title: "Platform Health",
          subtitle: "Real-time performance metrics and administrative oversight.",
        };
    }
  };

  const details = getTabDetails();

  return (
    <div className="space-y-6">
      {/* Dynamic Header Section */}
      <section className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
          {details.title.split(" ")[0]}{" "}
          <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.15)]">
            {details.title.split(" ").slice(1).join(" ")}
          </span>
        </h1>
        <p className="text-zinc-500 text-xs mt-1">{details.subtitle}</p>
      </section>

      {/* Main Welcome Container */}
      <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400/10 text-yellow-400 border border-yellow-500/20">
              System Active
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Welcome back to the Command Center
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              You are currently viewing the <span className="text-white font-semibold uppercase">{tab}</span> dashboard section. Use the sidebar menu to navigate through client directory lists, pending coach certifications, system audit logs, and security parameters.
            </p>
          </div>

          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/40 border border-zinc-700/50 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
              <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Static Mock Placeholder Grids */}
      {tab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Recent Audits Shell */}
          <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Recent System Events
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-900">
                <span className="text-zinc-400">Admin session authenticated</span>
                <span className="text-zinc-600 font-mono">Just Now</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-900">
                <span className="text-zinc-400">New trainer registration submitted</span>
                <span className="text-zinc-600 font-mono">2 mins ago</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-zinc-400">Database migration complete</span>
                <span className="text-zinc-600 font-mono">1 hour ago</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Shell */}
          <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Administrative Tasks
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-900">
                <span className="text-zinc-400">Pending trainer reviews</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 text-[10px] font-bold">2 Pending</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-900">
                <span className="text-zinc-400">System warnings</span>
                <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold">0 Alerts</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2">
                <span className="text-zinc-400">API health status</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">99.9% Online</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Specific Content Stubs */}
      {tab === "users" && <AdminUsersTable />}

      {tab === "coaches" && (
        <div className="bg-[#0e0e12]/40 border border-zinc-800/80 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pending Coach Applications</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Coach profiles, cert validations, and approval actions are disabled for now.
          </p>
        </div>
      )}

      {tab === "settings" && (
        <div className="bg-[#0e0e12]/40 border border-zinc-800/80 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Parameters</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Configurable variables, database settings, and global parameters are disabled for now.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-white">
          <span className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-zinc-500 font-mono text-xs tracking-wider uppercase">Loading views...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}