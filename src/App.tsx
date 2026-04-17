/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  User, 
  Settings, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Search,
  Menu,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  LogOut,
  Info
} from 'lucide-react';
import { cn } from './lib/utils';
import { Flight, Booking } from './types';

export default function App() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'flights' | 'settings'>('flights');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [bookingForm, setBookingForm] = useState({ passengerName: '', robloxUsername: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [editFlightData, setEditFlightData] = useState<Partial<Flight>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [flightsRes, bookingsRes] = await Promise.all([
        fetch('/api/flights'),
        fetch('/api/bookings')
      ]);
      const flightsData = await flightsRes.json();
      const bookingsData = await bookingsRes.json();
      setFlights(flightsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminPassword('');
      } else {
        alert('Invalid password');
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlight) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightId: selectedFlight.id,
          passengerName: bookingForm.passengerName,
          robloxUsername: bookingForm.robloxUsername,
          seatNumber: `${Math.floor(Math.random() * 20) + 1}${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}`
        })
      });

      if (res.ok) {
        setBookingSuccess(true);
        fetchData();
        setTimeout(() => {
          setBookingSuccess(false);
          setSelectedFlight(null);
          setBookingForm({ passengerName: '', robloxUsername: '' });
        }, 3000);
      } else {
        alert('Booking failed. No seats available?');
      }
    } catch (error) {
      alert('Error booking flight');
    }
  };

  const handleCreateOrUpdateFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editFlightData.id ? 'PUT' : 'POST';
    const url = editFlightData.id ? `/api/flights/${editFlightData.id}` : '/api/flights';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFlightData)
      });
      if (res.ok) {
        setShowFlightModal(false);
        setEditFlightData({});
        fetchData();
      }
    } catch (error) {
      alert('Error saving flight');
    }
  };

  const handleDeleteFlight = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    try {
      await fetch(`/api/flights/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error deleting flight');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('Error deleting booking');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden text-white font-sans antialiased">
      {/* Sidebar Layout */}
      <aside className="sidebar-glass w-[240px] flex-none flex flex-col p-10 gap-8 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-aircanada-red h-8 w-8 rounded flex items-center justify-center p-1.5 flex-none">
             <Plane className="text-white h-full w-full transform -rotate-45" />
          </div>
          <span className="font-display font-bold text-lg tracking-wider uppercase whitespace-nowrap">
            Air Canada <span className="font-light opacity-70">PTFS</span>
          </span>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <button 
            onClick={() => setActiveTab('flights')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
              activeTab === 'flights' ? "bg-white/10 text-white border border-white/15" : "text-white/60 hover:text-white"
            )}
          >
            <Plane className="w-4 h-4" /> Book Flight
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
              (activeTab === 'settings' || isAdmin) ? "bg-white/10 text-white border border-white/15" : "text-white/60 hover:text-white"
            )}
          >
            <Settings className="w-4 h-4" /> {isAdmin ? 'Admin Console' : 'Settings'}
          </button>
        </nav>

        <div className="mt-auto space-y-4">
          <div className="text-[10px] text-white/5 opacity-5 hover:opacity-50 transition-all cursor-pointer select-none" onClick={() => !isAdmin && setShowAdminLogin(true)}>
             [ ADMIN_LOGIN_V1.2 ]
          </div>
          <div className="text-[10px] opacity-30 tracking-widest uppercase">system sync active</div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-y-auto p-10 gap-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Reserve your flight</h1>
            <p className="opacity-60 text-sm mt-1">Exclusive booking for Air Canada Virtual PTFS operations.</p>
          </div>
          <div className="status-badge">NETWORK: ONLINE</div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'flights' ? (
            <motion.div
              key="flights-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* Flight Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {flights.map((flight) => (
                  <motion.div
                    key={flight.id}
                    whileHover={{ scale: 1.01 }}
                    className="glass-panel rounded-2xl p-8 flex flex-col gap-6 group cursor-pointer"
                    onClick={() => setSelectedFlight(flight)}
                  >
                    <div className="flex justify-between items-start text-xs font-medium text-white/70">
                      <span>{flight.flightNumber} • {flight.aircraft}</span>
                      <span className="text-aircanada-red">{flight.availableSeats} SEATS LEFT</span>
                    </div>

                    <div className="flex justify-between items-center px-2">
                      <div className="text-4xl font-display font-bold tracking-tighter uppercase">{flight.origin.match(/\((.*?)\)/)?.[1] || flight.origin.slice(0,3)}</div>
                      <div className="flex flex-col items-center opacity-30">
                        <div className="w-12 h-px bg-white/50" />
                        <Plane className="w-4 h-4 transform rotate-90 my-1" />
                        <div className="w-12 h-px bg-white/50" />
                      </div>
                      <div className="text-4xl font-display font-bold tracking-tighter uppercase">{flight.destination.match(/\((.*?)\)/)?.[1] || flight.destination.slice(0,3)}</div>
                    </div>

                    <div className="flex justify-between items-end pt-6 border-t border-white/10">
                      <div className="flex gap-10">
                        <div>
                          <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest mb-1">Departs</div>
                          <div className="font-bold">{flight.departureTime} GMT</div>
                        </div>
                        <div>
                          <div className="text-[10px] opacity-60 font-bold uppercase tracking-widest mb-1">Status</div>
                          <div className="font-bold text-green-400">{flight.status}</div>
                        </div>
                      </div>
                      <button className="red-button scale-95 origin-right">Book Now</button>
                    </div>

                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditFlightData(flight); setShowFlightModal(true); }}
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded shadow-sm border border-white/10"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteFlight(flight.id); }}
                          className="p-1.5 bg-aircanada-red/20 hover:bg-aircanada-red/40 rounded shadow-sm border border-aircanada-red/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => {
                    setEditFlightData({ flightNumber: 'AC', origin: '', destination: '', departureTime: '12:00', arrivalTime: '14:00', status: 'Scheduled', aircraft: '', availableSeats: 50, price: 400 });
                    setShowFlightModal(true);
                  }}
                  className="w-full py-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-white/40 hover:text-white"
                >
                  <Plus className="w-5 h-5" /> Add New Flight
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="settings-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="glass-panel rounded-2xl p-10 max-w-2xl">
                <div className="flex justify-between items-start mb-10">
                  <h3 className="text-2xl font-display font-bold">Administrative Control</h3>
                  {isAdmin && (
                    <button onClick={() => setIsAdmin(false)} className="text-xs text-red-400 hover:underline flex items-center gap-2">
                       <LogOut className="w-3 h-3" /> Sign Out
                    </button>
                  )}
                </div>

                {!isAdmin ? (
                  <div className="space-y-6">
                    <p className="opacity-60 text-sm leading-relaxed">
                      Restricted access for Air Canada Virtua Operations staff. 
                      Please log in with your staff credentials to manage the fleet and reservations.
                    </p>
                    <button 
                      onClick={() => setShowAdminLogin(true)}
                      className="px-6 py-3 rounded-lg bg-white/10 border border-white/15 hover:bg-white/20 transition-all text-sm font-medium"
                    >
                      Authenticate Admin Console
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                           <div className="text-[10px] opacity-40 uppercase font-bold tracking-widest mb-1">Reservations</div>
                           <div className="text-3xl font-display font-bold">{bookings.length}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                           <div className="text-[10px] opacity-40 uppercase font-bold tracking-widest mb-1">Active Fleet</div>
                           <div className="text-3xl font-display font-bold">{flights.length}</div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-40">User Logs</div>
                        <div className="space-y-1">
                          {bookings.map(booking => (
                            <div key={booking.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm">
                               <div className="grid grid-cols-3 flex-1 gap-4">
                                  <div className="font-bold">{booking.passengerName}</div>
                                  <div className="opacity-40">@{booking.robloxUsername}</div>
                                  <div className="text-aircanada-red font-mono">{booking.seatNumber}</div>
                               </div>
                               <button 
                                 onClick={() => handleDeleteBooking(booking.id)}
                                 className="text-white/20 hover:text-red-500 transition-colors"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          ))}
                          {bookings.length === 0 && <div className="text-center py-10 opacity-30 text-sm">No reservations found</div>}
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-auto py-10 opacity-20 text-[10px] uppercase font-bold tracking-widest text-center border-t border-white/5">
          System sync active • Virtual Air Canada Operations Center
        </footer>
      </main>

      {/* Booking Modal (Preserved Functionality) */}
      <AnimatePresence>
        {selectedFlight && !bookingSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedFlight(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-md p-10 relative z-10 shadow-3xl"
            >
              <h3 className="text-2xl font-bold mb-1">Confirm Seat</h3>
              <p className="text-sm opacity-50 mb-8">Flight {selectedFlight.flightNumber} • {selectedFlight.origin} to {selectedFlight.destination}</p>
              
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Passenger Name</label>
                  <input required value={bookingForm.passengerName} onChange={(e) => setBookingForm({...bookingForm, passengerName: e.target.value})} className="frosted-input w-full py-3" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-40 font-bold ml-1">Roblox Username</label>
                  <input required value={bookingForm.robloxUsername} onChange={(e) => setBookingForm({...bookingForm, robloxUsername: e.target.value})} className="frosted-input w-full py-3" placeholder="RobloxFlyer" />
                </div>
                <button type="submit" className="w-full red-button py-4 text-lg mt-4">Generate Digital Ticket</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Success */}
      <AnimatePresence>
        {bookingSuccess && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none p-4">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="bg-green-500 text-white px-10 py-6 rounded-2xl shadow-2xl flex items-center gap-4">
               <CheckCircle2 className="w-8 h-8" />
               <div className="font-bold text-xl uppercase tracking-tighter">Reservation Active!</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAdminLogin(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-sm p-10 relative z-10">
              <h3 className="text-xl font-bold mb-8 text-center uppercase tracking-widest">Auth Required</h3>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input type="password" placeholder="System Code" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="frosted-input w-full text-center py-4 text-lg" autoFocus />
                <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors uppercase tracking-widest text-xs">Authorize</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flight Edit Modal (Admin) */}
      <AnimatePresence>
        {showFlightModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowFlightModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl p-10 relative z-10 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-8 uppercase tracking-widest">{editFlightData.id ? 'Modify Airframe' : 'Registry Entry'}</h3>
              <form onSubmit={handleCreateOrUpdateFlight} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] uppercase font-bold opacity-40 ml-1">Flight Number</label><input required value={editFlightData.flightNumber} onChange={(e) => setEditFlightData({...editFlightData, flightNumber: e.target.value})} className="frosted-input w-full" /></div>
                <div className="space-y-2"><label className="text-[10px] uppercase font-bold opacity-40 ml-1">Aircraft</label><input required value={editFlightData.aircraft} onChange={(e) => setEditFlightData({...editFlightData, aircraft: e.target.value})} className="frosted-input w-full" /></div>
                <div className="space-y-2"><label className="text-[10px] uppercase font-bold opacity-40 ml-1">Origin</label><input required value={editFlightData.origin} onChange={(e) => setEditFlightData({...editFlightData, origin: e.target.value})} className="frosted-input w-full" /></div>
                <div className="space-y-2"><label className="text-[10px] uppercase font-bold opacity-40 ml-1">Destination</label><input required value={editFlightData.destination} onChange={(e) => setEditFlightData({...editFlightData, destination: e.target.value})} className="frosted-input w-full" /></div>
                <div className="space-y-2"><label className="text-[10px] uppercase font-bold opacity-40 ml-1">Departs (GMT)</label><input required value={editFlightData.departureTime} onChange={(e) => setEditFlightData({...editFlightData, departureTime: e.target.value})} className="frosted-input w-full" /></div>
                <div className="space-y-2"><label className="text-[10px] uppercase font-bold opacity-40 ml-1">Arrives (GMT)</label><input required value={editFlightData.arrivalTime} onChange={(e) => setEditFlightData({...editFlightData, arrivalTime: e.target.value})} className="frosted-input w-full" /></div>
                <div className="space-y-2 col-span-full">
                  <label className="text-[10px] uppercase font-bold opacity-40 ml-1">Status</label>
                  <select 
                    value={editFlightData.status} 
                    onChange={(e) => setEditFlightData({...editFlightData, status: e.target.value as any})}
                    className="frosted-input w-full"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Departed">Departed</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <button type="submit" className="col-span-full red-button py-4 font-bold mt-4 uppercase tracking-widest">{editFlightData.id ? 'Update System' : 'Publish to Fleet'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

}
