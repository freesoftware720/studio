
"use client";

import { Heart, Utensils, BookOpen, Trash2, Image as ImageIcon, Loader2, BarChart3, Info } from 'lucide-react'; // Added BarChart3, Info
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
  isLoadingNutrition?: boolean; // New prop
}

export function RecipeCard({ 
  recipe, 
  onSelectRecipe, 
  showFullDetails = false, 
  isDetailedView = false, 
  isGeneratingImage = false,
  isLoadingNutrition = false // New prop
}: RecipeCardProps) {
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

  // Determine default open accordion items
  const defaultAccordionValues: string[] = [];
  if (showFullDetails) {
    defaultAccordionValues.push("ingredients", "instructions");
    if (recipe.nutritionInfo || isLoadingNutrition) { // Open nutrition if available or loading
        defaultAccordionValues.push("nutrition");
    }
  }


  const cardContent = (
    <>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-headline font-semibold text-primary mb-1">{recipe.title}</h3>
          {recipe.userInput?.mealType && <p className="text-sm text-muted-foreground capitalize">{recipe.userInput.mealType}</p>}
          {recipe.userInput?.cuisine && <p className="text-sm text-muted-foreground capitalize">Cuisine: {recipe.userInput.cuisine}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleFavoriteToggle} 
            aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
            className={cn(
              "transition-colors",
              recipe.isFavorite ? "hover:bg-destructive/20" : "hover:bg-primary/20"
            )}
          >
            <Heart className={`h-6 w-6 ${recipe.isFavorite ? 'fill-destructive text-destructive' : 'text-primary'}`} />
          </Button>
          {isDetailedView && (
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRemoveRecipe} 
                aria-label="Delete recipe"
                className="hover:bg-destructive/20"
              >
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
          priority={isDetailedView}
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


      <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full">
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
        { (recipe.nutritionInfo || isLoadingNutrition) && (
            <AccordionItem value="nutrition">
                <AccordionTrigger className="text-lg font-semibold text-accent hover:no-underline">
                    <BarChart3 className="mr-2 h-5 w-5 text-accent" /> Nutrition & Health Tips
                </AccordionTrigger>
                <AccordionContent>
                    {isLoadingNutrition && !recipe.nutritionInfo && (
                        <div className="flex items-center justify-center py-6 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            <span>Analyzing nutrition...</span>
                        </div>
                    )}
                    {recipe.nutritionInfo && (
                        <div className="space-y-4 mt-2 text-foreground/90">
                            <div>
                                <h4 className="font-semibold text-md text-primary">Estimated Nutrition:</h4>
                                <ul className="list-disc list-inside pl-2 space-y-1 mt-1 text-sm">
                                    <li>Calories: {recipe.nutritionInfo.estimatedCalories}</li>
                                    <li>Protein: {recipe.nutritionInfo.proteinGrams}g</li>
                                    <li>Carbohydrates: {recipe.nutritionInfo.carbsGrams}g</li>
                                    <li>Fat: {recipe.nutritionInfo.fatGrams}g</li>
                                </ul>
                            </div>
                             {recipe.nutritionInfo.healthTips && recipe.nutritionInfo.healthTips.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-md text-primary">Health Tips:</h4>
                                    <ul className="list-disc list-inside pl-2 space-y-1 mt-1 text-sm">
                                    {recipe.nutritionInfo.healthTips.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                    </ul>
                                </div>
                            )}
                            {recipe.nutritionInfo.disclaimer && (
                                <p className="text-xs text-muted-foreground italic mt-3 flex items-start">
                                    <Info className="h-3 w-3 mr-1.5 mt-0.5 shrink-0"/>
                                    {recipe.nutritionInfo.disclaimer}
                                </p>
                            )}
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        )}
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
