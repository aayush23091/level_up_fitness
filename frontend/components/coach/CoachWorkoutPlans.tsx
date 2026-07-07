"use client";

import React, { useState, useEffect } from "react";
import { workoutAPI, Workout } from "@/lib/api";

interface WorkoutFormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  xpReward: number;
  coinReward: number;
  thumbnail: string;
  isPremium: boolean;
}

const INITIAL_FORM_DATA: WorkoutFormData = {
  title: "",
  description: "",
  category: "Strength",
  difficulty: "Beginner",
  duration: 30,
  xpReward: 50,
  coinReward: 10,
  thumbnail: "",
  isPremium: false,
};

export default function CoachWorkoutPlans() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [formData, setFormData] = useState<WorkoutFormData>(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof WorkoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutAPI.getWorkouts(page, limit, debouncedSearch, category, difficulty);
      if (response.success) {
        setWorkouts(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalWorkouts(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to fetch workouts");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading workouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [page, limit, debouncedSearch, category, difficulty]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof WorkoutFormData, string>> = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (formData.title.length < 2) errors.title = "Title must be at least 2 characters";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (formData.description.length < 5) errors.description = "Description must be at least 5 characters";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.difficulty) errors.difficulty = "Difficulty is required";
    if (formData.duration < 1) errors.duration = "Duration must be at least 1 minute";
    if (formData.xpReward < 0) errors.xpReward = "XP reward cannot be negative";
    if (formData.coinReward < 0) errors.coinReward = "Coin reward cannot be negative";
    if (!formData.thumbnail.trim()) errors.thumbnail = "Thumbnail URL is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await workoutAPI.createWorkout(formData);
      setIsCreateModalOpen(false);
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
      fetchWorkouts();
    } catch (err: any) {
      setError(err.message || "Failed to create workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedWorkout) return;

    setIsSubmitting(true);
    try {
      await workoutAPI.updateWorkout(selectedWorkout._id || selectedWorkout.id || "", formData);
      setIsEditModalOpen(false);
      setSelectedWorkout(null);
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
      fetchWorkouts();
    } catch (err: any) {
      setError(err.message || "Failed to update workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWorkout) return;

    setIsSubmitting(true);
    try {
      await workoutAPI.deleteWorkout(selectedWorkout._id || selectedWorkout.id || "");
      setIsDeleteModalOpen(false);
      setSelectedWorkout(null);
      fetchWorkouts();
    } catch (err: any) {
      setError(err.message || "Failed to delete workout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (workout: Workout) => {
    setSelectedWorkout(workout);
    setFormData({
      title: workout.title,
      description: workout.description,
      category: workout.category,
      difficulty: workout.difficulty,
      duration: workout.duration,
      xpReward: workout.xpReward,
      coinReward: workout.coinReward,
      thumbnail: workout.thumbnail,
      isPremium: workout.isPremium,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
          Workout Plans
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Create and manage workout plans for your athletes.</p>
      </section>

      {/* Search, Filters & Create Button */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search workouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 hover:border-yellow-500/40 focus:border-yellow-500 text-sm text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-600"
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

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-40 bg-zinc-950 border border-zinc-800 focus:border-yellow-500 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer transition-all"
          >
            <option value="all">All Categories</option>
            <option value="Strength">Strength</option>
            <option value="HIIT Cardio">HIIT Cardio</option>
            <option value="Core">Core</option>
            <option value="Mobility">Mobility</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-40 bg-zinc-950 border border-zinc-800 focus:border-yellow-500 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer transition-all"
          >
            <option value="all">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Create Button */}
        <button
          onClick={() => {
            setFormData(INITIAL_FORM_DATA);
            setFormErrors({});
            setIsCreateModalOpen(true);
          }}
          className="w-full lg:w-auto px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/10"
        >
          Create Workout
        </button>
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

      {/* Loading State */}
      {loading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
          <span className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin inline-block"></span>
          <p className="text-zinc-500 font-mono text-xs tracking-wider uppercase">Loading workouts...</p>
        </div>
      ) : workouts.length === 0 ? (
        /* Empty State */
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center">
          <div className="space-y-3">
            <span className="text-4xl block">🏋️‍♂️</span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">No workouts found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Create your first workout plan to get started.
            </p>
          </div>
        </div>
      ) : (
        /* Workout Table */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Workout</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Rewards</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {workouts.map((workout) => (
                  <tr key={workout._id || workout.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {workout.thumbnail && (
                          <img
                            src={workout.thumbnail}
                            alt={workout.title}
                            className="w-12 h-12 rounded-lg object-cover border border-zinc-700"
                          />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-white">{workout.title}</p>
                          <p className="text-xs text-zinc-500 truncate max-w-xs">{workout.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-yellow-500 font-semibold bg-yellow-500/10 px-2 py-1 rounded">
                        {workout.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-400 capitalize">{workout.difficulty}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-400">{workout.duration} min</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-yellow-500">✨ {workout.xpReward} XP</span>
                        <span className="text-xs text-yellow-500">🪙 {workout.coinReward} Coins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {workout.isPremium && (
                          <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            👑 Premium
                          </span>
                        )}
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          workout.status === "active" 
                            ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}>
                          {workout.status || "Active"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(workout)}
                          className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(workout)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-zinc-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-500">
                Showing page <span className="text-white font-semibold">{page}</span> of{" "}
                <span className="text-white font-semibold">{totalPages}</span> (Total: <span className="text-yellow-400">{totalWorkouts}</span>)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:border-yellow-500/40 disabled:opacity-30 disabled:hover:border-zinc-800 text-zinc-400 hover:text-white disabled:hover:text-zinc-400 text-xs font-bold rounded-xl uppercase tracking-wider transition-all disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:border-yellow-500/40 disabled:opacity-30 disabled:hover:border-zinc-800 text-zinc-400 hover:text-white disabled:hover:text-zinc-400 text-xs font-bold rounded-xl uppercase tracking-wider transition-all disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Create New Workout</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-zinc-950 border ${formErrors.title ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                  placeholder="Enter workout title"
                />
                {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full bg-zinc-950 border ${formErrors.description ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all resize-none`}
                  placeholder="Enter workout description"
                />
                {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full bg-zinc-950 border ${formErrors.category ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer`}
                  >
                    <option value="Strength">Strength</option>
                    <option value="HIIT Cardio">HIIT Cardio</option>
                    <option value="Core">Core</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                  {formErrors.category && <p className="text-red-400 text-xs mt-1">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className={`w-full bg-zinc-950 border ${formErrors.difficulty ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer`}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  {formErrors.difficulty && <p className="text-red-400 text-xs mt-1">{formErrors.difficulty}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="1"
                  className={`w-full bg-zinc-950 border ${formErrors.duration ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                  placeholder="30"
                />
                {formErrors.duration && <p className="text-red-400 text-xs mt-1">{formErrors.duration}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">XP Reward</label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    min="0"
                    className={`w-full bg-zinc-950 border ${formErrors.xpReward ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                    placeholder="50"
                  />
                  {formErrors.xpReward && <p className="text-red-400 text-xs mt-1">{formErrors.xpReward}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Coin Reward</label>
                  <input
                    type="number"
                    value={formData.coinReward}
                    onChange={(e) => setFormData({ ...formData, coinReward: parseInt(e.target.value) || 0 })}
                    min="0"
                    className={`w-full bg-zinc-950 border ${formErrors.coinReward ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                    placeholder="10"
                  />
                  {formErrors.coinReward && <p className="text-red-400 text-xs mt-1">{formErrors.coinReward}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Thumbnail URL</label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className={`w-full bg-zinc-950 border ${formErrors.thumbnail ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.thumbnail && <p className="text-red-400 text-xs mt-1">{formErrors.thumbnail}</p>}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-zinc-900"
                />
                <label htmlFor="isPremium" className="text-sm text-zinc-400">Premium Workout</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setFormData(INITIAL_FORM_DATA);
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creating..." : "Create Workout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Edit Workout</h2>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-zinc-950 border ${formErrors.title ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                  placeholder="Enter workout title"
                />
                {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full bg-zinc-950 border ${formErrors.description ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all resize-none`}
                  placeholder="Enter workout description"
                />
                {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full bg-zinc-950 border ${formErrors.category ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer`}
                  >
                    <option value="Strength">Strength</option>
                    <option value="HIIT Cardio">HIIT Cardio</option>
                    <option value="Core">Core</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                  {formErrors.category && <p className="text-red-400 text-xs mt-1">{formErrors.category}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className={`w-full bg-zinc-950 border ${formErrors.difficulty ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer`}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  {formErrors.difficulty && <p className="text-red-400 text-xs mt-1">{formErrors.difficulty}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="1"
                  className={`w-full bg-zinc-950 border ${formErrors.duration ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                  placeholder="30"
                />
                {formErrors.duration && <p className="text-red-400 text-xs mt-1">{formErrors.duration}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">XP Reward</label>
                  <input
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    min="0"
                    className={`w-full bg-zinc-950 border ${formErrors.xpReward ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                    placeholder="50"
                  />
                  {formErrors.xpReward && <p className="text-red-400 text-xs mt-1">{formErrors.xpReward}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Coin Reward</label>
                  <input
                    type="number"
                    value={formData.coinReward}
                    onChange={(e) => setFormData({ ...formData, coinReward: parseInt(e.target.value) || 0 })}
                    min="0"
                    className={`w-full bg-zinc-950 border ${formErrors.coinReward ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                    placeholder="10"
                  />
                  {formErrors.coinReward && <p className="text-red-400 text-xs mt-1">{formErrors.coinReward}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Thumbnail URL</label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className={`w-full bg-zinc-950 border ${formErrors.thumbnail ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.thumbnail && <p className="text-red-400 text-xs mt-1">{formErrors.thumbnail}</p>}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPremiumEdit"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-zinc-900"
                />
                <label htmlFor="isPremiumEdit" className="text-sm text-zinc-400">Premium Workout</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedWorkout(null);
                    setFormData(INITIAL_FORM_DATA);
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Workout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Delete Workout</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-400">
                Are you sure you want to delete <span className="text-white font-semibold">{selectedWorkout?.title}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedWorkout(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
