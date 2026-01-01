"use client"
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Phone, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface MyProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MyProfileDialog({ open, onOpenChange }: MyProfileDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        if (open && user?.id) {
            setLoading(true);
            fetch(`/api/users/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setProfileData({
                            name: data.user.name || '',
                            phone: data.user.phone || '',
                            address: data.user.address || '',
                        });
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [open, user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
            });
            if (response.ok) {
                toast.success("Profile updated successfully");
                onOpenChange(false);
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-white/10 text-white backdrop-blur-xl rounded-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D1AE6A]/10 blur-3xl -z-10 rounded-full" />

                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#D1AE6A]/10 rounded-lg">
                            <UserIcon className="w-5 h-5 text-[#D1AE6A]" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">My Profile</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400">
                        View and update your personal information
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D1AE6A]/50 transition-all"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                            <input
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                                value={user?.email || ''}
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-[#D1AE6A]" />
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D1AE6A]/50 transition-all"
                                    placeholder="+1 (555) 000-0000"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-[#D1AE6A]" />
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#D1AE6A]/50 transition-all"
                                    placeholder="123 Luxury Lane, Colombo"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-[#D1AE6A] hover:bg-[#8D5D11] text-white px-8 rounded-xl font-bold transition-all"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
