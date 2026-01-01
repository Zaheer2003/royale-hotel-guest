import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (status !== 'cancelled') {
            return NextResponse.json(
                { message: 'Only cancellation is currently supported' },
                { status: 400 }
            );
        }

        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: { status },
        });

        // Trigger real notification
        await prisma.notification.create({
            data: {
                userId: updatedRequest.guestId,
                type: 'SERVICE',
                title: 'Request Cancelled',
                message: `Your request for ${updatedRequest.type} has been successfully cancelled.`
            }
        });

        return NextResponse.json(
            { message: 'Service request cancelled successfully', request: updatedRequest },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating service request:', error);
        return NextResponse.json(
            { message: 'Internal server error or Request not found' },
            { status: 500 }
        );
    }
}
