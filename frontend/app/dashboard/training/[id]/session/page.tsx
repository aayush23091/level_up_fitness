"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { workoutAPI, Workout, userAPI, CompleteWorkoutResponse } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import DashboardLayout from "@/app/components/DashboardLayout";

interface MockExercise {
  name: string;
  sets: string;
}

function getMockExercisesAndCalories(title: string): {
  exercises: MockExercise[];
  calories: number;
} {
  const t = title.toLowerCase();

  if (t.includes("chest") || t.includes("triceps")) {
    return {
      calories: 420,
      exercises: [
        { name: "Barbell Bench Press", sets: "4 sets x 8-10 reps" },
        { name: "Incline Dumbbell Press", sets: "3 sets x 10-12 reps" },
        { name: "Cable Chest Flyes", sets: "3 sets x 12-15 reps" },
        { name: "Overhead Dumbbell Tricep Extension", sets: "3 sets x 10 reps" },
        { name: "Tricep Rope Pushdowns", sets: "3 sets x 12 reps" },
      ],
    };
  }

  if (t.includes("leg")) {
    return {
      calories: 580,
      exercises: [
        { name: "Barbell Back Squats", sets: "4 sets x 6-8 reps" },
        { name: "Romanian Deadlifts", sets: "3 sets x 8-10 reps" },
        { name: "Leg Press", sets: "3 sets x 10-12 reps" },
        { name: "Walking Lunges", sets: "3 sets x 12 steps per leg" },
        { name: "Standing Calf Raises", sets: "4 sets x 15 reps" },
      ],
    };
  }

  if (t.includes("hiit") || t.includes("cardio")) {
    return {
      calories: 390,
      exercises: [
        { name: "Jump Squats", sets: "3 sets x 45s work / 15s rest" },
        { name: "Mountain Climbers", sets: "3 sets x 45s work / 15s rest" },
        { name: "Burpees", sets: "3 sets x 45s work / 15s rest" },
        { name: "High Knees", sets: "3 sets x 45s work / 15s rest" },
        { name: "Plank Jacks", sets: "3 sets x 45s work / 15s rest" },
      ],
    };
  }

  if (t.includes("core") || t.includes("crusher")) {
    return {
      calories: 160,
      exercises: [
        { name: "Hanging Leg Raises", sets: "3 sets x 12 reps" },
        { name: "Ab Wheel Rollouts", sets: "3 sets x 10 reps" },
        { name: "Russian Twists", sets: "3 sets x 20 reps" },
        { name: "Bicycle Crunches", sets: "3 sets x 25 reps" },
        { name: "Forearm Plank", sets: "3 sets x 60s hold" },
      ],
    };
  }

  if (t.includes("back") || t.includes("builder")) {
    return {
      calories: 380,
      exercises: [
        { name: "Pull-Ups", sets: "4 sets x Max reps" },
        { name: "Bent-Over Barbell Rows", sets: "3 sets x 8-10 reps" },
        { name: "Lat Pulldowns", sets: "3 sets x 10-12 reps" },
        { name: "Single-Arm Dumbbell Rows", sets: "3 sets x 10 reps per side" },
        { name: "Hyperextensions", sets: "3 sets x 15 reps" },
      ],
    };
  }

  if (t.includes("shoulder") || t.includes("sculpt")) {
    return {
      calories: 290,
      exercises: [
        { name: "Overhead Barbell Press", sets: "4 sets x 8 reps" },
        { name: "Dumbbell Lateral Raises", sets: "3 sets x 12-15 reps" },
        { name: "Bent-Over Rear Delt Flyes", sets: "3 sets x 15 reps" },
        { name: "Dumbbell Front Raises", sets: "3 sets x 12 reps" },
        { name: "Barbell Shrugs", sets: "3 sets x 10 reps" },
      ],
    };
  }

  if (t.includes("push")) {
    return {
      calories: 400,
      exercises: [
        { name: "Flat Dumbbell Press", sets: "4 sets x 8 reps" },
        { name: "Seated Military Press", sets: "3 sets x 10 reps" },
        { name: "Incline Cable Flyes", sets: "3 sets x 12 reps" },
        { name: "Dumbbell Lateral Raises", sets: "3 sets x 15 reps" },
        { name: "Close-Grip Bench Press", sets: "3 sets x 10 reps" },
      ],
    };
  }

  if (t.includes("pull")) {
    return {
      calories: 390,
      exercises: [
        { name: "Deadlifts", sets: "4 sets x 5 reps" },
        { name: "Barbell Rows", sets: "3 sets x 8 reps" },
        { name: "Chin-Ups", sets: "3 sets x 8-10 reps" },
        { name: "Barbell Bicep Curls", sets: "3 sets x 10 reps" },
        { name: "Hammer Curls", sets: "3 sets x 12 reps" },
      ],
    };
  }

  // Fallback Full Body
  return {
    calories: 350,
    exercises: [
      { name: "Goblet Squats", sets: "3 sets x 12 reps" },
      { name: "Push-Ups", sets: "3 sets x 15 reps" },
      { name: "Dumbbell Rows", sets: "3 sets x 10 reps per side" },
      { name: "Dumbbell Shoulder Press", sets: "3 sets x 10 reps" },
      { name: "Plank to Push-Up", sets: "3 sets x 10 reps" },
      { name: "Glute Bridges", sets: "3 sets x 15 reps" },
    ],
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function WorkoutSessionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { refreshUser } = useAuth();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [completionResult, setCompletionResult] = useState<CompleteWorkoutResponse | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await workoutAPI.getWorkout(id);
        if (response.success && response.data) {
          setWorkout(response.data);
        } else {
          setError(response.message || "Failed to load workout details.");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while fetching workout details.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [id]);

  // Timer effect
  useEffect(() => {
    if (loading || error || !workout || completionResult) return;

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, error, workout, completionResult]);

  const handleCompleteWorkout = async () => {
    if (!workout?._id) return;
    setCompleting(true);
    setError(null);
    try {
      const result = await userAPI.completeWorkout(workout._id, timer);
      setCompletionResult(result);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || "Failed to complete workout.");
    } finally {
      setCompleting(false);
    }
  };

  const canComplete = timer >= 30;

  // Render Skeleton Loader
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
          <div className="h-4 bg-zinc-800/60 rounded w-24"></div>
          <div className="h-96 bg-zinc-800/60 rounded-2xl"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Render 404 / Error State
  if (error || !workout) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-3xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Workout Not Found</h2>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {error || "We couldn't retrieve the requested workout session database record."}
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
            >
              Back to Training
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { exercises } = getMockExercisesAndCalories(workout.title);

  // Completion success view
  if (completionResult) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-yellow-400 transition-colors self-start cursor-pointer"
          >
            &larr; Back to Training
          </button>

          <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-2xl space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mx-auto">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-green-400 uppercase tracking-wide">
              Workout Completed! 🎉
            </h2>
            <p className="text-sm text-zinc-400">
              Great job! You earned rewards for completing this workout.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-zinc-800/30 border border-zinc-700/30 p-6 rounded-xl text-center">
                <span className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
                  XP Earned
                </span>
                <span className="text-4xl font-black text-yellow-400">
                  ✨ +{completionResult.data.xpEarned}
                </span>
              </div>
              <div className="bg-zinc-800/30 border border-zinc-700/30 p-6 rounded-xl text-center">
                <span className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
                  Coins Earned
                </span>
                <span className="text-4xl font-black text-yellow-400">
                  🪙 +{completionResult.data.coinsEarned}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-8 w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02] shadow-lg shadow-yellow-400/10 cursor-pointer"
            >
              Back to Training
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <button
          onClick={() => router.push(`/dashboard/training/${id}`)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-yellow-400 transition-colors self-start cursor-pointer"
        >
          &larr; Back to Workout Details
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Side: Workout Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl overflow-hidden shadow-xl">
              {workout.thumbnail && (
                <div className="relative h-64 sm:h-80 w-full border-b border-[#1e1e24]">
                  <img
                    src={workout.thumbnail}
                    alt={workout.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 space-y-6">
                <div>
                  <span className="text-xs text-yellow-500 font-bold uppercase tracking-widest font-mono">
                    {workout.category}
                  </span>
                  <h1 className="text-2xl lg:text-3xl font-black text-white mt-1 uppercase tracking-wide">
                    {workout.title}
                  </h1>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Description
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {workout.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Timer & Exercises */}
          <div className="space-y-6">
            {/* Timer Card */}
            <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1e1e24] pb-3">
                Workout Timer
              </h2>

              <div className="text-center">
                <div className="text-5xl font-black text-yellow-400 font-mono tracking-widest">
                  {formatTime(timer)}
                </div>
                <p className="text-xs text-zinc-500 mt-2 uppercase tracking-wider">
                  Time Elapsed
                </p>
              </div>

              {!canComplete ? (
                <p className="text-xs text-yellow-500/80 text-center">
                  Complete workout available after 30 seconds
                </p>
              ) : null}

              <button
                onClick={handleCompleteWorkout}
                disabled={!canComplete || completing}
                className={`w-full py-3 text-xs font-bold rounded-xl uppercase tracking-widest transition-all shadow-lg ${
                  canComplete && !completing
                    ? "bg-green-500 hover:bg-green-600 text-black hover:scale-[1.02] shadow-green-500/10 hover:shadow-green-500/20 cursor-pointer"
                    : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {completing ? "Completing..." : "Complete Workout"}
              </button>
            </div>

            {/* Exercises List Card */}
            <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1e1e24] pb-3 flex items-center justify-between">
                <span>Workout Routine</span>
                <span className="text-zinc-500 font-mono text-xs">{exercises.length} Exercises</span>
              </h2>

              <div className="space-y-3">
                {exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 bg-[#121216] border border-[#1e1e24] hover:border-yellow-500/10 rounded-xl transition-all group"
                  >
                    <div>
                      <p className="text-xs font-black text-white group-hover:text-yellow-400 transition-colors">
                        {idx + 1}. {ex.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {ex.sets}
                      </p>
                    </div>
                    <span className="w-6 h-6 shrink-0 bg-yellow-500/5 text-yellow-500 rounded-lg flex items-center justify-center text-[10px] font-bold">
                      🏋️‍♂️
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
