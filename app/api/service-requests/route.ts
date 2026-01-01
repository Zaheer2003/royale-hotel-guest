import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { serviceType, description, priority, guestId } = await req.json();

        if (!serviceType || !description || !guestId) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const newRequest = await prisma.serviceRequest.create({
            data: {
                type: serviceType,
                description,
                priority: priority || 'medium',
                guestId,
                status: 'pending'
            }
        });

        // Trigger real notification
        await prisma.notification.create({
            data: {
                userId: guestId,
                type: 'SERVICE',
                title: 'Service Request Received',
                message: `We've received your request for ${serviceType}. Our staff will handle it ${priority === 'high' ? 'immediately' : 'shortly'}.`
            }
        });

        return NextResponse.json(
            { message: 'Service request created successfully', request: newRequest },
            { status: 201 }
        );
    } catch (error) {
        console.error('Service request creation error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const guestId = searchParams.get('guestId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '3');
        const skip = (page - 1) * limit;

        if (!guestId) {
            return NextResponse.json(
                { message: 'Guest ID is required' },
                { status: 400 }
            );
        }

        const [requests, total] = await Promise.all([
            prisma.serviceRequest.findMany({
                where: { guestId },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit,
            }),
            prisma.serviceRequest.count({ where: { guestId } })
        ]);

        return NextResponse.json({
            requests,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        }, { status: 200 });
    } catch (error) {
        console.error('Fetch service requests error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
