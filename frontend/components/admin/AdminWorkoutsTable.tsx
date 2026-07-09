"use client";

import React, { useState, useEffect } from "react";
import { adminAPI, Workout } from "@/lib/api";

export default function AdminWorkoutsTable() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  // Modal & Toast States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    category: "",
    difficulty: "",
    duration: 30,
    xpReward: 0,
    coinReward: 0,
    status: "active"
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (workout: Workout) => {
    setDeletingWorkout(workout);
  };

  const handleDeleteSubmit = async () => {
    if (!deletingWorkout) return;
    setIsDeleting(true);
    try {
      const id = deletingWorkout._id || deletingWorkout.id || "";
      const response = await adminAPI.deleteWorkout(id);
      if (response.success) {
        setToast({ message: `Workout "${deletingWorkout.title}" deleted successfully!`, type: "success" });
        setDeletingWorkout(null);
        fetchWorkouts();
      } else {
        setToast({ message: response.message || "Failed to delete workout.", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "An error occurred during deletion.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelClose = () => {
    setIsModalOpen(false);
    setEditingWorkoutId(null);
    setValidationError(null);
    setFormData({
      title: "",
      description: "",
      thumbnail: "",
      category: "",
      difficulty: "",
      duration: 30,
      xpReward: 0,
      coinReward: 0,
      status: "active"
    });
  };

  const handleEditClick = (workout: Workout) => {
    setValidationError(null);
    setFormData({
      title: workout.title,
      description: workout.description,
      thumbnail: workout.thumbnail,
      category: workout.category,
      difficulty: workout.difficulty,
      duration: workout.duration,
      xpReward: workout.xpReward,
      coinReward: workout.coinReward,
      status: workout.status || "active"
    });
    setEditingWorkoutId(workout._id || workout.id || null);
    setIsModalOpen(true);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setIsSubmitting(true);

    // Front-end validations
    if (formData.title.trim().length < 2) {
      setValidationError("Title must be at least 2 characters.");
      setIsSubmitting(false);
      return;
    }
    if (formData.description.trim().length < 5) {
      setValidationError("Description must be at least 5 characters.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.category.trim()) {
      setValidationError("Category is required.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.difficulty.trim()) {
      setValidationError("Difficulty is required.");
      setIsSubmitting(false);
      return;
    }
    if (formData.duration < 1) {
      setValidationError("Duration must be at least 1 minute.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingWorkoutId) {
        // Edit Mode
        const response = await adminAPI.updateWorkout(editingWorkoutId, formData);

        if (response.success) {
          setToast({ message: "Workout updated successfully!", type: "success" });
          handleCancelClose();
          fetchWorkouts();
        } else {
          setValidationError(response.message || "Failed to update workout.");
        }
      } else {
        // Create Mode
        const response = await adminAPI.createWorkout(formData);

        if (response.success) {
          setToast({ message: "Workout created successfully!", type: "success" });
          handleCancelClose();
          fetchWorkouts();
        } else {
          setValidationError(response.message || "Failed to create workout.");
        }
      }
    } catch (err: any) {
      setValidationError(err.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getWorkouts(page, limit, debouncedSearch);
      if (response.success) {
        setWorkouts(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalWorkouts(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to retrieve workouts.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching workout data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [page, limit, debouncedSearch]);

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
            placeholder="Search workouts by title or description..."
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
          {totalWorkouts > 0 && (
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
              Total Workouts: <span className="text-yellow-400">{totalWorkouts}</span>
            </span>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-yellow-400/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Workout
          </button>
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

      {/* Main Table View */}
      <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">XP Reward</th>
                <th className="px-6 py-4">Coin Reward</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-sm">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-20"></div>
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
              ) : workouts.length === 0 ? (
                // Empty State Rows
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">💪</span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">No workouts found</h4>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        We couldn't find any workouts matching your current filters or search term.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Workouts Data Rows
                workouts.map((workout) => {
                  const workoutId = workout._id || workout.id || "";
                  return (
                    <tr key={workoutId} className="hover:bg-zinc-900/20 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                          {workout.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-xs">{workout.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-xs">{workout.difficulty}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-xs">{workout.duration} min</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-xs">{workout.xpReward}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-300 text-xs">{workout.coinReward}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          {workout.status || "active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(workout)}
                            className="p-1 text-zinc-500 hover:text-white hover:bg-[#121216]/80 rounded-lg transition-all cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-2.036a5 5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(workout)}
                            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Workout"
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

      {/* Create/Edit Workout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingWorkoutId ? "Edit Workout" : "Add New Workout"}
              </h3>
              <button
                type="button"
                onClick={handleCancelClose}
                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all focus:outline-none cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {validationError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                  ⚠️ {validationError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter workout title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    required
                    placeholder="Enter workout description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700 resize-none"
                  />
                </div>

                {/* Thumbnail */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Thumbnail URL
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/thumbnail.jpg"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Strength"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer bg-zinc-950 text-white"
                  >
                    <option value="">Select difficulty</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* XP Reward */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Coin Reward */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Coin Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.coinReward}
                    onChange={(e) => setFormData({ ...formData, coinReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer bg-zinc-950 text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelClose}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-yellow-400/10 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : (editingWorkoutId ? "Save Changes" : "Create Workout")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingWorkout && (
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
                  Delete Workout
                </h3>
                <p className="text-xs text-zinc-400">
                  Are you sure you want to permanently delete the workout:
                </p>
                <p className="text-sm font-black text-yellow-400 py-1">
                  {deletingWorkout.title}
                </p>
                <p className="text-[10px] text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-lg p-2 max-w-xs mx-auto">
                  ⚠️ This action cannot be undone.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingWorkout(null)}
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
