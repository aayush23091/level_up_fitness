"use client";

import React, { useState, useEffect } from "react";
import { adminAPI, Coach } from "@/lib/api";

export default function AdminCoachesTable() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoaches, setTotalCoaches] = useState(0);

  // Modal & Toast States
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [deletingCoach, setDeletingCoach] = useState<Coach | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewDetails = (coach: Coach) => {
    setSelectedCoach(coach);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (coach: Coach) => {
    setDeletingCoach(coach);
  };

  const handleDeleteSubmit = async () => {
    if (!deletingCoach) return;
    setIsDeleting(true);
    try {
      const id = deletingCoach._id || deletingCoach.id || "";
      const response = await adminAPI.deleteCoach(id);
      if (response.success) {
        setToast({ message: `Coach "${deletingCoach.name}" deleted successfully!`, type: "success" });
        setDeletingCoach(null);
        fetchCoaches();
      } else {
        setToast({ message: response.message || "Failed to delete coach.", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "An error occurred during deletion.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Debounce search term to avoid excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search query
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchCoaches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getCoaches(page, limit, debouncedSearch);
      if (response.success) {
        setCoaches(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalCoaches(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to retrieve coaches.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching coach data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, [page, limit, debouncedSearch]);

  const getInitials = (name: string) => {
    if (!name) return "C";
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
            placeholder="Search coaches by name or email..."
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
          {totalCoaches > 0 && (
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
              Total Coaches: <span className="text-yellow-400">{totalCoaches}</span>
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
            onClick={fetchCoaches}
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
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Hire Cost</th>
                <th className="px-6 py-4">Clients</th>
                <th className="px-6 py-4">Workout Plans</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-sm">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800/60 shrink-0"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-zinc-800/60 rounded w-24"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-36"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-zinc-800/60 rounded w-28 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : coaches.length === 0 ? (
                // Empty State Rows
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">🏋️</span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">No coaches found</h4>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        We couldn't find any coach profiles matching your current filters or search term.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Coaches Data Rows
                coaches.map((coach) => {
                  const coachId = coach._id || coach.id || "";
                  // Extract coach profile data (check both coachProfile and direct fields for backward compatibility)
                  const coachProfile = coach.coachProfile || {};
                  const specialization = coachProfile.specialization || coach.specialization;
                  const experience = coachProfile.experience || coach.experience;
                  const hireCost = coachProfile.hireCost || coach.hireCost;
                  // Extract counts (added by backend)
                  const clientCount = (coach as any).clientCount || 0;
                  const planCount = (coach as any).planCount || 0;

                  return (
                    <tr key={coachId} className="hover:bg-zinc-900/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {coach.profilePhoto ? (
                            <img
                              src={
                                coach.profilePhoto.startsWith("http")
                                  ? coach.profilePhoto
                                  : `http://localhost:5000${coach.profilePhoto}`
                              }
                              alt={coach.name}
                              className="w-9 h-9 rounded-full object-cover border border-zinc-800 group-hover:border-yellow-500/30 transition-all shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/30 group-hover:border-yellow-500/30 flex items-center justify-center text-xs font-bold font-mono tracking-wider transition-all shrink-0">
                              {getInitials(coach.name)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                              {coach.name}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              @{coach.username || "username"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium">
                        {coach.email}
                      </td>
                      <td className="px-6 py-4">
                        {specialization ? (
                          Array.isArray(specialization) ? (
                            <div className="flex flex-wrap gap-1">
                              {specialization.slice(0, 2).map((spec, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded-full">
                                  {spec}
                                </span>
                              ))}
                              {specialization.length > 2 && (
                                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded-full">
                                  +{specialization.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-xs">{specialization}</span>
                          )
                        ) : (
                          <span className="text-zinc-500 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {experience ? (
                          <span className="text-zinc-300 text-xs">{experience} years</span>
                        ) : (
                          <span className="text-zinc-500 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hireCost ? (
                          <span className="text-zinc-300 text-xs font-medium">${hireCost}/hr</span>
                        ) : (
                          <span className="text-zinc-500 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-xs font-medium">{clientCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-xs font-medium">{planCount}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewDetails(coach)}
                            className="p-1 text-zinc-500 hover:text-yellow-500 hover:bg-[#121216]/80 rounded-lg transition-all"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(coach)}
                            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Coach"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 transition-all duration-300 ${
          toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <p className="text-xs font-bold uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      {/* Coach Details Modal */}
      {isDetailModalOpen && selectedCoach && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Coach Details
              </h3>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all focus:outline-none cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                {selectedCoach.profilePhoto ? (
                  <img
                    src={
                      selectedCoach.profilePhoto.startsWith("http")
                        ? selectedCoach.profilePhoto
                        : `http://localhost:5000${selectedCoach.profilePhoto}`
                    }
                    alt={selectedCoach.name}
                    className="w-16 h-16 rounded-full object-cover border border-zinc-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/30 flex items-center justify-center text-lg font-bold font-mono tracking-wider">
                    {getInitials(selectedCoach.name)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-white text-lg">{selectedCoach.name}</p>
                  <p className="text-zinc-400 text-xs">{selectedCoach.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase tracking-wider">Username</p>
                  <p className="text-white">{selectedCoach.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase tracking-wider">Phone</p>
                  <p className="text-white">{(selectedCoach as any).phoneNumber || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase tracking-wider">Experience</p>
                  <p className="text-white">
                    {(selectedCoach.coachProfile?.experience || selectedCoach.experience) 
                      ? `${selectedCoach.coachProfile?.experience || selectedCoach.experience} years` 
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase tracking-wider">Hire Cost</p>
                  <p className="text-white">
                    {(selectedCoach.coachProfile?.hireCost || selectedCoach.hireCost) 
                      ? `$${selectedCoach.coachProfile?.hireCost || selectedCoach.hireCost}/hr` 
                      : "N/A"}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-zinc-500 uppercase tracking-wider">Specialization</p>
                  <div className="flex flex-wrap gap-1">
                    {(() => {
                      const specialization = selectedCoach.coachProfile?.specialization || selectedCoach.specialization;
                      if (Array.isArray(specialization)) {
                        return specialization.map((spec, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded-full">
                            {spec}
                          </span>
                        ));
                      } else if (specialization) {
                        return (
                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] rounded-full">
                            {specialization}
                          </span>
                        );
                      }
                      return <span className="text-zinc-500">N/A</span>;
                    })()}
                  </div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-zinc-500 uppercase tracking-wider">Bio</p>
                  <p className="text-zinc-300">
                    {(selectedCoach.coachProfile?.bio || selectedCoach.bio) || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase tracking-wider">Clients</p>
                  <p className="text-white">{(selectedCoach as any).clientCount || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-500 uppercase tracking-wider">Workout Plans</p>
                  <p className="text-white">{(selectedCoach as any).planCount || 0}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-zinc-500 uppercase tracking-wider">Joined</p>
                  <p className="text-white">{formatDate((selectedCoach as any).createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCoach && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Body */}
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Delete Coach Account
                </h3>
                <p className="text-xs text-zinc-400">
                  Are you sure you want to permanently delete the coach profile for:
                </p>
                <p className="text-sm font-black text-yellow-400 py-1">
                  {deletingCoach.name} ({deletingCoach.email})
                </p>
                <p className="text-[10px] text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-lg p-2 max-w-xs mx-auto">
                  ⚠️ This action cannot be undone. All coach data, clients, and workout plans will be removed.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingCoach(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-red-500/10 cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
