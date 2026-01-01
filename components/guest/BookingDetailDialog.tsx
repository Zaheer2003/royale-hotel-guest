"use client"
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    MapPin,
    Users,
    CreditCard,
    Hash,
    Info,
    Hotel as HotelIcon,
    Clock
} from 'lucide-react';

import jsPDF from 'jspdf';
import { useAuth } from '@/contexts/AuthContext';

interface BookingDetailDialogProps {
    booking: {
        id: string;
        hotelId: string;
        checkInDate: string;
        checkOutDate: string;
        guests: number;
        totalAmount: number;
        status: string;
        hotel: {
            name: string;
            location: string;
        };
        room: {
            type: string;
        };
    };
    trigger: React.ReactNode;
}

export function BookingDetailDialog({ booking, trigger }: BookingDetailDialogProps) {
    const { user } = useAuth();
    const handleDownload = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;

        // Premium Gold Header Bar
        doc.setFillColor(209, 174, 106); // #D1AE6A
        doc.rect(0, 0, pageWidth, 15, 'F');

        // Add Logo (Centered)
        const logoUrl = '/LOGO.png';
        try {
            const img = new Image();
            img.src = logoUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
            });
            if (img.complete && img.naturalWidth > 0) {
                const logoWidth = 35;
                const logoHeight = 35;
                doc.addImage(img, 'PNG', centerX - (logoWidth / 2), 20, logoWidth, logoHeight);
            }
        } catch (e) {
            console.error("Logo failed to load", e);
        }

        // Dynamic Header and Color based on Status
        const status = booking.status.toLowerCase();
        let statementTitle = 'OFFICIAL GUEST STATEMENT';
        let accentColor = [209, 174, 106]; // Default Gold
        let billingLabel = 'TOTAL AMOUNT DUE & PAID';
        let footerText = "Thank you for experiencing Royale Hotel. This document serves as a verified record of your stay.";

        if (status === 'cancelled') {
            statementTitle = 'CANCELLATION STATEMENT';
            accentColor = [239, 68, 68]; // Red-500
            billingLabel = 'TOTAL CANCELLATION CHARGE';
            footerText = "Your reservation has been cancelled. If any penalty was applied, it is reflected in the total above.";
        } else if (status === 'checked-out') {
            statementTitle = 'FINAL GUEST RECEIPT';
            accentColor = [37, 99, 235]; // Blue-600
            billingLabel = 'TOTAL FINAL BILL';
            footerText = "We hope you enjoyed your stay at Royale Hotel. This receipt confirms your final check-out and payment.";
        }

        // Guest Identity (Centered)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text(`INVOICE FOR: ${(user?.name || 'VALUED GUEST').toUpperCase()}`, centerX, 70, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(statementTitle, centerX, 78, { align: 'center' });

        // Divider
        doc.setLineWidth(0.5);
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(20, 85, pageWidth - 20, 85);

        // Stay Details Section
        doc.setFillColor(248, 250, 252); // Slate-50
        doc.rect(20, 110, pageWidth - 40, 50, 'F');

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text('RESERVATION DETAILS', 30, 120);

        // Two-column details
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Status:', 30, 130);
        doc.text('Occupancy:', 30, 137);
        doc.text('Room Category:', 30, 144);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(status === 'cancelled' ? 220 : 30, status === 'cancelled' ? 38 : 41, status === 'cancelled' ? 38 : 59);
        doc.text(booking.status.replace('-', ' ').toUpperCase(), 70, 130);
        doc.setTextColor(30, 41, 59);
        doc.text(`${booking.guests} Guests`, 70, 137);
        doc.text(booking.room.type.toUpperCase(), 70, 144);

        // Dates (Right Column)
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text('STAY PERIOD', centerX + 10, 120);

        doc.setTextColor(30, 41, 59);
        doc.text('Check-in:', centerX + 10, 130);
        doc.text('Check-out:', centerX + 10, 137);

        doc.setFont('helvetica', 'normal');
        doc.text(new Date(booking.checkInDate).toLocaleDateString(), centerX + 40, 130);
        doc.text(new Date(booking.checkOutDate).toLocaleDateString(), centerX + 40, 137);

        // Billing Details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text('BILLING SUMMARY', 20, 175);

        // Total Amount Box
        doc.setFillColor(30, 41, 59); // Slate-900
        doc.rect(20, 180, pageWidth - 40, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text(billingLabel, 30, 198);

        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFontSize(24);
        doc.text(`$${booking.totalAmount.toFixed(2)}`, pageWidth - 35, 200, { align: 'right' });

        // Footer Decoration
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(20, 260, 40, 2, 'F');

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.setFont('helvetica', 'italic');
        doc.text(footerText, 20, 270);

        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice ID: INV-${booking.id.slice(0, 8).toUpperCase()}`, 20, 276);
        doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth - 20, 276, { align: 'right' });

        // Save PDF
        doc.save(`Royale-Invoice-${booking.id.slice(0, 8)}.pdf`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-[#D1AE6A]';
            case 'checked-in': return 'bg-green-600';
            case 'checked-out': return 'bg-blue-600';
            case 'cancelled': return 'bg-red-600';
            default: return 'bg-slate-500';
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="w-fit min-w-[320px] max-w-[95vw] max-h-[90vh] overflow-y-auto md:min-w-[480px] bg-slate-900 border-white/10 text-white backdrop-blur-xl rounded-2xl p-0 scrollbar-hide">
                {/* Visual Accent */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#D1AE6A] to-[#8D5D11]" />

                <div className="p-6 space-y-6">
                    <DialogHeader className="text-center space-y-4">
                        <div className="mx-auto p-3 bg-[#D1AE6A]/10 rounded-full w-fit">
                            <HotelIcon className="w-6 h-6 text-[#D1AE6A]" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold tracking-widest text-[#D1AE6A] uppercase">
                                Booking for: {user?.name || 'Valued Guest'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 font-medium font-serif italic text-base">
                                Stay at <span className="text-[#D1AE6A] font-bold not-italic font-sans">{booking.hotel.name}</span>
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        {/* Status & Location Section */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-lg">
                                    <MapPin className="w-4 h-4 text-[#D1AE6A]" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase text-slate-500 font-bold">Location</p>
                                    <p className="text-sm font-medium">{booking.hotel.location}</p>
                                </div>
                            </div>
                            <Badge className={`capitalize px-3 py-1 text-[10px] font-bold border-0 shadow-lg ${getStatusColor(booking.status)}`}>
                                {booking.status.replace('-', ' ')}
                            </Badge>
                        </div>

                        {/* Stay Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                <div className="flex items-center gap-2 text-[#D1AE6A]">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-[10px] uppercase font-bold tracking-tighter">Stay Period</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-300">In: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                                    <p className="text-xs text-slate-300">Out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
                                <div className="flex items-center gap-2 text-[#D1AE6A]">
                                    <Users className="w-4 h-4" />
                                    <span className="text-[10px] uppercase font-bold tracking-tighter">Occupancy</span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-white uppercase tracking-tight">{booking.room.type} Room</p>
                                    <p className="text-xs text-slate-400">{booking.guests} Guests</p>
                                </div>
                            </div>
                        </div>

                        {/* Billing Highlight */}
                        <div className="p-5 bg-slate-950/50 rounded-xl border border-[#D1AE6A]/20 flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#D1AE6A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="space-y-1 relative">
                                <p className="text-[10px] uppercase text-slate-500 font-bold">Total Amount Paid</p>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-[#D1AE6A]" />
                                    <span className="text-2xl font-black text-[#D1AE6A] tracking-tighter italic">
                                        ${booking.totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <Badge variant="outline" className="text-[9px] uppercase border-[#D1AE6A]/30 text-[#D1AE6A] bg-[#D1AE6A]/5 px-2">
                                    Verified
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleDownload}
                        className="w-full bg-gradient-to-r from-[#D1AE6A] to-[#8D5D11] hover:from-[#8D5D11] hover:to-[#D1AE6A] text-white font-bold h-12 rounded-xl transition-all duration-500 shadow-xl shadow-[#D1AE6A]/10 gap-2 uppercase text-xs tracking-widest"
                    >
                        <Info className="w-4 h-4" /> Download Official Invoice
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

