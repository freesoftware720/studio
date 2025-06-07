
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
import { analyzeRecipeNutrition, type AnalyzeRecipeNutritionOutput } from "@/ai/flows/analyze-recipe-nutrition"; // New
import { AlertTriangle, ChefHat, ScanLine, BarChart3 } from "lucide-react"; // Added BarChart3
import GlassCard from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { IngredientScannerModal } from "@/components/feature/ingredient-scanner-modal";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false); // New state for nutrition loading
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveRecipe, updateRecipeImage, updateRecipeNutritionInfo } = useRecipeStore(); // Added updateRecipeNutritionInfo
  const { toast } = useToast();
  
  const [chatbotContext, setChatbotContext] = useState<RecipeQuestionContext | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [ingredientsFromScanner, setIngredientsFromScanner] = useState<string | undefined>(undefined);

  const handleRecipeGeneration = async (data: GenerateRecipeInput) => {
    setIsLoading(true);
    setIsGeneratingImage(false);
    setIsLoadingNutrition(false);
    setError(null);
    setCurrentRecipe(null);
    setChatbotContext(null);

    let newRecipeBase: Recipe | null = null;

    try {
      // 1. Generate Recipe Text
      const generatedTextData = await generateRecipe(data);
      
      // Immediately set basic recipe to show something to the user
      const tempRecipe: Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'imageUrl' | 'userId' | 'userInput' | 'nutritionInfo'> & { userInput: GenerateRecipeInput } = {
        ...generatedTextData,
        userInput: data,
      };
      // Create a temporary partial recipe for UI update
      const partialRecipeForUi: Partial<Recipe> & GenerateRecipeInput = {
          title: generatedTextData.title,
          ingredients: generatedTextData.ingredients,
          instructions: generatedTextData.instructions,
          userInput: data,
      };
      setCurrentRecipe(partialRecipeForUi as Recipe); // Cast to Recipe for UI, knowing some fields are missing


      // 2. Save initial recipe (without nutrition yet, that will be an update)
      // No, we will get nutrition first then save.
      // newRecipeBase = await saveRecipe(generatedTextData, data); 
      // if (!newRecipeBase) {
      //   throw new Error("Failed to save the recipe to the database.");
      // }
      // setCurrentRecipe(newRecipeBase); // Update with full recipe from DB

      toast({ title: "Recipe Generated!", description: `Successfully generated "${generatedTextData.title}". Analyzing nutrition...`, variant: "default" });

      // 3. Analyze Nutrition
      setIsLoadingNutrition(true);
      let nutritionData: AnalyzeRecipeNutritionOutput | undefined = undefined;
      try {
        nutritionData = await analyzeRecipeNutrition({
          title: generatedTextData.title,
          ingredients: generatedTextData.ingredients,
          instructions: generatedTextData.instructions,
        });
        setCurrentRecipe(prev => prev ? { ...prev, nutritionInfo: nutritionData } : null); // Update UI with nutrition
        toast({ title: "Nutrition Analyzed!", description: `Nutritional info for "${generatedTextData.title}" ready.`, variant: "default" });
      } catch (nutErr) {
        console.error("Failed to analyze recipe nutrition:", nutErr);
        toast({ title: "Nutrition Analysis Issue", description: `Could not analyze nutrition for "${generatedTextData.title}".`, variant: "default" });
        // Continue without nutrition info
      } finally {
        setIsLoadingNutrition(false);
      }

      // 4. Save Recipe with Nutrition Info
      newRecipeBase = await saveRecipe(generatedTextData, data, nutritionData);
      if (!newRecipeBase) {
        throw new Error("Failed to save the complete recipe to the database.");
      }
      setCurrentRecipe(newRecipeBase); // Update with full recipe from DB including nutrition

      setChatbotContext({
        recipeTitle: newRecipeBase.title,
        recipeIngredients: newRecipeBase.ingredients,
        recipeInstructions: newRecipeBase.instructions,
      });

      // 5. Generate Image (asynchronously)
      setIsGeneratingImage(true);
      try {
        const imageData = await generateRecipeImage({ recipeTitle: newRecipeBase.title });
        if (imageData.imageUrl && newRecipeBase) {
          await updateRecipeImage(newRecipeBase.id, imageData.imageUrl);
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
      console.error("Failed to generate recipe, analyze nutrition, or save:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate recipe. ${errorMessage}`);
      toast({ title: "Error in Recipe Process", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
      // isLoadingNutrition and isGeneratingImage are handled by their specific blocks
    }
  };

  const handleIngredientsDetectedByScanner = (detectedIngredients: string[]) => {
    setIngredientsFromScanner(detectedIngredients.join(", "));
    setIsScannerModalOpen(false);
    toast({ title: "Ingredients Added", description: "Detected ingredients have been added to the form.", variant: "default" });
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <Button 
          onClick={() => setIsScannerModalOpen(true)} 
          variant="outline" 
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90 border-accent hover:border-accent/90 shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:scale-105 group"
        >
          <ScanLine className="mr-2 h-6 w-6 transition-transform duration-300 group-hover:animate-pulse" />
          Scan Ingredients with AI Camera
        </Button>
      </div>

      <IngredientForm 
        onSubmit={handleRecipeGeneration} 
        isLoading={isLoading} 
        initialIngredientsValue={ingredientsFromScanner}
      />

      {error && (
        <GlassCard className="border-destructive/50">
          <div className="flex items-center text-destructive">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <p>{error}</p>
          </div>
        </GlassCard>
      )}

      {isLoading && <LoadingSpinner text="Generating your masterpiece..." className="py-10" />}
      {!isLoading && isLoadingNutrition && currentRecipe && <LoadingSpinner text={`Analyzing nutrition for "${currentRecipe.title}"...`} className="py-5"/>}
      {!isLoading && !isLoadingNutrition && isGeneratingImage && currentRecipe && <LoadingSpinner text={`Generating image for "${currentRecipe.title}"...`} className="py-5"/>}


      {!isLoading && !currentRecipe && !error && (
         <div className="static-gradient-prompt-wrapper rounded-lg">
          <div className="static-gradient-prompt-inner">
            <div className="text-center py-10 text-muted-foreground">
              <ChefHat className="mx-auto h-16 w-16 mb-4 text-primary opacity-50 animate-bobble" />
              <h2 className="text-xl font-semibold mb-2">Welcome to SmartChef!</h2>
              <p>Enter your ingredients and preferences above, or use the AI scanner, and let our AI whip up a delicious recipe for you.</p>
            </div>
          </div>
        </div>
      )}
      
      {currentRecipe && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <RecipeCard 
              recipe={currentRecipe} 
              showFullDetails={true} 
              isDetailedView={true} 
              isGeneratingImage={isGeneratingImage && !currentRecipe.imageUrl}
              isLoadingNutrition={isLoadingNutrition && !currentRecipe.nutritionInfo}
            />
          </div>
          <div className="lg:col-span-1">
             <RecipeChatbot recipeContext={chatbotContext} />
          </div>
        </div>
      )}

      <IngredientScannerModal 
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onIngredientsDetected={handleIngredientsDetectedByScanner}
      />
    </div>
  );
}
