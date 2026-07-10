"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { withProtectedRoute } from "@/lib/protectedRoute";
import { userAPI } from "@/lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#facc15", "#eab308", "#ca8a04", "#a16207", "#854d0e"];

function AnalyticsPageContent() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await userAPI.getAnalytics();
        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-[#1e1e24] rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-[#1e1e24] rounded-2xl"></div>
              ))}
            </div>
            <div className="h-96 bg-[#1e1e24] rounded-2xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const overview = analytics?.overview || {};
  const workoutTrend = analytics?.workoutTrend || [];
  const weeklyActivity = analytics?.weeklyActivity || [];
  const workoutCategories = analytics?.workoutCategories || [];
  const xpProgress = analytics?.xpProgress || [];
  const achievementProgress = analytics?.achievementProgress || {};
  const personalBest = analytics?.personalBest || {};

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">Analytics</h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            View your fitness analytics and track your progress over time.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Workouts</p>
                <p className="text-3xl font-black text-white mt-1">{overview.totalWorkouts || 0}</p>
              </div>
              <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-bold font-mono">
                🏋️
              </span>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Current Streak</p>
                <p className="text-3xl font-black text-white mt-1">{overview.currentStreak || 0} Days</p>
              </div>
              <span className="p-2 bg-orange-500/10 text-orange-500 rounded-lg text-xs font-bold">
                ⚡
              </span>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total XP</p>
                <p className="text-3xl font-black text-white mt-1">{overview.totalXP || 0}</p>
              </div>
              <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-bold">
                ⭐
              </span>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex flex-col justify-between hover:border-yellow-500/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Coins</p>
                <p className="text-3xl font-black text-white mt-1">{overview.totalCoins || 0}</p>
              </div>
              <span className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-xs font-bold">
                🪙
              </span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workout Trend (Line Chart) */}
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Workout Completion Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workoutTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e24" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0e0e12",
                    border: "1px solid #1e1e24",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#facc15"
                  strokeWidth={2}
                  dot={{ fill: "#facc15", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Activity (Bar Chart) */}
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e24" />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0e0e12",
                    border: "1px solid #1e1e24",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
                <Bar dataKey="count" fill="#facc15" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Workout Categories (Pie Chart) */}
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Workout Categories</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workoutCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.category} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {workoutCategories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0e0e12",
                    border: "1px solid #1e1e24",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* XP Progress (Line Chart) */}
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">XP Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={xpProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e24" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0e0e12",
                    border: "1px solid #1e1e24",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#facc15"
                  strokeWidth={2}
                  dot={{ fill: "#facc15", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievement Progress & Personal Best */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Achievement Progress</h2>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#1e1e24"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#facc15"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray="351.86"
                    strokeDashoffset={
                      achievementProgress.total
                        ? 351.86 -
                          (351.86 * achievementProgress.unlocked) /
                            achievementProgress.total
                        : 351.86
                    }
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black text-white">
                    {achievementProgress.unlocked || 0}/{achievementProgress.total || 0}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Achievements Unlocked</p>
                <p className="text-yellow-500 font-bold mt-1">
                  {achievementProgress.total
                    ? `${Math.round(
                        (achievementProgress.unlocked / achievementProgress.total) * 100
                      )}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl">
            <h2 className="text-lg font-bold text-white mb-4">Personal Best</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#121216] rounded-xl">
                <span className="text-gray-400">Longest Streak</span>
                <span className="text-yellow-500 font-black text-xl">
                  {personalBest.longestStreak || 0} Days
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#121216] rounded-xl">
                <span className="text-gray-400">Most Workouts in a Week</span>
                <span className="text-yellow-500 font-black text-xl">
                  {personalBest.highestWeeklyWorkout || 0} Workouts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(AnalyticsPageContent, ["user"]);
