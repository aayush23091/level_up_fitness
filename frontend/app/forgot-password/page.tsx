"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "@/components/Logo";
import { MailIcon } from "../components/Icons";

import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations";
import { authAPI } from "@/lib/api";

const ForgotPasswordPageContent = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setApiError("");
    setSuccess("");

    try {
      const response = await authAPI.forgotPassword(data);

      if (response.success) {
        setSuccess("If an account exists with this email, a password reset link has been sent.");
      } else {
        setApiError(response.message || "Failed to send reset email");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full flex justify-between items-center px-8 py-8">
        <Logo size="auth" />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center">
        <AuthCard
          title="Forgot Password"
          subtitle="Enter your email to receive a password reset link."
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
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              icon={<MailIcon />}
              {...register("email")}
              error={errors.email?.message}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-md bg-accent py-2 font-semibold text-gray-900 transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
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

const ForgotPasswordPage = () => {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
};

export default ForgotPasswordPage;
