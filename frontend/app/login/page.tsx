'use client';

import React from 'react';
import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Side - Visual/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-black items-center justify-center p-12 text-white">
        <div className="max-w-md space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8">
            <ArrowLeft size={20} />
            <span>Back to home</span>
          </Link>
          <h1 className="text-5xl font-bold tracking-tighter leading-tight">
            Log in to your GoRide account
          </h1>
          <p className="text-xl text-gray-400 font-medium border-l-2 border-white pl-4">
            Request a ride, check your history, and manage your account all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Clerk Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden flex flex-col items-center mb-8">
            <Link href="/" className="text-3xl font-bold tracking-tighter text-black mb-4">
              GoRide
            </Link>
          </div>
          
          <div className="flex justify-center">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    'bg-black hover:bg-gray-800 text-sm font-bold normal-case rounded-lg py-3',
                  card: 'shadow-none border-0 p-0',
                  headerTitle: 'text-2xl font-bold tracking-tight text-black',
                  headerSubtitle: 'text-gray-500',
                  socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50 transition-colors',
                  footerActionLink: 'text-black hover:text-gray-700 font-bold',
                  rootBox: 'w-full',
                }
              }}
              routing="hash"
              fallbackRedirectUrl="/dashboard"
            />
          </div>
        </div>
      </div>
    </div>
  );
}