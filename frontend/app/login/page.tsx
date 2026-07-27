"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import ThemeToggle from "../components/ThemeToggle";
import Logo from "@/components/Logo";
import { MailIcon, LockIcon } from "../components/Icons";

import { loginSchema, type LoginFormData } from "@/lib/validations";
import { authAPI } from "@/lib/api";
import { getDashboardPath } from "@/lib/auth";
import { useAuth } from "../context/AuthContext";

function getSignupHref(role: string | null): string {
  if (role === "coach" || role === "user") {
    return `/signup?role=${role}`;
  }
  return "/signup";
}

const LoginPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get("role");
  const { refreshUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError("");

    try {
      const response = await authAPI.login(data);

      if (response.success) {
        const loggedInUser = await refreshUser();
        const role = loggedInUser?.role ?? response.data.user?.role;
        router.replace(getDashboardPath(role));
      } else {
        setApiError(response.message || "Login failed");
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
          title="Welcome Back"
          subtitle="Access your pro-coach dashboard and performance metrics."
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <div className="mb-4 rounded-md border border-red-500 bg-red-500/20 px-4 py-2 text-sm text-red-400">
                {apiError}
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

            <div className="relative">
              <InputField
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<LockIcon />}
                {...register("password")}
                error={errors.password?.message}
              />

              <a
                href="/forgot-password"
                className="absolute right-2 top-8 text-xs text-accent hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-md bg-accent py-2 font-semibold text-gray-900 transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-muted">
            Don't have an account?{" "}
            <a
              href={getSignupHref(selectedRole)}
              className="text-accent hover:underline"
            >
              Start Training
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

const LoginPage = () => {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;