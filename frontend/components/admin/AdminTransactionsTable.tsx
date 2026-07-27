"use client";

import React, { useState, useEffect } from "react";
import { adminAPI, AdminTransaction } from "@/lib/api";

export default function AdminTransactionsTable() {
  const [transactionsData, setTransactionsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getTransactions();
      setTransactionsData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-6 animate-pulse"
            >
              <div className="h-4 bg-card-secondary rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-card-secondary rounded w-1/3"></div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-card border border-border/80 rounded-2xl p-6 hover:border-accent/30 transition-all group">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Total Revenue
                </p>
                <p className="text-3xl lg:text-4xl font-black text-foreground group-hover:text-accent transition-colors">
                  {transactionsData?.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 hover:border-accent/30 transition-all group">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Admin Commission
                </p>
                <p className="text-3xl lg:text-4xl font-black text-accent group-hover:text-foreground transition-colors">
                  {transactionsData?.adminCommission?.toLocaleString() || 0}
                </p>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-2xl p-6 hover:border-accent/30 transition-all group">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Transactions
                </p>
                <p className="text-3xl lg:text-4xl font-black text-foreground group-hover:text-accent transition-colors">
                  {transactionsData?.transactionCount?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
          <button
            onClick={fetchTransactions}
            className="px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-card-secondary/50 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted">
                <th className="px-6 py-4">Athlete</th>
                <th className="px-6 py-4">Coach</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Admin Commission</th>
                <th className="px-6 py-4">Coach Earning</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-20"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-card-secondary/60 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-card-secondary/60 rounded-full w-16"></div>
                    </td>
                  </tr>
                ))
              ) : transactionsData?.transactions?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="space-y-3">
                      <span className="text-3xl">💰</span>
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        No transactions yet
                      </h4>
                      <p className="text-xs text-muted max-w-xs mx-auto">
                        Transactions will appear here once athletes hire coaches.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactionsData?.transactions?.map((tx: AdminTransaction) => (
                  <tr
                    key={tx._id}
                    className="hover:bg-card-secondary/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">
                        {tx.athleteName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">
                        {tx.coachName}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground font-medium">
                        {tx.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-accent font-semibold">
                        {tx.adminCommission.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-green-400 font-semibold">
                        {tx.coachEarning.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-muted text-xs">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                        {tx.status}
                      </span>
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
