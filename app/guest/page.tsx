"use client"
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Hotel, MapPin, CreditCard, CheckCircle, Clock, Package, X } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { mockBookings, mockServiceRequests, mockHotels, mockRooms } from '@/data/mockData';
import { BookingSearch } from '@/components/guest/BookingSearch/BookingSearch';
import { ServiceRequestForm } from '@/components/guest/serviceRequestForm/ServiceRequestForm';
import { Navbar } from '@/components/ui/navbar';

type Booking = {
  id: string;
  guestId: string;
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  guests: number;
  totalAmount: number;
};

const GuestDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const userBookings = (mockBookings as Booking[]).filter(b => b.guestId === user?.id);
  const activeBooking = userBookings.find(b => b.status === 'checked-in' || b.status === 'confirmed');
  const userServices = mockServiceRequests.filter(s => s.guestId === user?.id);

  const getBookingRoom = (roomId: string) => mockRooms.find(r => r.id === roomId);
  const getBookingHotel = (hotelId: string) => mockHotels.find(h => h.id === hotelId);

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'checked-in': return 'success';
      case 'checked-out': return 'outline';
      case 'cancelled': return 'destructive';
      case 'pending': return 'warning';
      case 'in-progress': return 'secondary';
      case 'completed': return 'success';
      default: return 'outline';
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">Manage your bookings and services</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="search">New Booking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {activeBooking && (
            <Card className="border-primary/20 bg-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span className="text-foreground">Current Stay</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <img
                    src={getBookingRoom(activeBooking.roomId)?.image}
                    alt="Room"
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold">{getBookingHotel(activeBooking.hotelId)?.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {getBookingHotel(activeBooking.hotelId)?.location}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(activeBooking.checkIn).toLocaleDateString()} - {new Date(activeBooking.checkOut).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant={getStatusVariant(activeBooking.status)} className="capitalize">
                        {activeBooking.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Check-in Online</Button>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Bookings</CardTitle>
                <Hotel className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userBookings.length}</div>
                <p className="text-xs text-muted-foreground">Lifetime bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Active Services</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userServices.filter(s => s.status === 'pending' || s.status === 'in-progress').length}
                </div>
                <p className="text-xs text-muted-foreground">Pending or in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Loyalty Points</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,248</div>
                <p className="text-xs text-muted-foreground">Available for rewards</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Service Requests</CardTitle>
              <CardDescription>Your latest service requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userServices.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm capitalize">{service.type.replace('-', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{service.description}</p>
                      <p className="text-xs text-muted-foreground/70">
                        {new Date(service.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(service.status)} className="capitalize">
                      {service.status.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
                {userServices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No service requests yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>View and manage your hotel reservations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBookings.map((booking) => {
                  const room = getBookingRoom(booking.roomId);
                  const hotel = getBookingHotel(booking.hotelId);
                  return (
                    <div key={booking.id} className="border rounded-lg overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-4 p-4">
                        <img
                          src={room?.image}
                          alt="Room"
                          className="w-full md:w-48 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg">{hotel?.name}</h3>
                              <Badge variant={getStatusVariant(booking.status)} className="capitalize">
                                {booking.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              {hotel?.location}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Check-in</p>
                              <p>{new Date(booking.checkIn).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Check-out</p>
                              <p>{new Date(booking.checkOut).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Guests</p>
                              <p>{booking.guests} guests</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total</p>
                              <p>${booking.totalAmount}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {booking.status === 'confirmed' && (
                              <>
                                <Button size="sm" onClick={() => alert('Proceeding to Online Check-in...')}>Check-in Online</Button>
                                <Button size="sm" variant="outline" onClick={() => alert('Redirecting to booking modification page...')}>Modify</Button>
                                <Button size="sm" variant="destructive" onClick={() => alert('Booking cancellation process initiated...')}>Cancel</Button>
                              </>
                            )}
                            {booking.status === 'checked-in' && (
                              <>
                                <Button size="sm" onClick={() => setActiveTab('services')}>Request Service</Button> 
                                <Button size="sm" variant="outline">View Bill</Button>
                              </>
                            )}
                            {booking.status === 'checked-out' && (
                              <Button size="sm" variant="outline">View Receipt</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {userBookings.length === 0 && (
                  <div className="text-center py-12">
                    <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bookings yet</p>
                    <Button className="mt-4" onClick={() => setActiveTab('search')}>
                      Make a Booking
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Service Requests</CardTitle>
                  <CardDescription>Track your service requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userServices.map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="capitalize">{service.type.replace('-', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                          <Badge variant={getStatusVariant(service.status)} className="capitalize">
                            {service.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(service.createdAt).toLocaleString()}
                          </div>
                          {service.status === 'pending' && (
                            <Button size="sm" variant="ghost" className="h-7 text-xs">
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {userServices.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No service requests yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <ServiceRequestForm />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search">
          <BookingSearch />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

export default function GuestPage() {
  return (
    <AuthProvider>
      <GuestDashboard />
    </AuthProvider>
  );
}
