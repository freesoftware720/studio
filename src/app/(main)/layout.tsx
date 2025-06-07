
"use client"; 

import type React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/feature/loading-spinner';
import { RecipeProvider } from '@/context/recipe-context'; // Import the provider

const publicPathsWithinMain: string[] = []; 

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
          if (pathname.startsWith('/auth')) {
            router.replace('/');
          }
        } else {
          setIsAuthenticated(false);
           if (!pathname.startsWith('/auth') && !publicPathsWithinMain.includes(pathname)) {
            router.replace('/auth/welcome'); 
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname]);


  useEffect(() => {
    if (!isLoading) { 
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

  if (!isAuthenticated && !pathname.startsWith('/auth') && !publicPathsWithinMain.includes(pathname)) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner text="Redirecting..." size={48} />
      </div>
    );
  }
  
  if (isAuthenticated || pathname.startsWith('/auth') || publicPathsWithinMain.includes(pathname)) {
      if (pathname.startsWith('/auth')) { 
          return <>{children}</>; 
      }
      // Wrap authenticated routes or public main paths with RecipeProvider
      return (
        <RecipeProvider>
          <AppShell>{children}</AppShell>
        </RecipeProvider>
      );
  }
  
  return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner text="Please wait..." size={48} />
      </div>
  );
}

    