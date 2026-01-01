import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const hotels = await prisma.hotel.findMany({
            include: {
                rooms: true,
            },
        });

        return NextResponse.json(hotels, { status: 200 });
    } catch (error) {
        console.error('Fetch hotels error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
