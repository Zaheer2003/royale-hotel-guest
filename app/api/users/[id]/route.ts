import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                avatar: true,
                loyaltyPoints: true,
                language: true,
                currency: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error: any) {
        console.error('Fetch user error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name: body.name,
                phone: body.phone,
                address: body.address,
                avatar: body.avatar,
                language: body.language,
                currency: body.currency,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                avatar: true,
                loyaltyPoints: true,
                language: true,
                currency: true,
            }
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: updatedUser
        }, { status: 200 });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
