import React from 'react';
import AuthCard from '../components/AuthCard';
import InputField from '../components/InputField';
import SocialButton from '../components/SocialButton';
import { MailIcon, LockIcon } from '../components/Icons';

const LoginPage = () => {
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
          <form className="space-y-0">
            <InputField label="Email Address" name="email" placeholder="Enter your email address" icon={<MailIcon />} />
            <div className="relative">
              <InputField label="Password" name="password" type="password" placeholder="********" icon={<LockIcon />} />
              <a href="#" className="absolute right-2 top-8 text-xs text-yellow-400 hover:underline">Forgot Password?</a>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md mt-2 transition-colors"
            >
              Login
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
            Don’t have an account?{' '}
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
