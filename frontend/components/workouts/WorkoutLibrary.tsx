"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { workoutAPI, Workout } from "@/lib/api";

export default function WorkoutLibrary() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // 6 works perfectly in a 3-column layout
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page to 1 when search term changes
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutAPI.getWorkouts(
        page,
        limit,
        debouncedSearch,
        category,
        difficulty
      );
      if (response.success) {
        setWorkouts(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalWorkouts(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to retrieve workouts.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading the workout library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [page, limit, debouncedSearch, category, difficulty]);

  return (
    <div className="space-y-6">
      {/* Search & Filters Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-md">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card-secondary border border-border hover:border-accent/40 focus:border-accent text-sm text-foreground rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Category Filter */}
          <div className="w-1/2 sm:w-40">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-card-secondary border border-border focus:border-accent text-xs text-foreground rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer transition-all bg-background"
            >
              <option value="all">All Categories</option>
              <option value="Strength">Strength</option>
              <option value="HIIT Cardio">HIIT Cardio</option>
              <option value="Core">Core</option>
              <option value="Mobility">Mobility</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="w-1/2 sm:w-40">
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
              className="w-full bg-card-secondary border border-border focus:border-accent text-xs text-foreground rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer transition-all bg-background"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
          <button
            onClick={fetchWorkouts}
            className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid Content */}
      {loading ? (
        // Loading Skeleton State
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-2xl space-y-4">
              <div className="w-full h-40 bg-card-secondary/60 rounded-xl"></div>
              <div className="h-4 bg-card-secondary/60 rounded w-16"></div>
              <div className="h-6 bg-card-secondary/60 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-card-secondary/60 rounded w-full"></div>
                <div className="h-3 bg-card-secondary/60 rounded w-5/6"></div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border">
                <div className="h-4 bg-card-secondary/60 rounded w-16"></div>
                <div className="h-4 bg-card-secondary/60 rounded w-16"></div>
                <div className="h-4 bg-card-secondary/60 rounded w-20"></div>
                <div className="h-4 bg-card-secondary/60 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      ) : workouts.length === 0 ? (
        // Empty State
        <div className="bg-card/40 border border-border/80 rounded-2xl p-12 text-center">
          <div className="space-y-3">
            <span className="text-4xl block">🏋️‍♂️</span>
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">No workouts found</h4>
            <p className="text-xs text-muted max-w-xs mx-auto">
              We couldn't find any workouts matching your current search term or filter options.
            </p>
          </div>
        </div>
      ) : (
        // Data State
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => {
            const workoutIdStr = workout._id || workout.id || "";
            return (
              <div
                key={workoutIdStr}
                onClick={() => router.push(`/dashboard/training/${workoutIdStr}`)}
                className="group bg-card border border-border p-6 rounded-2xl hover:border-accent/30 transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Decorative corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full filter blur-xl group-hover:bg-accent/10 transition-all pointer-events-none" />

                <div>
                  {/* Workout Image */}
                  {workout.thumbnail && (
                    <img
                      src={workout.thumbnail}
                      alt={workout.title}
                      className="w-full h-40 object-cover rounded-xl mb-4 border border-border group-hover:border-accent/20 transition-all"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-accent font-black uppercase tracking-widest font-mono bg-accent/10 px-2 py-0.5 rounded">
                      {workout.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground mt-3 group-hover:text-accent transition-colors">
                    {workout.title}
                  </h3>

                  <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">
                    {workout.description}
                  </p>
                </div>

                {/* Workout Specs Grid */}
                <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-border text-[11px] text-muted font-semibold font-mono">
                  <div className="flex items-center gap-1.5">
                    <span>⏱️</span> {workout.duration} Min
                  </div>
                  <div className="flex items-center gap-1.5 capitalize">
                    <span>⚡</span> {workout.difficulty}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-accent">✨</span> {workout.xpReward} XP
                  </div>
                  <div className="flex items-center gap-1.5 text-accent">
                    <span>🪙</span> {workout.coinReward} Coins
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="bg-card border border-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl shadow-md">
          <span className="text-xs text-muted">
            Showing page <span className="text-foreground font-semibold">{page}</span> of{" "}
            <span className="text-foreground font-semibold">{totalPages}</span> (Total Workouts: <span className="text-accent">{totalWorkouts}</span>)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 bg-card-secondary border border-border hover:border-accent/40 disabled:opacity-30 disabled:hover:border-border text-muted hover:text-foreground disabled:hover:text-muted text-xs font-bold rounded-xl uppercase tracking-wider transition-all disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-card-secondary border border-border hover:border-accent/40 disabled:opacity-30 disabled:hover:border-border text-muted hover:text-foreground disabled:hover:text-muted text-xs font-bold rounded-xl uppercase tracking-wider transition-all disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
