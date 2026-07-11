"use client";

import React from "react";
import Link from "next/link";
import LandingNavbar from "./components/LandingNavbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <main className="pt-20">
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  <span className="text-accent text-sm font-semibold tracking-wide">
                    Elite Performance Training
                  </span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-black text-foreground leading-tight">
                  Level up your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/80 drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                    fitness
                  </span>{" "}
                  journey
                </h1>

                <p className="text-xl text-muted max-w-lg leading-relaxed">
                  Transform your body with AI-powered workouts, gamified progress tracking, and a community of elite athletes pushing limits together.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/role"
                    className="px-8 py-4 bg-accent hover:bg-accent/90 text-gray-900 font-bold rounded-full transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 text-center"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/coaches"
                    className="px-8 py-4 border border-accent/30 text-accent font-semibold rounded-full hover:bg-accent/10 transition-all text-center"
                  >
                    Find Coach
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-3xl"></div>
                  
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted text-sm">Current Phase</p>
                        <p className="text-foreground font-bold text-lg">Strength Building</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                        <span className="text-accent text-2xl">💪</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted">Strength</span>
                          <span className="text-accent font-semibold">78%</span>
                        </div>
                        <div className="h-2 bg-card-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted">Progress</span>
                          <span className="text-accent font-semibold">65%</span>
                        </div>
                        <div className="h-2 bg-card-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="bg-card-secondary rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">12</p>
                        <p className="text-xs text-muted">Level</p>
                      </div>
                      <div className="bg-card-secondary rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">5</p>
                        <p className="text-xs text-muted">Streak</p>
                      </div>
                      <div className="bg-card-secondary rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">2.4k</p>
                        <p className="text-xs text-muted">XP</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>

        <section id="workouts" className="py-24 lg:py-32 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4">
                Master the Gamified Grid
              </h2>
              <p className="text-xl text-muted max-w-2xl mx-auto">
                Track every rep, earn XP, and unlock achievements as you progress through your fitness journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-card-secondary/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-accent/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="text-muted text-sm mb-2">XP Progression</p>
                <p className="text-4xl font-black text-accent">2,450</p>
                <p className="text-muted text-xs mt-2">Total XP earned</p>
              </div>

              <div className="bg-card-secondary/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-accent/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-muted text-sm mb-2">Current Level</p>
                <p className="text-4xl font-black text-accent">12</p>
                <p className="text-muted text-xs mt-2">Elite Athlete</p>
              </div>

              <div className="bg-card-secondary/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-accent/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🔥</span>
                </div>
                <p className="text-muted text-sm mb-2">Daily Streak</p>
                <p className="text-4xl font-black text-accent">5</p>
                <p className="text-muted text-xs mt-2">Days active</p>
              </div>

              <div className="bg-card-secondary/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:border-accent/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🏆</span>
                </div>
                <p className="text-muted text-sm mb-2">Rewards</p>
                <p className="text-4xl font-black text-accent">8</p>
                <p className="text-muted text-xs mt-2">Achievements</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-5xl font-black text-foreground leading-tight">
                  Your entire training arsenal, reimagined.
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">📊</span>
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold text-lg mb-1">Real-time Analytics</h3>
                      <p className="text-muted">Track your progress with detailed metrics and insights.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">🤖</span>
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold text-lg mb-1">AI Workout Coach</h3>
                      <p className="text-muted">Personalized recommendations powered by machine learning.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">👥</span>
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold text-lg mb-1">Smart Community Challenges</h3>
                      <p className="text-muted">Compete with friends and join global fitness challenges.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent">📋</span>
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold text-lg mb-1">Personalized Plans</h3>
                      <p className="text-muted">Custom workout plans tailored to your goals.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative bg-gradient-to-br from-card to-background border border-border/50 rounded-3xl p-6 shadow-2xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-accent/80 rounded-t-3xl"></div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted text-sm">Today's Progress</span>
                      <span className="text-accent font-semibold">77%</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-card-secondary/50 rounded-xl p-4">
                        <p className="text-muted text-xs mb-1">Calories</p>
                        <p className="text-foreground font-bold text-2xl">620</p>
                        <p className="text-muted text-xs">kcal burned</p>
                      </div>
                      <div className="bg-card-secondary/50 rounded-xl p-4">
                        <p className="text-muted text-xs mb-1">Time</p>
                        <p className="text-foreground font-bold text-2xl">45</p>
                        <p className="text-muted text-xs">minutes</p>
                      </div>
                    </div>

                    <div className="bg-card-secondary/50 rounded-xl p-4">
                      <p className="text-muted text-xs mb-2">Weekly Activity</p>
                      <div className="flex justify-between gap-2">
                        {[80, 65, 0, 95, 40, 0, 0].map((value, idx) => (
                          <div key={idx} className="flex-1">
                            <div className="h-20 bg-card-secondary/50 rounded-lg relative overflow-hidden">
                              <div
                                className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all ${
                                  value > 0 ? "bg-gradient-to-t from-accent/80 to-accent" : "bg-transparent"
                                }`}
                                style={{ height: `${value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted">
                        <span>M</span>
                        <span>T</span>
                        <span>W</span>
                        <span>T</span>
                        <span>F</span>
                        <span>S</span>
                        <span>S</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-card">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl lg:text-6xl font-black text-accent mb-2">500K+</p>
                <p className="text-muted">Active Users</p>
              </div>
              <div>
                <p className="text-5xl lg:text-6xl font-black text-accent mb-2">12M+</p>
                <p className="text-muted">Workouts Completed</p>
              </div>
              <div>
                <p className="text-5xl lg:text-6xl font-black text-accent mb-2">98%</p>
                <p className="text-muted">Success Rate</p>
              </div>
              <div>
                <p className="text-5xl lg:text-6xl font-black text-accent mb-2">4.9/5</p>
                <p className="text-muted">User Rating</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-16 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                    <span className="text-gray-900 font-bold">L</span>
                  </div>
                  <span className="text-foreground font-bold">LevelUp Fitness</span>
                </div>
                <p className="text-muted text-sm">
                  Your personal fitness journey platform.
                </p>
              </div>

              <div>
                <h4 className="text-foreground font-semibold mb-4">Navigation</h4>
                <ul className="space-y-2 text-sm text-muted">
                  <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
                  <li><Link href="/login" className="hover:text-accent transition-colors">Login</Link></li>
                  <li><Link href="/role" className="hover:text-accent transition-colors">Sign Up</Link></li>
                  <li><Link href="/coaches" className="hover:text-accent transition-colors">Find Coach</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted text-sm">
                © 2026 LevelUp Fitness. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
