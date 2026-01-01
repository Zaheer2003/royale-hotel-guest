"use client"
import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle, Loader2, Calendar, Hotel, Package, CreditCard, Inbox } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAllNotifications = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/notifications?userId=${user.id}&limit=50`);
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllNotifications();
    }, [user?.id]);

    const markAllAsRead = async () => {
        if (notifications.length === 0) return;
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        try {
            await Promise.all(unreadIds.map(id =>
                fetch(`/api/notifications/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ read: true })
                })
            ));
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'BOOKING': return <Hotel className="w-5 h-5 text-[#D1AE6A]" />;
            case 'SERVICE': return <Package className="w-5 h-5 text-blue-400" />;
            case 'LOYALTY': return <CreditCard className="w-5 h-5 text-green-400" />;
            default: return <Bell className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none" />
            <Navbar className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl" />

            <main className="relative z-10 container mx-auto px-4 py-12 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl">
                                <Bell className="w-10 h-10 text-[#D1AE6A]" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-bold tracking-tight">Notifications</h1>
                                <p className="text-slate-400 mt-2 text-xl">Stay updated with your latest hotel activities</p>
                            </div>
                        </div>
                        <Button
                            onClick={markAllAsRead}
                            variant="outline"
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                        >
                            Mark all as read
                        </Button>
                    </div>

                    <Card className="border-0 bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden min-h-[400px]">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Inbox className="w-5 h-5 text-slate-400" />
                                Activity Feed
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#D1AE6A]" />
                                    <p className="text-slate-500 font-medium">Fetching history...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <Bell className="w-10 h-10 text-slate-700" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-300">Quiet for now</h3>
                                    <p className="text-slate-500 mt-2 max-w-xs mx-auto">When we have updates about your stay or rewards, they'll appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`group flex items-start gap-6 p-8 transition-all duration-300 ${!n.read ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
                                        >
                                            <div className={`mt-1 w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500 ${!n.read ? 'bg-white/10 border-[#D1AE6A]/20 shadow-lg shadow-[#D1AE6A]/5' : 'bg-white/5 border-white/5'}`}>
                                                {React.cloneElement(getTypeIcon(n.type) as React.ReactElement, { className: "w-6 h-6 " + (getTypeIcon(n.type) as React.ReactElement).props.className.split(' ').filter((c: string) => !c.startsWith('w-') && !c.startsWith('h-')).join(' ') })}
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${n.type === 'BOOKING' ? 'text-[#D1AE6A]' : n.type === 'SERVICE' ? 'text-blue-400' : 'text-green-400'}`}>
                                                        {n.type}
                                                    </span>
                                                    {!n.read && (
                                                        <span className="w-2 h-2 bg-[#D1AE6A] rounded-full shadow-[0_0_8px_#D1AE6A]" />
                                                    )}
                                                </div>
                                                <h4 className={`text-lg font-bold ${!n.read ? 'text-white' : 'text-slate-300'}`}>{n.title}</h4>
                                                <p className={`text-base leading-relaxed ${!n.read ? 'text-slate-200' : 'text-slate-400 font-normal'}`}>
                                                    {n.message}
                                                </p>
                                                <div className="flex items-center gap-4 pt-2">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        <span className="mx-1">•</span>
                                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                            {n.read && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
