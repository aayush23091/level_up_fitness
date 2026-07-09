"use client";

import React, { useState, useEffect } from "react";
import { coachAPI, CoachEarningsResponse } from "@/lib/api";

function formatDate(dateStr?: string) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "coach_hire":
      return "Coach Hire";
    default:
      return type;
  }
}

function getTypeStyle(type: string) {
  switch (type) {
    case "coach_hire":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
}

export default function CoachEarnings() {
  const [earnings, setEarnings] = useState<CoachEarningsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await coachAPI.getEarnings();
      if (!response.success) throw new Error(response.message);
      setEarnings(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <section className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
            Earnings
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Your transaction history and revenue.</p>
        </section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg">
              <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
              <div className="h-8 w-16 bg-zinc-800 rounded animate-pulse mt-3" />
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse mt-3" />
            </div>
          ))}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg">
          <div className="h-4 w-40 bg-zinc-800 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 lg:space-y-8">
        <section className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
            Earnings
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Your transaction history and revenue.</p>
        </section>
        <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchEarnings}
            className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalEarnings = earnings?.totalEarnings || 0;
  const totalTransactions = earnings?.totalTransactions || 0;
  const transactions = earnings?.transactions || [];

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-wider">
          Earnings
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Your transaction history and revenue.</p>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg hover:border-yellow-400/30 hover:shadow-[0_0_20px_rgba(250,204,21,0.05)] transition-all group">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Total Earnings
              </p>
              <p className="text-3xl lg:text-4xl font-black text-white group-hover:text-yellow-400 transition-colors">
                {totalEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500">Lifetime revenue</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 lg:p-6 shadow-lg hover:border-yellow-400/30 hover:shadow-[0_0_20px_rgba(250,204,21,0.05)] transition-all group">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Total Transactions
              </p>
              <p className="text-3xl lg:text-4xl font-black text-white group-hover:text-yellow-400 transition-colors">
                {totalTransactions.toString()}
              </p>
              <p className="text-xs text-zinc-500">Completed hires</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-[#0e0e12] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            Transaction History
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">All completed coach hire transactions.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                <th className="px-6 py-4">Athlete</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">💰</span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        No transactions yet
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                        Your earnings will appear here once athletes hire you.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-zinc-900/20 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                        {tx.athleteName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getTypeStyle(
                          tx.type
                        )}`}
                      >
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        {getTypeLabel(tx.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium text-xs">
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {formatDate(tx.date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
