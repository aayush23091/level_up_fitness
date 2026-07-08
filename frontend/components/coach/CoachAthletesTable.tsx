"use client";

import React, { useState, useEffect } from "react";
import { coachAPI, User } from "@/lib/api";

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

  return (
    <div className="space-y-6">
      {/* Page Header Section */}
      <section className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
          Athletes
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Manage your assigned athletes.</p>
      </section>

      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121216] border border-zinc-800 hover:border-yellow-500/40 focus:border-yellow-500 text-sm text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-600"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {totalAthletes > 0 && (
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-xl">
              Total Athletes: <span className="text-yellow-400">{totalAthletes}</span>
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
      <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
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
            <tbody className="divide-y divide-zinc-900/60 text-sm">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="w-9 h-9 rounded-full bg-zinc-800/60 shrink-0"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-zinc-800/60 rounded w-24"></div>
                        <div className="h-3 bg-zinc-800/60 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-zinc-800/60 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-zinc-800/60 rounded w-8 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : athletes.length === 0 ? (
                // Empty State Rows
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">👥</span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">No athletes found</h4>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
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
                    <tr key={athleteIdStr} className="hover:bg-zinc-900/20 transition-colors group">
                      <td className="px-6 py-4">
                        {athlete.profilePhoto ? (
                          <img
                            src={
                              athlete.profilePhoto.startsWith("http")
                                ? athlete.profilePhoto
                                : `http://localhost:5000${athlete.profilePhoto}`
                            }
                            alt={athlete.name}
                            className="w-9 h-9 rounded-full object-cover border border-zinc-800 group-hover:border-yellow-500/30 transition-all shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/30 group-hover:border-yellow-500/30 flex items-center justify-center text-xs font-bold font-mono tracking-wider transition-all shrink-0">
                            {getInitials(athlete.name)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                            {athlete.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                        @{athlete.username || "username"}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                        {athlete.level || 0}
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                        {athlete.xp || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          {(athlete as any).status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-xs">
                        {formatDate((athlete as any).hiredAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingAthlete(athlete)}
                            className="p-1.5 text-zinc-500 hover:text-yellow-400 hover:bg-[#121216]/80 rounded-lg transition-all cursor-pointer"
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
          <div className="bg-zinc-900/30 border-t border-zinc-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-zinc-500">
              Showing page <span className="text-white font-semibold">{page}</span> of{" "}
              <span className="text-white font-semibold">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3.5 py-1.5 bg-[#121216] border border-zinc-800 hover:border-yellow-500/40 disabled:opacity-30 disabled:hover:border-zinc-800 text-zinc-400 hover:text-white disabled:hover:text-zinc-400 text-xs font-bold rounded-lg uppercase tracking-wider transition-all disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3.5 py-1.5 bg-[#121216] border border-zinc-800 hover:border-yellow-500/40 disabled:opacity-30 disabled:hover:border-zinc-800 text-zinc-400 hover:text-white disabled:hover:text-zinc-400 text-xs font-bold rounded-lg uppercase tracking-wider transition-all disabled:cursor-not-allowed"
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
          <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Athlete Profile Details
              </h3>
              <button
                type="button"
                onClick={() => setViewingAthlete(null)}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all focus:outline-none cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Profile Photo Display */}
              <div className="flex flex-col items-center gap-2 pb-4 border-b border-zinc-900">
                {viewingAthlete.profilePhoto ? (
                  <img
                    src={
                      viewingAthlete.profilePhoto.startsWith("http")
                        ? viewingAthlete.profilePhoto
                        : `http://localhost:5000${viewingAthlete.profilePhoto}`
                    }
                    alt={viewingAthlete.name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-yellow-400/40"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 flex items-center justify-center text-2xl font-bold font-mono">
                    {getInitials(viewingAthlete.name)}
                  </div>
                )}
                <h4 className="text-lg font-black text-white mt-2">{viewingAthlete.name}</h4>
                <p className="text-xs text-yellow-400 font-mono">@{viewingAthlete.username}</p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Level
                  </span>
                  <p className="text-sm text-zinc-100 bg-[#121216] border border-zinc-900 rounded-xl px-4 py-2.5">
                    {viewingAthlete.level || 0}
                  </p>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    XP
                  </span>
                  <p className="text-sm text-zinc-100 bg-[#121216] border border-zinc-900 rounded-xl px-4 py-2.5">
                    {viewingAthlete.xp || 0}
                  </p>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Status
                  </span>
                  <div className="text-sm text-zinc-100 bg-[#121216] border border-zinc-900 rounded-xl px-4 py-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{(viewingAthlete as any).status || "active"}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Hired Date
                  </span>
                  <p className="text-sm text-zinc-100 bg-[#121216] border border-zinc-900 rounded-xl px-4 py-2.5">
                    {formatDate((viewingAthlete as any).hiredAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end bg-zinc-900/20">
              <button
                type="button"
                onClick={() => setViewingAthlete(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
