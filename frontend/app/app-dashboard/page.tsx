"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function AppDashboardPage() {
  const { user } = useAuth();

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

  // Mock data for weekly progress
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
        {/* Welcome Section */}
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

        {/* Level Up Stats Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Level Progress */}
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

          {/* Daily Burn */}
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

          {/* Workout Time */}
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

          {/* Streak Tracker */}
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

        {/* Dashboard Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Weekly Activity */}
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Weekly Activity Analysis</h2>
              <span className="text-xs text-gray-500 font-medium bg-[#121216] border border-[#1e1e24] px-2.5 py-1 rounded-md">
                This Week
              </span>
            </div>

            {/* Weekly chart mock */}
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

          {/* Right Column - Fitness Goals / Achievements */}
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold text-white">Recent Achievements</h2>

            <div className="space-y-4">
              {/* Achievement 1 */}
              <div className="flex gap-4 p-4 bg-[#121216] border border-[#1e1e24] rounded-xl hover:border-yellow-500/10 transition-all">
                <span className="w-10 h-10 shrink-0 bg-yellow-500/10 text-yellow-500 flex items-center justify-center rounded-xl text-lg font-bold">
                  🥇
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">First Step Complete</p>
                  <p className="text-xs text-gray-500 mt-0.5">Completed the onboarding workout.</p>
                </div>
              </div>

              {/* Achievement 2 */}
              <div className="flex gap-4 p-4 bg-[#121216] border border-[#1e1e24] rounded-xl hover:border-yellow-500/10 transition-all">
                <span className="w-10 h-10 shrink-0 bg-orange-500/10 text-orange-500 flex items-center justify-center rounded-xl text-lg font-bold">
                  🔥
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">5-Day Hot Streak</p>
                  <p className="text-xs text-gray-500 mt-0.5">Checked in 5 days consecutively.</p>
                </div>
              </div>

              {/* Achievement 3 */}
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

        {/* Quick Programs */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Recommended Workouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Workout 1 */}
            <div className="group bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl hover:border-yellow-500/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full filter blur-xl group-hover:bg-yellow-500/10 transition-all"></div>
              <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest font-mono">
                Strength
              </span>
              <h3 className="text-lg font-bold text-white mt-1 group-hover:text-yellow-500 transition-colors">
                Full Body Hypertrophy
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                A high volume resistance workout targets all muscle groups.
              </p>
              <div className="flex justify-between items-center mt-6 text-xs text-gray-400 font-semibold font-mono">
                <span>⏱️ 55 Min</span>
                <span>🔥 Intermediate</span>
              </div>
            </div>

            {/* Workout 2 */}
            <div className="group bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl hover:border-yellow-500/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full filter blur-xl group-hover:bg-red-500/10 transition-all"></div>
              <span className="text-xs text-red-500 font-bold uppercase tracking-widest font-mono">
                HIIT Cardio
              </span>
              <h3 className="text-lg font-bold text-white mt-1 group-hover:text-red-500 transition-colors">
                Tabata Cardio Shred
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Fast-paced intervals designed to maximize metabolic burn.
              </p>
              <div className="flex justify-between items-center mt-6 text-xs text-gray-400 font-semibold font-mono">
                <span>⏱️ 30 Min</span>
                <span>🔥 Advanced</span>
              </div>
            </div>

            {/* Workout 3 */}
            <div className="group bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl hover:border-yellow-500/30 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full filter blur-xl group-hover:bg-blue-500/10 transition-all"></div>
              <span className="text-xs text-blue-500 font-bold uppercase tracking-widest font-mono">
                Mobility
              </span>
              <h3 className="text-lg font-bold text-white mt-1 group-hover:text-blue-500 transition-colors">
                Deep Stretch & Release
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Focused alignment, breathing techniques, and active recovery.
              </p>
              <div className="flex justify-between items-center mt-6 text-xs text-gray-400 font-semibold font-mono">
                <span>⏱️ 20 Min</span>
                <span>🔥 Beginner</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
