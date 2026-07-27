"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import CoachLayout from "@/components/coach/CoachLayout";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "@/lib/api";
import { getProfileImageUrl } from "@/lib/getProfileImageUrl";
import { cmToInches, kgToLbs, inchesToCm, lbsToKg } from "@/lib/measurements";

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
  // Measurement form state
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [arms, setArms] = useState("");
  const [shoulders, setShoulders] = useState("");
  const [legs, setLegs] = useState("");
  const [calves, setCalves] = useState("");

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
      // Initialize measurements
      setHeight(user.height?.toString() || "");
      setWeight(user.weight?.toString() || "");
      setChest(user.chest?.toString() || "");
      setWaist(user.waist?.toString() || "");
      setArms(user.arms?.toString() || "");
      setShoulders(user.shoulders?.toString() || "");
      setLegs(user.legs?.toString() || "");
      setCalves(user.calves?.toString() || "");
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
      // State is already in metric (cm/kg) — inputs convert on change, just pass through
      if (height) formData.append("height", height);
      if (weight) formData.append("weight", weight);
      if (chest) formData.append("chest", chest);
      if (waist) formData.append("waist", waist);
      if (arms) formData.append("arms", arms);
      if (shoulders) formData.append("shoulders", shoulders);
      if (legs) formData.append("legs", legs);
      if (calves) formData.append("calves", calves);
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

  const PageShell = isCoach ? CoachLayout : DashboardLayout;

  return (
    <PageShell>
      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        <section className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground uppercase tracking-wider">
              MY <span className="text-accent">PROFILE</span>
            </h1>
            <p className="text-muted text-xs mt-1">
              {isCoach
                ? "Manage your coach profile and professional details."
                : "Manage your account information, tracking, and fitness statistics."}
            </p>
          </div>
        </section>

        {/*
          Layout:
          - Coach: 2 columns
          - User: 2 columns (profile + measurements)
        */}
        {isCoach ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Edit Profile card */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative">
                {/* Avatar image container */}
                <div className="relative group mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || "Profile Photo"}
                      className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover border-2 border-accent/20"
                    />
                  ) : (
                    <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 text-accent border border-accent/20 flex items-center justify-center text-3xl font-black font-mono">
                      {getInitials()}
                    </div>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></span>
                </div>

                <h2 className="text-xl font-bold text-foreground tracking-wide">{user?.name}</h2>
                <p className="text-xs text-accent font-mono mt-0.5">@{user?.username}</p>
                <span className="mt-3 px-3 py-1 bg-accent/10 text-accent text-[10px] uppercase font-bold tracking-widest rounded-full">
                  {user?.role || "MEMBER"}
                </span>

                {/* Info fields */}
                <div className="w-full mt-6 space-y-3.5 border-t border-border pt-6 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Email Address</span>
                    <span className="text-foreground font-medium truncate max-w-[180px]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Phone Number</span>
                    <span className="text-foreground font-medium">{user?.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Gender</span>
                    <span className="text-foreground font-medium capitalize">{user?.gender || "N/A"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-6 py-2.5 bg-accent hover:bg-accent/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-accent/5"
                >
                  Edit Profile
                </button>

                {isCoach && (
                  <button
                    onClick={() => router.push(`/coaches/${user?.id || user?._id}`)}
                    className="w-full mt-3 py-2.5 bg-card-secondary hover:bg-card-secondary text-accent border border-accent/20 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    View Marketplace Profile
                  </button>
                )}
              </div>
            </div>

            {/* Coach Marketplace card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  COACH MARKETPLACE PROFILE
                </h3>
                <button
                  onClick={() => setIsCoachProfileModalOpen(true)}
                  className="text-xs text-accent hover:text-accent font-semibold uppercase tracking-wider transition-colors"
                >
                  Edit Coach Profile
                </button>
              </div>

              {/* Bio */}
              {user.coachProfile?.bio && (
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wider mb-1">Bio</p>
                  <p className="text-sm text-foreground leading-relaxed">{user.coachProfile.bio}</p>
                </div>
              )}

              {/* Specialization */}
              {user.coachProfile?.specialization && user.coachProfile.specialization.length > 0 && (
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wider mb-2">Specialization</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.coachProfile.specialization.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-accent font-semibold uppercase tracking-wider bg-accent/10 px-2 py-0.5 rounded"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coach Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wider">Experience</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{user.coachProfile?.experience || 0} Years</p>
                </div>
                <div>
                  <p className="text-xs text-muted font-medium uppercase tracking-wider">Hire Cost</p>
                  <p className="text-sm font-bold text-accent mt-0.5">{user.coachProfile?.hireCost || 0} Coins</p>
                </div>
                {user.coachProfile?.category && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Category</p>
                    <p className="text-sm font-bold text-foreground mt-0.5 capitalize">{user.coachProfile.category}</p>
                  </div>
                )}
                {user.coachProfile?.rating !== undefined && user.coachProfile?.rating !== null && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Rating</p>
                    <p className="text-sm font-bold text-accent mt-0.5">
                      {"★".repeat(Math.round(user.coachProfile.rating))} {user.coachProfile.rating}/5
                    </p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-xs text-muted font-medium uppercase tracking-wider">Availability</p>
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
                className="w-full mt-4 py-2.5 bg-card-secondary hover:bg-card-secondary text-accent border border-accent/20 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
              >
                View Marketplace Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left column: User details card */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-lg relative">
                {/* Avatar image container */}
                <div className="relative group mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.name || "Profile Photo"}
                      className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover border-2 border-accent/20"
                    />
                  ) : (
                    <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 text-accent border border-accent/20 flex items-center justify-center text-3xl font-black font-mono">
                      {getInitials()}
                    </div>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></span>
                </div>

                <h2 className="text-xl font-bold text-foreground tracking-wide">{user?.name}</h2>
                <p className="text-xs text-accent font-mono mt-0.5">@{user?.username}</p>
                <span className="mt-3 px-3 py-1 bg-accent/10 text-accent text-[10px] uppercase font-bold tracking-widest rounded-full">
                  {user?.role || "MEMBER"}
                </span>

                {/* Info fields */}
                <div className="w-full mt-6 space-y-3.5 border-t border-border pt-6 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Email Address</span>
                    <span className="text-foreground font-medium truncate max-w-[180px]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Phone Number</span>
                    <span className="text-foreground font-medium">{user?.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted">Gender</span>
                    <span className="text-foreground font-medium capitalize">{user?.gender || "N/A"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-6 py-2.5 bg-accent hover:bg-accent/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-accent/5"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Right column: My Measurements */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">
                  MY MEASUREMENTS
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Height (in)</p>
                    <p className="text-lg font-bold text-foreground">{user?.height ? `${cmToInches(user.height)} in` : "Not added"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Weight (lbs)</p>
                    <p className="text-lg font-bold text-foreground">{user?.weight ? `${kgToLbs(user.weight)} lbs` : "Not added"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Chest (in)</p>
                    <p className="text-lg font-bold text-foreground">{user?.chest ? `${cmToInches(user.chest)} in` : "Not added"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Waist (in)</p>
                    <p className="text-lg font-bold text-foreground">{user?.waist ? `${cmToInches(user.waist)} in` : "Not added"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Arms (in)</p>
                    <p className="text-lg font-bold text-foreground">{user?.arms ? `${cmToInches(user.arms)} in` : "Not added"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Shoulders (in)</p>
                    <p className="text-lg font-bold text-foreground">{user?.shoulders ? `${cmToInches(user.shoulders)} in` : "Not added"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Legs (in)</p>
                    <p className="text-lg font-bold text-foreground">{user?.legs ? `${cmToInches(user.legs)} in` : "Not added"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted font-medium uppercase tracking-wider">Calves (in)</p>
                    <p className="text-lg font-bold text-foreground">{user?.calves ? `${cmToInches(user.calves)} in` : "Not added"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300">
              <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card-secondary">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
                  EDIT <span className="text-accent">PROFILE DETAILS</span>
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded text-muted hover:text-foreground transition-colors focus:outline-none"
                >
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-4">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Avatar Preview"
                      className="w-16 h-16 rounded-full object-cover border border-accent/40"
                    />
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="Current Avatar" className="w-16 h-16 rounded-full object-cover border border-accent/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 text-accent flex items-center justify-center text-lg font-bold font-mono">
                      {getInitials()}
                    </div>
                  )}
                  <div className="text-center sm:text-left flex-1 space-y-1">
                    <label
                      htmlFor="photo-upload"
                      className="inline-block px-4 py-1.5 bg-card-secondary hover:bg-card-secondary text-foreground text-xs font-semibold rounded cursor-pointer transition-colors border border-border"
                    >
                      Change Photo
                    </label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    <p className="text-[10px] text-muted">PNG, JPG, or WEBP. Max 5MB.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Username</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Phone number"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Gender</label>
                    <select
                      value={gender}
                      required
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Body Measurements (in)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Height (in)</label>
                        <input
                          type="number"
                          value={height ? cmToInches(height) : ""}
                          onChange={(e) => setHeight(inchesToCm(e.target.value).toString())}
                          placeholder="68"
                          className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Weight (lbs)</label>
                        <input
                          type="number"
                          value={weight ? kgToLbs(weight) : ""}
                          onChange={(e) => setWeight(lbsToKg(e.target.value).toString())}
                          placeholder="165"
                          className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Chest (in)</label>
                        <input
                          type="number"
                          value={chest ? cmToInches(chest) : ""}
                          onChange={(e) => setChest(inchesToCm(e.target.value).toString())}
                          placeholder="43"
                          className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Waist (in)</label>
                        <input
                          type="number"
                          value={waist ? cmToInches(waist) : ""}
                          onChange={(e) => setWaist(inchesToCm(e.target.value).toString())}
                          placeholder="32"
                          className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Arms (in)</label>
                        <input
                          type="number"
                          value={arms ? cmToInches(arms) : ""}
                          onChange={(e) => setArms(inchesToCm(e.target.value).toString())}
                          placeholder="16"
                          className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Shoulders (in)</label>
                        <input
                          type="number"
                          value={shoulders ? cmToInches(shoulders) : ""}
                          onChange={(e) => setShoulders(inchesToCm(e.target.value).toString())}
                          placeholder="50"
                          className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Legs (in)</label>
                        <input
                          type="number"
                          value={legs ? cmToInches(legs) : ""}
                          onChange={(e) => setLegs(inchesToCm(e.target.value).toString())}
                          placeholder="25"
                          className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Calves (in)</label>
                        <input
                          type="number"
                          value={calves ? cmToInches(calves) : ""}
                          onChange={(e) => setCalves(inchesToCm(e.target.value).toString())}
                          placeholder="15"
                          className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                        />
                      </div>
                    </div>
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

                <div className="flex gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-2.5 bg-card-secondary hover:bg-card text-foreground border border-border hover:border-muted text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-accent/10"
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
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all duration-300">
              <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card-secondary">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">
                  EDIT <span className="text-accent">COACH PROFILE</span>
                </h3>
                <button
                  onClick={() => setIsCoachProfileModalOpen(false)}
                  className="p-1 rounded text-muted hover:text-foreground transition-colors focus:outline-none"
                >
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCoachProfileSubmit} className="p-6 space-y-5 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-4">
                  {coachProfileImagePreview ? (
                    <img
                      src={coachProfileImagePreview}
                      alt="Coach Profile Image Preview"
                      className="w-16 h-16 rounded-full object-cover border border-accent/40"
                    />
                  ) : coachProfileImageUrl ? (
                    <img src={coachProfileImageUrl} alt="Current Coach Profile Image" className="w-16 h-16 rounded-full object-cover border border-accent/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-accent/40 text-accent flex items-center justify-center text-lg font-bold font-mono">
                      {getInitials()}
                    </div>
                  )}
                  <div className="text-center sm:text-left flex-1 space-y-1">
                    <label
                      htmlFor="coach-profile-image-upload"
                      className="inline-block px-4 py-1.5 bg-card-secondary hover:bg-card-secondary text-foreground text-xs font-semibold rounded cursor-pointer transition-colors border border-border"
                    >
                      Change Profile Image
                    </label>
                    <input id="coach-profile-image-upload" type="file" accept="image/*" onChange={handleCoachProfileImageChange} className="hidden" />
                    <p className="text-[10px] text-muted">PNG, JPG, or WEBP. Max 5MB.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell athletes about yourself..."
                      rows={3}
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                      Specialization (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Muscle Building, Strength Training"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Experience (years)</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="5"
                      min="0"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Hire Cost (coins)</label>
                    <input
                      type="number"
                      value={hireCost}
                      onChange={(e) => setHireCost(e.target.value)}
                      placeholder="500"
                      min="0"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-4 py-2 focus:outline-none transition-all placeholder:text-muted"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="coach-availability"
                      checked={availability}
                      onChange={(e) => setAvailability(e.target.checked)}
                      className="w-4 h-4 rounded border-border bg-card-secondary text-accent focus:ring-accent focus:ring-offset-0"
                    />
                    <label htmlFor="coach-availability" className="text-xs text-muted font-medium">
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

                <div className="flex gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCoachProfileModalOpen(false)}
                    className="flex-1 py-2.5 bg-card-secondary hover:bg-card text-foreground border border-border hover:border-muted text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-accent/10"
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

