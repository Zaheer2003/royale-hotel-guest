"use client"
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Bell, User, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Hotel Logo and Name */}
        <div className="flex items-center space-x-3 group">
          <Image 
            src="/LOGO.svg" 
            alt="Hotel Logo" 
            width={100} 
            height={100} 
            className="object-contain transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notification Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-105"
          >
            <Bell className="w-5 h-5 text-foreground/80 hover:text-foreground transition-colors" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg">
              <span className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75"></span>
            </span>
          </Button>

          <Separator orientation="vertical" className="h-6 bg-muted/40" />

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-105"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-xl bg-background/95 border-border/50">
              <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-primary/10">
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-primary/10">
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="hover:bg-primary/10">
                <Settings className="w-4 h-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6 bg-muted/40" />

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-3 px-3 py-2 h-10 rounded-full hover:bg-primary/10 transition-all duration-200 hover:scale-105 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-foreground/90 font-medium text-sm hidden md:block group-hover:text-foreground transition-colors">
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 backdrop-blur-xl bg-background/95 border-border/50">
              <DropdownMenuItem className="flex items-center space-x-3 hover:bg-primary/10 transition-colors">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-3 hover:bg-primary/10 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem 
                className="flex items-center space-x-3 text-destructive hover:bg-destructive/10 transition-colors"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};