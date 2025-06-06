"use client";

import { useState, useEffect } from 'react';
import { Copy, Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Recipe } from '@/lib/types';

interface ShareButtonsProps {
  recipe: Recipe;
}

export function ShareButtons({ recipe }: ShareButtonsProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Ensure this runs only on the client
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

  const socialShare = (platformUrl: string) => {
    if (!shareUrl) return;
    window.open(`${platformUrl}${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(recipe.title)}`, '_blank');
  };

  if (!shareUrl) {
    return null; // Or a loading state if preferred
  }

  return (
    <div className="flex items-center space-x-2 mt-4">
      <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy recipe link" className="border-accent hover:bg-accent/20">
        <Copy className="h-5 w-5 text-accent" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => socialShare('https://twitter.com/intent/tweet?url=')} aria-label="Share on Twitter" className="border-accent hover:bg-accent/20">
        <Twitter className="h-5 w-5 text-accent" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => socialShare('https://www.facebook.com/sharer/sharer.php?u=')} aria-label="Share on Facebook" className="border-accent hover:bg-accent/20">
        <Facebook className="h-5 w-5 text-accent" />
      </Button>
       <Button variant="outline" size="icon" onClick={() => socialShare('https://www.linkedin.com/sharing/share-offsite/?url=')} aria-label="Share on LinkedIn" className="border-accent hover:bg-accent/20">
        <Linkedin className="h-5 w-5 text-accent" />
      </Button>
    </div>
  );
}
