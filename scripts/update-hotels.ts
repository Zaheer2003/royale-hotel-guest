import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const branches = [
        { name: 'Royale Hotel Colombo', location: 'Colombo' },
        { name: 'Royale Hotel Kandy', location: 'Kandy' },
        { name: 'Royale Hotel Jaffna', location: 'Jaffna' },
        { name: 'Royale Hotel Galle', location: 'Galle' },
        { name: 'Royale Hotel Negombo', location: 'Negombo' }
    ];

    for (const branch of branches) {
        const hotel = await prisma.hotel.upsert({
            where: { id: branch.location.toLowerCase() },
            update: { name: branch.name, location: branch.location },
            create: {
                id: branch.location.toLowerCase(),
                name: branch.name,
                location: branch.location,
                rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10
            },
        });

        // Delete existing rooms for clean update
        await prisma.room.deleteMany({ where: { hotelId: hotel.id } });

        const roomData = [
            {
                type: 'Deluxe',
                capacity: 2,
                pricePerNight: 250,
                floor: 3,
                amenities: 'WiFi,Air Conditioning,Room Service,Mini Bar',
                status: 'available',
                image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=2574&auto=format&fit=crop'
            },
            {
                type: 'Executive',
                capacity: 2,
                pricePerNight: 320,
                floor: 5,
                amenities: 'WiFi,Air Conditioning,Room Service,Balcony',
                status: 'available',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2670&auto=format&fit=crop'
            },
            {
                type: 'Presidential',
                capacity: 4,
                pricePerNight: 750,
                floor: 10,
                amenities: 'WiFi,Air Conditioning,Room Service,Jacuzzi,Private Bar',
                status: 'available',
                image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2574&auto=format&fit=crop'
            }
        ];

        for (const room of roomData) {
            await prisma.room.create({
                data: {
                    ...room,
                    hotelId: hotel.id
                }
            });
        }
    }

    console.log('Hotels and Room details (Floor, Amenities) updated successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
