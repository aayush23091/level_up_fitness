"use client";

import React from "react";

interface CoinBalanceProps {
  amount: number | null;
  loading: boolean;
}

export default function CoinBalance({ amount, loading }: CoinBalanceProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl">
      <span className="text-xl">🪙</span>
      <div className="min-w-[60px]">
        {loading ? (
          <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse" />
        ) : (
          <span className="text-sm font-black text-yellow-400 tracking-wider">
            {amount?.toLocaleString() || 0}
          </span>
        )}
      </div>
    </div>
  );
}
