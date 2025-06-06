
"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import type { Provider } from "@supabase/supabase-js";
import { Chrome, Facebook, Github } from "lucide-react"; // Example icons

interface SocialAuthButtonsProps {
  isLoading?: boolean;
  className?: string;
}

// Example: Define an array of providers you want to support
const socialProviders: { name: string; provider: Provider; icon: React.ElementType }[] = [
  { name: "Google", provider: "google", icon: Chrome },
  { name: "GitHub", provider: "github", icon: Github },
  // Add more providers as needed, e.g., Facebook, Apple, etc.
  // { name: "Facebook", provider: "facebook", icon: FacebookIcon }, 
];


export function SocialAuthButtons({ isLoading, className }: SocialAuthButtonsProps) {
  
  const handleOAuthLogin = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`, // Your OAuth callback URL
        },
      });
      if (error) throw error;
      // Redirects to provider's login page
    } catch (error: any) {
      console.error(`Error with ${provider} OAuth:`, error.message);
      // Handle error (e.g., show a toast)
    }
  };

  if (socialProviders.length === 0) {
    return null; // Don't render anything if no providers are configured
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      {socialProviders.map(({ name, provider, icon: IconComponent }) => (
        <Button
          key={provider}
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthLogin(provider)}
          disabled={isLoading}
        >
          <IconComponent className="mr-2 h-4 w-4" />
          Sign in with {name}
        </Button>
      ))}
      <p className="px-2 text-center text-xs text-muted-foreground">
        Social login is a placeholder. Full OAuth setup required.
      </p>
    </div>
  );
}

// Note: You'll need to configure OAuth providers in your Supabase project settings
// and handle the callback URL (e.g., /auth/callback) to complete the login.
