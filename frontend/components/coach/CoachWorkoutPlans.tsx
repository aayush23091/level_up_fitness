"use client";

import React, { useState, useEffect } from "react";
import { workoutPlanAPI, WorkoutPlan } from "@/lib/api";
import WorkoutBuilderModal from "./WorkoutBuilderModal";

export default function CoachWorkoutPlans() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkoutPlans, setTotalWorkoutPlans] = useState(0);

  // Modal states
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorkoutPlan, setSelectedWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchWorkoutPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutPlanAPI.getWorkoutPlans(page, limit, status);
      if (response.success) {
        setWorkoutPlans(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalWorkoutPlans(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to fetch workout plans");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading workout plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlans();
  }, [page, limit, status]);

  const handleDelete = async () => {
    if (!selectedWorkoutPlan) return;

    setIsSubmitting(true);
    try {
      await workoutPlanAPI.deleteWorkoutPlan(selectedWorkoutPlan._id || selectedWorkoutPlan.id || "");
      setIsDeleteModalOpen(false);
      setSelectedWorkoutPlan(null);
      fetchWorkoutPlans();
    } catch (err: any) {
      setError(err.message || "Failed to delete workout plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async (workoutPlan: WorkoutPlan) => {
    try {
      await workoutPlanAPI.publishWorkoutPlan(workoutPlan._id || workoutPlan.id || "");
      fetchWorkoutPlans();
    } catch (err: any) {
      setError(err.message || "Failed to publish workout plan");
    }
  };

  const openDeleteModal = (workoutPlan: WorkoutPlan) => {
    setSelectedWorkoutPlan(workoutPlan);
    setIsDeleteModalOpen(true);
  };

  const openBuilderModal = (workoutPlan?: WorkoutPlan) => {
    setSelectedWorkoutPlan(workoutPlan || null);
    setIsBuilderModalOpen(true);
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
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-40 bg-zinc-950 border border-zinc-800 focus:border-yellow-500 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer transition-all"
          >
            <option value="all">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </div>

        {/* Create Button */}
        <button
          onClick={() => openBuilderModal()}
          className="w-full lg:w-auto px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/10"
        >
          Create Workout Plan
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
            onClick={fetchWorkoutPlans}
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
          <p className="text-zinc-500 font-mono text-xs tracking-wider uppercase">Loading workout plans...</p>
        </div>
      ) : workoutPlans.length === 0 ? (
        /* Empty State */
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center">
          <div className="space-y-3">
            <span className="text-4xl block">🏋️‍♂️</span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">No workout plans found</h4>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Create your first workout plan to get started.
            </p>
          </div>
        </div>
      ) : (
        /* Workout Plans Table */
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-950 border-b border-zinc-800">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Workout Plan</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Difficulty</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Exercises</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {workoutPlans.map((workoutPlan) => (
                  <tr key={workoutPlan._id || workoutPlan.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{workoutPlan.title}</p>
                        <p className="text-xs text-zinc-500 truncate max-w-xs">{workoutPlan.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-400 capitalize">{workoutPlan.difficulty}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-400">{workoutPlan.estimatedDuration} min</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-yellow-500 font-semibold bg-yellow-500/10 px-2 py-1 rounded">
                        {workoutPlan.exercises?.length || 0} exercises
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        workoutPlan.status === "Published" 
                          ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                      }`}>
                        {workoutPlan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {workoutPlan.status === "Draft" && (
                          <button
                            onClick={() => handlePublish(workoutPlan)}
                            className="p-2 text-zinc-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Publish"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => openBuilderModal(workoutPlan)}
                          className="p-2 text-zinc-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(workoutPlan)}
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
                <span className="text-white font-semibold">{totalPages}</span> (Total: <span className="text-yellow-400">{totalWorkoutPlans}</span>)
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

      {/* Workout Builder Modal */}
      <WorkoutBuilderModal
        isOpen={isBuilderModalOpen}
        onClose={() => {
          setIsBuilderModalOpen(false);
          setSelectedWorkoutPlan(null);
        }}
        onSuccess={fetchWorkoutPlans}
        editWorkoutPlan={selectedWorkoutPlan}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-white">Delete Workout Plan</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-400">
                Are you sure you want to delete <span className="text-white font-semibold">{selectedWorkoutPlan?.title}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedWorkoutPlan(null);
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
