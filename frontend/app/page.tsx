'use client';

import React from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowRight, MapPin, Shield, CreditCard, Star, Users, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md px-6 md:px-12 py-5 flex items-center justify-between z-50 border-b border-gray-50 shadow-sm">
        <Link href="/" className="text-3xl font-black tracking-tighter flex items-center group">
          UBER<span className="text-blue-600 transition-colors group-hover:text-black">CLONE</span>
        </Link>
        <div className="flex items-center space-x-8">
          {!isSignedIn ? (
            <>
              <Link href="/login" className="text-xs font-black uppercase tracking-[0.2em] hover:text-blue-600 transition">Log In</Link>
              <Link href="/register" className="bg-black text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition shadow-xl hover:shadow-black/20 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md">
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="bg-black text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition">Dashboard</Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-44 pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        <div className="flex-1 space-y-12 z-10">
          <div className="space-y-4">
             <span className="inline-block py-1.5 px-4 rounded-full bg-blue-50 text-blue-600 font-black uppercase tracking-[0.25em] text-[0.6rem] border border-blue-100">Now Live in 50+ Cities</span>
             <h1 className="text-7xl md:text-[6rem] font-black leading-[0.95] tracking-tighter text-black">
               Go anywhere, <br />
               <span className="text-blue-600">at any time.</span>
             </h1>
          </div>
          
          <p className="text-xl text-gray-500 leading-relaxed max-w-xl font-medium">
             The world's most advanced ride-sharing experience. Built with real-time tracking, 
             secure payments, and SOS support – designed for your urban lifestyle.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <Link href="/rides/request" className="bg-black text-white px-10 py-5 rounded-2xl font-black flex items-center justify-center space-x-4 hover:bg-gray-800 transition group shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-black/20 text-lg tracking-tight">
              <span>Request a Ride</span>
              <ArrowRight className="h-6 w-6 transform transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/driver/register" className="bg-white text-black px-10 py-5 rounded-2xl font-black flex items-center justify-center space-x-4 hover:bg-gray-50 transition border-2 border-gray-100 text-lg tracking-tight">
              <span>Drive with Us</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-12 pt-12 border-t border-gray-100">
             <div className="flex flex-col">
                <span className="text-4xl font-black text-black tracking-tighter">10M+</span>
                <span className="text-[0.6rem] uppercase font-black tracking-widest text-gray-400 mt-1">Total Rides</span>
             </div>
             <div className="flex flex-col border-l border-gray-100 pl-12">
                <span className="text-4xl font-black text-black tracking-tighter">4.9/5</span>
                <span className="text-[0.6rem] uppercase font-black tracking-widest text-gray-400 mt-1">Satisfaction</span>
             </div>
             <div className="flex flex-col border-l border-gray-100 pl-12">
                <span className="text-4xl font-black text-black tracking-tighter">15Min</span>
                <span className="text-[0.6rem] uppercase font-black tracking-widest text-gray-400 mt-1">Avg Response</span>
             </div>
          </div>
        </div>

        {/* Decorative App Preview Wrapper */}
        <div className="flex-1 relative w-full h-[600px] hidden lg:block">
           <div className="absolute inset-0 bg-blue-600/10 rounded-[4rem] transform rotate-3 -z-10 blur-2xl"></div>
           <div className="w-full h-full bg-black rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border-[12px] border-black relative ring-1 ring-white/20">
              <div className="absolute top-0 w-full h-10 bg-black flex justify-center py-3">
                 <div className="w-20 h-5 bg-black rounded-full border border-white/5"></div>
              </div>
              <div className="w-full h-full bg-gray-100 opacity-90 p-8 pt-14">
                 <div className="w-full h-full bg-white rounded-3xl shadow-inner border border-gray-200 p-6 space-y-6">
                    <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
                    <div className="space-y-3">
                       <div className="h-12 w-full bg-gray-50 border border-gray-200 rounded-xl flex items-center px-4 space-x-3">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <div className="h-2 w-32 bg-gray-200 rounded-full"></div>
                       </div>
                       <div className="h-12 w-full bg-gray-50 border border-gray-200 rounded-xl flex items-center px-4 space-x-3">
                          <div className="h-3 w-3 rounded-full bg-black"></div>
                          <div className="h-2 w-48 bg-gray-200 rounded-full"></div>
                       </div>
                    </div>
                    <div className="h-64 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center font-black text-gray-300 text-sm">MAP VIEW</div>
                    <div className="h-14 w-full bg-blue-600 rounded-xl shadow-lg ring-1 ring-blue-700"></div>
                 </div>
              </div>
           </div>
        </div>
      </main>

      {/* Feature Section */}
      <section className="bg-gray-50 py-32 border-y border-gray-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-24">
             <span className="text-xs uppercase font-black tracking-[0.3em] text-blue-600">Enterprise Ready</span>
             <h2 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">Everything you need, <br/> built with precision.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <FeatureCard title="Live GPS Tracking" desc="Watch your ride in real-time with Leaflet & OSM integration." icon={MapPin} />
            <FeatureCard title="SOS Security" desc="Safety triggers built-in to keep you and your driver safe." icon={Shield} />
            <FeatureCard title="Built-in Stripe" desc="Automatic checkout and digital receipts after every trip." icon={CreditCard} />
            <FeatureCard title="Smart Promo" desc="Get the best prices with our dynamic promo system." icon={Star} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-24 pb-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between pb-16 border-b border-white/10 gap-16">
          <div className="space-y-10 max-w-md">
            <h4 className="text-4xl font-black tracking-tighter">UBERCLONE</h4>
            <p className="text-gray-400 font-medium leading-[1.8] text-lg">
              Redefining mobile transportation with cutting-edge real-time technology and 
              world-class security modules. 
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16 font-black uppercase tracking-[0.2em] text-[0.65rem]">
            <div className="flex flex-col space-y-8">
              <span className="text-blue-500">Platform</span>
              <Link href="/rides/request" className="hover:text-blue-400 transition">Book Ride</Link>
              <Link href="/driver/register" className="hover:text-blue-400 transition">Drive</Link>
              <Link href="/profile" className="hover:text-blue-400 transition">Support</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-6">
           <span>© 2026 UBERCLONE • LABMENTIX LABS</span>
           <div className="flex gap-8">
              <span className="cursor-pointer hover:text-white transition">Privacy Policy</span>
              <span className="cursor-pointer hover:text-white transition">Terms of Use</span>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon }) {
  return (
    <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group">
      <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-10 transform group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm border border-blue-100">
        <Icon className="h-8 w-8" />
      </div>
      <h4 className="text-2xl font-black mb-4 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{title}</h4>
      <p className="text-gray-500 font-medium leading-[1.7]">{desc}</p>
    </div>
  );
}
