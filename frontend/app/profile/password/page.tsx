"use client";

import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { authAPI } from "@/lib/api";

export default function PasswordSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Frontend validations
    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData as PUT /api/v1/auth/update expects multipart/form-data
      const formData = new FormData();
      formData.append("password", newPassword);

      const res = await authAPI.updateProfile(formData);
      if (res.success) {
        setSuccessMsg("Password updated successfully!");
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

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8 max-w-2xl mx-auto">
        {/* Page Header */}
        <section className="border-b border-border pb-5">
          <h1 className="text-2xl lg:text-3xl font-black text-foreground uppercase tracking-wider">
            ACCOUNT <span className="text-accent">SETTINGS</span>
          </h1>
          <p className="text-muted text-xs mt-1">Manage and update your account security credentials.</p>
        </section>

        {/* Change Password Card */}
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="text-2xl">🔒</span>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-wide">Change Password</h2>
              <p className="text-xs text-muted mt-0.5">Ensure your account is using a long, random password to stay secure.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
              />
              <p className="text-[10px] text-muted mt-1">Must be at least 6 characters long.</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2.5 focus:outline-none transition-all placeholder:text-muted"
              />
            </div>

            {/* Form alerts */}
            {errorMsg && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg font-medium">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded-lg font-medium">
                ✅ {successMsg}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-3 border-t border-border">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-accent/10"
              >
                {isSubmitting ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
