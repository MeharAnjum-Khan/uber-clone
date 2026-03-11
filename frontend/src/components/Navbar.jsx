'use client';

import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import Link from 'next/link';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-black text-white px-6 py-4 flex items-center justify-between z-30 md:left-64">
      <div className="flex items-center space-x-4">
        <button 
          className="p-2 -ml-2 rounded-lg hover:bg-white/10 md:hidden" 
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-xl font-bold md:hidden tracking-tighter uppercase">Uber</span>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-white/10 transition">
          <Bell className="h-6 w-6" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-blue-600 rounded-full border border-black shadow"></span>
        </button>
        
        <Link 
          href="/profile" 
          className="flex items-center space-x-3 p-1 rounded-full border border-white/20 hover:bg-white/10 transition group"
        >
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shadow-inner group-hover:scale-95 transition-transform">
            JD
          </div>
          <span className="text-sm font-medium mr-2 hidden sm:inline">John Doe</span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
