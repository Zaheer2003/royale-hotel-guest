import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit
        });

        return NextResponse.json({ notifications }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, type, title, message } = body;

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message
            }
        });

        return NextResponse.json({ notification }, { status: 201 });
    } catch (error: any) {
        console.error('Create notification error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
