"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlassCard from "@/components/ui/glass-card";
import { Sparkles, Utensils } from "lucide-react";
import type { GenerateRecipeInput } from "@/ai/flows/generate-recipe";

const recipeRequestSchema = z.object({
  ingredients: z.string().min(3, "Please list at least one ingredient."),
  cuisine: z.string().optional(),
  mealType: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
});

type RecipeRequestFormValues = z.infer<typeof recipeRequestSchema>;

interface IngredientFormProps {
  onSubmit: (data: GenerateRecipeInput) => Promise<void>;
  isLoading: boolean;
}

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer", "Side Dish"];
const commonCuisines = ["Any", "Italian", "Mexican", "Chinese", "Indian", "American", "Japanese", "Thai", "Mediterranean", "French", "Korean"];
const commonDietaryRestrictions = ["None", "Vegan", "Vegetarian", "Gluten-Free", "Keto", "Paleo", "Dairy-Free", "Nut-Free"];


export function IngredientForm({ onSubmit, isLoading }: IngredientFormProps) {
  const { register, handleSubmit, control, formState: { errors }, setValue } = useForm<RecipeRequestFormValues>({
    resolver: zodResolver(recipeRequestSchema),
  });

  const processSubmit: SubmitHandler<RecipeRequestFormValues> = async (data) => {
    const input: GenerateRecipeInput = {
      ingredients: data.ingredients,
      cuisine: data.cuisine === "Any" ? undefined : data.cuisine,
      mealType: data.mealType,
      dietaryRestrictions: data.dietaryRestrictions === "None" ? undefined : data.dietaryRestrictions,
    };
    await onSubmit(input);
  };

  return (
    <GlassCard className="w-full">
      <form onSubmit={handleSubmit(processSubmit)} className="space-y-6">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-6 flex items-center">
          <Utensils className="mr-3 h-7 w-7" />
          What's in your pantry?
        </h2>
        
        <div>
          <Label htmlFor="ingredients" className="block text-sm font-medium text-foreground/90 mb-1">Ingredients</Label>
          <Textarea
            id="ingredients"
            {...register("ingredients")}
            placeholder="e.g., chicken breast, tomatoes, onion, garlic, olive oil"
            rows={4}
            className="bg-background/50 border-white/20 focus:border-primary focus:ring-primary"
          />
          {errors.ingredients && <p className="text-sm text-destructive mt-1">{errors.ingredients.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="cuisine" className="block text-sm font-medium text-foreground/90 mb-1">Cuisine (Optional)</Label>
            <Select onValueChange={(value) => setValue("cuisine", value)} name="cuisine">
              <SelectTrigger id="cuisine" className="bg-background/50 border-white/20 focus:ring-primary">
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                {commonCuisines.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="mealType" className="block text-sm font-medium text-foreground/90 mb-1">Meal Type (Optional)</Label>
             <Select onValueChange={(value) => setValue("mealType", value)} name="mealType">
              <SelectTrigger id="mealType" className="bg-background/50 border-white/20 focus:ring-primary">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map(mt => <SelectItem key={mt} value={mt.toLowerCase()}>{mt}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-foreground/90 mb-1">Dietary Restrictions (Optional)</Label>
            <Select onValueChange={(value) => setValue("dietaryRestrictions", value)} name="dietaryRestrictions">
              <SelectTrigger id="dietaryRestrictions" className="bg-background/50 border-white/20 focus:ring-primary">
                <SelectValue placeholder="Select restrictions" />
              </SelectTrigger>
              <SelectContent>
                {commonDietaryRestrictions.map(dr => <SelectItem key={dr} value={dr.toLowerCase()}>{dr}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3">
          <Sparkles className="mr-2 h-5 w-5" />
          {isLoading ? "Generating Recipe..." : "Generate Recipe"}
        </Button>
      </form>
    </GlassCard>
  );
}
