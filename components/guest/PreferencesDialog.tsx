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
import { Settings, Globe, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

interface PreferencesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PreferencesDialog({ open, onOpenChange }: PreferencesDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [prefs, setPrefs] = useState({
        language: 'English',
        currency: 'USD',
    });

    useEffect(() => {
        if (open && user?.id) {
            setLoading(true);
            fetch(`/api/users/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setPrefs({
                            language: data.user.language || 'English',
                            currency: data.user.currency || 'USD',
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
                body: JSON.stringify(prefs),
            });
            if (response.ok) {
                toast.success("Preferences updated successfully");
                onOpenChange(false);
            } else {
                toast.error("Failed to update preferences");
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
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10 rounded-full" />

                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Settings className="w-5 h-5 text-blue-400" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">Preferences</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400">
                        Customize your experience and localization settings
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-8 py-6">
                    <div className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5 text-blue-400" />
                                <h3 className="font-semibold text-white">Preferred Language</h3>
                            </div>
                            <select
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                value={prefs.language}
                                onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                            >
                                <option value="English">English</option>
                                <option value="Sinhala">Sinhala</option>
                                <option value="Tamil">Tamil</option>
                                <option value="French">French</option>
                            </select>
                        </div>

                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-green-400" />
                                <h3 className="font-semibold text-white">Preferred Currency</h3>
                            </div>
                            <select
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-green-500/50 outline-none"
                                value={prefs.currency}
                                onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
                            >
                                <option value="USD">USD ($)</option>
                                <option value="LKR">LKR (Rs.)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                    </div>

                    <div className="p-4 bg-[#D1AE6A]/5 rounded-xl border border-[#D1AE6A]/20">
                        <p className="text-slate-400 text-xs leading-relaxed">
                            <span className="text-[#D1AE6A] font-bold">Note:</span> These settings will be applied to your future bookings and billing statements.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-2 gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Save Preferences
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
