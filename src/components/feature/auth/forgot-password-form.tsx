
"use client";

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Send } from 'lucide-react';
import { LoadingSpinner } from '@/components/feature/loading-spinner';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setEmailSent(false);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password-confirm`, // URL for password update page
      });

      if (resetError) {
        throw resetError;
      }
      
      setEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email inbox for instructions to reset your password.",
        variant: "default",
      });

    } catch (e: any) {
      console.error("Forgot password error:", e);
      setError(e.message || "An unexpected error occurred.");
      toast({
        title: "Error Sending Reset Email",
        description: e.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-4 text-center">
        <Send className="h-12 w-12 text-primary mx-auto animate-pulse" />
        <h2 className="text-xl font-semibold text-primary">Check Your Email</h2>
        <p className="text-muted-foreground">
          If an account exists for the email you entered, you will receive a password reset link shortly.
        </p>
        <Button variant="outline" asChild>
          <Link href="/auth/login">Back to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
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
      
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3" disabled={isLoading}>
        {isLoading ? <LoadingSpinner size={20} /> : <Send className="mr-2 h-5 w-5" />}
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>
      
      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link href="/auth/login" passHref>
          <Button variant="link" className="font-semibold text-accent p-0 h-auto hover:underline" disabled={isLoading}>Login</Button>
        </Link>
      </p>
    </form>
  );
}
