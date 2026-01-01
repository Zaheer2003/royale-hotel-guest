"use client"
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Phone, MapPin, CheckCircle, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        address: '',
    });
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);

    useEffect(() => {
        if (user?.id) {
            setLoading(true);
            fetch(`/api/users/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        const fetchedData = {
                            name: data.user.name || '',
                            phone: data.user.phone || '',
                            address: data.user.address || '',
                        };
                        setProfileData(fetchedData);
                        setLoyaltyPoints(data.user.loyaltyPoints || 0);
                        updateUser({ ...fetchedData, loyaltyPoints: data.user.loyaltyPoints });
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [user?.id]);

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
                const data = await response.json();
                updateUser(profileData);
                toast.success("Profile updated successfully");
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none" />
            <Navbar className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl" />

            <main className="relative z-10 container mx-auto px-4 py-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#D1AE6A] to-[#8D5D11] flex items-center justify-center shadow-xl shadow-[#D1AE6A]/20">
                            <UserIcon className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Personal Profile</h1>
                            <p className="text-slate-400 mt-1 text-lg">Manage your identity and contact information</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-0 bg-white/5 backdrop-blur-md overflow-hidden rounded-3xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl">Basic Information</CardTitle>
                                    <CardDescription>This information will be used for your bookings and invoicing.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-400 ml-1">Full Name</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D1AE6A]/50 transition-all text-lg"
                                                placeholder="Zaheer"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-400 ml-1">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-5 top-5 w-5 h-5 text-[#D1AE6A]" />
                                                    <input
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D1AE6A]/50 transition-all text-lg"
                                                        placeholder="+94 77 123 4567"
                                                        value={profileData.phone}
                                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-400 ml-1">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-5 top-5 w-5 h-5 text-slate-500" />
                                                    <input
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-slate-500 cursor-not-allowed text-lg"
                                                        value={user?.email || ''}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-400 ml-1">Physical Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-5 top-5 w-5 h-5 text-[#D1AE6A]" />
                                                <input
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-[#D1AE6A]/50 transition-all text-lg"
                                                    placeholder="Colombo, Sri Lanka"
                                                    value={profileData.address}
                                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="w-full md:w-auto bg-[#D1AE6A] hover:bg-[#8D5D11] text-white px-10 py-7 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-[#D1AE6A]/20"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
                                            Save Profile Updates
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-transparent backdrop-blur-md rounded-3xl overflow-hidden p-8 border border-white/5">
                                <h3 className="text-[#D1AE6A] font-bold">Loyalty Points</h3>
                                <div className="text-4xl font-bold text-white mt-2">{loyaltyPoints}</div>
                                <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold font-mono">Total Points Earned</p>
                                <Button variant="link" className="text-[#D1AE6A] p-0 mt-4 h-auto text-sm hover:no-underline">
                                    View rewards catalog →
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
