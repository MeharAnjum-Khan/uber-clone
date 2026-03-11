'use client';

import React from 'react';
import { LogOut, User, Menu, X, LayoutDashboard, History, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const Sidebar = ({ isOpen, toggleSidebar, role = 'rider' }) => {
  const menuItems = role === 'rider' ? [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Request Ride', href: '/rides/request', icon: Menu },
    { title: 'Ride History', href: '/rides/history', icon: History },
    { title: 'Payments', href: '/payments/history', icon: CreditCard },
    { title: 'Profile', href: '/profile', icon: User },
  ] : [
    { title: 'Driver Dashboard', href: '/driver/dashboard', icon: LayoutDashboard },
    { title: 'Availability', href: '/driver/availability', icon: Menu },
    { title: 'Earnings', href: '/driver/earnings', icon: CreditCard },
    { title: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={toggleSidebar}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="text-2xl font-black tracking-tight text-black">
            UBER<span className="text-blue-600">CLONE</span>
          </Link>
          <button className="md:hidden" onClick={toggleSidebar}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="group flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 font-medium"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                <span>{item.title}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
          <button className="flex items-center space-x-3 w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition duration-200 font-bold">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
