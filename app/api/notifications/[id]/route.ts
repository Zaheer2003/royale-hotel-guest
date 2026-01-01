import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const notification = await prisma.notification.update({
            where: { id },
            data: {
                read: body.read ?? true
            }
        });

        return NextResponse.json({ notification }, { status: 200 });
    } catch (error: any) {
        console.error('Update notification error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
