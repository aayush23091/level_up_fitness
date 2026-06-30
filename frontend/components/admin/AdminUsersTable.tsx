"use client";

import React, { useState, useEffect } from "react";
import { adminAPI, User } from "@/lib/api";

export default function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal & Toast States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    gender: "Male",
    role: "user",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
  };

  const handleDeleteSubmit = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const id = deletingUser._id || deletingUser.id || "";
      const response = await adminAPI.deleteUser(id);
      if (response.success) {
        setToast({ message: `User "${deletingUser.name}" deleted successfully!`, type: "success" });
        setDeletingUser(null);
        fetchUsers();
      } else {
        setToast({ message: response.message || "Failed to delete user.", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: err.message || "An error occurred during deletion.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelClose = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setValidationError(null);
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      gender: "Male",
      role: "user",
    });
  };

  const handleEditClick = (user: User) => {
    setValidationError(null);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      password: "", // Optional during edit
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      role: user.role,
    });
    setEditingUserId(user._id || user.id || null);
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
    if (formData.name.trim().length < 2) {
      setValidationError("Name must be at least 2 characters.");
      setIsSubmitting(false);
      return;
    }
    if (formData.username.trim().length < 3) {
      setValidationError("Username must be at least 3 characters.");
      setIsSubmitting(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setValidationError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }
    // Only check password length if in create mode, or if entered in edit mode
    if (!editingUserId || formData.password.length > 0) {
      if (formData.password.length < 6) {
        setValidationError("Password must be at least 6 characters long.");
        setIsSubmitting(false);
        return;
      }
    }
    if (formData.phoneNumber.trim().length < 7) {
      setValidationError("Phone number must be at least 7 characters.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingUserId) {
        // Edit Mode
        const updatePayload: Record<string, any> = {
          name: formData.name.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formData.phoneNumber.trim(),
          gender: formData.gender,
          role: formData.role,
        };

        if (formData.password.length > 0) {
          updatePayload.password = formData.password;
        }

        const response = await adminAPI.updateUser(editingUserId, updatePayload);

        if (response.success) {
          setToast({ message: "User updated successfully!", type: "success" });
          handleCancelClose();
          fetchUsers();
        } else {
          setValidationError(response.message || "Failed to update user.");
        }
      } else {
        // Create Mode
        const response = await adminAPI.createUser({
          name: formData.name.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim(),
          gender: formData.gender,
          role: formData.role,
        });

        if (response.success) {
          setToast({ message: "User created successfully!", type: "success" });
          handleCancelClose();
          fetchUsers();
        } else {
          setValidationError(response.message || "Failed to create user.");
        }
      }
    } catch (err: any) {
      setValidationError(err.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getUsers(page, limit, debouncedSearch);
      if (response.success) {
        setUsers(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalUsers(response.meta?.total || 0);
      } else {
        setError(response.message || "Failed to retrieve users.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching user data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
          {totalUsers > 0 && (
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
              Total Users: <span className="text-yellow-400">{totalUsers}</span>
            </span>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-yellow-400/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add User
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
            onClick={fetchUsers}
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-sm">
              {loading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-12"></div>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800/60 shrink-0"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-zinc-800/60 rounded w-24"></div>
                        <div className="h-3 bg-zinc-800/60 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-36"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-zinc-800/60 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-zinc-800/60 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-zinc-800/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-8 bg-zinc-800/60 rounded w-28 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                // Empty State Rows
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">👥</span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">No users found</h4>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        We couldn't find any user profiles matching your current filters or search term.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Users Data Rows
                users.map((user) => {
                  const userIdStr = user._id || user.id || "";
                  const displayId = userIdStr ? `#${userIdStr.slice(-6).toUpperCase()}` : "N/A";
                  return (
                    <tr key={userIdStr} className="hover:bg-zinc-900/20 transition-colors group">
                      <td className="px-6 py-4 text-zinc-500 font-mono text-xs">
                        {displayId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.profilePhoto ? (
                            <img
                              src={
                                user.profilePhoto.startsWith("http")
                                  ? user.profilePhoto
                                  : `http://localhost:5000${user.profilePhoto}`
                              }
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-zinc-800 group-hover:border-yellow-500/30 transition-all shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/30 group-hover:border-yellow-500/30 flex items-center justify-center text-xs font-bold font-mono tracking-wider transition-all shrink-0">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                              {user.name}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              @{user.username || "username"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.05)]">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-xs">
                        {formatDate((user as any).createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            className="p-1 text-zinc-500 hover:text-yellow-400 hover:bg-[#121216]/80 rounded-lg transition-all"
                            title="View Profile"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-1 text-zinc-500 hover:text-white hover:bg-[#121216]/80 rounded-lg transition-all cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-2.036a5 5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                            title="Delete User"
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

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingUserId ? "Edit User Profile" : "Add New User"}
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
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Email */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Password */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder={editingUserId ? "•••••••• (Leave blank to keep current)" : "••••••••"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all placeholder:text-zinc-700"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer bg-zinc-950 text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#121216] border border-zinc-800 focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer bg-zinc-950 text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
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
                  {isSubmitting ? "Saving..." : (editingUserId ? "Save Changes" : "Create User")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
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
                  Delete User Account
                </h3>
                <p className="text-xs text-zinc-400">
                  Are you sure you want to permanently delete the profile for:
                </p>
                <p className="text-sm font-black text-yellow-400 py-1">
                  {deletingUser.name} ({deletingUser.email})
                </p>
                <p className="text-[10px] text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-lg p-2 max-w-xs mx-auto">
                  ⚠️ This action cannot be undone. All user records will be removed.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
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
