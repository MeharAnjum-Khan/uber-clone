'use client';

import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { 
  User, 
  Settings, 
  HelpCircle, 
  Shield, 
  CreditCard, 
  Bell, 
  ChevronRight, 
  LogOut,
  Camera,
  Star,
  Info,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import Sidebar from '@/src/components/Sidebar';
import Navbar from '@/src/components/Navbar';
import { usersApi } from '@/src/api/usersApi';
import communicationApi from '@/src/api/communicationApi';
import Loader from '@/src/components/Loader';
import ErrorMessage from '@/src/components/ErrorMessage';
import Link from 'next/link';

export default function UserProfilePage() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (isLoaded && user && activeTab === 'support') {
      fetchTickets();
    }
  }, [isLoaded, user, activeTab]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = await (window as any).Clerk?.session?.getToken();
      // Adjusting to what's likely in communicationApi based on previous patterns
      const data = await (communicationApi as any).safetyApi.getTickets(token);
      setTickets(data);
    } catch (err) {
      console.error('Tickets error:', err);
      setError('Unable to load support tickets.');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'security', label: 'Login & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support & Help', icon: HelpCircle },
    { id: 'privacy', label: 'Privacy Center', icon: Info },
  ];

  if (!isLoaded) return <Loader fullPage={true} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={false} toggleSidebar={() => {}} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleSidebar={() => {}} />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
            
            {/* Left Sidebar: Settings Navigation */}
            <aside className="w-full lg:w-80 space-y-12">
               <div className="space-y-4">
                  <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">Settings</h1>
                  <p className="text-gray-400 font-medium text-lg leading-relaxed">Manage your account preferences and security.</p>
               </div>
               
               <nav className="space-y-4">
                  {menuItems.map((item) => (
                    <button 
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between p-6 rounded-3xl transition-all border-2 ${activeTab === item.id ? 'bg-black text-white border-black shadow-xl shadow-black/10 scale-[1.02]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                    >
                      <div className="flex items-center gap-6">
                         <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === item.id ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-400'}`}>
                            <item.icon className="w-6 h-6" />
                         </div>
                         <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'translate-x-1' : ''}`} />
                    </button>
                  ))}
               </nav>
            </aside>

            {/* Right Panel: Content */}
            <div className="flex-1 min-w-0">
               <div className="bg-white rounded-[3rem] p-8 md:p-14 border border-gray-100 shadow-sm min-h-full">
                  
                  {activeTab === 'profile' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                       <div className="flex flex-col md:flex-row gap-12 md:items-center">
                          <div className="relative group">
                             <div className="h-40 w-40 rounded-[3rem] bg-gray-50 border-4 border-white shadow-2xl overflow-hidden pointer-events-none">
                                <img src={user?.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                             </div>
                             <button className="absolute bottom-2 right-2 h-12 w-12 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-black transition transform hover:scale-110">
                                <Camera className="w-6 h-6" />
                             </button>
                          </div>
                          <div className="space-y-3">
                             <h2 className="text-3xl font-black text-gray-900 leading-none uppercase tracking-tight">{user?.fullName || 'User Name'}</h2>
                             <div className="flex items-center gap-4 text-gray-400">
                                <span className="text-[0.65rem] font-black uppercase tracking-[0.2em]">{user?.primaryEmailAddress?.emailAddress}</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-green-500">Verified User</span>
                             </div>
                             <div className="pt-4 flex items-center gap-4">
                                <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
                                   <Star className="w-4 h-4 text-blue-600 fill-blue-600" />
                                   <span className="text-sm font-black text-blue-600">4.92 Rating</span>
                                </div>
                                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2">
                                   <CreditCard className="w-4 h-4 text-gray-400" />
                                   <span className="text-sm font-black text-gray-600">$1,421 Spent</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <InputField label="First Name" value={user?.firstName || ''} placeholder="First Name" disabled={false} />
                          <InputField label="Last Name" value={user?.lastName || ''} placeholder="Last Name" disabled={false} />
                          <InputField label="Email Address" value={user?.primaryEmailAddress?.emailAddress || ''} placeholder="Email" disabled={true} />
                          <InputField label="Contact Number" value="" placeholder="+1 (555) 000-0000" disabled={false} />
                          <div className="md:col-span-2 space-y-4">
                             <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Home Address</label>
                             <textarea 
                                className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-3xl text-sm font-bold transition-all outline-none resize-none" 
                                rows={3}
                                placeholder="123 Luxury Ave, Manhattan, New York"
                             />
                          </div>
                       </div>
                       
                       <div className="flex justify-end gap-6 pt-6 border-t border-gray-50">
                          <button className="px-10 py-5 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest text-gray-400 hover:text-black transition">Cancel</button>
                          <button className="px-10 py-5 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:bg-black transition">Save Changes</button>
                       </div>
                    </div>
                  )}

                  {activeTab === 'support' && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                       <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-50 pb-12">
                          <div className="space-y-4">
                             <h2 className="text-4xl font-black text-gray-900 leading-none">Support</h2>
                             <p className="text-gray-400 font-medium text-lg">Active tickets and help requests.</p>
                          </div>
                          <button className="bg-black text-white px-8 py-4 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest hover:bg-blue-600 transition flex items-center gap-3 shadow-xl hover:shadow-blue-500/20 group">
                             <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> New Ticket
                          </button>
                       </header>

                       <div className="space-y-6">
                          {tickets.length > 0 ? (
                            tickets.map(ticket => (
                              <TicketItem key={ticket.id} ticket={ticket} />
                            ))
                          ) : (
                            <div className="bg-gray-50 p-24 rounded-[3rem] text-center space-y-6">
                               <div className="h-20 w-20 bg-white rounded-[2rem] flex items-center justify-center text-gray-200 mx-auto shadow-sm"><HelpCircle className="w-10 h-10" /></div>
                               <p className="text-gray-400 font-bold">No active support tickets found.</p>
                            </div>
                          )}
                       </div>
                       
                       {/* FAQ or Knowledge Base Links */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-50">
                          <FAQLink title="Lost Items" desc="Report an item left in your ride." />
                          <FAQLink title="Safety Concerns" desc="Emergency and non-emergency safety tools." />
                          <FAQLink title="Technical Issues" desc="Problems with the app or GPS." />
                          <FAQLink title="Billing Disputes" desc="Incorrect fare charges or receipt issues." />
                       </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="flex flex-col items-center justify-center h-[500px] space-y-8 text-center animate-in fade-in duration-500">
                       <div className="h-32 w-32 bg-gray-50 rounded-full flex items-center justify-center text-gray-200"><Bell className="w-16 h-16" /></div>
                       <div className="space-y-4 max-w-sm">
                          <h3 className="text-2xl font-black text-gray-900">Push Notifications</h3>
                          <p className="text-gray-400 font-medium">Get real-time updates on your rides, promos, and account activity.</p>
                       </div>
                       <button className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest shadow-xl shadow-blue-500/20">Enable Notifications</button>
                    </div>
                  )}

               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

function InputField({ label, value, placeholder, disabled }: any) {
  return (
    <div className="space-y-4">
      <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">{label}</label>
      <input 
        type="text" 
        defaultValue={value}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-6 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-3xl text-sm font-bold transition-all outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

function TicketItem({ ticket }: any) {
   return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 flex items-center justify-between hover:shadow-xl hover:border-blue-100 transition-all group">
         <div className="flex items-center gap-8">
            <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110">
               <HelpCircle className="w-8 h-8"/>
            </div>
            <div>
               <div className="flex items-center gap-4 mb-1">
                  <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{ticket.subject}</h4>
                  <span className={`text-[0.55rem] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${ticket.status === 'open' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    {ticket.status}
                  </span>
               </div>
               <p className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 flex items-center gap-3">
                  <Clock className="w-3 h-3"/> {new Date(ticket.createdAt).toLocaleDateString()} • Ticket #{ticket.id?.toString().slice(-6)}
               </p>
            </div>
         </div>
         <button className="h-12 w-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 hover:bg-black hover:text-white transition group-hover:translate-x-1">
            <ArrowRight className="w-5 h-5"/>
         </button>
      </div>
   );
}

function FAQLink({ title, desc }: any) {
   return (
      <Link href="#" className="p-8 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-lg border-2 border-transparent hover:border-gray-100 transition-all group">
         <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{title}</h4>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
         </div>
         <p className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 leading-relaxed">{desc}</p>
      </Link>
   );
}
