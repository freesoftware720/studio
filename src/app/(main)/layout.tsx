
"use client"; // This layout needs to be a client component for hooks

import type React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/feature/loading-spinner';

// List of public paths that don't require authentication within the (main) group
// Typically, auth pages would be in a separate route group or outside (main)
const publicPathsWithinMain = ['/some-public-page-in-main']; // Example

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
          // If user logs out and is on a protected page, redirect to login
           if (!pathname.startsWith('/auth') && !publicPathsWithinMain.includes(pathname)) {
            router.replace('/auth/login');
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
    if (!isLoading && !isAuthenticated && !pathname.startsWith('/auth') && !publicPathsWithinMain.includes(pathname)) {
      router.replace('/auth/welcome'); // Or '/auth/login'
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner text="Initializing SmartChef..." size={48} />
      </div>
    );
  }

  // If user is not authenticated and trying to access a protected page,
  // this check handles the initial load scenario before the effect fully kicks in.
  // The effect above will handle subsequent changes and redirection.
  if (!isAuthenticated && !pathname.startsWith('/auth') && !publicPathsWithinMain.includes(pathname)) {
     // Show loading or a minimal UI while redirecting, or null if redirect is fast
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner text="Redirecting..." size={48} />
      </div>
    );
  }
  
  // If user is authenticated OR is on a public/auth page, render the AppShell or children
  if (isAuthenticated || pathname.startsWith('/auth') || publicPathsWithinMain.includes(pathname)) {
      if (pathname.startsWith('/auth')) { // Auth pages have their own layout
          return <>{children}</>;
      }
      return <AppShell>{children}</AppShell>;
  }
  
  // Fallback, should ideally be handled by redirection logic
  return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner text="Please wait..." size={48} />
      </div>
  );
}
