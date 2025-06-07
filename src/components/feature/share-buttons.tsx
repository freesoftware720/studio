
"use client";

import { useState, useEffect } from 'react';
import { Copy, Share2 } from 'lucide-react'; // Removed Twitter, Facebook, Linkedin
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Recipe } from '@/lib/types';

interface ShareButtonsProps {
  recipe: Recipe;
}

export function ShareButtons({ recipe }: ShareButtonsProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    setIsClient(true);
    if (typeof window !== 'undefined') {
      // For now, we'll just use the current page URL.
      // In a real app, you might have dedicated recipe URLs: `${window.location.origin}/recipe/${recipe.id}`
      setShareUrl(window.location.href); 
    }
  }, [recipe.id]);


  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast({ title: "Link Copied!", description: "Recipe link copied to clipboard.", variant: "default" });
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        toast({ title: "Error", description: "Could not copy link.", variant: "destructive" });
      });
  };

  // Removed socialShare function as it's no longer needed

  if (!isClient || !shareUrl) { 
    // Render a placeholder or null on server/before URL is ready to avoid hydration issues
    // Or, render a disabled button
    return (
      <div className="flex items-center space-x-2 mt-4">
        <Button variant="outline" size="icon" aria-label="Copy recipe link" className="border-primary hover:bg-primary/20" disabled>
          <Copy className="h-5 w-5 text-primary" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 mt-4">
      <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy recipe link" className="border-primary hover:bg-primary/20">
        <Copy className="h-5 w-5 text-primary" />
      </Button>
      {/* Removed Twitter, Facebook, and LinkedIn buttons */}
    </div>
  );
}

