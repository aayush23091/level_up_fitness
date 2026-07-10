"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { withProtectedRoute } from "@/lib/protectedRoute";

function AchievementsPageContent() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">Achievements</h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            Track your progress and unlock achievements.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "First Step Complete", desc: "Completed the onboarding workout.", icon: "🥇", unlocked: true },
            { title: "5-Day Hot Streak", desc: "Checked in 5 days consecutively.", icon: "🔥", unlocked: true },
            { title: "HIIT Master", desc: "Complete 10 HIIT classes.", icon: "👑", unlocked: false },
            { title: "Strength Champion", desc: "Lift 1000 lbs total.", icon: "💪", unlocked: false },
            { title: "Cardio King", desc: "Run 50 miles total.", icon: "🏃", unlocked: false },
            { title: "Early Bird", desc: "Workout before 8 AM 10 times.", icon: "🌅", unlocked: false },
          ].map((achievement, idx) => (
            <div
              key={idx}
              className={`bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl flex gap-4 ${
                achievement.unlocked ? "hover:border-yellow-500/20" : "opacity-40"
              } transition-all`}
            >
              <span className="w-12 h-12 shrink-0 bg-yellow-500/10 text-yellow-500 flex items-center justify-center rounded-xl text-2xl font-bold">
                {achievement.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{achievement.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{achievement.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(AchievementsPageContent, ["user"]);
