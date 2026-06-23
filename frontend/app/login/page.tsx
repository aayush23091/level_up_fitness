"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AuthCard from "../components/AuthCard";
import InputField from "../components/InputField";
import SocialButton from "../components/SocialButton";
import { MailIcon, LockIcon } from "../components/Icons";

import { loginSchema, type LoginFormData } from "@/lib/validations";
import { authAPI } from "@/lib/api";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const router = useRouter();
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
    console.log("========== LOGIN START ==========");
    console.log("Form Data:", data);

    setIsLoading(true);
    setApiError("");

    try {
      console.log("Calling authAPI.login()...");

      const response = await authAPI.login(data);

      console.log("Login Response:");
      console.log(response);

      if (response.success) {
        console.log("Login successful!");

        console.log("Refreshing user...");
        await refreshUser();

        console.log("Redirecting...");
        router.push("/app-dashboard");
      } else {
        console.log("Backend returned success = false");
        console.log(response.message);

        setApiError(response.message || "Login failed");
      }
    } catch (error) {
      console.error("========== LOGIN ERROR ==========");
      console.error(error);

      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      console.log("Error Message:", errorMessage);

      setApiError(errorMessage);
    } finally {
      console.log("Finished.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex flex-col">
      <header className="w-full flex justify-center items-center py-8">
        <span className="text-2xl font-bold text-yellow-400">
          LevelUp Fitness
        </span>
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
                href="#"
                className="absolute right-2 top-8 text-xs text-yellow-400 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-md bg-yellow-400 py-2 font-semibold text-black transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="my-4 flex items-center">
            <div className="h-px flex-grow bg-[#232323]" />
            <span className="mx-2 text-xs text-gray-400">
              OR CONTINUE WITH
            </span>
            <div className="h-px flex-grow bg-[#232323]" />
          </div>

          <div className="flex flex-col gap-2">
            <SocialButton provider="Google" />
            <SocialButton provider="Apple" />
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-yellow-400 hover:underline"
            >
              Start Training
            </a>
          </div>
        </AuthCard>
      </main>

      <footer className="flex w-full justify-center gap-8 py-4 text-xs text-gray-500">
        <a href="#">PRIVACY POLICY</a>
        <a href="#">TERMS OF SERVICE</a>
        <a href="#">COOKIE POLICY</a>
      </footer>
    </div>
  );
};

export default LoginPage;