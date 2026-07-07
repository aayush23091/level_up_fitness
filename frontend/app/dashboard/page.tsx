"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withProtectedRoute } from "@/lib/protectedRoute";
import WorkoutLibrary from "@/components/workouts/WorkoutLibrary";

function DashboardPageContent() {
  const { user } = useAuth();
  const router = useRouter();

  const getAvatarUrl = () => {
    if (user?.profilePhoto) {
      return user.profilePhoto.startsWith("http")
        ? user.profilePhoto
        : `http://localhost:5000${user.profilePhoto}`;
    }
    return null;
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const weeklyActivity = [
    { day: "Mon", active: true, value: 80 },
    { day: "Tue", active: true, value: 65 },
    { day: "Wed", active: false, value: 0 },
    { day: "Thu", active: true, value: 95 },
    { day: "Fri", active: true, value: 40 },
    { day: "Sat", active: false, value: 0 },
    { day: "Sun", active: false, value: 0 },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0e0e12] to-[#16161c] p-6 lg:p-8 rounded-2xl border border-[#1e1e24] shadow-lg">
          <div className="flex items-center gap-4 lg:gap-6">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()!}
                alt={user?.name || "Profile Photo"}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-yellow-500/30"
              />
            ) : (
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 border-2 border-yellow-500/30 text-yellow-500 flex items-center justify-center text-xl font-bold font-mono">
                {getInitials()}
              </div>
            )}
            <div>
              <h1 className="text-xl lg:text-3xl font-black text-white">
                WELCOME BACK, <span className="text-yellow-500 uppercase">{user?.name?.split(" ")[0]}</span>!
              </h1>
              <p className="text-gray-400 text-xs lg:text-sm mt-1">
                Your streaks are hot! Ready to level up your fitness goals today?
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="self-start md:self-auto px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/10"
          >
            View Profile
          </Link>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Level Status</p>
                <p className="text-3xl font-black text-white mt-1">Lvl 12</p>
              </div>
              <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-bold font-mono">
                XP
              </span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span>Progress</span>
                <span>2,450 / 3,000 XP</span>
              </div>
              <div className="w-full bg-[#1c1c24] h-2 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: "81%" }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Daily Calorie Burn</p>
                <p className="text-3xl font-black text-white mt-1">620 kcal</p>
              </div>
              <span className="p-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold">
                🔥
              </span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span>Goal: 800 kcal</span>
                <span>77%</span>
              </div>
              <div className="w-full bg-[#1c1c24] h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: "77%" }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Workout Time</p>
                <p className="text-3xl font-black text-white mt-1">45 min</p>
              </div>
              <span className="p-2 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold">
                ⏱️
              </span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span>Goal: 60 min</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-[#1c1c24] h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Current Streak</p>
                <p className="text-3xl font-black text-white mt-1">5 Days</p>
              </div>
              <span className="p-2 bg-orange-500/10 text-orange-500 rounded-lg text-xs font-bold">
                ⚡
              </span>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span>Personal Best</span>
                <span>12 Days</span>
              </div>
              <div className="w-full bg-[#1c1c24] h-2 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: "42%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Weekly Activity Analysis</h2>
              <span className="text-xs text-gray-500 font-medium bg-[#121216] border border-[#1e1e24] px-2.5 py-1 rounded-md">
                This Week
              </span>
            </div>

            <div className="h-64 flex items-end justify-between px-4 pb-2 border-b border-[#1e1e24]">
              {weeklyActivity.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3 w-10">
                  <div className="w-full bg-[#121216] h-48 rounded-lg relative flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        day.active
                          ? "bg-gradient-to-t from-yellow-600 to-yellow-400 shadow-md shadow-yellow-500/15"
                          : "bg-gray-800/10"
                      }`}
                      style={{ height: `${day.value}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{day.day}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Active Days
              </span>
              <span>Total Workout: 4.5 hrs</span>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold text-white">Recent Achievements</h2>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-[#121216] border border-[#1e1e24] rounded-xl hover:border-yellow-500/10 transition-all">
                <span className="w-10 h-10 shrink-0 bg-yellow-500/10 text-yellow-500 flex items-center justify-center rounded-xl text-lg font-bold">
                  🥇
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">First Step Complete</p>
                  <p className="text-xs text-gray-500 mt-0.5">Completed the onboarding workout.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-[#121216] border border-[#1e1e24] rounded-xl hover:border-yellow-500/10 transition-all">
                <span className="w-10 h-10 shrink-0 bg-orange-500/10 text-orange-500 flex items-center justify-center rounded-xl text-lg font-bold">
                  🔥
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">5-Day Hot Streak</p>
                  <p className="text-xs text-gray-500 mt-0.5">Checked in 5 days consecutively.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-[#121216] border border-[#1e1e24] rounded-xl hover:border-yellow-500/10 transition-all opacity-40">
                <span className="w-10 h-10 shrink-0 bg-purple-500/10 text-purple-500 flex items-center justify-center rounded-xl text-lg font-bold">
                  👑
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">HIIT Master</p>
                  <p className="text-xs text-gray-500 mt-0.5">Complete 10 HIIT classes.</p>
                </div>
              </div>
            </div>

            <Link
              href="/profile"
              className="block w-full py-2.5 text-center text-xs font-bold text-yellow-500 bg-[#121216] hover:bg-[#1a1a24] border border-yellow-500/20 hover:border-yellow-500/40 rounded-lg uppercase tracking-wider transition-all"
            >
              View All Achievements
            </Link>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Workout Library</h2>
          <WorkoutLibrary />
        </section>
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(DashboardPageContent, ["user"]);
