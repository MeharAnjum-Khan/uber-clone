'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth, UserButton } from '@clerk/nextjs';
import { ArrowRight, Shield, Clock, CreditCard, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const { userId, isLoaded } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black text-white px-6 md:px-16 py-4 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            GoRide
          </Link>
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link href="/rides/request" className="hover:text-gray-300 transition-colors">Ride</Link>
            <Link href="/driver/dashboard" className="hover:text-gray-300 transition-colors">Drive</Link>
            <Link href="#about" className="hover:text-gray-300 transition-colors">About</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoaded && userId ? (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="hidden md:block text-sm font-medium hover:text-gray-300 transition-colors text-white">
                Dashboard
              </Link>
              <UserButton />
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden md:block text-sm font-medium hover:text-gray-300 transition-colors text-white">
                Log in
              </Link>
              <Link href="/register" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all">
                Sign up
              </Link>
            </>
          )}
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[49] bg-black pt-24 px-6 lg:hidden flex flex-col gap-6 text-white animate-in slide-in-from-top duration-300">
          <Link href="/rides/request" className="text-3xl font-bold" onClick={() => setIsMenuOpen(false)}>Ride</Link>
          <Link href="/driver/dashboard" className="text-3xl font-bold" onClick={() => setIsMenuOpen(false)}>Drive</Link>
          <Link href="#about" className="text-3xl font-bold" onClick={() => setIsMenuOpen(false)}>About</Link>
          {!userId && (
            <Link href="/login" className="text-3xl font-bold" onClick={() => setIsMenuOpen(false)}>Log in</Link>
          )}
          {userId && (
            <Link href="/dashboard" className="text-3xl font-bold" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 md:pt-24 md:pb-16 px-6 md:px-16 overflow-hidden bg-white text-black border-b border-gray-100 lg:h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10 w-full">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1.1]">
              Go anywhere,<br />anytime.
            </h1>
            <p className="text-base md:text-lg text-gray-500 max-w-lg mx-auto md:mx-0 font-medium border-l-2 border-black pl-4">
              The professional way to reach your destination. Reliable rides, 
              up-front pricing, and world-class safety features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
              <Link href="/rides/request" className="bg-black text-white px-8 py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group shadow-lg shadow-black/10">
                Request a ride
                <ArrowRight className="group-hover:translate-x-1 transition-transform w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div className="flex-1 hidden md:flex justify-end items-center">
            {/* Phone Mockup Screen Illustration - Scaled Down and adjusted for White BG */}
            <div className="relative w-[260px] h-[440px] bg-black rounded-[3rem] border-[8px] border-black shadow-2xl overflow-hidden shadow-black/5 rotate-1 translate-y-4">
                {/* Status Bar */}
                <div className="absolute top-0 inset-x-0 h-6 bg-transparent flex justify-between items-center px-8 pt-2">
                    <div className="w-12 h-3 bg-white/20 rounded-full animate-pulse"></div>
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
                    </div>
                </div>

                {/* App Content Mockup */}
                <div className="mt-10 mx-3 h-full bg-white rounded-t-2xl p-4 flex flex-col gap-4">
                    {/* Search Bar Mock */}
                    <div className="w-full h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center px-4 gap-3 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
                        <div className="w-2/3 h-1.5 bg-gray-200 rounded"></div>
                    </div>

                    {/* Simple Map Representation */}
                    <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e1e1e1_1px,transparent_1px)] [background-size:12px_12px]"></div>
                         <div className="w-24 h-24 rounded-full border border-black/5 flex items-center justify-center animate-ping duration-[4000ms]">
                             <div className="w-3 h-3 rounded-full bg-black shadow-lg"></div>
                         </div>
                         <div className="absolute top-1/4 right-1/4 w-8 h-8 flex items-center justify-center">
                            <div className="bg-black text-white p-1.5 rounded-md shadow-xl text-[7px] font-bold">GORIDE</div>
                         </div>
                    </div>

                    {/* Ride Selection Mock */}
                    <div className="h-32 flex flex-col gap-2 py-1">
                         {[1, 2].map((i) => (
                             <div key={i} className="flex justify-between items-center p-2.5 rounded-xl border border-gray-100 bg-white">
                                 <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 bg-gray-100 rounded-lg"></div>
                                     <div className="space-y-1">
                                         <div className="w-12 h-1.5 bg-gray-100 rounded"></div>
                                         <div className="w-8 h-1 bg-gray-50 rounded"></div>
                                     </div>
                                 </div>
                                 <div className="w-10 h-1.5 bg-gray-100 rounded"></div>
                             </div>
                         ))}
                    </div>
                </div>
                
                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="about" className="py-24 px-6 md:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16">Focused on what matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24">
            <FeatureItem 
              icon={<Shield className="w-8 h-8" />}
              title="Global Safety"
              desc="Safety features built into every ride, from GPS tracking to emergency assistance."
            />
            <FeatureItem 
              icon={<Clock className="w-8 h-8" />}
              title="Always Available"
              desc="Ready when you are. Request a ride in seconds and get picked up in minutes."
            />
            <FeatureItem 
              icon={<CreditCard className="w-8 h-8" />}
              title="Seamless Payments"
              desc="Go cashless with digital payment options that are safe, quick, and easy."
            />
          </div>
        </div>
      </section>

      {/* Driver CTA */}
      <section className="py-24 px-6 md:px-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Become a driver</h2>
                <p className="text-lg text-gray-600 max-w-lg">
                    Drive on the platform with the largest network of active riders. 
                    Earn money on your own schedule.
                </p>
                <Link href="/driver/dashboard" className="inline-block bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                    Get started
                </Link>
            </div>
            <div className="w-full md:w-1/2 relative aspect-[4/3] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
                {/* Modern Abstract UI Illustration */}
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="relative w-full h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                        <div className="absolute top-4 left-4 w-24 h-8 bg-black rounded flex items-center justify-center shadow-lg transform -rotate-1 group-hover:rotate-0 transition-transform">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                            <span className="text-[10px] text-white font-bold uppercase tracking-widest leading-none mt-0.5">Online</span>
                        </div>
                        
                        <div className="absolute bottom-8 right-8 w-32 h-20 bg-white rounded-lg shadow-xl border border-gray-100 p-3 transform rotate-2 group-hover:rotate-0 transition-transform delay-75">
                            <div className="w-full h-2 bg-gray-100 rounded mb-2"></div>
                            <div className="w-2/3 h-2 bg-gray-100 rounded mb-4"></div>
                            <div className="w-full h-6 bg-black rounded flex items-center justify-center text-[10px] text-white font-bold">
                                ACCEPT
                            </div>
                        </div>

                        <div className="text-gray-200 scale-150 transform -rotate-12 group-hover:rotate-0 transition-all duration-700 opacity-40">
                            <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 20l-5.447-2.723A2 2 0 013 15.483V8.517a2 2 0 011.553-1.894L9 4m0 16l6-3m-6 3V4m6 13l5.447 2.723A2 2 0 0023 17.764V10.74a2 2 0 00-1.553-1.894L16 7m0 10V7m0 0L9 4m6 3l-6 3m6-3l-6-3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-black text-white py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-16 border-b border-white/10 pb-16">
            <div className="space-y-6">
              <span className="text-3xl font-bold tracking-tighter">GoRide</span>
              <p className="text-gray-400 max-w-xs text-sm">
                Redefining the way the world moves. For everyone, everywhere.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24 text-sm font-medium">
              <div className="flex flex-col gap-4">
                <span className="text-gray-500 uppercase tracking-widest text-xs font-bold">Company</span>
                <Link href="/about" className="hover:text-gray-300">About us</Link>
                <Link href="/services" className="hover:text-gray-300">Offerings</Link>
                <Link href="/news" className="hover:text-gray-300">Newsroom</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-gray-500 uppercase tracking-widest text-xs font-bold">Products</span>
                <Link href="/ride" className="hover:text-gray-300">Ride</Link>
                <Link href="/drive" className="hover:text-gray-300">Drive</Link>
                <Link href="/eat" className="hover:text-gray-300">Eat</Link>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-gray-500 uppercase tracking-widest text-xs font-bold">Support</span>
                <Link href="/help" className="hover:text-gray-300">Help Center</Link>
                <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
                <Link href="/terms" className="hover:text-gray-300">Terms</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs gap-4">
             <p>© 2026 GoRide Inc.</p>
             <div className="flex gap-8">
                <span className="cursor-pointer hover:text-white">English (US)</span>
                <span className="cursor-pointer hover:text-white">Privacy Policy</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-6 group">
      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-gray-600 leading-relaxed font-medium">
          {desc}
        </p>
      </div>
    </div>
  );
}

