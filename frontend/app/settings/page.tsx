"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";
import { withProtectedRoute } from "@/lib/protectedRoute";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "@/lib/api";

function SettingsPageContent() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [measurements, setMeasurements] = useState({
    height: "",
    weight: "",
    chest: "",
    waist: "",
    arms: "",
    shoulders: "",
    legs: "",
    calves: ""
  });

  useEffect(() => {
    if (user) {
      setMeasurements({
        height: user.height?.toString() || "",
        weight: user.weight?.toString() || "",
        chest: user.chest?.toString() || "",
        waist: user.waist?.toString() || "",
        arms: user.arms?.toString() || "",
        shoulders: user.shoulders?.toString() || "",
        legs: user.legs?.toString() || "",
        calves: user.calves?.toString() || ""
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMeasurements(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      
      Object.entries(measurements).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      await authAPI.updateProfile(formData);
      await refreshUser();
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to save measurements", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">Settings</h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-400 text-sm">
            Measurements saved successfully!
          </div>
        )}
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
            <h2 className="text-lg font-bold text-white">Fitness Measurements</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Height (in)</label>
                  <input
                    type="number"
                    name="height"
                    value={measurements.height}
                    onChange={handleInputChange}
                    placeholder="68"
                    className="w-full bg-[#121216] border border-[#1e1e24] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Weight (lbs)</label>
                  <input
                    type="number"
                    name="weight"
                    value={measurements.weight}
                    onChange={handleInputChange}
                    placeholder="165"
                    className="w-full bg-[#121216] border border-[#1e1e24] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Chest (in)</label>
                  <input
                    type="number"
                    name="chest"
                    value={measurements.chest}
                    onChange={handleInputChange}
                    placeholder="43"
                    className="w-full bg-[#121216] border border-[#1e1e24] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Waist (in)</label>
                  <input
                    type="number"
                    name="waist"
                    value={measurements.waist}
                    onChange={handleInputChange}
                    placeholder="32"
                    className="w-full bg-[#121216] border border-[#1e1e24] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Arms (in)</label>
                  <input
                    type="number"
                    name="arms"
                    value={measurements.arms}
                    onChange={handleInputChange}
                    placeholder="16"
                    className="w-full bg-[#121216] border border-[#1e1e24] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Shoulders (in)</label>
                  <input
                    type="number"
                    name="shoulders"
                    value={measurements.shoulders}
                    onChange={handleInputChange}
                    placeholder="50"
                    className="w-full bg-[#121216] border border-[#1e1e24] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Legs (in)</label>
                  <input
                    type="number"
                    name="legs"
                    value={measurements.legs}
                    onChange={handleInputChange}
                    placeholder="25"
                    className="w-full bg-[#121216] border border-[#1e1e24] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Calves (in)</label>
                  <input
                    type="number"
                    name="calves"
                    value={measurements.calves}
                    onChange={handleInputChange}
                    placeholder="15"
                    className="w-full bg-[#121216] border border-[#1e1e24] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 text-black font-semibold py-2 rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Measurements"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(SettingsPageContent, ["user"]);
