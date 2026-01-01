import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { userId, hotelId, roomId, checkIn, checkOut, guests, totalAmount } = await req.json();

        if (!userId || !hotelId || !roomId || !checkIn || !checkOut || !guests || !totalAmount) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const booking = await prisma.booking.create({
            data: {
                userId,
                hotelId,
                roomId,
                checkInDate: new Date(checkIn),
                checkOutDate: new Date(checkOut),
                guests: parseInt(guests),
                totalAmount: parseFloat(totalAmount),
                status: 'confirmed',
            },
            include: {
                hotel: true,
                room: true
            }
        });

        return NextResponse.json(
            { message: 'Booking created successfully', booking },
            { status: 201 }
        );
    } catch (error) {
        console.error('Booking creation error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '5');
        const skip = (page - 1) * limit;

        if (!userId) {
            return NextResponse.json(
                { message: 'User ID is required' },
                { status: 400 }
            );
        }

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where: { userId },
                include: {
                    hotel: true,
                    room: true
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.booking.count({ where: { userId } })
        ]);

        return NextResponse.json({
            bookings,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }, { status: 200 });
    } catch (error) {
        console.error('Fetch bookings error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
