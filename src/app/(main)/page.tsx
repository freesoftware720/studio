
"use client";

import { useState } from "react";
import { IngredientForm } from "@/components/feature/ingredient-form";
import { RecipeCard } from "@/components/feature/recipe-card";
import { RecipeChatbot } from "@/components/feature/recipe-chatbot";
import { LoadingSpinner } from "@/components/feature/loading-spinner";
import { useRecipeStore } from "@/hooks/use-recipe-store";
import type { Recipe, RecipeQuestionContext } from "@/lib/types";
import { generateRecipe, type GenerateRecipeInput } from "@/ai/flows/generate-recipe";
import { AlertTriangle, ChefHat } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addRecipeToHistory } = useRecipeStore();
  const { toast } = useToast();
  
  const [chatbotContext, setChatbotContext] = useState<RecipeQuestionContext | null>(null);

  const handleRecipeGeneration = async (data: GenerateRecipeInput) => {
    setIsLoading(true);
    setError(null);
    setCurrentRecipe(null);
    setChatbotContext(null);

    try {
      const generatedData = await generateRecipe(data);
      // The `data` object now includes the language, cuisine, etc.
      const newRecipe = addRecipeToHistory(generatedData, data); 
      setCurrentRecipe(newRecipe);
      setChatbotContext({
        recipeTitle: newRecipe.title,
        recipeIngredients: newRecipe.ingredients,
        recipeInstructions: newRecipe.instructions,
      });
      toast({ title: "Recipe Generated!", description: `Successfully generated "${newRecipe.title}".`, variant: "default" });
    } catch (err) {
      console.error("Failed to generate recipe:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate recipe. ${errorMessage}`);
      toast({ title: "Error Generating Recipe", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <IngredientForm onSubmit={handleRecipeGeneration} isLoading={isLoading} />

      {error && (
        <GlassCard className="border-destructive/50">
          <div className="flex items-center text-destructive">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <p>{error}</p>
          </div>
        </GlassCard>
      )}

      {isLoading && <LoadingSpinner text="Generating your masterpiece..." className="py-10" />}

      {!isLoading && !currentRecipe && !error && (
         <GlassCard>
          <div className="text-center py-10 text-muted-foreground">
            <ChefHat className="mx-auto h-16 w-16 mb-4 text-primary opacity-50 animate-bobble" />
            <h2 className="text-xl font-semibold mb-2">Welcome to SmartChef!</h2>
            <p>Enter your ingredients and preferences above, and let our AI whip up a delicious recipe for you.</p>
          </div>
        </GlassCard>
      )}
      
      {currentRecipe && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <RecipeCard recipe={currentRecipe} showFullDetails={true} isDetailedView={true}/>
          </div>
          <div className="lg:col-span-1">
             <RecipeChatbot recipeContext={chatbotContext} />
          </div>
        </div>
      )}
    </div>
  );
}
