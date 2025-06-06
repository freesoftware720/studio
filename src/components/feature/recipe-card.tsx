"use client";

import { Heart, Utensils, BookOpen, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/glass-card';
import type { Recipe } from '@/lib/types';
import { useRecipeStore } from '@/hooks/use-recipe-store';
import { ShareButtons } from './share-buttons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Image from 'next/image';

interface RecipeCardProps {
  recipe: Recipe;
  onSelectRecipe?: (recipe: Recipe) => void; // For chatbot context
  showFullDetails?: boolean; // To control if all details are expanded by default
  isDetailedView?: boolean; // If true, shows share buttons, etc.
}

export function RecipeCard({ recipe, onSelectRecipe, showFullDetails = false, isDetailedView = false }: RecipeCardProps) {
  const { toggleFavorite, removeRecipe } = useRecipeStore();

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click if any
    toggleFavorite(recipe.id);
  };
  
  const handleRemoveRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecipe(recipe.id);
  };

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

      <Image 
        src={`https://placehold.co/600x300.png`} 
        alt={recipe.title}
        width={600}
        height={300}
        className="w-full h-auto rounded-md mb-4 object-cover"
        data-ai-hint="food cooking"
      />

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
