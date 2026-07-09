"use client";

import React, { useState } from "react";
import { authAPI } from "@/lib/api";

export default function CoachSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setIsSubmitting(false);
      setErrorMsg("New password and confirmation do not match");
      return;
    }

    try {
      const res = await authAPI.changePassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setSuccessMsg(res.message || "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none transition-all placeholder:text-gray-600";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
          Coach <span className="text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.15)]">Settings</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-1">
          Manage your account security and credentials.
        </p>
      </section>

      {/* Security Settings Card */}
      <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            Security Settings
          </h2>
          <p className="text-zinc-500 text-xs mt-1">
            Update your password to keep your account secure.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5 max-w-xl">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={inputClass}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={inputClass}
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className={inputClass}
              />
            </div>

            {/* Feedback */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg font-medium">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg font-medium">
                {successMsg}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/10"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
