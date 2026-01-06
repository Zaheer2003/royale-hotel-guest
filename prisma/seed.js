const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  await prisma.serviceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  // We keep users to avoid breaking auth, but we can update or create a test one.

  console.log('Seeding data...');

  // 1. Create a Test Hotel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'The Royale Majestic',
      location: 'Dubai, UAE',
      rating: 5.0,
    },
  });

  // 2. Create Rooms
  const luxurySuite = await prisma.room.create({
    data: {
      hotelId: hotel.id,
      type: 'Luxury Ocean Suite',
      capacity: 2,
      pricePerNight: 450,
      floor: 12,
      amenities: 'Sea View, King Bed, Mini Bar, Jacuzzi, Free Wi-Fi',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2624&auto=format&fit=crop',
    },
  });

  const deluxeRoom = await prisma.room.create({
    data: {
      hotelId: hotel.id,
      type: 'Deluxe Garden Room',
      capacity: 2,
      pricePerNight: 280,
      floor: 4,
      amenities: 'Garden View, Queen Bed, Work Desk, Coffee Maker',
      status: 'available',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2670&auto=format&fit=crop',
    },
  });

  // 3. Create/Find a Test Guest User
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: { password: hashedPassword },
    create: {
      email: 'guest@example.com',
      name: 'John Doe',
      password: hashedPassword,
      loyaltyPoints: 1250,
      language: 'English',
      currency: 'USD',
      phone: '+971 50 123 4567',
      address: 'Sky Tower 1, Dubai Marina',
    },
  });

  // 4. Create an Active Booking (Starts today)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 5);

  const activeBooking = await prisma.booking.create({
    data: {
      userId: user.id,
      hotelId: hotel.id,
      roomId: luxurySuite.id,
      checkInDate: today,
      checkOutDate: nextWeek,
      guests: 2,
      totalAmount: 2250,
      status: 'checked-in',
    },
  });

  // 5. Create a Service Request
  await prisma.serviceRequest.create({
    data: {
      guestId: user.id,
      type: 'room-service',
      description: 'Late night dinner: Wagyu Burger and mineral water.',
      priority: 'high',
      status: 'in-progress',
    },
  });

  // 6. Create a Notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'LOYALTY',
      title: 'Level Up!',
      message: 'You have earned 250 Royale Points from your last stay. You are now a Gold Member.',
    },
  });

  console.log({
    hotel,
    user,
    bookingId: activeBooking.id
  });
  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
