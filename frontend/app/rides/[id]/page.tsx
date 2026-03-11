'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Car, 
  MapPin, 
  Clock, 
  Shield, 
  Phone, 
  MessageSquare, 
  Star, 
  AlertTriangle,
  ChevronLeft,
  ArrowRight,
  Zap,
  Navigation
} from 'lucide-react';
import Sidebar from '@/src/components/Sidebar';
import Navbar from '@/src/components/Navbar';
import MapView from '@/src/components/MapView';
import { ridesApi } from '@/src/api/ridesApi';
import communicationApi from '@/src/api/communicationApi';
import Loader from '@/src/components/Loader';
import ErrorMessage from '@/src/components/ErrorMessage';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';

export default function RideTrackingPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const rideId = params.id;
  
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Status mapping for UI
  const statusConfig: any = {
    requested: { label: 'Finding Driver', color: 'bg-yellow-50 text-yellow-600 border-yellow-100', progress: 20 },
    accepted: { label: 'Driver Arriving', color: 'bg-blue-50 text-blue-600 border-blue-100', progress: 40 },
    arriving: { label: 'Driver Nearby', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', progress: 60 },
    started: { label: 'On Trip', color: 'bg-green-50 text-green-600 border-green-100', progress: 80 },
    completed: { label: 'Trip Completed', color: 'bg-gray-50 text-gray-600 border-gray-100', progress: 100 },
    cancelled: { label: 'Trip Cancelled', color: 'bg-red-50 text-red-600 border-red-100', progress: 0 },
  };

  useEffect(() => {
    if (isLoaded && user && rideId) {
      fetchRideDetails();
      initSocket();
    }
    return () => socket?.disconnect();
  }, [isLoaded, user, rideId]);

  useEffect(() => {
    if (chatOpen) {
      fetchMessages();
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatOpen, messages.length]);

  const initSocket = () => {
    const s = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    s.emit('join_ride', rideId);
    
    s.on('ride_status_update', (data: any) => {
      setRide((prev: any) => ({ ...prev, status: data.status }));
      if (data.status === 'completed') {
         router.push(`/rides/${rideId}/rating`);
      }
    });

    s.on('receive_message', (msg: any) => {
      setMessages((prev: any[]) => [...prev, msg]);
    });

    setSocket(s);
  };

  const fetchRideDetails = async () => {
    try {
      setLoading(true);
      const token = await (window as any).Clerk?.session?.getToken();
      const data = await ridesApi.getRideDetails(token, rideId as string);
      setRide(data);
    } catch (err) {
      console.error('Error fetching ride:', err);
      setError('Unable to fetch ride tracking data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const data = await communicationApi.messagesApi.getRideHistory(token, rideId as string);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const msgData = {
        rideId,
        senderId: user.id,
        receiverId: ride?.driverId,
        content: message
      };
      
      await communicationApi.messagesApi.sendMessage(token, rideId as string, message);
      socket.emit('send_message', msgData);
      setMessage('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleSOS = async () => {
    if (confirm('Trigger Emergency SOS? Our security team and local authorities will be notified.')) {
       try {
          const token = await (window as any).Clerk?.session?.getToken();
          await communicationApi.safetyApi.triggerSOS(token, rideId as string, 'User manually triggered SOS');
          alert('SOS Alert Sent! Emergency response is on the way.');
       } catch (err) {
          alert('Could not trigger SOS. Contact local emergency services directly.');
       }
    }
  };

  if (!isLoaded || loading) return <Loader fullPage={true} />;
  if (error) return <ErrorMessage message={error} onRetry={fetchRideDetails} />;

  const currentStatus = statusConfig[ride?.status] || statusConfig.requested;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={false} toggleSidebar={() => {}} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar toggleSidebar={() => {}} />
        
        <main className="flex-1 overflow-hidden flex flex-col lg:flex-row shadow-inner">
          
          {/* Left Panel: Ride Details & Status */}
          <div className="w-full lg:w-[480px] bg-white border-r border-gray-100 flex flex-col z-20 shadow-2xl">
             
             {/* Header */}
             <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0">
                <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-400 hover:text-black transition transform hover:-translate-x-1"><ChevronLeft className="w-5 h-5"/></button>
                <div className="text-right">
                   <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">Ride Tracking</h2>
                   <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">Ride #{(rideId as string)?.toString().slice(-6)}</p>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-10">
                
                {/* Status Indicator */}
                <section className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className={`px-4 py-2 rounded-2xl border ${currentStatus.color} shadow-sm flex items-center gap-3`}>
                         <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                         <span className="text-[0.7rem] font-black uppercase tracking-widest">{currentStatus.label}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 block">ETA</span>
                         <span className="text-xl font-black text-gray-900">4 Min</span>
                      </div>
                   </div>
                   
                   <div className="relative h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                         className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                         style={{ width: `${currentStatus.progress}%` }}
                      ></div>
                   </div>
                </section>

                {/* Driver Info Area */}
                <section className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-8 relative overflow-hidden group">
                   <div className="flex items-center gap-6 relative z-10">
                      <div className="h-20 w-20 rounded-3xl bg-white shadow-xl border border-gray-100 overflow-hidden p-1">
                         <div className="w-full h-full bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Car className="w-10 h-10" />
                         </div>
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-black text-gray-900">Marcus Wright</h3>
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-gray-100 shadow-sm">
                               <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                               <span className="text-[0.65rem] font-black">4.9</span>
                            </div>
                         </div>
                         <p className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">BMW Series 5 • BLACK • NJX 4421</p>
                      </div>
                   </div>

                   <div className="flex gap-4 relative z-10">
                      <button onClick={() => setChatOpen(true)} className="flex-1 bg-white border-2 border-gray-100 py-4 rounded-2xl font-black text-[0.65rem] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-blue-600 hover:text-blue-600 transition group/btn">
                         <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition"/> Chat
                      </button>
                      <button className="flex-1 bg-white border-2 border-gray-100 py-4 rounded-2xl font-black text-[0.65rem] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-green-600 hover:text-green-600 transition group/btn">
                         <Phone className="w-4 h-4 group-hover/btn:scale-110 transition"/> Call
                      </button>
                   </div>
                </section>

                {/* Trip Route Details */}
                <section className="space-y-6">
                   <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Trip Details</h4>
                   <div className="relative pl-6 space-y-10 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-100 before:border-dashed">
                      <div className="relative">
                         <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-lg"></div>
                         <p className="text-[0.65rem] text-gray-400 uppercase font-black tracking-widest mb-1">Pickup</p>
                         <p className="text-sm font-black text-gray-900">{ride?.pickupAddress || 'Current Location'}</p>
                      </div>
                      <div className="relative">
                         <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-white shadow-lg"></div>
                         <p className="text-[0.65rem] text-gray-400 uppercase font-black tracking-widest mb-1">Destination</p>
                         <p className="text-sm font-black text-gray-900">{ride?.destinationAddress}</p>
                      </div>
                   </div>
                </section>

                {/* SOS / Cancel Section */}
                <section className="pt-6 border-t border-gray-100 flex items-center justify-between gap-6">
                   <button onClick={handleSOS} className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-black text-[0.65rem] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition group/sos outline-none focus:ring-4 focus:ring-red-100">
                      <AlertTriangle className="w-4 h-4 group-hover/sos:rotate-12 transition"/> Trigger SOS
                   </button>
                   <button className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition">Cancel Trip</button>
                </section>
             </div>
          </div>

          {/* Right Panel: Live Map */}
          <div className="flex-1 relative bg-gray-100 cursor-crosshair">
             <MapView pickup={null} destination={null} drivers={[]} />
             
             {/* Floating Map Overlays */}
             <div className="absolute top-8 left-8 right-8 flex justify-between pointer-events-none">
                <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 pointer-events-auto">
                   <div className="h-10 w-10 flex items-center justify-center bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30"><Zap className="w-5 h-5"/></div>
                   <div>
                      <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">Connection</p>
                      <p className="text-xs font-black text-gray-900">Live Satellite Feed</p>
                   </div>
                </div>
                
                <div className="flex gap-4 pointer-events-auto">
                   <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center bg-black rounded-xl text-white shadow-lg shadow-black/20"><Navigation className="w-5 h-5"/></div>
                      <div className="text-right">
                         <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">Heading</p>
                         <p className="text-xs font-black text-gray-900 font-mono uppercase">North-East • 42mph</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Chat Side Overlay */}
          {chatOpen && (
             <div className="absolute inset-y-0 right-0 w-[400px] bg-white shadow-[-50px_0_100px_rgba(0,0,0,0.1)] z-50 flex flex-col transform transition-transform duration-500">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><MessageSquare className="w-5 h-5"/></div>
                      <h4 className="font-black text-gray-900 uppercase tracking-tight">Driver Chat</h4>
                   </div>
                   <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-black">Close</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
                   {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.senderId === user?.id ? 'bg-black text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'}`}>
                            {msg.content}
                         </div>
                      </div>
                   ))}
                   <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-8 border-t border-gray-50 bg-white">
                   <div className="relative group">
                      <input 
                         type="text" 
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         placeholder="Send a message to driver..."
                         className="w-full pl-6 pr-16 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-blue-600 transition-all outline-none"
                      />
                      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-xl hover:bg-black transition shadow-lg shadow-blue-500/20"><ArrowRight className="w-4 h-4"/></button>
                   </div>
                </form>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
