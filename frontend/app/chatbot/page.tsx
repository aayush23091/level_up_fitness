"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { withProtectedRoute } from "@/lib/protectedRoute";
import { userAPI } from "@/lib/api";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function ChatbotPageContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { emoji: "💪", text: "Build Muscle", message: "Give me a muscle-building workout plan" },
    { emoji: "🔥", text: "Fat Loss", message: "What are the best exercises for fat loss?" },
    { emoji: "🥗", text: "Diet Advice", message: "What should I eat to improve my fitness?" },
    { emoji: "🏋️", text: "Workout Tips", message: "Give me some workout tips" },
    { emoji: "📈", text: "Analyze My Progress", message: "Analyze my fitness progress" },
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await userAPI.chatWithAI(text);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">AI Fitness Assistant</h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">
            Get personalized fitness advice and workout recommendations.
          </p>
        </div>

        <div className="flex-1 flex flex-col bg-[#0e0e12] border border-[#1e1e24] rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl block mb-4">🤖</span>
                <h4 className="text-lg font-bold text-white mb-2">Hello! I'm your AI Fitness Coach</h4>
                <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
                  Ask me anything about workouts, nutrition, or your fitness progress!
                </p>
                {/* Quick Actions */}
                <div className="flex flex-wrap justify-center gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.text}
                      onClick={() => sendMessage(action.message)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#16161d] border border-[#2a2a35] rounded-full text-white text-sm hover:border-[#ffc107] hover:text-[#ffc107] transition-all"
                    >
                      <span>{action.emoji}</span>
                      <span>{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] lg:max-w-[70%] p-4 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-[#ffc107] text-black rounded-tr-none"
                      : "bg-[#16161d] text-white border border-[#2a2a35] rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-2 opacity-70 ${
                      msg.role === "user" ? "text-black/70" : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#16161d] text-white border border-[#2a2a35] p-4 rounded-2xl rounded-tl-none">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#ffc107] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-[#ffc107] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-[#ffc107] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#1e1e24] bg-[#0e0e12]">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 bg-[#16161d] border border-[#2a2a35] rounded-full px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#ffc107] transition-all"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="bg-[#ffc107] text-black px-6 py-3 rounded-full font-bold hover:bg-[#e6ac00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default withProtectedRoute(ChatbotPageContent, ["user"]);
