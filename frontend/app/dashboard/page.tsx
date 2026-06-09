"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '@/lib/api';

interface UserData {
  userId: string;
  email: string;
}

const DashboardPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('authToken');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<UserData>(token);
      setUser(decoded);
    } catch (error) {
      console.error('Failed to decode token:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    authAPI.logout();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181818] to-[#232323] flex flex-col">
      <header className="w-full flex justify-between items-center px-8 py-6 border-b border-[#333]">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">LevelUp Fitness</h1>
          <p className="text-sm text-gray-400">Dashboard</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-md transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto px-8 py-16">
          <div className="bg-[#232323] rounded-lg border border-[#333] p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">Welcome back!</h2>
            
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#333]">
                <p className="text-gray-400 text-sm mb-2">Email</p>
                <p className="text-white text-lg font-semibold">{user.email}</p>
              </div>

              <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#333]">
                <p className="text-gray-400 text-sm mb-2">User ID</p>
                <p className="text-white text-lg font-mono font-semibold break-all">{user.userId}</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg p-6 border border-yellow-500/30">
                <p className="text-yellow-400 font-semibold mb-2">✨ You're logged in!</p>
                <p className="text-gray-300">You have successfully authenticated with the LevelUp Fitness platform. You can now access all features.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <a href="#" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg text-center transition-colors">
                  View Profile
                </a>
                <a href="#" className="bg-[#333] hover:bg-[#444] text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors">
                  Settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-center gap-8 py-6 text-xs text-gray-500 border-t border-[#333]">
        <a href="#" className="hover:underline">PRIVACY POLICY</a>
        <a href="#" className="hover:underline">TERMS OF SERVICE</a>
        <a href="#" className="hover:underline">CONTACT US</a>
      </footer>
    </div>
  );
};

export default DashboardPage;
