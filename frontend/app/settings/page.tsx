"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";
import { withProtectedRoute } from "@/lib/protectedRoute";

function SettingsPageContent() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">Settings</h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Account Settings</h2>
            <div className="space-y-3">
              <Link
                href="/profile"
                className="flex items-center gap-3 p-4 bg-[#121216] border border-[#1e1e24] rounded-xl hover:border-yellow-500/20 transition-all"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-white">Edit Profile</p>
                  <p className="text-xs text-gray-500">Update your personal information</p>
                </div>
              </Link>
              <Link
                href="/profile/password"
                className="flex items-center gap-3 p-4 bg-[#121216] border border-[#1e1e24] rounded-xl hover:border-yellow-500/20 transition-all"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-white">Change Password</p>
                  <p className="text-xs text-gray-500">Update your password</p>
                </div>
              </Link>
            </div>
          </div>
          <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white">Preferences</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-[#121216] border border-[#1e1e24] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive workout reminders</p>
                </div>
                <div className="w-12 h-6 bg-yellow-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#121216] border border-[#1e1e24] rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-white">Dark Mode</p>
                  <p className="text-xs text-gray-500">Use dark theme</p>
                </div>
                <div className="w-12 h-6 bg-yellow-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(SettingsPageContent, ["user"]);
