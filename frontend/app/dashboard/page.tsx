"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withProtectedRoute } from "@/lib/protectedRoute";
import WorkoutLibrary from "@/components/workouts/WorkoutLibrary";
import { workoutPlanAPI, userAPI, StreakData } from "@/lib/api";

function DashboardPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [assignedWorkoutPlans, setAssignedWorkoutPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

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

  // Calculate XP progress (1000 XP per level)
  const xpPerLevel = 1000;
  const currentLevelXp = dashboard?.user?.xp % xpPerLevel;
  const xpProgressPercent = (currentLevelXp / xpPerLevel) * 100;

  useEffect(() => {
    const fetchAssignedWorkoutPlans = async () => {
      setLoadingPlans(true);
      setPlansError(null);
      try {
        const response = await workoutPlanAPI.getUserWorkoutPlans();
        if (response.success) {
          setAssignedWorkoutPlans(response.data);
        } else {
          setPlansError(response.message || "Failed to fetch workout plans");
        }
      } catch (err: any) {
        setPlansError(err.message || "An error occurred while loading workout plans");
      } finally {
        setLoadingPlans(false);
      }
    };

    const fetchDashboard = async () => {
      setLoadingDashboard(true);
      setDashboardError(null);
      try {
        const response = await userAPI.getDashboard();
        if (response.success) {
          setDashboard(response.data);
        } else {
          setDashboardError(response.message || "Failed to fetch dashboard data");
        }
      } catch (err: any) {
        setDashboardError(err.message || "An error occurred while loading dashboard data");
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchAssignedWorkoutPlans();
    fetchDashboard();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-card to-card-secondary p-6 lg:p-8 rounded-2xl border border-border shadow-lg">
          <div className="flex items-center gap-4 lg:gap-6">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()!}
                alt={user?.name || "Profile Photo"}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover border-2 border-accent/30"
              />
            ) : (
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 border-2 border-accent/30 text-accent flex items-center justify-center text-xl font-bold font-mono">
                {getInitials()}
              </div>
            )}
            <div>
              <h1 className="text-xl lg:text-3xl font-black text-foreground">
                WELCOME BACK, <span className="text-accent uppercase">{user?.name?.split(" ")[0]}</span>!
              </h1>
              <p className="text-muted text-xs lg:text-sm mt-1">
                Your streaks are hot! Ready to level up your fitness goals today?
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="self-start md:self-auto px-5 py-2.5 bg-accent hover:bg-accent/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-accent/10"
          >
            View Profile
          </Link>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Coins Card */}
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-accent/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider">Coins</p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {loadingDashboard ? (
                    <span className="w-24 h-8 bg-card-secondary rounded animate-pulse inline-block"></span>
                  ) : (
                    dashboard?.user?.coins || 0
                  )}
                </p>
              </div>
              <span className="p-2 bg-accent/10 text-accent rounded-lg text-xs font-bold font-mono">
                🪙
              </span>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-accent/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider">Level Status</p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {loadingDashboard ? (
                    <span className="w-20 h-8 bg-card-secondary rounded animate-pulse inline-block"></span>
                  ) : (
                    `Lvl ${dashboard?.user?.level || 0}`
                  )}
                </p>
              </div>
              <span className="p-2 bg-accent/10 text-accent rounded-lg text-xs font-bold font-mono">
                XP
              </span>
            </div>
            <div className="mt-6">
              {loadingDashboard ? (
                <div className="space-y-2">
                  <div className="w-full h-2 bg-card-secondary rounded-full animate-pulse"></div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-xs text-muted mb-1.5 font-medium">
                    <span>Progress</span>
                    <span>{currentLevelXp} / {xpPerLevel} XP</span>
                  </div>
                  <div className="w-full bg-card-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-accent h-full rounded-full transition-all" 
                      style={{ width: `${xpProgressPercent}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* XP Card */}
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-accent/20 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted font-semibold uppercase tracking-wider">Total XP</p>
                <p className="text-3xl font-black text-foreground mt-1">
                  {loadingDashboard ? (
                    <span className="w-24 h-8 bg-card-secondary rounded animate-pulse inline-block"></span>
                  ) : (
                    dashboard?.user?.xp || 0
                  )}
                </p>
              </div>
              <span className="p-2 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold">
                ⚡
              </span>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between hover:border-accent/20 transition-all">
            {loadingDashboard ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <span className="w-6 h-6 border-3 border-accent border-t-transparent rounded-full animate-spin inline-block"></span>
                <p className="text-muted font-mono text-xs tracking-wider uppercase">Loading streak...</p>
              </div>
            ) : dashboardError ? (
              <div className="text-center py-4">
                <p className="text-red-400 text-xs">{dashboardError}</p>
              </div>
            ) : dashboard?.streak ? (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider">Current Streak</p>
                    <p className="text-3xl font-black text-foreground mt-1">
                      {dashboard.streak.streakActive ? `${dashboard.streak.currentStreak} Days` : "Streak Lost"}
                    </p>
                  </div>
                  <span className={`p-2 rounded-lg text-xs font-bold ${dashboard.streak.streakActive ? "bg-orange-500/10 text-orange-500" : "bg-red-500/10 text-red-500"}`}>
                    {dashboard.streak.streakActive ? "⚡" : "🔥"}
                  </span>
                </div>
                <div className="mt-6 space-y-3">
                  {!dashboard.streak.streakActive && (
                    <p className="text-xs text-red-400">Complete a workout today to restart!</p>
                  )}
                  <div className="flex justify-between text-xs text-muted mb-1.5 font-medium">
                    <span>Personal Best</span>
                    <span>{dashboard.streak.longestStreak} Days</span>
                  </div>
                  <div className="w-full bg-card-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full rounded-full transition-all" 
                      style={{ 
                        width: `${dashboard.streak.longestStreak > 0 ? Math.min((dashboard.streak.currentStreak / dashboard.streak.longestStreak) * 100, 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                  {dashboard.streak.lastWorkoutDate && (
                    <p className="text-xs text-muted">
                      Last Workout: {new Date(dashboard.streak.lastWorkoutDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workout Stats */}
          <div className="bg-card border border-border p-6 rounded-2xl lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-foreground">Workout Stats</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 bg-card-secondary border border-border rounded-xl">
                <div className="w-12 h-12 flex items-center justify-center bg-accent/10 text-accent rounded-xl text-2xl font-bold">
                  🏃
                </div>
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider">Total Completed</p>
                  <p className="text-2xl font-black text-foreground">
                    {loadingDashboard ? (
                      <span className="w-16 h-8 bg-card-secondary rounded animate-pulse inline-block"></span>
                    ) : (
                      dashboard?.workouts?.totalCompleted || 0
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-card-secondary border border-border rounded-xl">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-xl text-2xl font-bold">
                  📅
                </div>
                <div>
                  <p className="text-xs text-muted font-semibold uppercase tracking-wider">This Week</p>
                  <p className="text-2xl font-black text-foreground">
                    {loadingDashboard ? (
                      <span className="w-16 h-8 bg-card-secondary rounded animate-pulse inline-block"></span>
                    ) : (
                      dashboard?.workouts?.weeklyCompleted || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Summary */}
          <div className="bg-card border border-border p-6 rounded-2xl space-y-6">
            <h2 className="text-lg font-bold text-foreground">Achievements</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-card-secondary border border-border rounded-xl">
                <div className="w-10 h-10 shrink-0 bg-accent/10 text-accent flex items-center justify-center rounded-xl text-lg font-bold">
                  🎯
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Unlocked</p>
                  <p className="text-xs text-muted mt-0.5">
                    {loadingDashboard ? (
                      <span className="w-12 h-4 bg-card-secondary rounded animate-pulse inline-block"></span>
                    ) : (
                      `${dashboard?.achievements?.unlockedCount || 0} / ${dashboard?.achievements?.totalCount || 0}`
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/achievements"
              className="block w-full py-2.5 text-center text-xs font-bold text-accent bg-card-secondary hover:bg-card border border-accent/20 hover:border-accent/40 rounded-lg uppercase tracking-wider transition-all"
            >
              View All Achievements
            </Link>
          </div>
        </div>

        {/* My Workout Plans Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">My Workout Plans</h2>
          
          {plansError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <p>{plansError}</p>
              </div>
            </div>
          )}

          {loadingPlans ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
              <span className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin inline-block"></span>
              <p className="text-muted font-mono text-xs tracking-wider uppercase">Loading workout plans...</p>
            </div>
          ) : assignedWorkoutPlans.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
              <div className="space-y-3">
                <span className="text-4xl block">📋</span>
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">No workout plans assigned</h4>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Your coach hasn't assigned any workout plans yet. Check back later!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedWorkoutPlans.map((plan) => (
                <div key={plan._id} className="bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/20 transition-all">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-foreground mb-1">{plan.title}</h3>
                        <p className="text-xs text-muted">by {plan.coach}</p>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        plan.difficulty === "Beginner" 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : plan.difficulty === "Intermediate"
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {plan.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {plan.estimatedDuration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {plan.exercises?.length || 0} exercises
                      </span>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <button className="w-full py-2.5 bg-accent hover:bg-accent/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors">
                        Start Workout
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Workout Library</h2>
          <WorkoutLibrary />
        </section>
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(DashboardPageContent, ["user"]);
