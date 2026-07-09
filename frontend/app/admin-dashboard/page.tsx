"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminCoachesTable from "@/components/admin/AdminCoachesTable";
import { adminAPI, User, authAPI } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";

function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "dashboard";
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  
  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch dashboard stats when tab is dashboard
  useEffect(() => {
    if (tab === "dashboard") {
      const fetchStats = async () => {
        try {
          const response = await adminAPI.getDashboardStats();
          setStats(response.data);
        } catch (error) {
          console.error("Failed to fetch dashboard stats:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [tab]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setIsSubmitting(false);
      setErrorMsg("New password and confirmation do not match");
      return;
    }

    try {
      const response = await authAPI.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccessMsg("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Dashboard Stats Cards */}
      {tab === "dashboard" && (
        <div className="space-y-6 pt-2">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 animate-pulse">
                  <div className="h-4 bg-zinc-800 rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Users</h3>
                  <p className="text-3xl font-black text-yellow-400">{stats?.totalUsers || 0}</p>
                </div>
                <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Coaches</h3>
                  <p className="text-3xl font-black text-yellow-400">{stats?.totalCoaches || 0}</p>
                </div>
                <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Workout Plans</h3>
                  <p className="text-3xl font-black text-yellow-400">{stats?.totalWorkoutPlans || 0}</p>
                </div>
                <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-yellow-500/30 transition-all">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Published Plans</h3>
                  <p className="text-3xl font-black text-yellow-400">{stats?.totalPublishedPlans || 0}</p>
                </div>
              </>
            )}
          </div>

          {/* Recent Users and Coaches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Recent Users
              </h3>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2 animate-pulse">
                      <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                      <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
                    </div>
                  ))
                ) : stats?.recentUsers?.length > 0 ? (
                  stats.recentUsers.map((user: User) => (
                    <div key={user._id} className="flex items-center justify-between py-2 border-b border-zinc-900 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                      <p className="text-xs text-zinc-600 font-mono">
                        {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">No recent users</p>
                )}
              </div>
            </div>

            {/* Recent Coaches */}
            <div className="bg-[#0e0e12]/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Recent Coaches
              </h3>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2 animate-pulse">
                      <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
                      <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
                    </div>
                  ))
                ) : stats?.recentCoaches?.length > 0 ? (
                  stats.recentCoaches.map((coach: User) => (
                    <div key={coach._id} className="flex items-center justify-between py-2 border-b border-zinc-900 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{coach.name}</p>
                        <p className="text-xs text-zinc-500">{coach.email}</p>
                      </div>
                      <p className="text-xs text-zinc-600 font-mono">
                        {coach.createdAt ? formatDate(coach.createdAt) : "N/A"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500">No recent coaches</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Specific Content Stubs */}
      {tab === "users" && <AdminUsersTable />}

      {tab === "coaches" && <AdminCoachesTable />}

      {tab === "settings" && (
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Admin Profile</h2>
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</p>
                    <p className="text-white text-sm font-medium mt-1">{user?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</p>
                    <p className="text-white text-sm font-medium mt-1">{user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</p>
                    <p className="text-yellow-400 text-sm font-bold mt-1 uppercase">{user?.role || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Change Password</h2>
              <p className="text-zinc-500 text-xs mt-1">Update your password to keep your account secure.</p>
              <form onSubmit={handleChangePassword} className="mt-6 space-y-5 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>

                {/* Feedback */}
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg font-medium">
                    {successMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/10"
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </div>

          {/* Logout Section */}
          <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Logout</h2>
              <p className="text-zinc-500 text-xs mt-1">Sign out of your admin account.</p>
              <button
                onClick={logout}
                className="mt-6 px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-red-500/10"
              >
                Logout
              </button>
            </div>
          </div>
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