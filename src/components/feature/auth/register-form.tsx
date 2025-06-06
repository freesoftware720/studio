
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, UserPlus } from 'lucide-react';
import { LoadingSpinner } from '@/components/feature/loading-spinner';
import { SocialAuthButtons } from './social-auth-buttons';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"], // Error path for confirmPassword field
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        // This case can happen if email confirmation is required and the user already exists but is unconfirmed.
        // Supabase might return a user object but no session.
        setError("This email may already be registered or require confirmation. Please check your inbox or try logging in.");
         toast({
          title: "Registration Pending",
          description: "If this email is new, please check your inbox to confirm your email address. Otherwise, try logging in.",
          variant: "default",
        });
        setIsLoading(false);
        return;
      }
      
      // Handle email confirmation if enabled in Supabase settings
      if (signUpData.user && !signUpData.session) {
         toast({
          title: "Registration Successful!",
          description: "Please check your email to confirm your account.",
          variant: "default",
        });
        router.push('/auth/login?message=check-email'); // Optional: Redirect to login with a message
      } else if (signUpData.user && signUpData.session) {
        toast({
          title: "Registration Successful!",
          description: "Welcome to SmartChef! You are now logged in.",
          variant: "default",
        });
        router.push('/'); // Redirect to homepage or dashboard
        router.refresh();
      } else {
        // Fallback for unexpected scenarios
         throw new Error("Registration completed, but user session not established. Please try logging in.");
      }

    } catch (e: any) {
      console.error("Registration error:", e);
      setError(e.message || "An unexpected error occurred during registration.");
      toast({
        title: "Registration Failed",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Registration Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          {...register("fullName")}
          placeholder="John Doe"
          className="bg-background/50 border-white/20 focus:border-primary focus-visible:ring-primary"
          disabled={isLoading}
        />
        {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="you@example.com"
          className="bg-background/50 border-white/20 focus:border-primary focus-visible:ring-primary"
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="•••••••• (min. 8 characters)"
          className="bg-background/50 border-white/20 focus:border-primary focus-visible:ring-primary"
          disabled={isLoading}
        />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          placeholder="••••••••"
          className="bg-background/50 border-white/20 focus:border-primary focus-visible:ring-primary"
          disabled={isLoading}
        />
        {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>}
      </div>
      
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
        {isLoading ? <LoadingSpinner size={20} /> : <UserPlus className="mr-2 h-5 w-5" />}
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>

      <SocialAuthButtons isLoading={isLoading} />
      
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" passHref>
          <Button variant="link" className="font-semibold text-accent p-0 h-auto hover:underline" disabled={isLoading}>Login</Button>
        </Link>
      </p>
    </form>
  );
}
