"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "@/components/Logo";
import { LockIcon } from "../components/Icons";

import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations";
import { authAPI } from "@/lib/api";

const ResetPasswordPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setApiError("");
    setSuccess("");

    try {
      const response = await authAPI.resetPassword(token, data);

      if (response.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setApiError(response.message || "Failed to reset password");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="w-full flex justify-between items-center px-8 py-8">
          <Logo size="auth" />
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center">
          <AuthCard
            title="Invalid Reset Link"
            subtitle="The password reset link is invalid or has expired."
          >
            <div className="text-center">
              <p className="text-red-400 mb-4">No reset token provided.</p>
              <a
                href="/forgot-password"
                className="text-accent hover:underline"
              >
                Request a new reset link
              </a>
            </div>
          </AuthCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full flex justify-between items-center px-8 py-8">
        <Logo size="auth" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center">
        <AuthCard
          title="Reset Password"
          subtitle="Enter your new password below."
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <div className="mb-4 rounded-md border border-red-500 bg-red-500/20 px-4 py-2 text-sm text-red-400">
                {apiError}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-md border border-green-500 bg-green-500/20 px-4 py-2 text-sm text-green-400">
                {success}
              </div>
            )}

            <InputField
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={<LockIcon />}
              {...register("password")}
              error={errors.password?.message}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-md bg-accent py-2 font-semibold text-gray-900 transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted">
            <a
              href="/login"
              className="text-accent hover:underline"
            >
              Back to Login
            </a>
          </div>
        </AuthCard>
      </main>

      <footer className="flex w-full justify-center gap-8 py-4 text-xs text-muted">
        <a href="/privacy-policy">PRIVACY POLICY</a>
        <a href="/terms">TERMS OF SERVICE</a>
        <a href="/cookies">COOKIE POLICY</a>
      </footer>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
