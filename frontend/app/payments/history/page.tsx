"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { paymentsApi } from "@/src/api/paymentsApi";
import {
  LayoutDashboard,
  Plus,
  History,
  CreditCard,
  Settings,
  Car,
  Clock,
} from "lucide-react";

type PaymentHistoryItem = {
  id: string;
  ride_id?: string | null;
  amount?: number | null; // in major currency units as returned by API
  currency?: string | null;
  status?: string | null;
  created_at?: string | null;
  method?: string | null;
};

export default function PaymentsHistoryPage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await paymentsApi.getHistory(token);
      if (Array.isArray(res)) {
        setPayments(res);
      } else {
        setPayments([]);
      }
    } catch (err: unknown) {
      console.warn("Payments history error", err);
      let message = "Failed to load payments.";
      if (typeof err === "object" && err !== null) {
        const maybeError = err as { error?: string; message?: string };
        message = maybeError.error || maybeError.message || message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateTime = (value?: string | null) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const formatAmount = (amount?: number | null, currency?: string | null) => {
    if (amount == null) return "—";
    const symbol = currency?.toLowerCase() === "inr" ? "?" : "";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatStatus = (status?: string | null) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-black flex-col fixed inset-y-0 left-0 p-6">
        <div className="text-white text-2xl font-bold tracking-tighter mb-10">
          GoRide
        </div>
        <nav className="flex-1 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            href="/rides/request"
            className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium"
          >
            <Plus size={18} />
            Request Ride
          </Link>
          <Link
            href="/rides/history"
            className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium"
          >
            <History size={18} />
            Ride History
          </Link>
          <Link
            href="/payments/history"
            className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-lg font-medium"
          >
            <CreditCard size={18} />
            Payments
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium"
          >
            <Settings size={18} />
            Profile
          </Link>
        </nav>

        <div className="pt-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-4">
            <UserButton />
            <div className="text-white">
              <p className="text-sm font-bold leading-none">
                {user?.fullName ||
                  user?.emailAddresses?.[0]?.emailAddress ||
                  "User"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                Rider
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 p-6 md:p-10">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
              Payments
            </h1>
            <p className="text-gray-500">
              View your past charges and receipts.
            </p>
          </div>
          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <Clock className="h-3 w-3" />
            Refresh
          </button>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-gray-500">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p>Loading your payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-1">
              <Car size={24} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-black">No payments yet</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              When you start taking rides, your completed trip charges and
              receipts will appear here.
            </p>
            <Link
              href="/rides/request"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-900"
            >
              Request a ride
            </Link>
          </div>
        ) : (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-widest">
              <span className="w-2/5">Trip / Description</span>
              <span className="hidden md:inline-flex w-1/5">Date</span>
              <span className="w-1/5 text-center">Status</span>
              <span className="w-1/5 text-right">Amount</span>
            </div>
            <ul className="divide-y divide-gray-50">
              {payments.map((payment) => (
                <li
                  key={payment.id}
                  className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50"
                >
                  <div className="flex-1 flex items-start gap-3 min-w-0">
                    <div className="mt-1 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      <CreditCard size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-black truncate">
                        {payment.ride_id ? `Ride ${payment.ride_id.slice(0, 8)}` : "Ride payment"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 truncate max-w-50">
                        {payment.method || "Card"}
                      </p>
                    </div>
                  </div>

                  <div className="md:w-1/5 flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} className="hidden md:inline" />
                    <span className="truncate max-w-45">
                      {formatDateTime(payment.created_at)}
                    </span>
                  </div>

                  <div className="md:w-1/5 flex justify-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        payment.status === "succeeded"
                          ? "bg-emerald-50 text-emerald-700"
                          : payment.status === "refunded"
                          ? "bg-blue-50 text-blue-700"
                          : payment.status === "failed"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formatStatus(payment.status)}
                    </span>
                  </div>

                  <div className="md:w-1/5 text-right text-sm font-semibold text-black">
                    {formatAmount(payment.amount ?? null, payment.currency ?? null)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
