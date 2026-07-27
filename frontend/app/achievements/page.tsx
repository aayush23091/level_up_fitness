"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { withProtectedRoute } from "@/lib/protectedRoute";
import { userAPI, UserAchievementWithProgress } from "@/lib/api";

function AchievementsPageContent() {
  const [achievements, setAchievements] = useState<UserAchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await userAPI.getAchievements();
        setAchievements(res.data);
      } catch (err) {
        console.error("Failed to fetch achievements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const getIconForCondition = (conditionType: string) => {
    switch (conditionType) {
      case "workout_completed":
        return "🏋️";
      case "xp_earned":
        return "⭐";
      case "level_reached":
        return "🎖️";
      case "streak_days":
        return "🔥";
      default:
        return "🏆";
    }
  };

  const formatCondition = (conditionType: string, conditionValue: number) => {
    switch (conditionType) {
      case "workout_completed":
        return `Complete ${conditionValue} workouts`;
      case "xp_earned":
        return `Earn ${conditionValue} XP`;
      case "level_reached":
        return `Reach level ${conditionValue}`;
      case "streak_days":
        return `Streak for ${conditionValue} days`;
      default:
        return "";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">Achievements</h1>
          <p className="text-muted text-xs lg:text-sm mt-1">
            Track your progress and unlock achievements.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((item, idx) => (
              <div
                key={idx}
                className={`bg-card border border-border p-6 rounded-2xl flex flex-col gap-4 ${
                  item.unlocked ? "hover:border-yellow-500/20" : "opacity-70"
                } transition-all`}
              >
                <div className="flex gap-4">
                  <span className="w-12 h-12 shrink-0 bg-accent/10 text-accent flex items-center justify-center rounded-xl text-2xl font-bold">
                    {getIconForCondition(item.achievement.conditionType)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{item.achievement.title}</p>
                    <p className="text-xs text-muted mt-0.5">{item.achievement.description}</p>
                  </div>
                </div>

                {!item.unlocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted">
                      <span>{formatCondition(item.achievement.conditionType, item.achievement.conditionValue)}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-card-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.unlocked && (
                  <div className="flex flex-wrap gap-2 text-xs text-accent">
                    <span>+{item.achievement.xpReward} XP</span>
                    <span>+{item.achievement.coinReward} Coins</span>
                    {item.unlockedAt && (
                      <span className="text-muted ml-auto">
                        Unlocked {new Date(item.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(AchievementsPageContent, ["user"]);
