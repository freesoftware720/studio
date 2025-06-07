
"use client";

import { useRecipeStore } from "@/hooks/use-recipe-store";
import { RecipeCard } from "@/components/feature/recipe-card";
import { Heart } from "lucide-react";
import GlassCard from "@/components/ui/glass-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { favorites, getRecipeById } = useRecipeStore();
  // For chatbot, we might need a way to set context if user clicks on a recipe.
  // For now, chatbot is on main page. Can extend RecipeCard to navigate to main page with recipe ID.

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
        My Favorite Recipes
      </h1>
      {favorites.length === 0 ? (
        <GlassCard>
          <div className="text-center py-10 text-muted-foreground">
            <Heart className="mx-auto h-16 w-16 mb-4 text-primary opacity-50 animate-bobble" />
            <p className="text-lg">You haven't saved any favorite recipes yet.</p>
            <p className="mt-2">Generate some recipes and click the heart icon to save them!</p>
            <Button asChild variant="link" className="mt-4 text-accent text-lg">
              <Link href="/">Generate Recipes</Link>
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} isDetailedView={true}/>
          ))}
        </div>
      )}
    </div>
  );
}
