'use client';

import React, { useState } from 'react';
import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Car, Shield, Globe } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
      
      {/* Visual Brand Panel */}
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden flex-col justify-between p-20 text-white">
         <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay"></div>
         <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>

         <nav className="relative z-10">
            <Link href="/" className="text-4xl font-black tracking-tighter flex items-center group">
               UBER<span className="text-blue-600 transition-colors group-hover:text-white">CLONE</span>
            </Link>
         </nav>

         <div className="relative z-10 space-y-10 max-w-xl">
            <div className="space-y-4">
               <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/20 text-blue-400 font-black uppercase tracking-[0.25em] text-[0.6rem] border border-blue-500/20">Enterprise Grade Security</span>
               <h1 className="text-7xl font-black leading-[0.95] tracking-tighter">
                  Welcome back <br /> 
                  to the <span className="text-blue-600">future</span> of rides.
               </h1>
            </div>
            <p className="text-xl text-gray-400 leading-relaxed font-medium">Log into your dashboard to access high-fidelity real-time ride tracking, secure payment history, and precision navigation controls.</p>
            
            <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/10">
               <div className="space-y-4 flex flex-col">
                  <Shield className="w-10 h-10 text-blue-600 mb-2" />
                  <span className="text-sm font-black uppercase tracking-widest text-white">Encrypted Data</span>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-widest">End-to-end encryption for every transaction and route.</p>
               </div>
               <div className="space-y-4 flex flex-col">
                  <Globe className="w-10 h-10 text-blue-600 mb-2" />
                  <span className="text-sm font-black uppercase tracking-widest text-white">Global Access</span>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed uppercase tracking-widest">Your account travels with you across 50+ major cities.</p>
               </div>
            </div>
         </div>

         <div className="relative z-10 flex items-center justify-between text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 pt-10 border-t border-white/10">
            <span>© 2026 UBERCLONE • LABMENTIX</span>
            <div className="flex gap-8">
               <span className="cursor-pointer hover:text-white transition">Privacy</span>
               <span className="cursor-pointer hover:text-white transition">Terms</span>
            </div>
         </div>
      </div>

      {/* Login Component Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative bg-gray-50/50">
         <div className="absolute top-10 left-10 lg:hidden">
            <Link href="/" className="text-2xl font-black tracking-tighter flex items-center group">
               UBER<span className="text-blue-600">CLONE</span>
            </Link>
         </div>
         
         <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="lg:hidden text-center space-y-4">
               <h2 className="text-4xl font-black text-gray-900 tracking-tight">Log In</h2>
               <p className="text-gray-400 font-medium">Welcome back to the global ride-share network.</p>
            </div>

            <div className="clerk-container shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden bg-white border border-gray-100">
               <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-none p-10 w-full",
                      headerTitle: "text-2xl font-black tracking-tight text-gray-900",
                      headerSubtitle: "text-sm font-medium text-gray-400 mb-10",
                      socialButtonsBlockButton: "rounded-2xl border-2 border-gray-100 py-4 hover:border-blue-600 hover:bg-white transition-all",
                      socialButtonsBlockButtonText: "font-black uppercase tracking-widest text-[0.65rem] text-gray-600",
                      formButtonPrimary: "bg-black hover:bg-blue-600 rounded-2xl py-4 font-black uppercase tracking-widest text-[0.65rem] shadow-xl hover:shadow-blue-500/20 transition-all",
                      formFieldInput: "bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl py-4 px-6 text-sm font-bold transition-all",
                      formFieldLabel: "text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1",
                      footerActionText: "text-[0.65rem] font-black text-gray-400 uppercase tracking-widest",
                      footerActionLink: "text-[0.65rem] font-black text-blue-600 uppercase tracking-widest hover:text-black transition",
                      dividerLine: "bg-gray-100",
                      dividerText: "text-[0.6rem] font-black uppercase tracking-widest text-gray-300"
                    }
                  }}
                  routing="path"
                  path="/login"
                  signUpUrl="/register"
                  forceRedirectUrl="/dashboard"
               />
            </div>
            
            <Link href="/" className="flex items-center justify-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-all group">
               <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
               Back to Homepage
            </Link>
         </div>
      </div>
    </div>
  );
}
