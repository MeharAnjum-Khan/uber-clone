"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { LayoutDashboard, Plus, History, CreditCard, Settings, Phone, Star, ShieldAlert, Trash2 } from "lucide-react";
import { authApi } from "@/src/api/authApi";
import { ratingsApi } from "@/src/api/ratingsApi";
import { usersApi } from "@/src/api/usersApi";

type ProfileData = {
  id: string;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
};

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relation?: string;
  created_at?: string;
};

export default function ProfilePage() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [phoneInput, setPhoneInput] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalRatings, setTotalRatings] = useState<number>(0);

  // Emergency Contacts state
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const res = await authApi.getMe(token);
      if (res && typeof res === "object") {
        const data = res as ProfileData;
        setProfile(data);
        setPhoneInput(data.phone || "");

        // Fetch ratings/reviews
        try {
          const revRes = await ratingsApi.getUserReviews(token);
          if (Array.isArray(revRes)) {
            setReviews(revRes);
          }
          const avgRes = await ratingsApi.getUserAverage(token, data.id);
          if (avgRes && (avgRes as any).average_rating !== undefined) {
             setAvgRating((avgRes as any).average_rating);
             setTotalRatings((avgRes as any).total_ratings);
          }
          
          const contactsRes = await usersApi.getEmergencyContacts(token);
          if (Array.isArray(contactsRes)) {
            setEmergencyContacts(contactsRes);
          }
        } catch (rErr) {
          console.warn("Failed to load secondary data", rErr);
        }

      } else {
        setProfile(null);
        setPhoneInput("");
      }
    } catch (err: unknown) {
      console.warn("Profile load error", err);
      let message = "Failed to load profile.";
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
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await authApi.updateProfile(token, {
        phone: phoneInput.trim() || null,
      });

      setSuccess("Profile updated successfully.");
      await loadProfile();
    } catch (err: unknown) {
      console.warn("Profile save error", err);
      let message = "Failed to update profile.";
      if (typeof err === "object" && err !== null) {
        const maybeError = err as { error?: string; message?: string };
        message = maybeError.error || maybeError.message || message;
      } else if (typeof err === "string") {
        message = err;
      }
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmergencyContact = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newContactName || !newContactPhone) return;
    
    try {
      setAddingContact(true);
      setError(null);
      setSuccess(null);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await usersApi.addEmergencyContact(token, {
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relation: newContactRelation.trim() || undefined
      });

      setSuccess("Emergency contact added successfully.");
      setNewContactName("");
      setNewContactPhone("");
      setNewContactRelation("");
      
      const contactsRes = await usersApi.getEmergencyContacts(token);
      if (Array.isArray(contactsRes)) setEmergencyContacts(contactsRes);
    } catch (err: unknown) {
      console.warn("Error adding contact", err);
      setError("Failed to add emergency contact.");
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteEmergencyContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to remove this emergency contact?")) return;
    try {
      setError(null);
      setSuccess(null);
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      await usersApi.deleteEmergencyContact(token, contactId);
      setSuccess("Emergency contact removed.");
      setEmergencyContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (err: unknown) {
      console.warn("Error deleting contact", err);
      setError("Failed to remove emergency contact.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-black flex-col fixed inset-y-0 left-0 p-6">
        <div className="text-white text-2xl font-bold tracking-tighter mb-10">GoRide</div>
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
            className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-medium"
          >
            <CreditCard size={18} />
            Payments
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-3 bg-white/10 text-white px-4 py-3 rounded-lg font-medium"
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
              Profile
            </h1>
            <p className="text-gray-500">
              Manage your account details and contact info.
            </p>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl mb-6 text-sm">
            {success}
          </div>
        )}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 max-w-2xl">
          <h2 className="text-lg font-bold text-black mb-4">Basic info</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                Full name
              </p>
              <p className="text-black">
                {user?.fullName || profile?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                Email
              </p>
              <p className="text-black">
                {user?.primaryEmailAddress?.emailAddress || profile?.email || "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Email is managed by your sign-in provider (Clerk). To change it,
                update it in your account settings there.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl">
          <h2 className="text-lg font-bold text-black mb-4">Contact</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                Phone number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-xs">
                  <Phone size={14} />
                </span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="Add a phone number"
                  disabled={saving}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll use this to help drivers or support reach you about
                your trips.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-bold text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <ShieldAlert size={20} className="text-red-500" />
            <h2 className="text-lg font-bold text-black">Emergency Contacts</h2>
          </div>
          
          <div className="mb-6 space-y-3">
            {emergencyContacts.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No emergency contacts added yet.</p>
            ) : (
              emergencyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-bold text-black">{contact.name}</p>
                    <p className="text-xs text-gray-600">{contact.phone} {contact.relation && `• ${contact.relation}`}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteEmergencyContact(contact.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove Contact"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddEmergencyContact} className="space-y-4 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-black mb-2">Add New Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g. Jane Doe"
                  disabled={addingContact}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="+1 234 567 8900"
                  disabled={addingContact}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1">
                  Relation (Optional)
                </label>
                <input
                  type="text"
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="e.g. Spouse, Parent"
                  disabled={addingContact}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={addingContact || !newContactName || !newContactPhone}
              className="inline-flex items-center gap-2 rounded-full bg-red-50 text-red-600 border border-red-100 px-5 py-2 text-sm font-bold hover:bg-red-100 disabled:opacity-60"
            >
              <Plus size={16} />
              {addingContact ? "Adding..." : "Add Emergency Contact"}
            </button>
          </form>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-black">Ratings & Reviews</h2>
            {avgRating !== null && totalRatings > 0 && (
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm font-bold text-black">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({totalRatings})</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">No reviews to display yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev, idx) => (
                <div key={rev.id || idx} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-black">
                      {rev.rater_name || "Anonymous User"}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={i < rev.rating ? "text-yellow-400 fill-current" : "text-gray-200"} 
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-sm text-gray-600 mt-1 italic">&quot;{rev.comment}&quot;</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
