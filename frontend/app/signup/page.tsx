"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import Checkbox from '../components/Checkbox';
import { PersonIcon, MailIcon, LockIcon, ArrowForwardIcon } from '../components/Icons';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { authAPI } from '@/lib/api';

const SignupPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    if (!termsAccepted) {
      setApiError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authAPI.register(registerData);

      if (response.success) {
        router.push("/dashboard");
      } else {
        setApiError(response.message || "Registration failed");
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
      <header className="w-full flex justify-between items-center px-8 py-4">
        <span className="text-lg font-bold text-yellow-400">LevelUp Fitness</span>
        <div>
          <a href="/login" className="text-gray-300 mr-6 hover:underline">Login</a>
          <a href="/signup" className="bg-yellow-400 text-black px-4 py-1 rounded font-semibold ml-2">Join Now</a>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <AuthCard
          title="Elevate Your Game"
          subtitle="Join the community of elite athletes and data-driven coaches today."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
            {apiError && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-md text-sm mb-4">
                {apiError}
              </div>
            )}
            <InputField
              label="Full Name"
              placeholder="Enter your full name"
              icon={<PersonIcon />}
              {...register("name")}
              error={errors.name?.message}
            />
            <InputField
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              icon={<MailIcon />}
              {...register("email")}
              error={errors.email?.message}
            />
            <div className="flex gap-2">
              <div className="w-1/2">
                <InputField
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<LockIcon />}
                  {...register("password")}
                  error={errors.password?.message}
                />
              </div>
              <div className="w-1/2">
                <InputField
                  label="Confirm"
                  type="password"
                  placeholder="••••••••"
                  icon={<LockIcon />}
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </div>
            <Checkbox
              name="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              label={<span>I agree to the <a href="#" className="underline text-yellow-400">Terms of Service</a> and <a href="#" className="underline text-yellow-400">Privacy Policy</a>.</span>}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md mt-2 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"} <span className="ml-2"><ArrowForwardIcon /></span>
            </button>
          </form>
          <div className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-yellow-400 hover:underline">Login to LevelUp</a>
          </div>
        </AuthCard>
      </main>
    </div>
  );
};

export default SignupPage;
