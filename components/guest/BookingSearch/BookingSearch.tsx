"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Search, Star, Users, Wifi, UtensilsCrossed, Car } from 'lucide-react';
import { mockHotels, mockRooms } from '@/data/mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

type Room = {
  id: string;
  image: string;
  hotelId: string;
  type: string;
  capacity: number;
  floor: number;
  pricePerNight: number;
  status: string;
  amenities: string[];
};

export const BookingSearch: React.FC = () => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('all');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Room[]>([]);

  const handleSearch = () => {
    setSearching(true);
    // Simulate search - in real app, this would call an API
    setTimeout(() => {
      let results = mockRooms;

      // Filter by location if a location is selected
      if (location && location !== 'all') {
        const hotelIdsInLocation = mockHotels.filter(h => h.location === location).map(h => h.id);
        results = results.filter(r => hotelIdsInLocation.includes(r.hotelId));
      }

      if (roomType !== 'all') {
        results = results.filter(r => r.type === roomType);
      }
      setSearchResults(results.filter(r => r.status === 'available' && r.capacity >= parseInt(guests, 10)));
      setSearching(false);
    }, 500);
  };

  const getHotelForRoom = (hotelId: string) => mockHotels.find(h => h.id === hotelId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Available Rooms</CardTitle>
          <CardDescription>Find the perfect room for your stay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {mockHotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.location}>
                      {hotel.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-in">Check-in</Label>
              <Input
                id="check-in"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-out">Check-out</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger id="guests">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-type">Room Type</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger id="room-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="deluxe">Deluxe</SelectItem>
                  <SelectItem value="suite">Suite</SelectItem>
                  <SelectItem value="presidential">Presidential</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full mt-4" disabled={searching}>
            <Search className="w-4 h-4 mr-2" />
            {searching ? 'Searching...' : 'Search Rooms'}
          </Button>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl">Available Rooms ({searchResults.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((room) => {
              const hotel = getHotelForRoom(room.hotelId);
              return (
                <Card key={room.id} className="overflow-hidden">
                  <img
                    src={room.image}
                    alt={`${room.type} room`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="capitalize">{room.type} Room</h3>
                          <p className="text-sm text-gray-600">{hotel?.name}</p>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          {hotel?.rating}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {hotel?.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {room.capacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Floor {room.floor}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 3).map((amenity, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-end justify-between pt-3 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Per night</p>
                        <p className="text-2xl">${room.pricePerNight}</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Book Now</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Confirm Booking</DialogTitle>
                            <DialogDescription>Review your booking details</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <img
                              src={room.image}
                              alt="Room"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="text-sm text-gray-600">Hotel</p>
                                <p>{hotel?.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Room Type</p>
                                <p className="capitalize">{room.type}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Check-in</p>
                                <p>{checkIn ? new Date(checkIn).toLocaleDateString() : 'Not selected'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Check-out</p>
                                <p>{checkOut ? new Date(checkOut).toLocaleDateString() : 'Not selected'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Guests</p>
                                <p>{guests} guests</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-xl">
                                  {checkIn && checkOut
                                    ? `$${
                                        room.pricePerNight *
                                        Math.ceil(
                                          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
                                            (1000 * 60 * 60 * 24)
                                        )
                                      }`
                                    : 'Select dates'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button className="flex-1">Confirm & Pay</Button>
                              <DialogClose asChild>
                                <Button variant="outline" className="flex-1">Cancel</Button>
                              </DialogClose>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
