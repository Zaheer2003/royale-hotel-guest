"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionProvider, useSession, signOut, signIn } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  loyaltyPoints?: number;
  language?: string;
  currency?: string;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchFullProfile = async (sessionUser: any) => {
      try {
        const res = await fetch(`/api/users/${sessionUser.id}`);
        const data = await res.json();

        if (data.user) {
          setUser({
            id: sessionUser.id,
            name: data.user.name || sessionUser.name,
            email: data.user.email || sessionUser.email,
            image: sessionUser.image,
            avatar: data.user.avatar || sessionUser.image || undefined,
            phone: data.user.phone,
            address: data.user.address,
            loyaltyPoints: data.user.loyaltyPoints,
            language: data.user.language,
            currency: data.user.currency,
          });
        }
      } catch (error) {
        console.error("Failed to fetch full profile", error);
        // Fallback to session data
        setUser({
          id: sessionUser.id || "",
          name: sessionUser.name || "",
          email: sessionUser.email || "",
          image: sessionUser.image,
          avatar: sessionUser.image || undefined,
        });
      }
    };

    if (session?.user) {
      // Optimistically set basic data first
      setUser(prev => ({
        ...prev,
        id: session.user?.id || "",
        name: session.user?.name || "",
        email: session.user?.email || "",
        image: session.user?.image,
        avatar: session.user?.image || undefined,
      }));

      // Then fetch the rest
      fetchFullProfile(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  const login = (userData: User) => {
    // This function is kept for backward compatibility. 
    // In a full migration, consumers should use signIn() directly.
    setUser(userData);
  };

  const logout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  const updateUserData = async (data: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...data };
      setUser(newUser);
      await update({ user: newUser });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser: updateUserData, isLoading: status === "loading" }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <AuthProviderWrapper>{children}</AuthProviderWrapper>
    </SessionProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
