export const mockHotels = [
  {
    id: '1',
    name: 'Grand Hotel',
    location: 'New York, NY',
    rating: 4.5
  },
  {
    id: '2',
    name: 'Luxury Resort',
    location: 'Miami, FL',
    rating: 4.8
  }
];

export const mockRooms = [
  {
    id: '1',
    image: '/DeluxeRoom.jpeg',
    hotelId: '1',
    type: 'deluxe',
    capacity: 2,
    floor: 3,
    pricePerNight: 150,
    status: 'available',
    amenities: ['WiFi', 'Air Conditioning', 'Room Service']
  },
  {
    id: '2',
    image: '/SuiteRoom.jpeg',
    hotelId: '1',
    type: 'suite',
    capacity: 4,
    floor: 5,
    pricePerNight: 250,
    status: 'available',
    amenities: ['WiFi', 'Air Conditioning', 'Room Service', 'Balcony', 'Mini Bar']
  },
  {
    id: '3',
    image: '/StandardRoom.jpg',
    hotelId: '2',
    type: 'standard',
    capacity: 2,
    floor: 2,
    pricePerNight: 120,
    status: 'available',
    amenities: ['WiFi', 'Air Conditioning']
  }
];

export const mockBookings = [
  {
    id: '1',
    guestId: '1',
    hotelId: '1',
    roomId: '1',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    status: 'confirmed',
    guests: 2,
    totalAmount: 750
  }
];

export const mockServiceRequests = [
  {
    id: '1',
    guestId: '1',
    type: 'room-service',
    description: 'Extra towels',
    status: 'pending',
    createdAt: '2024-01-15T10:00:00Z'
  }
];