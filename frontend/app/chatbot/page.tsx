"use client";

import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { withProtectedRoute } from "@/lib/protectedRoute";

function ChatbotPageContent() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">AI Fitness Assistant</h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            Get personalized fitness advice and workout recommendations.
          </p>
        </div>
        <div className="bg-[#0e0e12] border border-[#1e1e24] rounded-2xl p-8 text-center">
          <div className="space-y-3">
            <span className="text-4xl block">🤖</span>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Assistant Coming Soon</h4>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Our AI fitness assistant is currently in development. Check back later for personalized workout recommendations and fitness advice!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(ChatbotPageContent, ["user"]);
