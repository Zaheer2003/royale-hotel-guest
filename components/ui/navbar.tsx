"use client"
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Bell, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&limit=5`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user?.id]);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className={`bg-slate-900 border-b border-white/10 px-6 py-4 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mx-auto">
        {/* Left side - Hotel Logo and Name */}
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => router.push('/guest')}>
          <div className="bg-white/5 p-2 rounded-lg border border-white/5">
            <Image
              src="/LOGO.svg"
              alt="Hotel Logo"
              width={40}
              height={40}
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 hidden md:block">
            Royale Hotel
          </span>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Notification Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-[#D1AE6A] rounded-full animate-pulse shadow-[0_0_10px_rgba(209,174,106,0.5)]" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-white/10 text-slate-200 shadow-2xl backdrop-blur-3xl p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-sm font-bold text-white">Notifications</h3>
                {unreadCount > 0 && <span className="text-[10px] bg-[#D1AE6A] text-white px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <Bell className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={`flex flex-col items-start gap-1 p-4 focus:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 ${!n.read ? 'bg-white/[0.03]' : 'opacity-70'}`}
                    >
                      <div className="flex items-center gap-2">
                        {!n.read && <div className={`w-1.5 h-1.5 rounded-full ${n.type === 'BOOKING' ? 'bg-[#D1AE6A]' : n.type === 'SERVICE' ? 'bg-blue-400' : 'bg-green-400'}`} />}
                        <span className={`font-bold text-[10px] uppercase tracking-widest ${n.type === 'BOOKING' ? 'text-[#D1AE6A]' : n.type === 'SERVICE' ? 'text-blue-400' : 'text-green-400'}`}>
                          {n.title}
                        </span>
                      </div>
                      <p className={`text-sm leading-snug ${n.read ? 'text-slate-400' : 'text-slate-200'}`}>{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-1 uppercase font-medium">
                        {new Date(n.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                          ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              <div className="p-2 border-t border-white/10 bg-white/5">
                <Button
                  variant="ghost"
                  className="w-full text-xs text-slate-400 hover:text-white hover:bg-transparent h-8"
                  onClick={() => router.push('/guest/notifications')}
                >
                  View all activity
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-px bg-white/10 mx-2" />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-3 px-2 md:px-3 py-2 h-10 rounded-full hover:bg-white/10 text-slate-200 hover:text-white transition-all group border border-transparent hover:border-white/10"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-[#D1AE6A] to-[#8D5D11] flex items-center justify-center shadow-lg shadow-[#8D5D11]/20 text-white font-bold text-xs ring-2 ring-[#D1AE6A]/20 group-hover:ring-[#D1AE6A]/40 transition-all">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || <User className="w-4 h-4" />
                  )}
                </div>
                <span className="font-medium text-sm hidden md:block">
                  {user?.name || 'Guest'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10 text-slate-200 shadow-xl backdrop-blur-3xl">
              <div className="px-2 py-1.5 text-sm font-semibold text-white border-b border-white/10 mb-1">
                {user?.name}
                <div className="text-xs text-slate-500 font-normal truncate">{user?.email}</div>
              </div>
              <DropdownMenuItem
                className="flex items-center space-x-2 focus:bg-white/10 focus:text-white cursor-pointer group"
                onClick={() => router.push('/guest?tab=profile')}
              >
                <User className="w-4 h-4 text-slate-400 group-hover:text-[#D1AE6A] transition-colors" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="flex items-center space-x-2 text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer group"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 group-hover:text-red-300 transition-colors" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};