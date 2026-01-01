"use client"
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Hotel, MapPin, CreditCard, CheckCircle, Clock, Package, X, Loader2, User, Mail, Phone, Award, Save, Camera, Globe, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockServiceRequests } from '@/data/mockData'; // Keeping for type ref if needed, or remove if unused.
// Actually we should define type properly or rely on inference.
// Let's rely on type inference or define it.
import { BookingSearch } from '@/components/guest/BookingSearch/BookingSearch';
import { ServiceRequestForm } from '@/components/guest/serviceRequestForm/ServiceRequestForm';
import { Navbar } from '@/components/ui/navbar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ModifyBookingDialog } from '@/components/guest/ModifyBookingDialog';
import { BookingDetailDialog } from '@/components/guest/BookingDetailDialog';

type BookingWithDetails = {
  id: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  guests: number;
  totalAmount: number;
  hotel: {
    name: string;
    location: string;
  };
  room: {
    type: string;
    image: string | null;
    floor?: number;
    amenities?: string;
  };
};

const Greeting = () => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 5) setGreeting('Night');
    else if (hour < 12) setGreeting('Morning');
    else if (hour < 17) setGreeting('Afternoon');
    else if (hour < 21) setGreeting('Evening');
    else setGreeting('Night');
  }, []);

  if (!greeting) return <>Good Morning</>; // Default or skeleton

  return <>Good {greeting}</>;
};

const GuestDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [totalServicePages, setTotalServicePages] = useState(1);
  const servicePageSize = 3;
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      avatar: formData.get('avatar') as string,
      language: formData.get('language') as string,
      currency: formData.get('currency') as string,
    };

    setUpdatingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = await res.json();
        updateUser(updated.user);
        toast.success("Profile Updated", {
          description: "Your changes have been saved successfully."
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      toast.error("Update Failed", {
        description: "Could not update your profile. Please try again."
      });
    } finally {
      setUpdatingProfile(false);
    }
  };


  const fetchServiceRequests = () => {
    if (user?.id) {
      setLoadingServices(true);
      fetch(`/api/service-requests?guestId=${user.id}&page=${currentServicePage}&limit=${servicePageSize}`)
        .then(res => res.json())
        .then(data => {
          if (data.requests) {
            setServiceRequests(data.requests);
            setTotalServicePages(data.totalPages);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingServices(false));
    }
  };

  useEffect(() => {
    if (user?.id) {
      setLoadingBookings(true);
      fetch(`/api/bookings?userId=${user.id}&page=${currentPage}&limit=${pageSize}`)
        .then(res => res.json())
        .then(data => {
          if (data.bookings) {
            setBookings(data.bookings);
            setTotalPages(data.totalPages);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingBookings(false));
    }
  }, [user?.id, activeTab, currentPage]);

  useEffect(() => {
    if (user?.id) {
      fetchServiceRequests();
    }
  }, [user?.id, activeTab, currentServicePage]);

  const fetchUserProfile = () => {
    if (user?.id) {
      fetch(`/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            updateUser({
              name: data.user.name,
              phone: data.user.phone,
              address: data.user.address,
              avatar: data.user.avatar,
              loyaltyPoints: data.user.loyaltyPoints,
              language: data.user.language,
              currency: data.user.currency
            });
          }
        })
        .catch(err => console.error('Error fetching profile:', err));
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  const handleServiceRequestSuccess = () => {
    fetchServiceRequests();
  };

  // Determine active booking (e.g. checked-in or confirmed and dates are current)
  // For simplicity, let's take the most recent 'confirmed' or 'checked-in' booking
  const activeBooking = bookings.find(b => b.status === 'checked-in' || b.status === 'confirmed');

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'checked-in': return 'success';
      case 'checked-out': return 'info';
      case 'cancelled': return 'destructive';
      case 'pending': return 'warning';
      case 'in-progress': return 'secondary';
      case 'completed': return 'success';
      default: return 'outline';
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const today = new Date();
    const checkIn = new Date(booking.checkInDate);
    const timeDiff = checkIn.getTime() - today.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    let finalTotalAmount = booking.totalAmount;
    let refund = booking.totalAmount;
    let description = "Your reservation has been cancelled. A full refund has been initiated.";

    // If cancelling less than 24 hours before check-in or after check-in started
    if (hoursDiff < 24) {
      const checkOut = new Date(booking.checkOutDate);
      const totalNights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
      const pricePerNight = booking.totalAmount / totalNights;

      // Penalty of 1 night
      finalTotalAmount = Math.round(pricePerNight * 100) / 100;
      refund = Math.round((booking.totalAmount - finalTotalAmount) * 100) / 100;
      description = `Late cancellation: A one-night penalty of $${finalTotalAmount} was applied. Refund of $${refund} initiated.`;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          totalAmount: finalTotalAmount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const data = await response.json();
      const updatedBooking = data.booking;

      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...updatedBooking } : b
      ));

      toast.success("Booking cancelled", {
        description: description
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error("Failed to cancel booking", {
        description: "Please try again later or contact support."
      });
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'checked-in' }),
      });

      if (!response.ok) {
        throw new Error('Failed to check in');
      }

      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'checked-in' } : b
      ));

      toast.success("Checked in successfully", {
        description: "Welcome! Your stay has theoretically begun."
      });
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error("Failed to check in", {
        description: "Please try again later or contact support."
      });
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const today = new Date();
    const checkIn = new Date(booking.checkInDate);
    const originalCheckOut = new Date(booking.checkOutDate);

    // Normalize dates to midnight for accurate day counting
    const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const checkInNorm = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
    const originalCheckOutNorm = new Date(originalCheckOut.getFullYear(), originalCheckOut.getMonth(), originalCheckOut.getDate());

    const originalNights = Math.max(1, Math.ceil((originalCheckOutNorm.getTime() - checkInNorm.getTime()) / (1000 * 60 * 60 * 24)));
    const actualNights = Math.max(1, Math.ceil((todayNorm.getTime() - checkInNorm.getTime()) / (1000 * 60 * 60 * 24)));

    let finalTotalAmount = booking.totalAmount;
    let description = "We hope you enjoyed your stay! See you again soon.";

    if (actualNights < originalNights) {
      const pricePerNight = booking.totalAmount / originalNights;
      finalTotalAmount = Math.round((pricePerNight * actualNights) * 100) / 100;
      const refund = Math.round((booking.totalAmount - finalTotalAmount) * 100) / 100;
      description = `Early check-out processed. You stayed ${actualNights} nights. Pro-rated refund of $${refund} has been applied. We hope to see you again!`;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'checked-out',
          checkOut: today.toISOString(),
          totalAmount: finalTotalAmount
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check out');
      }

      const data = await response.json();
      const updatedBooking = data.booking;

      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...updatedBooking } : b
      ));

      // Refresh user profile to update Loyalty Points immediately
      fetchUserProfile();

      toast.success("Checked out successfully", {
        description: description
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error("Failed to check out", {
        description: "Please try again later or contact support."
      });
    }
  };

  const handleBookingUpdate = (updatedBooking: BookingWithDetails) => {
    setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
  };

  const handleCancelServiceRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel request');
      }

      setServiceRequests(prev => prev.map(s =>
        s.id === requestId ? { ...s, status: 'cancelled' } : s
      ));

      toast.success("Service request cancelled", {
        description: "Your request has been successfully cancelled."
      });
    } catch (error) {
      console.error('Error cancelling service request:', error);
      toast.error("Failed to cancel request", {
        description: "Please try again later or contact support."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none" />
      <Navbar className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl" />

      <div className="relative z-10 container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              <Greeting />
              <br />
              <span className="text-[#D1AE6A]">{user?.name?.split(' ')[0] || 'Guest'}</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Manage your stay and explore our services</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="px-4 py-2 border-[#D1AE6A]/50 text-[#D1AE6A] bg-[#D1AE6A]/10 backdrop-blur-md">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verified Guest
            </Badge>
            <Badge variant="outline" className="px-4 py-2 border-purple-500/50 text-purple-400 bg-purple-500/10 backdrop-blur-md">
              <Award className="w-4 h-4 mr-2" />
              {user?.loyaltyPoints || 0} Royale Points
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white/5 border border-white/10 backdrop-blur-md p-1 rounded-xl w-full md:w-auto overflow-x-auto flex-nowrap justify-start md:justify-center">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#D1AE6A] data-[state=active]:text-white rounded-lg px-6 transition-all duration-300">Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-[#D1AE6A] data-[state=active]:text-white rounded-lg px-6 transition-all duration-300">My Bookings</TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-[#D1AE6A] data-[state=active]:text-white rounded-lg px-6 transition-all duration-300">Services</TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-[#D1AE6A] data-[state=active]:text-white rounded-lg px-6 transition-all duration-300">New Booking</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#D1AE6A] data-[state=active]:text-white rounded-lg px-6 transition-all duration-300">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-in zoom-in-95 duration-500">
            {activeBooking && (
              <Card className="border-0 bg-gradient-to-r from-[#D1AE6A]/20 to-slate-900/50 backdrop-blur-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D1AE6A]/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#D1AE6A]">
                    <CheckCircle className="w-5 h-5" />
                    <span>Current Stay</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src={activeBooking.room.image || '/placeholder-room.jpg'}
                      alt="Room"
                      className="w-full md:w-64 h-40 object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{activeBooking.hotel.name}</h3>
                        <p className="text-slate-400 flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-[#D1AE6A]" />
                          {activeBooking.hotel.location}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                          <Calendar className="w-4 h-4 text-[#D1AE6A]" />
                          <span className="text-slate-200">
                            {new Date(activeBooking.checkInDate).toLocaleDateString()} - {new Date(activeBooking.checkOutDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant={getStatusVariant(activeBooking.status)} className="capitalize px-3 py-1.5 text-sm">
                          {activeBooking.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex gap-3 pt-2">
                        {activeBooking.status === 'confirmed' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-[#D1AE6A] hover:bg-[#8D5D11] text-white shadow-lg shadow-[#D1AE6A]/25 transition-all hover:scale-105 active:scale-95 px-6">
                                Check-in Online
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Check-in Online?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  This will confirm your arrival and start your stay at {activeBooking.hotel.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCheckIn(activeBooking.id)}
                                  className="bg-[#D1AE6A] hover:bg-[#8D5D11] text-white border-0"
                                >
                                  Confirm Check-in
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {activeBooking.status === 'checked-in' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/10 transition-all hover:scale-105 active:scale-95 px-6">
                                Check-out
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Check-out?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Are you ready to end your stay at {activeBooking.hotel.name}? We hope you had a wonderful time with us.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCheckOut(activeBooking.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white border-0"
                                >
                                  Confirm Check-out
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <BookingDetailDialog
                          booking={activeBooking}
                          trigger={
                            <Button
                              variant="outline"
                              className="border-[#D1AE6A]/30 text-[#D1AE6A] hover:bg-[#D1AE6A] hover:text-white transition-all duration-300 font-medium px-6 shadow-lg shadow-[#D1AE6A]/10"
                            >
                              View Details
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Total Bookings", icon: Hotel, value: bookings.length, sub: "Lifetime bookings" },
                { title: "Active Services", icon: Package, value: serviceRequests.filter(s => s.status === 'pending' || s.status === 'in-progress').length, sub: "Pending or in progress" },
                { title: "Loyalty Points", icon: CreditCard, value: user?.loyaltyPoints || 0, sub: "Verified total points" }
              ].map((stat, i) => (
                <Card key={i} className="border-0 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400 group-hover:text-[#D1AE6A] transition-colors">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-slate-500 group-hover:text-[#D1AE6A] transition-colors" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <p className="text-xs text-slate-500">{stat.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 animate-in zoom-in-95 duration-500">
            <Card className="border-0 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white">My Bookings</CardTitle>
                <CardDescription className="text-slate-400">View and manage your hotel reservations</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="h-10 w-10 animate-spin text-[#D1AE6A]" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="group border border-white/5 rounded-xl overflow-hidden bg-black/20 hover:bg-black/40 transition-all duration-300">
                        <div className="flex flex-col md:flex-row gap-6 p-6">
                          <div className="relative overflow-hidden rounded-lg w-full md:w-56 h-40">
                            <img
                              src={booking.room.image || '/placeholder-room.jpg'}
                              alt="Room"
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="flex items-start justify-between">
                                <h3 className="text-xl font-bold text-white">{booking.hotel.name}</h3>
                                <Badge variant={getStatusVariant(booking.status)} className="capitalize px-3 py-1">
                                  {booking.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                <MapPin className="w-4 h-4 text-[#D1AE6A]" />
                                {booking.hotel.location}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white/5 p-4 rounded-lg">
                              <div>
                                <p className="text-slate-500 mb-1">Check-in</p>
                                <p className="text-slate-200">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 mb-1">Check-out</p>
                                <p className="text-slate-200">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-slate-500 mb-1">Guests</p>
                                <p className="text-slate-200">{booking.guests} guests</p>
                              </div>
                              <div>
                                <p className="text-slate-500 mb-1">Total</p>
                                <p className="text-[#D1AE6A] font-bold text-lg">${booking.totalAmount}</p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              {booking.status === 'confirmed' && (
                                <>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" className="bg-[#D1AE6A] hover:bg-[#8D5D11] text-white border-0">Check-in Online</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Check-in Online?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">
                                          This will confirm your arrival and start your stay at {booking.hotel.name}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleCheckIn(booking.id)}
                                          className="bg-[#D1AE6A] hover:bg-[#8D5D11] text-white border-0"
                                        >
                                          Confirm Check-in
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <ModifyBookingDialog booking={booking} onUpdate={handleBookingUpdate} />

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0">Cancel</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">
                                          Are you sure you want to cancel your stay at {booking.hotel.name}? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Keep Booking</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleCancelBooking(booking.id)}
                                          className="bg-red-500 hover:bg-red-600 border-0"
                                        >
                                          Yes, Cancel Booking
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}

                              {booking.status === 'checked-in' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50">Check-out</Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Check-out?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-slate-400">
                                        Are you ready to end your stay at {booking.hotel.name}?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleCheckOut(booking.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                                      >
                                        Confirm Check-out
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <BookingDetailDialog
                                booking={booking}
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#D1AE6A]/30 text-[#D1AE6A] hover:bg-[#D1AE6A] hover:text-white transition-all ml-auto"
                                  >
                                    View Details
                                  </Button>
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {bookings.length > 0 ? (
                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <p className="text-sm text-slate-400">
                          Page <span className="text-white font-medium">{currentPage}</span> of <span className="text-white font-medium">{totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="border-white/10 text-slate-300 hover:text-white"
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="border-white/10 text-slate-300 hover:text-white"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <Hotel className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">No bookings yet</p>
                        <Button className="mt-6 bg-[#D1AE6A] hover:bg-[#8D5D11] text-white" onClick={() => setActiveTab('search')}>
                          Make your first Booking
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="border-0 bg-white/5 backdrop-blur-md h-full">
                  <CardHeader>
                    <CardTitle className="text-white">Service Requests</CardTitle>
                    <CardDescription className="text-slate-400">Track and manage your requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loadingServices ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#D1AE6A]" /></div>
                      ) : (
                        <>
                          {serviceRequests.map((service) => (
                            <div key={service.id} className="p-4 border border-white/5 rounded-xl bg-black/20 hover:bg-black/30 transition-colors space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <p className="capitalize font-medium text-white text-lg">{service.type.replace('-', ' ')}</p>
                                  <p className="text-sm text-slate-400">{service.description}</p>
                                </div>
                                <Badge variant={getStatusVariant(service.status)} className="capitalize">
                                  {service.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {new Date(service.createdAt).toLocaleString()}
                                </div>
                                {service.status === 'pending' && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-7 text-xs hover:text-red-400 hover:bg-red-950/30">
                                        <X className="w-3 h-3 mr-1" />
                                        Cancel
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Cancel Service Request?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">
                                          Are you sure you want to cancel this {service.type.replace('-', ' ')} request?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Stay</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleCancelServiceRequest(service.id)}
                                          className="bg-red-500 hover:bg-red-600 border-0"
                                        >
                                          Yes, Cancel Request
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}

                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {serviceRequests.length > 0 ? (
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <p className="text-sm text-slate-400">
                            Page <span className="text-white font-medium">{currentServicePage}</span> of <span className="text-white font-medium">{totalServicePages}</span>
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentServicePage(p => Math.max(1, p - 1))}
                              disabled={currentServicePage === 1}
                              className="border-white/10 text-slate-300 hover:text-white"
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentServicePage(p => Math.min(totalServicePages, p + 1))}
                              disabled={currentServicePage === totalServicePages}
                              className="border-white/10 text-slate-300 hover:text-white"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-sm text-slate-400">No active service requests</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <ServiceRequestForm onSuccess={handleServiceRequestSuccess} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="search" className="animate-in zoom-in-95 duration-500">
            <BookingSearch onSuccess={() => setActiveTab('bookings')} />
          </TabsContent>
          <TabsContent value="profile" className="animate-in zoom-in-95 duration-500">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card className="border-0 bg-white/5 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-[#D1AE6A]" />
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">Update your account details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="space-y-4">
                          <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl relative">
                              <img
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Royale'}`}
                                alt="Profile Avatar"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <button type="button" className="absolute -bottom-2 -right-2 bg-[#D1AE6A] p-2 rounded-xl shadow-xl hover:bg-[#8D5D11] transition-colors">
                              <Camera className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 text-center uppercase font-bold tracking-widest">Profile Identity</p>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                name="name"
                                defaultValue={user?.name || ''}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D1AE6A]/50 focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                disabled
                                defaultValue={user?.email || ''}
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-slate-500 cursor-not-allowed"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                name="phone"
                                defaultValue={user?.phone || ''}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D1AE6A]/50 focus:outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Avatar URL</label>
                            <div className="relative">
                              <Camera className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                              <input
                                name="avatar"
                                defaultValue={user?.avatar || ''}
                                placeholder="https://..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D1AE6A]/50 focus:outline-none transition-all font-mono text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Home Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <textarea
                            name="address"
                            defaultValue={user?.address || ''}
                            rows={2}
                            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D1AE6A]/50 focus:outline-none transition-all resize-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Language Preference</label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <select
                              name="language"
                              defaultValue={user?.language || 'English'}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D1AE6A]/50 focus:outline-none transition-all appearance-none"
                            >
                              <option className="bg-slate-900">English</option>
                              <option className="bg-slate-900">Arabic</option>
                              <option className="bg-slate-900">French</option>
                              <option className="bg-slate-900">Chinese</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Preferred Currency</label>
                          <div className="relative">
                            <Coins className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <select
                              name="currency"
                              defaultValue={user?.currency || 'USD'}
                              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-[#D1AE6A]/50 focus:outline-none transition-all appearance-none"
                            >
                              <option className="bg-slate-900">USD</option>
                              <option className="bg-slate-900">SAR</option>
                              <option className="bg-slate-900">EUR</option>
                              <option className="bg-slate-900">PKR</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={updatingProfile} className="bg-[#D1AE6A] hover:bg-[#8D5D11] text-white px-8 h-12 rounded-xl">
                          {updatingProfile ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-purple-900/40 to-slate-900/50 backdrop-blur-md overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Award className="w-24 h-24 text-white" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      Royale Membership
                    </CardTitle>
                    <CardDescription className="text-purple-200/50 italic">Elite Loyalty Program</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 relative">
                    <div className="space-y-2">
                      <p className="text-sm text-purple-200/70 uppercase font-black tracking-widest">Available Points</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-white tracking-tighter">{user?.loyaltyPoints || 0}</span>
                        <span className="text-purple-400 font-bold uppercase text-xs">Points</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">Rewards Tier</p>
                        <p className="text-[#D1AE6A] font-serif italic text-lg">{(user?.loyaltyPoints || 0) > 1000 ? 'Platinum Royale' : (user?.loyaltyPoints || 0) > 500 ? 'Gold Elite' : 'Silver Member'}</p>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, ((user?.loyaltyPoints || 0) % 500) / 5)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">Next reward at {Math.ceil(((user?.loyaltyPoints || 0) + 1) / 500) * 500} pts</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-[10px] text-white/40 uppercase font-black tracking-widest">How it works</h4>
                      <div className="space-y-2">
                        {[
                          { text: 'Earn 1 point for every $10 spent', icon: <Coins className="w-3 h-3" /> },
                          { text: 'Redeem points for room service', icon: <Package className="w-3 h-3" /> },
                          { text: 'Exclusive access to VIP events', icon: <User className="w-3 h-3" /> }
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-3 text-xs text-slate-300">
                            <div className="mt-0.5 text-[#D1AE6A]">{item.icon}</div>
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/5 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Booking History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 pt-2">
                      {bookings.length > 0 ? (
                        bookings.slice(0, 5).map(booking => (
                          <div key={booking.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${booking.room.image || '/placeholder-room.jpg'})` }} />
                              <div>
                                <p className="text-sm font-medium text-white">{booking.hotel.name}</p>
                                <p className="text-xs text-slate-400">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={getStatusVariant(booking.status)} className="capitalize text-[10px] px-2 h-5">
                                {booking.status.replace('-', ' ')}
                              </Badge>
                              <div className="mt-1 flex flex-col items-end">
                                <p className="text-xs font-bold text-white">${booking.totalAmount}</p>
                                {booking.status === 'checked-out' && (
                                  <div className="flex items-center gap-1 text-purple-400">
                                    <span className="text-[10px] font-bold">+{Math.floor(booking.totalAmount / 10)} pts</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center space-y-3 py-4">
                          <div className="flex justify-center">
                            <Clock className="w-10 h-10 text-slate-700" />
                          </div>
                          <p className="text-xs text-slate-500">No bookings found.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  )
}

export default function GuestPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="animate-spin text-[#D1AE6A] w-12 h-12" /></div>}>
      <GuestDashboard />
    </Suspense>
  );
}
