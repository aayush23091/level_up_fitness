"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { workoutAPI, Workout } from "@/lib/api";
import DashboardLayout from "../../../components/DashboardLayout";

interface MockExercise {
  name: string;
  sets: string;
}

// Dynamic exercise and calorie mockup based on workout title
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

export default function WorkoutDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const handleStartWorkout = () => {
    // Navigate to workout session - non-functional for now
  };

  // Render Skeleton Loader
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
          <div className="h-4 bg-zinc-800/60 rounded w-24"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="w-full h-80 bg-zinc-800/60 rounded-2xl"></div>
              <div className="h-8 bg-zinc-800/60 rounded w-1/2"></div>
              <div className="h-4 bg-zinc-800/60 rounded w-full"></div>
            </div>
            <div className="space-y-6">
              <div className="h-40 bg-zinc-800/60 rounded-2xl"></div>
              <div className="h-80 bg-zinc-800/60 rounded-2xl"></div>
            </div>
          </div>
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
            {error && (
              <button
                onClick={fetchWorkout}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { exercises, calories } = getMockExercisesAndCalories(workout.title);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Back Row & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e24] pb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-yellow-400 transition-colors self-start cursor-pointer"
          >
            &larr; Back to Training
          </button>
          
          <nav className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <Link href="/dashboard" className="hover:text-yellow-400 transition-colors">
              Dashboard
            </Link>
            <span>&gt;</span>
            <span className="text-zinc-400">Workout Details</span>
          </nav>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Side: Image and General Info Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl overflow-hidden shadow-xl">
              {workout.thumbnail && (
                <div className="relative h-64 sm:h-80 w-full border-b border-[#1e1e24]">
                  <img
                    src={workout.thumbnail}
                    alt={workout.title}
                    className="w-full h-full object-cover"
                  />
                  {workout.isPremium && (
                    <span className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      👑 Premium
                    </span>
                  )}
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

          {/* Right Side: Specifications and Exercises Card */}
          <div className="space-y-6">
            {/* Quick Specs Card */}
            <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1e1e24] pb-3">
                Workout Specifications
              </h2>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold font-mono">
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    Difficulty
                  </span>
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400/10 text-yellow-400 border border-yellow-500/20">
                    {workout.difficulty}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    Duration
                  </span>
                  <span className="text-white text-sm">⏱️ {workout.duration} Mins</span>
                </div>

                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    XP Reward
                  </span>
                  <span className="text-white text-sm">✨ {workout.xpReward} XP</span>
                </div>

                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    Coin Reward
                  </span>
                  <span className="text-white text-sm">🪙 {workout.coinReward} Coins</span>
                </div>

                <div className="col-span-2">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                    Estimated Burn
                  </span>
                  <span className="text-red-400 text-sm font-black font-mono">🔥 {calories} Kcal</span>
                </div>
              </div>

              <button
                onClick={handleStartWorkout}
                className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-black rounded-xl uppercase tracking-widest transition-all hover:scale-[1.02] shadow-lg shadow-yellow-400/10 hover:shadow-yellow-400/20 cursor-pointer"
              >
                Start Workout
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
