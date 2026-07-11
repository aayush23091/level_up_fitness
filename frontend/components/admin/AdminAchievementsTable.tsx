
"use client";

import React, { useState, useEffect } from "react";
import { adminAPI, Achievement } from "@/lib/api";

export default function AdminAchievementsTable() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, filter and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAchievements, setTotalAchievements] = useState(0);

  // Modal & Toast States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    conditionType: "workout_completed" as Achievement["conditionType"],
    conditionValue: 1,
    xpReward: 0,
    coinReward: 0,
    badgeImage: "",
    status: "active" as Achievement["status"],
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<Achievement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (achievement: Achievement) => {
    setDeletingAchievement(achievement);
  };

  const handleDeleteSubmit = async () => {
    if (!deletingAchievement) return;
    setIsDeleting(true);
    try {
      const id = deletingAchievement._id || deletingAchievement.id || "";
      const response = await adminAPI.deleteAchievement(id);
      if (response.success) {
        setToast({ message: `Achievement "${deletingAchievement.title}" deleted successfully!`, type: "success" });
        setDeletingAchievement(null);
        fetchAchievements();
      } else {
        setToast({ message: response.message || "Failed to delete achievement.", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "An error occurred during deletion.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelClose = () => {
    setIsModalOpen(false);
    setEditingAchievementId(null);
    setValidationError(null);
    setFormData({
      title: "",
      description: "",
      conditionType: "workout_completed",
      conditionValue: 1,
      xpReward: 0,
      coinReward: 0,
      badgeImage: "",
      status: "active",
    });
  };

  const handleEditClick = (achievement: Achievement) => {
    setValidationError(null);
    setFormData({
      title: achievement.title,
      description: achievement.description,
      conditionType: achievement.conditionType,
      conditionValue: achievement.conditionValue,
      xpReward: achievement.xpReward,
      coinReward: achievement.coinReward,
      badgeImage: achievement.badgeImage || "",
      status: achievement.status,
    });
    setEditingAchievementId(achievement._id || achievement.id || null);
    setIsModalOpen(true);
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
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
    if (formData.conditionValue < 1) {
      setValidationError("Condition value must be at least 1.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingAchievementId) {
        // Edit Mode
        const response = await adminAPI.updateAchievement(editingAchievementId, formData);

        if (response.success) {
          setToast({ message: "Achievement updated successfully!", type: "success" });
          handleCancelClose();
          fetchAchievements();
        } else {
          setValidationError(response.message || "Failed to update achievement.");
        }
      } else {
        // Create Mode
        const response = await adminAPI.createAchievement(formData);

        if (response.success) {
          setToast({ message: "Achievement created successfully!", type: "success" });
          handleCancelClose();
          fetchAchievements();
        } else {
          setValidationError(response.message || "Failed to create achievement.");
        }
      }
    } catch (err: any) {
      setValidationError(err.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getAchievements(page, limit, debouncedSearch, statusFilter);
      if (response.success) {
        setAchievements(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalAchievements(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to retrieve achievements.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching achievement data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [page, limit, debouncedSearch, statusFilter]);

  const formatConditionType = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative w-full max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search achievements..."
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
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-card-secondary border border-border hover:border-accent/40 focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          {totalAchievements > 0 && (
            <span className="text-xs text-muted font-bold uppercase tracking-wider">
              Total Achievements: <span className="text-accent">{totalAchievements}</span>
            </span>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-accent hover:bg-accent/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-accent/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Achievement
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
            onClick={fetchAchievements}
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
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Condition</th>
                <th className="px-6 py-4">Requirement</th>
                <th className="px-6 py-4">XP Reward</th>
                <th className="px-6 py-4">Coin Reward</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-card-secondary/60 rounded w-28 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : achievements.length === 0 ? (
                // Empty State Rows
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">🏆</span>
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">No achievements found</h4>
                      <p className="text-xs text-muted max-w-xs mx-auto">
                        We couldn't find any achievements matching your current filters or search term.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Achievements Data Rows
                achievements.map((achievement) => {
                  const achievementId = achievement._id || achievement.id || "";
                  return (
                    <tr key={achievementId} className="hover:bg-card-secondary/20 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground group-hover:text-accent transition-colors">
                          {achievement.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground text-xs">{formatConditionType(achievement.conditionType)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground text-xs">{achievement.conditionValue}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground text-xs">{achievement.xpReward}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground text-xs">{achievement.coinReward}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${achievement.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-card-secondary text-muted border-border/50"}`}>
                          {achievement.status === "active" && (
                            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          )}
                          {achievement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(achievement)}
                            className="p-1 text-muted hover:text-foreground hover:bg-card-secondary/80 rounded-lg transition-all cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-2.036a5 5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(achievement)}
                            className="p-1 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete Achievement"
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

      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-3 transition-all duration-300 ${toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
          <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
          <p className="text-xs font-bold uppercase tracking-wider">{toast.message}</p>
        </div>
      )}

      {/* Create/Edit Achievement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card-secondary/40">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                {editingAchievementId ? "Edit Achievement" : "Add New Achievement"}
              </h3>
              <button
                type="button"
                onClick={handleCancelClose}
                className="p-1 rounded text-muted hover:text-foreground hover:bg-card-secondary transition-all focus:outline-none cursor-pointer"
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
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter achievement title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    required
                    placeholder="Enter achievement description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted resize-none"
                  />
                </div>

                {/* Condition Type */}
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Condition Type
                  </label>
                  <select
                    value={formData.conditionType}
                    onChange={(e) => setFormData({ ...formData, conditionType: e.target.value as any })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer bg-background"
                  >
                    <option value="workout_completed">Workout Completed</option>
                    <option value="xp_earned">XP Earned</option>
                    <option value="level_reached">Level Reached</option>
                    <option value="streak_days">Streak Days</option>
                  </select>
                </div>

                {/* Condition Value */}
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Condition Value
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.conditionValue}
                    onChange={(e) => setFormData({ ...formData, conditionValue: parseInt(e.target.value) || 1 })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
                  />
                </div>

                {/* XP Reward */}
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
                  />
                </div>

                {/* Coin Reward */}
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Coin Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.coinReward}
                    onChange={(e) => setFormData({ ...formData, coinReward: parseInt(e.target.value) || 0 })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
                  />
                </div>

                {/* Badge Image (Optional */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Badge Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/badge.png"
                    value={formData.badgeImage}
                    onChange={(e) => setFormData({ ...formData, badgeImage: e.target.value })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelClose}
                  className="px-4 py-2 bg-card-secondary hover:bg-card-secondary text-foreground text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-accent/10 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : (editingAchievementId ? "Save Changes" : "Create Achievement")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAchievement && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Body */}
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Delete Achievement
                </h3>
                <p className="text-xs text-muted">
                  Are you sure you want to permanently delete the achievement:
                </p>
                <p className="text-sm font-black text-accent py-1">
                  {deletingAchievement.title}
                </p>
                <p className="text-[10px] text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-lg p-2 max-w-xs mx-auto">
                  ⚠️ This action cannot be undone.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingAchievement(null)}
                  className="px-4 py-2 bg-card-secondary hover:bg-card-secondary text-foreground text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-foreground text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-red-500/10 cursor-pointer"
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

