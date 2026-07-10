"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { withProtectedRoute } from "@/lib/protectedRoute";

function AnalyticsPageContent() {
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
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">Analytics</h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            View your fitness analytics and track your progress over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Workouts</p>
                <p className="text-3xl font-black text-white mt-1">24</p>
              </div>
              <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-bold font-mono">
                🏋️
              </span>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Calories Burned</p>
                <p className="text-3xl font-black text-white mt-1">14,880</p>
              </div>
              <span className="p-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold">
                🔥
              </span>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Workout Time</p>
                <p className="text-3xl font-black text-white mt-1">18 hrs</p>
              </div>
              <span className="p-2 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold">
                ⏱️
              </span>
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
          </div>
        </div>

        <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl space-y-6">
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
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(AnalyticsPageContent, ["user"]);
