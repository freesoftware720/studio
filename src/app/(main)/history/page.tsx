"use client";

import { useRecipeStore } from "@/hooks/use-recipe-store";
import { RecipeCard } from "@/components/feature/recipe-card";
import { History as HistoryIcon } from "lucide-react"; // Renamed to avoid conflict
import GlassCard from "@/components/ui/glass-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HistoryPage() {
  const { history } = useRecipeStore();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
        <HistoryIcon className="mr-3 h-8 w-8 text-accent" />
        Recipe History
      </h1>
      {history.length === 0 ? (
        <GlassCard>
           <div className="text-center py-10 text-muted-foreground">
            <HistoryIcon className="mx-auto h-16 w-16 mb-4 text-primary opacity-50" />
            <p className="text-lg">Your recipe history is empty.</p>
            <p className="mt-2">Generated recipes will appear here.</p>
            <Button asChild variant="link" className="mt-4 text-accent text-lg">
              <Link href="/">Generate Recipes</Link>
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} isDetailedView={true} />
          ))}
        </div>
      )}
    </div>
  );
}
