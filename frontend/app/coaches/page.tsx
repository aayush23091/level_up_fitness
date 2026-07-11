"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { coachAPI, Coach } from "@/lib/api";
import { withProtectedRoute } from "@/lib/protectedRoute";
import { getProfileImageUrl } from "@/lib/getProfileImageUrl";

function CoachesMarketplacePageContent() {
  const router = useRouter();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoaches, setTotalCoaches] = useState(0);

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchCoaches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await coachAPI.getCoaches(
        page,
        limit,
        debouncedSearch,
        specialization
      );
      if (response.success) {
        setCoaches(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalCoaches(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to retrieve coaches.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading coaches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, [page, limit, debouncedSearch, specialization]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = (profilePhoto?: string) => {
    return getProfileImageUrl(profilePhoto);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">
            Find Your <span className="text-accent">Coach</span>
          </h1>
          <p className="text-muted text-sm mt-2">
            Discover and hire expert coaches to level up your fitness journey
          </p>
        </div>

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
              placeholder="Search coaches..."
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

          {/* Specialization Filter */}
          <div className="w-full sm:w-48">
            <select
              value={specialization}
              onChange={(e) => {
                setSpecialization(e.target.value);
                setPage(1);
              }}
              className="w-full bg-card-secondary border border-border focus:border-accent text-xs text-foreground rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer transition-all bg-background"
            >
              <option value="all">All Specializations</option>
              <option value="Strength Training">Strength Training</option>
              <option value="Cardio">Cardio</option>
              <option value="Yoga">Yoga</option>
              <option value="HIIT">HIIT</option>
              <option value="CrossFit">CrossFit</option>
              <option value="Nutrition">Nutrition</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Building">Muscle Building</option>
            </select>
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
              onClick={fetchCoaches}
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
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-card-secondary/60 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-card-secondary/60 rounded w-3/4"></div>
                    <div className="h-3 bg-card-secondary/60 rounded w-1/2"></div>
                  </div>
                </div>
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
        ) : coaches.length === 0 ? (
          // Empty State
          <div className="bg-card/40 border border-border/80 rounded-2xl p-12 text-center">
            <div className="space-y-3">
              <span className="text-4xl block">🏋️‍♂️</span>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">No coaches found</h4>
              <p className="text-xs text-muted max-w-xs mx-auto">
                We couldn't find any coaches matching your current search term or filter options.
              </p>
            </div>
          </div>
        ) : (
          // Data State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coaches.map((coach) => {
              const coachIdStr = coach._id || coach.id || "";
              const coachProfileImage = getAvatarUrl(coach.coachProfile?.profileImage);
              const avatarUrl = coachProfileImage || getAvatarUrl(coach.profilePhoto);
              return (
                <div
                  key={coachIdStr}
                  onClick={() => router.push(`/coaches/${coachIdStr}`)}
                  className="group bg-card border border-border p-6 rounded-2xl hover:border-accent/30 transition-all relative overflow-hidden flex flex-col cursor-pointer"
                >
                  {/* Decorative corner glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full filter blur-xl group-hover:bg-accent/10 transition-all pointer-events-none" />

                  {/* Coach Profile */}
                  <div className="flex items-start gap-4 mb-4">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={coach.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500/30"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 border-2 border-yellow-500/30 text-accent flex items-center justify-center text-xl font-bold font-mono">
                        {getInitials(coach.name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors truncate">
                        {coach.name}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">@{coach.username}</p>
                      {typeof coach.coachProfile?.rating === "number" && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-accent text-xs">⭐</span>
                          <span className="text-xs text-foreground font-semibold">{coach.coachProfile.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {coach.coachProfile?.bio && (
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed mb-4">
                      {coach.coachProfile.bio}
                    </p>
                  )}

                  {/* Specializations */}
                  {coach.coachProfile?.specialization && coach.coachProfile.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {coach.coachProfile.specialization.slice(0, 3).map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-accent font-semibold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded"
                        >
                          {spec}
                        </span>
                      ))}
                      {coach.coachProfile.specialization.length > 3 && (
                        <span className="text-[10px] text-muted font-semibold uppercase tracking-wider bg-card-secondary px-2 py-0.5 rounded">
                          +{coach.coachProfile.specialization.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Coach Specs Grid */}
                  <div className="grid grid-cols-2 gap-2.5 mt-auto pt-4 border-t border-border text-[11px] text-muted font-semibold font-mono">
                    <div className="flex items-center gap-1.5">
                      <span>💼</span> {Number(coach.coachProfile?.experience) || 0} Years
                    </div>
                    <div className="flex items-center gap-1.5 text-accent">
                      <span>🪙</span> {Number(coach.coachProfile?.hireCost) || 0} Coins
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <div className="mt-4 pt-3 border-t border-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/coaches/${coachIdStr}`);
                      }}
                      className="w-full py-2 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                    >
                      View Profile
                    </button>
                  </div>

                  {/* Hire Status Badge */}
                  {coach.isHired && (
                    <div className="absolute top-4 right-4 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      HIRED
                    </div>
                  )}
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
              <span className="text-foreground font-semibold">{totalPages}</span> (Total Coaches: <span className="text-yellow-400">{totalCoaches}</span>)
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
    </DashboardLayout>
  );
}

export default withProtectedRoute(CoachesMarketplacePageContent, ["user"]);
