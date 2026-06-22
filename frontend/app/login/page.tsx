"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import SocialButton from '../components/SocialButton';
import { MailIcon, LockIcon } from '../components/Icons';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { authAPI } from '@/lib/api';
import { useAuth } from '../context/AuthContext';

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
    setIsLoading(true);
    setApiError("");

    try {
      const response = await authAPI.login(data);

      if (response.success) {
        await refreshUser();
        router.push("/app-dashboard");
      } else {
        setApiError(response.message || "Login failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex flex-col">
      <header className="w-full flex justify-center items-center py-8">
        <span className="text-2xl font-bold text-yellow-400">LevelUp Fitness</span>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <AuthCard
          title="Welcome Back"
          subtitle="Access your pro-coach dashboard and performance metrics."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            {apiError && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-md text-sm mb-4">
                {apiError}
              </div>
            )}
            <InputField
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
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
              <a href="#" className="absolute right-2 top-8 text-xs text-yellow-400 hover:underline">Forgot Password?</a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md mt-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-[#232323]" />
            <span className="mx-2 text-xs text-gray-400">OR CONTINUE WITH</span>
            <div className="flex-grow h-px bg-[#232323]" />
          </div>
          <div className="flex flex-col gap-2">
            <SocialButton provider="Google" />
            <SocialButton provider="Apple" />
          </div>
          <div className="text-center mt-4 text-gray-400 text-sm">
            Don't have an account?{' '}
            <a href="/signup" className="text-yellow-400 hover:underline">Start Training</a>
          </div>
        </AuthCard>
      </main>
      <footer className="w-full flex justify-center gap-8 py-4 text-xs text-gray-500">
        <a href="#" className="hover:underline">PRIVACY POLICY</a>
        <a href="#" className="hover:underline">TERMS OF SERVICE</a>
        <a href="#" className="hover:underline">COOKIE POLICY</a>
      </footer>
    </div>
  );
};

export default LoginPage;
