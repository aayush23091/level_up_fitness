"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import Checkbox from "../components/Checkbox";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "@/components/Logo";

import {
  PersonIcon,
  MailIcon,
  LockIcon,
  ArrowForwardIcon,
} from "../components/Icons";

import {
  registerSchema,
  RegisterFormData,
} from "@/lib/validations";

import { authAPI } from "@/lib/api";
import { getDashboardPath } from "@/lib/auth";
import { useAuth } from "../context/AuthContext";

const SIGNUP_ROLES = ["user", "coach"] as const;
type SignupRole = (typeof SIGNUP_ROLES)[number];

function resolveSignupRole(role: string | null): SignupRole {
  if (role === "coach") {
    return "coach";
  }
  return "user";
}

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRole = resolveSignupRole(searchParams.get("role"));
  const { refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!termsAccepted) {
      setApiError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setApiError("");
    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = data;

      const response = await authAPI.register({
        ...registerData,
        role: selectedRole,
      });

      if (response.success) {
        const loggedInUser = await refreshUser();
        const role = loggedInUser?.role ?? response.data.user?.role;
        router.replace(getDashboardPath(role));
      } else {
        setApiError(response.message);
      }
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-4">
        <Logo size="large" />

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href={selectedRole === "coach" ? "/login?role=coach" : "/login"}
            className="text-foreground mr-6 hover:underline"
          >
            Login
          </a>

          <a
            href="/signup"
            className="bg-accent text-gray-900 px-4 py-1 rounded font-semibold"
          >
            Join Now
          </a>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-center justify-center">
        <AuthCard
          title="Elevate Your Game"
          subtitle="Join the community of elite athletes and data-driven coaches today."
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {apiError && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-md text-sm">
                {apiError}
              </div>
            )}

            <InputField
              label="Full Name"
              placeholder="John Doe"
              icon={<PersonIcon />}
              {...register("name")}
              error={errors.name?.message}
            />

            <InputField
              label="Username"
              placeholder="john123"
              icon={<PersonIcon />}
              {...register("username")}
              error={errors.username?.message}
            />

            <InputField
              label="Email Address"
              type="email"
              placeholder="john@email.com"
              icon={<MailIcon />}
              {...register("email")}
              error={errors.email?.message}
            />

            <InputField
              label="Phone Number"
              placeholder="98XXXXXXXX"
              {...register("phoneNumber")}
              error={errors.phoneNumber?.message}
            />

            <div>
              <label className="block text-sm text-foreground mb-2">
                Gender
              </label>

              <select
                {...register("gender")}
                className="w-full rounded-md bg-card-secondary border border-border p-3 text-foreground"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<LockIcon />}
              {...register("password")}
              error={errors.password?.message}
            />

            <InputField
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={<LockIcon />}
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <Checkbox
              name="terms"
              checked={termsAccepted}
              onChange={(e) =>
                setTermsAccepted(e.target.checked)
              }
              label={
                <span>
                  I agree to the{" "}
                  <a
                    href="#"
                    className="underline text-accent"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="underline text-accent"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              }
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-accent hover:bg-accent/90 text-gray-900 font-semibold py-3 rounded-md transition flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}

              <span className="ml-2">
                <ArrowForwardIcon />
              </span>
            </button>
          </form>

          <div className="text-center mt-6 text-muted text-sm">
            Already have an account?{" "}
            <a
              href={selectedRole === "coach" ? "/login?role=coach" : "/login"}
              className="text-accent hover:underline"
            >
              Login to LevelUp
            </a>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageContent />
    </Suspense>
  );
}