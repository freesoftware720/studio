
"use client";

import { useState } from "react";
import { IngredientForm } from "@/components/feature/ingredient-form";
import { RecipeCard } from "@/components/feature/recipe-card";
import { RecipeChatbot } from "@/components/feature/recipe-chatbot";
import { LoadingSpinner } from "@/components/feature/loading-spinner";
import { useRecipeStore } from "@/hooks/use-recipe-store";
import type { Recipe, RecipeQuestionContext } from "@/lib/types";
import { generateRecipe, type GenerateRecipeInput } from "@/ai/flows/generate-recipe";
import { generateRecipeImage } from "@/ai/flows/generate-recipe-image";
import { AlertTriangle, ChefHat } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveRecipe, updateRecipeImage } = useRecipeStore(); // Changed from addRecipeToHistory
  const { toast } = useToast();
  
  const [chatbotContext, setChatbotContext] = useState<RecipeQuestionContext | null>(null);

  const handleRecipeGeneration = async (data: GenerateRecipeInput) => {
    setIsLoading(true);
    setIsGeneratingImage(false);
    setError(null);
    setCurrentRecipe(null);
    setChatbotContext(null);

    let newRecipeBase: Recipe | null = null;

    try {
      // 1. Generate recipe text
      const generatedTextData = await generateRecipe(data);
      
      // 2. Save initial recipe object to DB (which also adds to local state via store)
      // Pass both core recipe data and original user input
      newRecipeBase = await saveRecipe(generatedTextData, data); 

      if (!newRecipeBase) {
        throw new Error("Failed to save the recipe to the database.");
      }

      setCurrentRecipe(newRecipeBase); // Display text part first
      setChatbotContext({
        recipeTitle: newRecipeBase.title,
        recipeIngredients: newRecipeBase.ingredients,
        recipeInstructions: newRecipeBase.instructions,
      });
      toast({ title: "Recipe Generated!", description: `Successfully generated "${newRecipeBase.title}". Image generation started...`, variant: "default" });

      // 3. Asynchronously generate image
      setIsGeneratingImage(true);
      try {
        const imageData = await generateRecipeImage({ recipeTitle: newRecipeBase.title });
        if (imageData.imageUrl && newRecipeBase) {
          await updateRecipeImage(newRecipeBase.id, imageData.imageUrl); // await this
          // The store update should trigger a re-render if setCurrentRecipe relies on store's recipe object
           setCurrentRecipe(prev => prev && prev.id === newRecipeBase!.id ? { ...prev, imageUrl: imageData.imageUrl } : prev);
           toast({ title: "Image Generated!", description: `Image for "${newRecipeBase.title}" is ready.`, variant: "default" });
        }
      } catch (imgErr) {
        console.error("Failed to generate recipe image:", imgErr);
        toast({ title: "Image Generation Issue", description: `Could not generate image for "${newRecipeBase?.title || 'recipe'}". Displaying placeholder.`, variant: "default" });
      } finally {
        setIsGeneratingImage(false);
      }

    } catch (err) {
      console.error("Failed to generate recipe text or save:", err);
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
      {!isLoading && isGeneratingImage && currentRecipe && <LoadingSpinner text={`Generating image for "${currentRecipe.title}"...`} className="py-5"/>}


      {!isLoading && !currentRecipe && !error && (
         <div className="static-gradient-prompt-wrapper rounded-lg">
          <div className="static-gradient-prompt-inner">
            <div className="text-center py-10 text-muted-foreground">
              <ChefHat className="mx-auto h-16 w-16 mb-4 text-primary opacity-50 animate-bobble" />
              <h2 className="text-xl font-semibold mb-2">Welcome to SmartChef!</h2>
              <p>Enter your ingredients and preferences above, and let our AI whip up a delicious recipe for you.</p>
            </div>
          </div>
        </div>
      )}
      
      {currentRecipe && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <RecipeCard recipe={currentRecipe} showFullDetails={true} isDetailedView={true} isGeneratingImage={isGeneratingImage && !currentRecipe.imageUrl}/>
          </div>
          <div className="lg:col-span-1">
             <RecipeChatbot recipeContext={chatbotContext} />
          </div>
        </div>
      )}
    </div>
  );
}
