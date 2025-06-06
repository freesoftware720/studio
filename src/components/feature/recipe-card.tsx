
"use client";

import { Heart, Utensils, BookOpen, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/glass-card';
import type { Recipe } from '@/lib/types';
import { useRecipeStore } from '@/hooks/use-recipe-store';
import { ShareButtons } from './share-buttons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe?: (recipe: Recipe) => void;
  showFullDetails?: boolean;
  isDetailedView?: boolean;
  isGeneratingImage?: boolean; 
}

export function RecipeCard({ recipe, onSelectRecipe, showFullDetails = false, isDetailedView = false, isGeneratingImage = false }: RecipeCardProps) {
  const { toggleFavorite, removeRecipe } = useRecipeStore();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(recipe.id);
  };
  
  const handleRemoveRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecipe(recipe.id);
  };

  const placeholderHint = recipe.title 
    ? recipe.title.toLowerCase().split(/\s+/).slice(0, 2).join(' ') 
    : "food cooking";
  
  const displayImageUrl = recipe.imageUrl || `https://placehold.co/600x300.png`;

  const cardContent = (
    <>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-headline font-semibold text-primary mb-1">{recipe.title}</h3>
          {recipe.userInput?.mealType && <p className="text-sm text-muted-foreground capitalize">{recipe.userInput.mealType}</p>}
          {recipe.userInput?.cuisine && <p className="text-sm text-muted-foreground capitalize">Cuisine: {recipe.userInput.cuisine}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleFavoriteToggle} aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <Heart className={`h-6 w-6 ${recipe.isFavorite ? 'fill-hotpink text-hotpink' : 'text-primary'}`} />
          </Button>
          {isDetailedView && (
             <Button variant="ghost" size="icon" onClick={handleRemoveRecipe} aria-label="Delete recipe">
                <Trash2 className="h-6 w-6 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] rounded-md mb-4 overflow-hidden bg-muted/30">
        <Image 
          src={displayImageUrl}
          alt={recipe.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn("object-cover transition-opacity duration-500", isGeneratingImage ? "opacity-30" : "opacity-100")}
          priority={isDetailedView} // Prioritize image if it's the main content on the page
          data-ai-hint={!recipe.imageUrl ? placeholderHint : undefined}
        />
        {isGeneratingImage && !recipe.imageUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
            <p className="text-sm">Generating Image...</p>
          </div>
        )}
         {!isGeneratingImage && !recipe.imageUrl && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white/80 opacity-0 hover:opacity-100 transition-opacity duration-300">
            <ImageIcon className="h-10 w-10 mb-2" />
            <p className="text-sm text-center">AI image will appear here</p>
          </div>
         )}
      </div>


      <Accordion type="multiple" defaultValue={showFullDetails ? ["ingredients", "instructions"] : []} className="w-full">
        <AccordionItem value="ingredients">
          <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
            <Utensils className="mr-2 h-5 w-5 text-accent" /> Ingredients
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc list-inside pl-2 space-y-1 mt-2 text-foreground/90">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="instructions">
          <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
            <BookOpen className="mr-2 h-5 w-5 text-accent" /> Instructions
          </AccordionTrigger>
          <AccordionContent>
            <ol className="list-decimal list-inside pl-2 space-y-2 mt-2 text-foreground/90">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {isDetailedView && <ShareButtons recipe={recipe} />}
    </>
  );

  if (onSelectRecipe) {
    return (
      <GlassCard 
        className="cursor-pointer hover:border-primary/50 transition-colors duration-200"
        onClick={() => onSelectRecipe(recipe)}
      >
        {cardContent}
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      {cardContent}
    </GlassCard>
  );
}
