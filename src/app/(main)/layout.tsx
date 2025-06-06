
"use client"; // This layout needs to be a client component for hooks

import type React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/feature/loading-spinner';

// List of public paths that don't require authentication within the (main) group
const publicPathsWithinMain: string[] = []; // Initialize as empty array if no specific public paths

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error getting session:", error);
        setIsAuthenticated(false);
      } else if (session) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setIsAuthenticated(true);
          // If user was on an auth page and logs in, redirect to home
          if (pathname.startsWith('/auth')) {
            router.replace('/');
          }
        } else {
          setIsAuthenticated(false);
          // If user logs out and is on a protected page, redirect to welcome page
           if (!pathname.startsWith('/auth') && !publicPathsWithinMain.includes(pathname)) {
            router.replace('/auth/welcome'); 
          }
        }
        // No need to setIsLoading here as this is for subsequent changes
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname]);


  useEffect(() => {
    // This effect handles redirection after the initial auth check or on auth state changes
    if (!isLoading) { // Only run if initial auth check is complete
      if (!isAuthenticated && !pathname.startsWith('/auth') && !publicPathsWithinMain.includes(pathname)) {
        router.replace('/auth/welcome');
      }
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner text="Initializing SmartChef..." size={48} />
      </div>
    );
  }

  // If initial load is done, and user is NOT authenticated, AND is on a protected path,
  // this will show a brief loading spinner while the useEffect above handles redirection.
  if (!isAuthenticated && !pathname.startsWith('/auth') && !publicPathsWithinMain.includes(pathname)) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner text="Redirecting..." size={48} />
      </div>
    );
  }
  
  // If user is authenticated OR is on an auth page OR on a public page within (main)
  if (isAuthenticated || pathname.startsWith('/auth') || publicPathsWithinMain.includes(pathname)) {
      if (pathname.startsWith('/auth')) { // Auth pages have their own layout (defined in app/auth/layout.tsx)
          return <>{children}</>; // Render children directly, auth layout handles its own shell
      }
      // Authenticated users or users on public paths within (main) get the AppShell
      return <AppShell>{children}</AppShell>;
  }
  
  // Fallback: This case should ideally not be reached if redirection logic is correct.
  return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner text="Please wait..." size={48} />
      </div>
  );
}
