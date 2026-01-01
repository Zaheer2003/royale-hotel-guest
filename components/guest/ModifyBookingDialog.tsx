"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';

// Type definition matching the one in page.tsx
type BookingWithDetails = {
    id: string;
    hotelId: string;
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    status: string;
    guests: number;
    totalAmount: number;
    hotel: {
        name: string;
        location: string;
    };
    room: {
        type: string;
        image: string | null;
    };
};

interface ModifyBookingDialogProps {
    booking: BookingWithDetails;
    onUpdate: (updatedBooking: BookingWithDetails) => void;
}

export function ModifyBookingDialog({ booking, onUpdate }: ModifyBookingDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial state from booking
    const [checkIn, setCheckIn] = useState(new Date(booking.checkInDate).toISOString().split('T')[0]);
    const [checkOut, setCheckOut] = useState(new Date(booking.checkOutDate).toISOString().split('T')[0]);
    const [guests, setGuests] = useState(booking.guests);

    // Helper to calculate cost
    const calculateTotal = () => {
        const start = new Date(booking.checkInDate);
        const end = new Date(booking.checkOutDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const oldDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const pricePerNight = booking.totalAmount / oldDays;

        const newStart = new Date(checkIn);
        const newEnd = new Date(checkOut);
        const newDiff = newEnd.getTime() - newStart.getTime();
        const newDays = Math.ceil(newDiff / (1000 * 60 * 60 * 24));

        if (newDays <= 0) return 0;
        return pricePerNight * newDays;
    };

    const predictedTotal = calculateTotal();

    const handleSave = async () => {
        if (new Date(checkIn) >= new Date(checkOut)) {
            toast.error("Invalid Dates", { description: "Check-out must be after check-in." });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkIn,
                    checkOut,
                    guests,
                    totalAmount: predictedTotal,
                }),
            });

            if (!response.ok) throw new Error('Failed to modify booking');

            const data = await response.json();

            // Update local state via callback
            onUpdate({
                ...booking,
                checkInDate: new Date(checkIn).toISOString(),
                checkOutDate: new Date(checkOut).toISOString(),
                guests,
                totalAmount: predictedTotal
            });

            toast.success("Booking Modified", { description: "Your changes have been saved." });
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Error", { description: "Failed to modify booking." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/10">
                    Modify
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modify Booking</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Make changes to your reservation at {booking.hotel.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="checkIn" className="text-right text-slate-300">
                            Check-in
                        </Label>
                        <Input
                            id="checkIn"
                            type="date"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            className="col-span-3 bg-black/20 border-white/10 text-white color-scheme-dark"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="checkOut" className="text-right text-slate-300">
                            Check-out
                        </Label>
                        <Input
                            id="checkOut"
                            type="date"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="col-span-3 bg-black/20 border-white/10 text-white"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="guests" className="text-right text-slate-300">
                            Guests
                        </Label>
                        <Input
                            id="guests"
                            type="number"
                            min={1}
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                            className="col-span-3 bg-black/20 border-white/10 text-white"
                        />
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg mt-2">
                        <span className="text-sm text-slate-400">New Total Estimate:</span>
                        <span className="font-bold text-[#D1AE6A] text-lg">${predictedTotal.toFixed(2)}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10">Cancel</Button>
                    <Button onClick={handleSave} className="bg-[#D1AE6A] hover:bg-[#8D5D11] text-white" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
