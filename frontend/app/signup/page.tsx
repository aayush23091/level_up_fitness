"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import Checkbox from "../components/Checkbox";

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

export default function SignupPage() {
  const router = useRouter();
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

      const response = await authAPI.register(registerData);

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
    <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-8 py-4">
        <span className="text-lg font-bold text-yellow-400">
          LevelUp Fitness
        </span>

        <div>
          <a
            href="/login"
            className="text-gray-300 mr-6 hover:underline"
          >
            Login
          </a>

          <a
            href="/signup"
            className="bg-yellow-400 text-black px-4 py-1 rounded font-semibold"
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
              <label className="block text-sm text-gray-300 mb-2">
                Gender
              </label>

              <select
                {...register("gender")}
                className="w-full rounded-md bg-[#232323] border border-gray-700 p-3 text-white"
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
                    className="underline text-yellow-400"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="underline text-yellow-400"
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
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 rounded-md transition flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}

              <span className="ml-2">
                <ArrowForwardIcon />
              </span>
            </button>
          </form>

          <div className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-yellow-400 hover:underline"
            >
              Login to LevelUp
            </a>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}