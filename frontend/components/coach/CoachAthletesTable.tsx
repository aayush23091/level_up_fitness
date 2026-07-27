"use client";

import React, { useState, useEffect } from "react";
import { coachAPI, workoutPlanAPI, User, WorkoutPlan } from "@/lib/api";

export default function CoachAthletesTable() {
  const [athletes, setAthletes] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAthletes, setTotalAthletes] = useState(0);

  // View Profile Modal State
  const [viewingAthlete, setViewingAthlete] = useState<User | null>(null);

  // Assign Workout Plan Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null);
  const [publishedWorkoutPlans, setPublishedWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Debounce search term (same 400ms as Admin)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search query
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchAthletes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await coachAPI.getAthletes(page, limit, debouncedSearch);
      if (response.success) {
        setAthletes(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalAthletes(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to retrieve athletes.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching athlete data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, [page, limit, debouncedSearch]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const fetchPublishedWorkoutPlans = async () => {
    try {
      const response = await workoutPlanAPI.getWorkoutPlans(1, 100, "Published");
      if (response.success) {
        setPublishedWorkoutPlans(response.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch workout plans:", err);
    }
  };

  const openAssignModal = (athlete: User) => {
    setSelectedAthlete(athlete);
    setSelectedWorkoutPlan("");
    setAssignError(null);
    setIsAssignModalOpen(true);
    fetchPublishedWorkoutPlans();
  };

  const handleAssignWorkoutPlan = async () => {
    if (!selectedAthlete || !selectedWorkoutPlan) {
      setAssignError("Please select a workout plan");
      return;
    }

    setIsAssigning(true);
    setAssignError(null);
    try {
      await workoutPlanAPI.assignWorkoutPlan(selectedWorkoutPlan, selectedAthlete._id || selectedAthlete.id || "");
      setIsAssignModalOpen(false);
      setSelectedAthlete(null);
      setSelectedWorkoutPlan("");
    } catch (err: any) {
      setAssignError(err.message || "Failed to assign workout plan");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Section */}
      <section className="border-b border-border pb-5">
        <h1 className="text-2xl lg:text-3xl font-black text-foreground uppercase tracking-wider">
          Athletes
        </h1>
        <p className="text-muted text-xs mt-1">Manage your assigned athletes.</p>
      </section>

      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
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

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {totalAthletes > 0 && (
            <span className="text-xs text-muted font-bold uppercase tracking-wider bg-card-secondary px-3 py-1.5 border border-border rounded-xl">
              Total Athletes: <span className="text-accent">{totalAthletes}</span>
            </span>
          )}
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
            onClick={fetchAthletes}
            className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table View */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-card-secondary/50 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted">
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">XP</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Hired Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="w-9 h-9 rounded-full bg-card-secondary/60 shrink-0"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-card-secondary/60 rounded w-24"></div>
                        <div className="h-3 bg-card-secondary/60 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-card-secondary/60 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-card-secondary/60 rounded w-8 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : athletes.length === 0 ? (
                // Empty State Rows
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">👥</span>
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">No athletes found</h4>
                      <p className="text-xs text-muted max-w-xs mx-auto">
                        We couldn't find any athletes matching your current filters or search term.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Athletes Data Rows
                athletes.map((athlete) => {
                  const athleteIdStr = athlete._id || athlete.id || "";
                  return (
                    <tr key={athleteIdStr} className="hover:bg-card-secondary/20 transition-colors group">
                      <td className="px-6 py-4">
                        {athlete.profilePhoto ? (
                          <img
                            src={
                              athlete.profilePhoto.startsWith("http")
                                ? athlete.profilePhoto
                                : `http://localhost:5000${athlete.profilePhoto}`
                            }
                            alt={athlete.name}
                            className="w-9 h-9 rounded-full object-cover border border-border group-hover:border-accent/30 transition-all shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-card-secondary text-muted border border-border/30 group-hover:border-accent/30 flex items-center justify-center text-xs font-bold font-mono tracking-wider transition-all shrink-0">
                            {getInitials(athlete.name)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-foreground group-hover:text-accent transition-colors">
                            {athlete.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium text-xs">
                        @{athlete.username || "username"}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium text-xs">
                        {athlete.level || 0}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium text-xs">
                        {athlete.xp || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          {(athlete as any).status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted text-xs">
                        {formatDate((athlete as any).hiredAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAssignModal(athlete)}
                            className="p-1.5 text-muted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all cursor-pointer"
                            title="Assign Workout Plan"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setViewingAthlete(athlete)}
                            className="p-1.5 text-muted hover:text-accent hover:bg-card-secondary/80 rounded-lg transition-all cursor-pointer"
                            title="View Athlete Profile"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section Footer */}
        {!loading && totalPages > 1 && (
          <div className="bg-card-secondary/30 border-t border-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted">
              Showing page <span className="text-foreground font-semibold">{page}</span> of{" "}
              <span className="text-foreground font-semibold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3.5 py-1.5 bg-card-secondary border border-border hover:border-accent/40 disabled:opacity-30 disabled:hover:border-border text-muted hover:text-foreground disabled:hover:text-muted text-xs font-bold rounded-lg uppercase tracking-wider transition-all disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3.5 py-1.5 bg-card-secondary border border-border hover:border-accent/40 disabled:opacity-30 disabled:hover:border-border text-muted hover:text-foreground disabled:hover:text-muted text-xs font-bold rounded-lg uppercase tracking-wider transition-all disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Read-Only View Athlete Details Modal */}
      {viewingAthlete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card-secondary/40">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Athlete Profile Details
              </h3>
              <button
                type="button"
                onClick={() => setViewingAthlete(null)}
                className="p-1 rounded text-muted hover:text-foreground hover:bg-card-secondary transition-all focus:outline-none cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Profile Photo Display */}
              <div className="flex flex-col items-center gap-2 pb-4 border-b border-border">
                {viewingAthlete.profilePhoto ? (
                  <img
                    src={
                      viewingAthlete.profilePhoto.startsWith("http")
                        ? viewingAthlete.profilePhoto
                        : `http://localhost:5000${viewingAthlete.profilePhoto}`
                    }
                    alt={viewingAthlete.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-accent/40"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-card-secondary text-muted border border-border/50 flex items-center justify-center text-2xl font-bold font-mono">
                    {getInitials(viewingAthlete.name)}
                  </div>
                )}
                <h4 className="text-lg font-black text-foreground mt-2">{viewingAthlete.name}</h4>
                <p className="text-xs text-accent font-mono">@{viewingAthlete.username}</p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    Level
                  </span>
                  <p className="text-sm text-foreground bg-card-secondary border border-border rounded-xl px-4 py-2.5">
                    {viewingAthlete.level || 0}
                  </p>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    XP
                  </span>
                  <p className="text-sm text-foreground bg-card-secondary border border-border rounded-xl px-4 py-2.5">
                    {viewingAthlete.xp || 0}
                  </p>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    Status
                  </span>
                  <div className="text-sm text-foreground bg-card-secondary border border-border rounded-xl px-4 py-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{(viewingAthlete as any).status || "active"}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1">
                    Hired Date
                  </span>
                  <p className="text-sm text-foreground bg-card-secondary border border-border rounded-xl px-4 py-2.5">
                    {formatDate((viewingAthlete as any).hiredAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-border flex justify-end bg-card-secondary/20">
              <button
                type="button"
                onClick={() => setViewingAthlete(null)}
                className="px-4 py-2 bg-card-secondary hover:bg-card-secondary text-foreground text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Workout Plan Modal */}
      {isAssignModalOpen && selectedAthlete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card-secondary/40">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Assign Workout Plan
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded text-muted hover:text-foreground hover:bg-card-secondary transition-all focus:outline-none cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                {selectedAthlete.profilePhoto ? (
                  <img
                    src={
                      selectedAthlete.profilePhoto.startsWith("http")
                        ? selectedAthlete.profilePhoto
                        : `http://localhost:5000${selectedAthlete.profilePhoto}`
                    }
                    alt={selectedAthlete.name}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-card-secondary text-muted border border-border/30 flex items-center justify-center text-sm font-bold font-mono">
                    {getInitials(selectedAthlete.name)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">{selectedAthlete.name}</p>
                  <p className="text-xs text-muted">@{selectedAthlete.username}</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">
                  Select Workout Plan
                </label>
                <select
                  value={selectedWorkoutPlan}
                  onChange={(e) => setSelectedWorkoutPlan(e.target.value)}
                  className="w-full bg-card-secondary border border-border focus:border-accent text-xs text-foreground rounded-xl px-4 py-3 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="">Choose a workout plan...</option>
                  {publishedWorkoutPlans.map((plan) => (
                    <option key={plan._id || plan.id} value={plan._id || plan.id || ""}>
                      {plan.title} ({plan.difficulty}) - {plan.estimatedDuration} min
                    </option>
                  ))}
                </select>
              </div>

              {assignError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg">
                  {assignError}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-card-secondary/20">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-card-secondary hover:bg-card-secondary text-foreground text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignWorkoutPlan}
                disabled={isAssigning || !selectedWorkoutPlan}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? "Assigning..." : "Assign Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
