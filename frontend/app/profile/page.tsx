"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import CoachLayout from "@/components/coach/CoachLayout";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "@/lib/api";
import { getProfileImageUrl } from "@/lib/getProfileImageUrl";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCoachProfileModalOpen, setIsCoachProfileModalOpen] = useState(false);

  // Edit Profile Form State
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Coach-specific fields
  const [bio, setBio] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [hireCost, setHireCost] = useState("");
  const [availability, setAvailability] = useState(true);
  const [coachProfileImage, setCoachProfileImage] = useState<File | null>(null);
  const [coachProfileImagePreview, setCoachProfileImagePreview] = useState<string | null>(null);

  // Modal feedback state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Initialize form fields when user data is available or modal opens
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setGender(user.gender || "");
      setPhoto(null);
      setPhotoPreview(null);
    }
  }, [user, isEditModalOpen]);

  // Initialize coach profile fields when coach profile modal opens
  useEffect(() => {
    if (user && user.role === "coach") {
      setBio(user.coachProfile?.bio || "");
      setSpecialization(user.coachProfile?.specialization?.join(", ") || "");
      setExperience(user.coachProfile?.experience?.toString() || "");
      setHireCost(user.coachProfile?.hireCost?.toString() || "");
      setAvailability(
        user.coachProfile?.availability !== undefined
          ? user.coachProfile.availability
          : true
      );
      setCoachProfileImage(null);
      setCoachProfileImagePreview(null);
    }
  }, [user, isCoachProfileModalOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoachProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoachProfileImage(file);
      setCoachProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("gender", gender);
      if (photo) {
        formData.append("photo", photo);
      }

      const res = await authAPI.updateProfile(formData);
      if (res.success) {
        setSuccessMsg("Profile updated successfully!");
        await refreshUser();
        setTimeout(() => {
          setIsEditModalOpen(false);
          setSuccessMsg("");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoachProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("specialization", specialization);
      formData.append("experience", experience);
      formData.append("hireCost", hireCost);
      formData.append("availability", availability.toString());
      if (coachProfileImage) {
        formData.append("profileImage", coachProfileImage);
      }

      const res = await authAPI.updateProfile(formData);
      if (res.success) {
        setSuccessMsg("Coach profile updated successfully!");
        await refreshUser();
        setTimeout(() => {
          setIsCoachProfileModalOpen(false);
          setSuccessMsg("");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update coach profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarUrl = getProfileImageUrl(user?.profilePhoto);
  const coachProfileImageUrl = getProfileImageUrl(user?.coachProfile?.profileImage);
  const router = useRouter();
  const isCoach = user?.role === "coach";

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Mock statistics for profile
  const stats = [
    {
      label: "Total Workouts",
      value: "48",
      icon: "🏋️‍♂️",
      color: "text-yellow-500 bg-yellow-500/10",
    },
    {
      label: "Active Calories",
      value: "18,400 kcal",
      icon: "🔥",
      color: "text-red-500 bg-red-500/10",
    },
    {
      label: "Time Exercising",
      value: "2,400 min",
      icon: "⏱️",
      color: "text-blue-500 bg-blue-500/10",
    },
  ];

  // Achievements
  const achievements = [
    {
      title: "Onboarding Master",
      description: "Completed setup and first training",
      icon: "🚀",
      unlocked: true,
    },
    {
      title: "Streak Champion",
      description: "Maintained a 5-day active workout streak",
      icon: "🔥",
      unlocked: true,
    },
    {
      title: "Heavy Lifter",
      description: "Lifted a total of 1000kg in workouts",
      icon: "💪",
      unlocked: true,
    },
    {
      title: "Early Bird",
      description: "Completed a workout before 6:00 AM",
      icon: "🌅",
      unlocked: false,
    },
    {
      title: "Consistency King",
      description: "Exercised 4 weeks in a row",
      icon: "👑",
      unlocked: false,
    },
  ];

  const PageShell = isCoach ? CoachLayout : DashboardLayout;

  return (
    <PageShell>
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        <section className="flex items-center justify-between border-b border-[#1e1e24] pb-5">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
              MY <span className="text-yellow-500">PROFILE</span>
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              {isCoach
                ? "Manage your coach profile and professional details."
                : "Manage your account information, tracking, and fitness statistics."}
            </p>
          </div>
        </section>

        {/*
          Coach layout fix:
          - Desktop/tablet: 2 columns
          - Mobile: 1 column
        */}
        {isCoach ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Edit Profile card */}
            <div className="space-y-6">
              <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative">
                {/* Avatar image container */}
                <div className="relative group mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || "Profile Photo"}
                      className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover border-2 border-yellow-500/20"
                    />
                  ) : (
                    <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 text-yellow-500 border border-yellow-500/20 flex items-center justify-center text-3xl font-black font-mono">
                      {getInitials()}
                    </div>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0e0e12]"></span>
                </div>

                <h2 className="text-xl font-bold text-white tracking-wide">{user?.name}</h2>
                <p className="text-xs text-yellow-500 font-mono mt-0.5">@{user?.username}</p>
                <span className="mt-3 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] uppercase font-bold tracking-widest rounded-full">
                  {user?.role || "MEMBER"}
                </span>

                {/* Info fields */}
                <div className="w-full mt-6 space-y-3.5 border-t border-[#1e1e24] pt-6 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Email Address</span>
                    <span className="text-white font-medium truncate max-w-[180px]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Phone Number</span>
                    <span className="text-white font-medium">{user?.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Gender</span>
                    <span className="text-white font-medium capitalize">{user?.gender || "N/A"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/5"
                >
                  Edit Profile
                </button>

                {isCoach && (
                  <button
                    onClick={() => router.push(`/coaches/${user?.id || user?._id}`)}
                    className="w-full mt-3 py-2.5 bg-[#1e1e24] hover:bg-[#2e2e38] text-yellow-500 border border-yellow-500/20 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    View Marketplace Profile
                  </button>
                )}
              </div>
            </div>

            {/* Coach Marketplace card */}
            <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1e1e24] pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  COACH MARKETPLACE PROFILE
                </h3>
                <button
                  onClick={() => setIsCoachProfileModalOpen(true)}
                  className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold uppercase tracking-wider transition-colors"
                >
                  Edit Coach Profile
                </button>
              </div>

              {/* Bio */}
              {user.coachProfile?.bio && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{user.coachProfile.bio}</p>
                </div>
              )}

              {/* Specialization */}
              {user.coachProfile?.specialization && user.coachProfile.specialization.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Specialization</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.coachProfile.specialization.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-yellow-500 font-semibold uppercase tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coach Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1e1e24]">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Experience</p>
                  <p className="text-sm font-bold text-white mt-0.5">{user.coachProfile?.experience || 0} Years</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Hire Cost</p>
                  <p className="text-sm font-bold text-yellow-500 mt-0.5">{user.coachProfile?.hireCost || 0} Coins</p>
                </div>
                {user.coachProfile?.category && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Category</p>
                    <p className="text-sm font-bold text-white mt-0.5 capitalize">{user.coachProfile.category}</p>
                  </div>
                )}
                {user.coachProfile?.rating !== undefined && user.coachProfile?.rating !== null && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Rating</p>
                    <p className="text-sm font-bold text-yellow-500 mt-0.5">
                      {"★".repeat(Math.round(user.coachProfile.rating))} {user.coachProfile.rating}/5
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Availability</p>
                  <p
                    className={`text-sm font-bold mt-0.5 ${
                      user.coachProfile?.availability ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {user.coachProfile?.availability ? "Available for hire" : "Not available"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push(`/coaches/${user?.id || user?._id}`)}
                className="w-full mt-4 py-2.5 bg-[#1e1e24] hover:bg-[#2e2e38] text-yellow-500 border border-yellow-500/20 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
              >
                View Marketplace Profile
              </button>
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 items-start`}>
            {/* Left column: User details card */}
            <div className="space-y-6">
              <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative">
                {/* Avatar image container */}
                <div className="relative group mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || "Profile Photo"}
                      className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover border-2 border-yellow-500/20"
                    />
                  ) : (
                    <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 text-yellow-500 border border-yellow-500/20 flex items-center justify-center text-3xl font-black font-mono">
                      {getInitials()}
                    </div>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0e0e12]"></span>
                </div>

                <h2 className="text-xl font-bold text-white tracking-wide">{user?.name}</h2>
                <p className="text-xs text-yellow-500 font-mono mt-0.5">@{user?.username}</p>
                <span className="mt-3 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] uppercase font-bold tracking-widest rounded-full">
                  {user?.role || "MEMBER"}
                </span>

                {/* Info fields */}
                <div className="w-full mt-6 space-y-3.5 border-t border-[#1e1e24] pt-6 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Email Address</span>
                    <span className="text-white font-medium truncate max-w-[180px]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Phone Number</span>
                    <span className="text-white font-medium">{user?.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Gender</span>
                    <span className="text-white font-medium capitalize">{user?.gender || "N/A"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/5"
                >
                  Edit Profile
                </button>
              </div>

              {!isCoach && (
                <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1e1e24] pb-3">
                    XP & LEVEL STATUS
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Current Status</p>
                      <p className="text-2xl font-black text-white mt-0.5">Level 12</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-medium">Daily Streak</p>
                      <p className="text-2xl font-black text-yellow-500 mt-0.5 flex items-center justify-end gap-1">
                        ⚡ 5 Days
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                      <span>Level Progress</span>
                      <span>2,450 / 3,000 XP</span>
                    </div>
                    <div className="w-full bg-[#1c1c24] h-2 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full rounded-full" style={{ width: "81%" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-[#0e0e12] border border-[#1e1e24] p-5 rounded-2xl flex items-center gap-4 hover:border-yellow-500/10 transition-all"
                  >
                    <span className={`w-12 h-12 flex items-center justify-center rounded-xl text-xl ${stat.color}`}>
                      {stat.icon}
                    </span>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
                      <p className="text-lg font-black text-white mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weekly Activity Placeholder */}
              <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1e1e24] pb-3">
                  WEEKLY PERFORMANCE OVERVIEW
                </h3>
                <div className="h-44 flex items-end justify-between px-2 pt-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                    const heights = [40, 75, 20, 95, 60, 10, 5];
                    const height = heights[idx];
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 w-8">
                        <div className="w-full bg-[#121216] h-32 rounded-md relative flex items-end overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-md"
                            style={{ height: `${height}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Achievements Section */}
              <div className="bg-[#0e0e12] border border-[#1e1e24] p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1e1e24] pb-3">
                  UNLOCKED ACHIEVEMENTS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((ach, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 bg-[#121216] border rounded-xl transition-all ${
                        ach.unlocked
                          ? "border-[#1e1e24] hover:border-yellow-500/10"
                          : "border-[#1e1e24]/40 opacity-40"
                      }`}
                    >
                      <span className="text-2xl p-2 bg-[#1c1c24] rounded-lg shrink-0">{ach.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-white">{ach.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300">
              <div className="h-16 px-6 border-b border-[#1e1e24] flex items-center justify-between bg-[#121216]">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  EDIT <span className="text-yellow-500">PROFILE DETAILS</span>
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded text-gray-400 hover:text-white transition-colors focus:outline-none"
                >
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#1e1e24] pb-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover border border-yellow-500/40"
                    />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Current Avatar" className="w-16 h-16 rounded-full object-cover border border-yellow-500/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 text-yellow-500 flex items-center justify-center text-lg font-bold font-mono">
                      {getInitials()}
                    </div>
                  )}
                  <div className="text-center sm:text-left flex-1 space-y-1">
                    <label
                      htmlFor="photo-upload"
                      className="inline-block px-4 py-1.5 bg-[#1e1e24] hover:bg-[#2e2e38] text-white text-xs font-semibold rounded cursor-pointer transition-colors border border-[#333]"
                    >
                      Change Photo
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    <p className="text-[10px] text-gray-500">PNG, JPG, or WEBP. Max 5MB.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone number"
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Gender</label>
                    <select
                      value={gender}
                      required
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded-lg font-medium">
                    ✅ {successMsg}
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-[#1e1e24]">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-[#1e1e24] hover:border-gray-700 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/10"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* COACH PROFILE EDIT MODAL */}
        {isCoachProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300">
              <div className="h-16 px-6 border-b border-[#1e1e24] flex items-center justify-between bg-[#121216]">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  EDIT <span className="text-yellow-500">COACH PROFILE</span>
                </h3>
                <button
                  onClick={() => setIsCoachProfileModalOpen(false)}
                  className="p-1 rounded text-gray-400 hover:text-white transition-colors focus:outline-none"
                >
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCoachProfileSubmit} className="p-6 space-y-5 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#1e1e24] pb-4">
                  {coachProfileImagePreview ? (
                    <img
                      src={coachProfileImagePreview}
                      alt="Coach Profile Image Preview"
                      className="w-16 h-16 rounded-full object-cover border border-yellow-500/40"
                    />
                  ) : coachProfileImageUrl ? (
                    <img src={coachProfileImageUrl} alt="Current Coach Profile Image" className="w-16 h-16 rounded-full object-cover border border-yellow-500/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 text-yellow-500 flex items-center justify-center text-lg font-bold font-mono">
                      {getInitials()}
                    </div>
                  )}
                  <div className="text-center sm:text-left flex-1 space-y-1">
                    <label
                      htmlFor="coach-profile-image-upload"
                      className="inline-block px-4 py-1.5 bg-[#1e1e24] hover:bg-[#2e2e38] text-white text-xs font-semibold rounded cursor-pointer transition-colors border border-[#333]"
                    >
                      Change Profile Image
                    </label>
                    <input id="coach-profile-image-upload" type="file" accept="image/*" onChange={handleCoachProfileImageChange} className="hidden" />
                    <p className="text-[10px] text-gray-500">PNG, JPG, or WEBP. Max 5MB.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell athletes about yourself..."
                      rows={3}
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-gray-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Specialization (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Muscle Building, Strength Training"
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Experience (years)</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="5"
                      min="0"
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Hire Cost (coins)</label>
                    <input
                      type="number"
                      value={hireCost}
                      onChange={(e) => setHireCost(e.target.value)}
                      placeholder="500"
                      min="0"
                      className="w-full bg-[#121216] border border-[#1e1e24] focus:border-yellow-500 text-sm text-white rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-gray-600"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="coach-availability"
                      checked={availability}
                      onChange={(e) => setAvailability(e.target.checked)}
                      className="w-4 h-4 rounded border-[#1e1e24] bg-[#121216] text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
                    />
                    <label htmlFor="coach-availability" className="text-xs text-gray-400 font-medium">
                      Available for hire
                    </label>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-lg font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded-lg font-medium">
                    ✅ {successMsg}
                  </div>
                )}

                <div className="flex gap-3 pt-3 border-t border-[#1e1e24]">
                  <button
                    type="button"
                    onClick={() => setIsCoachProfileModalOpen(false)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-[#1e1e24] hover:border-gray-700 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-yellow-500/10"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

