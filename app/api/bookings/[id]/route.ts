import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const bookingId = id;
        const body = await request.json();
        const { status } = body;

        if (!bookingId) {
            return NextResponse.json(
                { message: 'Booking ID is required' },
                { status: 400 }
            );
        }

        if (status) {
            if (status !== 'cancelled' && status !== 'checked-in' && status !== 'checked-out') {
                return NextResponse.json(
                    { message: 'Only cancellation, check-in and check-out are currently supported for status updates' },
                    { status: 400 }
                );
            }
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (body.checkIn) updateData.checkInDate = new Date(body.checkIn);
        if (body.checkOut) updateData.checkOutDate = new Date(body.checkOut);
        if (body.guests) updateData.guests = parseInt(body.guests);
        if (body.totalAmount) updateData.totalAmount = parseFloat(body.totalAmount);

        // Verify booking exists and belongs to user? 
        // Ideally we should check auth here, but for now we follow existing patterns (no strict auth check within the route logic visible in other routes, relying on client or middleware).

        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
            include: { hotel: true, room: true }
        });

        // Award loyalty points on check-out
        if (status === 'checked-out') {
            const pointsToAdd = Math.floor(updatedBooking.totalAmount / 10); // 1 point per $10
            await prisma.user.update({
                where: { id: updatedBooking.userId },
                data: {
                    loyaltyPoints: {
                        increment: pointsToAdd
                    }
                }
            });
        }

        // Trigger real notification
        let title = 'Booking Updated';
        let message = `Your reservation at ${updatedBooking.hotel.name} has been successfully updated.`;

        if (status === 'cancelled') {
            title = 'Booking Cancelled';
            message = `Your reservation at ${updatedBooking.hotel.name} has been cancelled as requested.`;
        } else if (status === 'checked-in') {
            title = 'Check-in Successful';
            message = `Welcome to ${updatedBooking.hotel.name}! Your check-in is complete. Enjoy your stay.`;
        } else if (status === 'checked-out') {
            title = 'Check-out Complete';
            message = `Thank you for staying at ${updatedBooking.hotel.name}. We hope you had a wonderful time! Your final invoice is ready for download.`;
        }

        await prisma.notification.create({
            data: {
                userId: updatedBooking.userId,
                type: 'BOOKING',
                title,
                message
            }
        });

        return NextResponse.json(
            { message: status === 'cancelled' ? 'Booking cancelled successfully' : 'Booking updated successfully', booking: updatedBooking },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return NextResponse.json(
            { message: 'Internal server error or Booking not found' },
            { status: 500 }
        );
    }
}
