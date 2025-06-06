
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
import { AlertTriangle, LogIn as LoginIcon } from 'lucide-react';
import { LoadingSpinner } from '@/components/feature/loading-spinner';
import { SocialAuthButtons } from './social-auth-buttons';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        throw signInError;
      }
      
      toast({
        title: "Login Successful!",
        description: "Welcome back to SmartChef!",
        variant: "default",
      });
      router.push('/'); // Redirect to homepage or dashboard
      router.refresh(); // Important to re-fetch server-side data like user state

    } catch (e: any) {
      console.error("Login error:", e);
      setError(e.message || "An unexpected error occurred during login.");
      toast({
        title: "Login Failed",
        description: e.message || "Please check your credentials and try again.",
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
          <AlertTitle>Login Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/auth/forgot-password" passHref>
            <Button variant="link" size="sm" className="p-0 h-auto text-xs text-accent hover:underline" disabled={isLoading}>
              Forgot password?
            </Button>
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="••••••••"
          className="bg-background/50 border-white/20 focus:border-primary focus-visible:ring-primary"
          disabled={isLoading}
        />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>
      
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
        {isLoading ? <LoadingSpinner size={20} /> : <LoginIcon className="mr-2 h-5 w-5" />}
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      <SocialAuthButtons isLoading={isLoading} />
      
      <p className="text-center text-sm text-muted-foreground">
        Don’t have an account?{' '}
        <Link href="/auth/register" passHref>
          <Button variant="link" className="font-semibold text-accent p-0 h-auto hover:underline" disabled={isLoading}>Sign up</Button>
        </Link>
      </p>
    </form>
  );
}
