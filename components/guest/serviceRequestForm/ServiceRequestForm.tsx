"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from 'sonner';
import {
  Utensils,
  Car,
  Sparkles,
  Wrench,
  ConciergeBell,
  BedDouble,
  AlertCircle,
  Clock,
  CheckCircle2,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceRequestFormProps {
  onSuccess?: () => void;
}

export const ServiceRequestForm: React.FC<ServiceRequestFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceType || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to submit a request');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          description,
          priority,
          guestId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to submit request');

      toast.success('Service Request Received', {
        description: "We'll attend to your request shortly."
      });

      setServiceType('');
      setDescription('');
      setPriority('medium');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error", { description: "Failed to submit service request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'room-service': return <Utensils className="h-4 w-4" />;
      case 'dining': return <Utensils className="h-4 w-4" />;
      case 'transport': return <Car className="h-4 w-4" />;
      case 'housekeeping': return <Sparkles className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'concierge': return <ConciergeBell className="h-4 w-4" />;
      default: return <BedDouble className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-0 bg-white/5 backdrop-blur-md h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ConciergeBell className="h-5 w-5 text-[#D1AE6A]" />
          Request Service
        </CardTitle>
        <CardDescription className="text-slate-400">
          How can we enhance your stay today?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service-type" className="text-slate-200">Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger id="service-type" className="bg-black/20 border-white/10 text-white h-12">
                <SelectValue placeholder="Select a service..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="room-service">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-[#D1AE6A]" /> Room Service
                  </div>
                </SelectItem>
                <SelectItem value="transport">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-[#D1AE6A]" /> Transport
                  </div>
                </SelectItem>
                <SelectItem value="housekeeping">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#D1AE6A]" /> Housekeeping
                  </div>
                </SelectItem>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-[#D1AE6A]" /> Maintenance
                  </div>
                </SelectItem>
                <SelectItem value="concierge">
                  <div className="flex items-center gap-2">
                    <ConciergeBell className="h-4 w-4 text-[#D1AE6A]" /> Concierge
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Priority Level</Label>
            <ToggleGroup
              type="single"
              value={priority}
              onValueChange={(val) => val && setPriority(val)}
              className="justify-start bg-black/20 p-1 rounded-lg border border-white/5"
            >
              <ToggleGroupItem value="low" className="data-[state=on]:bg-green-500/20 data-[state=on]:text-green-400 text-slate-400 hover:text-slate-200 flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Normal
              </ToggleGroupItem>
              <ToggleGroupItem value="medium" className="data-[state=on]:bg-yellow-500/20 data-[state=on]:text-yellow-400 text-slate-400 hover:text-slate-200 flex-1">
                <Clock className="h-4 w-4 mr-2" />
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem value="high" className="data-[state=on]:bg-red-500/20 data-[state=on]:text-red-400 text-slate-400 hover:text-slate-200 flex-1">
                <AlertCircle className="h-4 w-4 mr-2" />
                Urgent
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">Request Details</Label>
            <Textarea
              id="description"
              placeholder="Please describe your request in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="bg-black/20 border-white/10 text-white resize-none focus-visible:ring-[#D1AE6A]/50"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#D1AE6A] hover:bg-[#8D5D11] text-white shadow-lg shadow-[#D1AE6A]/20 h-12 text-lg font-medium transition-all active:scale-[0.98]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Request
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
