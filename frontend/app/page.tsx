'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Shield, CreditCard, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-stone-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 px-8 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold tracking-tight text-foreground">GoRide</div>
          <div className="flex gap-10 items-center">
            <Link href="/rides/request" className="text-sm font-medium hover:text-stone-400 transition">Rides</Link>
            <Link href="/driver/register" className="text-sm font-medium hover:text-stone-400 transition">Drive</Link>
            <div className="h-4 w-px bg-stone-200 mx-2" />
            <Link href="/profile" className="text-sm font-medium px-5 py-2 rounded-full border border-stone-200 hover:bg-stone-50 transition">Account</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-[0.9] mb-8">
            Ride into the<br />future today.
          </h1>
          <p className="text-stone-400 text-lg font-light max-w-xl mb-12 leading-relaxed">
            Experience the new standard of urban mobility. Precise, predictable, and perfectly tailored to your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/rides/request" className="bg-foreground text-background px-10 py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition">
              <span>Book a Ride</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/driver/register" className="bg-white text-foreground px-10 py-4 rounded-full font-medium flex items-center justify-center border border-stone-200 hover:bg-stone-50 transition">
              <span>Drive with Us</span>
            </Link>
          </div>
          
          <div className="flex items-center justify-center space-x-16 pt-20 border-t border-stone-100">
             <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground tracking-tight">10M+</span>
                <span className="text-xs font-medium text-stone-400 mt-1 uppercase tracking-widest">Rides</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground tracking-tight">4.9</span>
                <span className="text-xs font-medium text-stone-400 mt-1 uppercase tracking-widest">Rating</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground tracking-tight">50+</span>
                <span className="text-xs font-medium text-stone-400 mt-1 uppercase tracking-widest">Cities</span>
             </div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="bg-white py-32 border-y border-stone-100 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <FeatureCard title="Live Tracking" desc="Real-time map integration for every journey." icon={MapPin} />
            <FeatureCard title="Safety First" desc="Dedicated SOS and emergency support modules." icon={Shield} />
            <FeatureCard title="Pure Payments" desc="Seamless checkout and transparent pricing." icon={CreditCard} />
            <FeatureCard title="Loyalty Perks" desc="Experience rewards and dynamic member pricing." icon={Star} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-stone-900 pt-24 pb-16 px-8 border-t border-stone-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between pb-20 gap-16">
          <div className="space-y-6 max-w-xs">
            <h4 className="text-xl font-bold tracking-tight">GoRide</h4>
            <p className="text-stone-400 font-light leading-relaxed">
              Refined transportation technology built for the modern world.
            </p>
          </div>
          <div className="flex gap-20">
            <div className="flex flex-col space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-300">Platform</span>
              <Link href="/rides/request" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition">Book Ride</Link>
              <Link href="/driver/register" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition">Drive</Link>
            </div>
            <div className="flex flex-col space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-300">Support</span>
              <Link href="/profile" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition">Help Center</Link>
              <Link href="/privacy" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition">Privacy</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto pt-10 border-t border-stone-100 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 flex flex-col sm:flex-row justify-between items-center gap-6">
           <span>© 2026 GoRide</span>
           <div className="flex gap-10">
              <span className="cursor-pointer hover:text-stone-900 transition">Privacy</span>
              <span className="cursor-pointer hover:text-stone-900 transition">Terms</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ElementType;
}

function FeatureCard({ title, desc, icon: Icon }: FeatureCardProps) {
  return (
    <div className="space-y-6 group">
      <div className="h-10 w-10 text-stone-900 flex items-center justify-center border border-stone-100 rounded-lg group-hover:bg-stone-900 group-hover:text-white transition-all duration-300">
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-3">
        <h4 className="text-lg font-semibold tracking-tight text-stone-900">{title}</h4>
        <p className="text-stone-400 text-sm leading-relaxed font-light">{desc}</p>
      </div>
    </div>
  );
}
