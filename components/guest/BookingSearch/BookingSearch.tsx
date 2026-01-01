"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Search, Star, Users, Hotel, Loader2, Info, Wifi, Coffee, Snowflake, Tv, Wind, ShieldCheck, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

// Types matching the Prisma schema/API response
type Room = {
  id: string;
  hotelId: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  floor: number;
  image: string | null;
  amenities: string; // Comma separated in DB
};

type Hotel = {
  id: string;
  name: string;
  location: string;
  rating: number;
  rooms: Room[];
};

interface BookingSearchProps {
  onSuccess?: () => void;
}

export const BookingSearch: React.FC<BookingSearchProps> = ({ onSuccess }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [location, setLocation] = useState('all');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('all');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Room[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const { user } = useAuth();
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    // Fetch hotels and rooms on mount
    const fetchData = async () => {
      try {
        const res = await fetch('/api/hotels');
        if (res.ok) {
          const data = await res.json();
          setHotels(data);
        }
      } catch (error) {
        console.error("Failed to fetch hotels:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/bookings?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.bookings) {
            setUserBookings(data.bookings);
          }
        })
        .catch(err => console.error("Failed to fetch user bookings:", err));
    }
  }, [user?.id, bookingSuccess]);

  const getActiveBookingForHotel = (hotelId: string) => {
    return userBookings.find(b =>
      b.hotelId === hotelId &&
      (b.status === 'confirmed' || b.status === 'checked-in')
    );
  };

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      toast.error("Missing dates", {
        description: "Please select both check-in and check-out dates to search."
      });
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      toast.error("Invalid stay period", {
        description: "Check-out date must be after the check-in date."
      });
      return;
    }

    setSearching(true);

    // Allow UI to update
    setTimeout(() => {
      let results: Room[] = [];

      // Flatten all rooms from all hotels
      hotels.forEach(hotel => {
        results.push(...hotel.rooms);
      });

      // Filter by location
      if (location && location !== 'all') {
        const hotelIdsInLocation = hotels.filter(h => h.location === location).map(h => h.id);
        results = results.filter(r => hotelIdsInLocation.includes(r.hotelId));
      }

      // Filter by room type
      if (roomType !== 'all') {
        results = results.filter(r => r.type === roomType);
      }

      // Filter by capacity
      results = results.filter(r => r.capacity >= parseInt(guests, 10));

      setSearchResults(results);
      setCurrentPage(1); // Reset to first page on new search
      setSearching(false);
    }, 500);
  };

  const getHotelForRoom = (hotelId: string) => hotels.find(h => h.id === hotelId);

  const handleBooking = async (room: Room) => {
    if (!user) {
      toast.error("Authentication required", {
        description: "Please login to book a room"
      });
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("Selection required", {
        description: "Please select check-in and check-out dates"
      });
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          hotelId: room.hotelId,
          roomId: room.id,
          checkIn: `${checkIn}T12:00:00`,
          checkOut: `${checkOut}T12:00:00`,
          guests,
          totalAmount: room.pricePerNight * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Booking failed');

      toast.success("Booking Confirmed!", {
        description: `Your stay at ${getHotelForRoom(room.hotelId)?.name} has been successfully reserved.`
      });

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }

    } catch (error: any) {
      toast.error("Booking Failed", {
        description: error.message
      });
    }
  };

  // Get unique locations
  const uniqueLocations = Array.from(new Set(hotels.map(h => h.location)));

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#D1AE6A] mr-2" />
        <span className="text-slate-400">Loading available hotels...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/5 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">Search Available Rooms</CardTitle>
          <CardDescription className="text-slate-400">Find the perfect room for your stay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location" className="bg-black/20 border-white/10 text-white placeholder:text-slate-500">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-in" className="text-slate-300">Check-in</Label>
              <Input
                id="check-in"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="bg-black/20 border-white/10 text-white dark:[color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-out" className="text-slate-300">Check-out</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="bg-black/20 border-white/10 text-white dark:[color-scheme:dark]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests" className="text-slate-300">Guests</Label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger id="guests" className="bg-black/20 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-type" className="text-slate-300">Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger id="room-type" className="bg-black/20 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="presidential">Presidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full mt-6 bg-[#D1AE6A] hover:bg-[#8D5D11] text-white h-12 text-lg" disabled={searching}>
            {searching ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" /> Search Rooms
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-2xl text-white font-semibold">Available Rooms ({searchResults.length})</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((room) => {
                  const hotel = getHotelForRoom(room.hotelId);
                  const activeBooking = getActiveBookingForHotel(room.hotelId);
                  const isAlreadyBooked = !!activeBooking;
                  const amenitiesList = room.amenities ? room.amenities.split(',') : [];

                  return (
                    <Dialog key={room.id}>
                      <DialogTrigger asChild>
                        <div className="cursor-pointer">
                          <Card className="border-0 bg-white/5 backdrop-blur-md overflow-hidden group hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-[#D1AE6A]/5">
                            <div className="relative overflow-hidden h-48">
                              <img
                                src={room.image || '/placeholder-room.jpg'}
                                alt={`${room.type} room`}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
                                <Badge className="bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/60">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                  {hotel?.rating?.toFixed(1)}
                                </Badge>
                                {isAlreadyBooked && (
                                  <Badge variant="info" className="bg-blue-600/80 text-white border-0 shadow-lg">
                                    Current Stay
                                  </Badge>
                                )}
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-[#D1AE6A]">View Property Details</span>
                              </div>
                            </div>

                            <CardContent className="p-5 space-y-4">
                              <div>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="capitalize font-bold text-lg text-white">{room.type} Room</h3>
                                    <p className="text-sm font-semibold text-[#D1AE6A]">{hotel?.name}</p>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3 text-[#D1AE6A]" />
                                  {hotel?.location}
                                </p>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-slate-300">
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-[#D1AE6A]" />
                                  <span>Up to {room.capacity}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Hotel className="w-4 h-4 text-[#D1AE6A]" />
                                  <span>Floor {room.floor}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {amenitiesList.slice(0, 3).map((amenity, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs border-white/10 text-slate-300 bg-white/5">
                                    {amenity.trim()}
                                  </Badge>
                                ))}
                                {amenitiesList.length > 3 && (
                                  <Badge variant="outline" className="text-xs border-white/10 text-slate-300 bg-white/5">
                                    +{amenitiesList.length - 3}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-end justify-between pt-4 border-t border-white/10">
                                <div>
                                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Per night</p>
                                  <p className="text-2xl font-bold text-[#D1AE6A]">${room.pricePerNight}</p>
                                </div>
                                {isAlreadyBooked ? (
                                  <div className="space-y-1 text-right">
                                    <Badge variant="success" className="bg-green-600/20 text-green-400 border-green-500/30 px-3">
                                      Booked
                                    </Badge>
                                  </div>
                                ) : (
                                  <Button size="sm" className="bg-[#D1AE6A] hover:bg-[#8D5D11] text-white font-bold px-4">
                                    View & Book
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </DialogTrigger>
                      <DialogContent showCloseButton={false} className="w-[95vw] sm:w-[90vw] md:max-w-4xl max-h-[90vh] bg-slate-950 border-white/5 p-0 overflow-y-auto md:overflow-hidden rounded-[2rem] shadow-2xl scrollbar-hide">
                        {/* Floating Premium Close Button */}
                        <DialogClose className="absolute top-6 right-6 z-50 group">
                          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/40 group-hover:text-white group-hover:border-[#D1AE6A]/50 group-hover:bg-[#D1AE6A]/10 transition-all duration-500">
                            <X className="w-5 h-5" />
                          </div>
                        </DialogClose>

                        <div className="flex flex-col md:flex-row min-h-full md:min-h-[500px]">
                          {/* Left Side: Visual Experience */}
                          <div className="h-64 md:h-auto md:w-1/2 relative">
                            <img
                              src={room.image || '/placeholder-room.jpg'}
                              alt="Room Experience"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                            <div className="absolute top-8 left-8">
                              <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em]">
                                Level {room.floor} • Wing A
                              </Badge>
                            </div>
                            <div className="absolute bottom-12 left-8 right-8 space-y-2">
                              <p className="text-white/60 text-xs font-bold uppercase tracking-[0.3em]">Exclusive Stay</p>
                              <h2 className="text-4xl font-serif text-white tracking-tight">{room.type} Room</h2>
                            </div>
                          </div>

                          {/* Right Side: Details & Action */}
                          <div className="md:w-1/2 p-10 md:p-14 bg-[#0A0F1C] flex flex-col justify-between">
                            <div className="space-y-10">
                              <DialogHeader className="space-y-2 text-left">
                                <div className="flex items-center gap-1 text-[#D1AE6A]">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(hotel?.rating || 0) ? 'fill-[#D1AE6A]' : 'text-white/20'}`} />
                                  ))}
                                  <span className="text-[10px] ml-2 text-white/40 font-bold uppercase tracking-widest leading-none mt-0.5">
                                    {hotel?.rating?.toFixed(1)} Guest Rating
                                  </span>
                                </div>
                                <DialogTitle className="text-2xl font-light text-white leading-tight">
                                  {hotel?.name}
                                </DialogTitle>
                                <DialogDescription className="text-white/40 text-sm flex items-center gap-1.5 pt-1">
                                  <MapPin className="w-3.5 h-3.5" /> {hotel?.location}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6">
                                <h4 className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em]">World-Class Comfort</h4>
                                <div className="grid grid-cols-2 gap-y-5 gap-x-8">
                                  <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D1AE6A]/10 transition-colors">
                                      <Wifi className="w-4 h-4 text-[#D1AE6A]" />
                                    </div>
                                    <span className="text-xs text-white/60">Fibre WiFi</span>
                                  </div>
                                  <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D1AE6A]/10 transition-colors">
                                      <Snowflake className="w-4 h-4 text-[#D1AE6A]" />
                                    </div>
                                    <span className="text-xs text-white/60">Climate Ctrl</span>
                                  </div>
                                  <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D1AE6A]/10 transition-colors">
                                      <Coffee className="w-4 h-4 text-[#D1AE6A]" />
                                    </div>
                                    <span className="text-xs text-white/60">Mini Bar</span>
                                  </div>
                                  <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#D1AE6A]/10 transition-colors">
                                      <Tv className="w-4 h-4 text-[#D1AE6A]" />
                                    </div>
                                    <span className="text-xs text-white/60">Smart Entertainment</span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-white/40 text-xs">
                                  <ShieldCheck className="w-4 h-4 text-green-500/50" />
                                  <span>Free Cancellation</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/40 text-xs text-right">
                                  <span>Up to {room.capacity} Guests</span>
                                  <Users className="w-4 h-4 text-[#D1AE6A]" />
                                </div>
                              </div>
                            </div>

                            <div className="pt-10 space-y-6">
                              <div className="flex items-baseline justify-between">
                                <div className="space-y-1">
                                  <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Grand Total</p>
                                  <p className="text-4xl font-light text-[#D1AE6A] tracking-tighter">
                                    {checkIn && checkOut
                                      ? `$${room.pricePerNight * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}`
                                      : `$${room.pricePerNight}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Duration</p>
                                  <p className="text-sm text-white/60 font-medium">
                                    {checkIn && checkOut
                                      ? `${Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))} Nights`
                                      : 'Set Dates'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-4">
                                <Button
                                  className="w-full h-14 bg-[#D1AE6A] hover:bg-[#B69656] text-slate-950 font-bold uppercase tracking-[0.15em] text-xs transition-all duration-300 rounded-xl shadow-xl shadow-[#D1AE6A]/10"
                                  onClick={() => handleBooking(room)}
                                  disabled={!checkIn || !checkOut}
                                >
                                  Reserve This Experience
                                </Button>

                                <DialogClose asChild>
                                  <button className="text-[10px] text-white/20 hover:text-[#D1AE6A] font-bold uppercase tracking-[0.2em] transition-colors py-2">
                                    Continue Browsing
                                  </button>
                                </DialogClose>
                              </div>
                              {!checkIn && (
                                <p className="text-[10px] text-red-400/80 text-center font-bold tracking-widest uppercase italic border-t border-white/5 pt-4">
                                  Selection of dates required to complete reservation
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
            </div>

            {/* Pagination Controls */}
            {searchResults.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <p className="text-sm text-slate-400">
                  Showing <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, searchResults.length)}</span> of <span className="text-white font-medium">{searchResults.length}</span> results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(p => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="border-white/10 text-slate-300 hover:text-white"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1 px-4 text-sm text-[#D1AE6A] font-bold">
                    Page {currentPage} of {Math.ceil(searchResults.length / itemsPerPage)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(p => Math.min(Math.ceil(searchResults.length / itemsPerPage), p + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === Math.ceil(searchResults.length / itemsPerPage)}
                    className="border-white/10 text-slate-300 hover:text-white"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
