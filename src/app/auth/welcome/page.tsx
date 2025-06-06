
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LoadingSpinner } from '@/components/feature/loading-spinner';


export default function WelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace('/'); // User is already logged in, redirect to main app
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner text="Loading SmartChef..." size={48} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
      <div className="relative mb-6">
        {/* Placeholder for Lottie Animation or Animated Background */}
        <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
          <ChefHat className="h-24 w-24 text-primary animate-rgb-icon" />
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-primary tracking-tight">
        Welcome to SmartChef
      </h1>
      <p className="text-xl text-muted-foreground">
        AI Recipes, Your Way.
      </p>
      <p className="max-w-md text-foreground/80">
        Discover delicious recipes tailored to your ingredients and preferences, powered by cutting-edge AI. Let's get cooking!
      </p>
      
      <Button 
        size="lg" 
        className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
        asChild
      >
        <Link href="/auth/register">
          <Sparkles className="mr-2 h-5 w-5" />
          Get Started
        </Link>
      </Button>

      <div className="pt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-accent hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
