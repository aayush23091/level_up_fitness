"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { coachAPI, Coach } from "@/lib/api";
import { withProtectedRoute } from "@/lib/protectedRoute";
import { useAuth } from "@/app/context/AuthContext";
import { getProfileImageUrl } from "@/lib/getProfileImageUrl";

function CoachProfilePageContent() {
  const router = useRouter();
  const params = useParams();
  const { user, refreshUser } = useAuth();
  const coachId = params.id as string;

  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hire state
  const [hiring, setHiring] = useState(false);
  const [hireSuccess, setHireSuccess] = useState(false);
  const [remainingCoins, setRemainingCoins] = useState<number | null>(null);

  const fetchCoach = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await coachAPI.getCoach(coachId);
      if (response.success) {
        setCoach(response.data);
      } else {
        setError(response.message || "Failed to retrieve coach profile.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading coach profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoach();
  }, [coachId]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarUrl = (profilePhoto?: string) => {
    return getProfileImageUrl(profilePhoto);
  };

  const handleHireCoach = async () => {
    setHiring(true);
    setRemainingCoins(null);
    try {
      const response = await coachAPI.hireCoach(coachId);
      if (response.success) {
        setHireSuccess(true);
        setRemainingCoins(response.data.user.coins || 0);
        // Refresh user state to update coins
        await refreshUser();
        // Refresh coach data to update isHired status
        await fetchCoach();
      } else {
        const message = response.message || "Failed to hire coach.";
        if (message.toLowerCase().includes("insufficient")) {
          alert("Insufficient coins");
        } else if (message.toLowerCase().includes("already hired")) {
          alert("Already hired this coach");
        } else {
          alert(message);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while hiring coach.";
      if (errorMessage.toLowerCase().includes("unauthorized") || err.response?.status === 401) {
        router.push("/login");
      } else if (errorMessage.toLowerCase().includes("insufficient")) {
        alert("Insufficient coins");
      } else if (errorMessage.toLowerCase().includes("already hired")) {
        alert("Already hired this coach");
      } else {
        alert(errorMessage);
      }
    } finally {
      setHiring(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-card to-card-secondary border-b border-border px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-card-secondary border border-border hover:border-accent/40 text-muted hover:text-foreground rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl lg:text-3xl font-black text-foreground">
            COACH <span className="text-accent">PROFILE</span>
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {loading ? (
          // Loading Skeleton
          <div className="bg-card border border-border p-8 rounded-2xl space-y-6 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-card-secondary/60 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-card-secondary/60 rounded w-1/2"></div>
                <div className="h-4 bg-card-secondary/60 rounded w-1/3"></div>
                <div className="h-4 bg-card-secondary/60 rounded w-1/4"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-card-secondary/60 rounded w-full"></div>
              <div className="h-4 bg-card-secondary/60 rounded w-full"></div>
              <div className="h-4 bg-card-secondary/60 rounded w-3/4"></div>
            </div>
          </div>
        ) : error ? (
          // Error State
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-6 text-center">
            <p>{error}</p>
            <button
              onClick={fetchCoach}
              className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
            >
              Retry
            </button>
          </div>
        ) : coach ? (
          // Coach Profile
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-card border border-border p-8 rounded-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {(() => {
                  const coachProfileImage = getAvatarUrl(coach.coachProfile?.profileImage);
                  const avatarUrl = coachProfileImage || getAvatarUrl(coach.profilePhoto);
                  return avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={coach.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-accent/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/40 border-2 border-accent/30 text-accent flex items-center justify-center text-2xl font-bold font-mono">
                      {getInitials(coach.name)}
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl lg:text-3xl font-black text-foreground">{coach.name}</h2>
                    {coach.isHired && (
                      <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-black uppercase px-3 py-1 rounded-full">
                        HIRED
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-sm mt-1">@{coach.username}</p>
                  {typeof coach.coachProfile?.rating === "number" && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-accent text-lg">⭐</span>
                      <span className="text-lg font-bold text-foreground">{coach.coachProfile.rating.toFixed(1)}</span>
                      <span className="text-muted text-xs">Rating</span>
                    </div>
                  )}
                </div>
                {!coach.isHired && (
                  <button
                    onClick={handleHireCoach}
                    disabled={hiring || hireSuccess}
                    className="px-6 py-3 bg-accent hover:bg-accent/90 text-gray-900 text-sm font-bold rounded-xl uppercase tracking-wider transition-colors shadow-lg shadow-accent/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hiring ? 'Hiring...' : hireSuccess ? 'Hired ✓' : 'Hire Coach'}
                  </button>
                )}
              </div>
            </div>

            {/* About Section */}
            {coach.coachProfile?.bio && (
              <div className="bg-card border border-border p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-foreground mb-4">About</h3>
                <p className="text-muted text-sm leading-relaxed">{coach.coachProfile.bio}</p>
              </div>
            )}

            {/* Specializations */}
            {coach.coachProfile?.specialization && coach.coachProfile.specialization.length > 0 && (
              <div className="bg-card border border-border p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-foreground mb-4">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {coach.coachProfile.specialization.map((spec, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-accent font-semibold uppercase tracking-wider bg-accent/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience & Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-foreground mb-4">Experience</h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💼</span>
                  <div>
                    <p className="text-3xl font-black text-foreground">{Number(coach.coachProfile?.experience) || 0}</p>
                    <p className="text-muted text-xs uppercase tracking-wider">Years</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border p-8 rounded-2xl">
                <h3 className="text-lg font-bold text-foreground mb-4">Hiring Cost</h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🪙</span>
                  <div>
                    <p className="text-3xl font-black text-accent">{Number(coach.coachProfile?.hireCost) || 0}</p>
                    <p className="text-muted text-xs uppercase tracking-wider">Coins</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Success Notification */}
      {hireSuccess && remainingCoins !== null && (
        <div className="fixed bottom-6 right-6 bg-card border border-border rounded-xl p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="text-foreground font-bold text-sm">Coach hired successfully</p>
              <p className="text-muted text-xs">Remaining coins: {remainingCoins}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withProtectedRoute(CoachProfilePageContent, ["user"]);
