
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Utensils, Wand2, Mic, MicOff } from "lucide-react"; // Added Wand2 for Surprise Me & Mic icons
import type { GenerateRecipeInput } from "@/ai/flows/generate-recipe";
import { useEffect, useState, useRef } from "react"; 
import { useToast } from "@/hooks/use-toast";

const recipeRequestSchema = z.object({
  ingredients: z.string().min(3, "Please list at least one ingredient."),
  cuisine: z.string().optional(),
  mealType: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  language: z.string().optional(),
});

type RecipeRequestFormValues = z.infer<typeof recipeRequestSchema>;

interface IngredientFormProps {
  onSubmit: (data: GenerateRecipeInput) => Promise<void>;
  isLoading: boolean;
  initialIngredientsValue?: string;
}

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer", "Side Dish", "Any"];
const commonCuisines = ["Any", "Italian", "Mexican", "Chinese", "Indian", "American", "Japanese", "Thai", "Mediterranean", "French", "Korean"];
const commonDietaryRestrictions = ["None", "Vegan", "Vegetarian", "Gluten-Free", "Keto", "Paleo", "Dairy-Free", "Nut-Free"];
const supportedLanguages = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi (हिन्दी)" },
  { value: "urdu", label: "Urdu (اردو)" },
  { value: "roman urdu", label: "Roman Urdu" },
  { value: "roman hindi", label: "Roman Hindi" },
  { value: "spanish", label: "Spanish (Español)" },
  { value: "french", label: "French (Français)" },
];


export function IngredientForm({ onSubmit, isLoading, initialIngredientsValue }: IngredientFormProps) {
  const { register, handleSubmit, control, formState: { errors }, setValue, getValues } = useForm<RecipeRequestFormValues>({
    resolver: zodResolver(recipeRequestSchema),
    defaultValues: {
      language: "english",
      ingredients: "", 
      cuisine: "Any",
      mealType: "Any",
      dietaryRestrictions: "None",
    }
  });

  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (initialIngredientsValue !== undefined) {
      setValue("ingredients", initialIngredientsValue, { shouldValidate: true, shouldDirty: true });
    }
  }, [initialIngredientsValue, setValue]);

  // Initialize SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Default language, can be made dynamic

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setValue("ingredients", transcript, { shouldValidate: true, shouldDirty: true });
          setIsListening(false);
          toast({ title: "Voice Input Received", description: "Ingredients updated with your voice input." });
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
          let errorMessage = "Speech recognition error.";
          if (event.error === 'no-speech') {
            errorMessage = "No speech detected. Please try again.";
          } else if (event.error === 'audio-capture') {
            errorMessage = "Audio capture error. Ensure microphone is working.";
          } else if (event.error === 'not-allowed') {
            errorMessage = "Microphone access denied. Please enable it in your browser settings.";
          }
          toast({ title: "Voice Input Error", description: errorMessage, variant: "destructive" });
          setIsListening(false);
        };

        recognition.onend = () => {
          // Ensure listening state is false if recognition ends for any reason other than result
          if (isListening && speechRecognitionRef.current) { // Check if it was actively listening
             // Only set if it wasn't stopped by onresult
             // This check is tricky because onresult also calls onend.
             // A small delay or more complex state might be needed if premature stop is an issue.
          }
        };
        speechRecognitionRef.current = recognition;
      } else {
        toast({ title: "Voice Input Not Supported", description: "Your browser does not support speech recognition.", variant: "destructive" });
      }
    }
  }, [setValue, toast, isListening]);


  const toggleListening = () => {
    if (!speechRecognitionRef.current) {
      toast({ title: "Voice Input Error", description: "Speech recognition not available.", variant: "destructive" });
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
        toast({ title: "Listening...", description: "Speak your ingredients now." });
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({ title: "Voice Input Error", description: "Could not start voice recognition. Check microphone permissions.", variant: "destructive" });
        setIsListening(false);
      }
    }
  };

  // Cleanup speech recognition on component unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current && isListening) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [isListening]);


  const prepareSubmitData = (surpriseMe: boolean = false): GenerateRecipeInput => {
    const data = getValues();
    return {
      ingredients: data.ingredients,
      cuisine: data.cuisine === "Any" || data.cuisine === "" ? undefined : data.cuisine,
      mealType: data.mealType === "Any" || data.mealType === "" ? undefined : data.mealType,
      dietaryRestrictions: data.dietaryRestrictions === "None" || data.dietaryRestrictions === "" ? undefined : data.dietaryRestrictions,
      language: data.language === "english" ? undefined : data.language, 
      surpriseMe: surpriseMe,
    };
  };

  const handleStandardSubmit: SubmitHandler<RecipeRequestFormValues> = async () => {
    if (isListening && speechRecognitionRef.current) speechRecognitionRef.current.stop();
    setIsListening(false);
    await onSubmit(prepareSubmitData(false));
  };

  const handleSurpriseMeSubmit = async () => {
    if (isListening && speechRecognitionRef.current) speechRecognitionRef.current.stop();
    setIsListening(false);
    // Validate ingredients before surprise me submission
    const ingredientsValue = getValues("ingredients");
    if (!ingredientsValue || ingredientsValue.trim().length < 3) {
        setValue("ingredients", ingredientsValue, { shouldValidate: true }); // Trigger validation
        return;
    }
    await onSubmit(prepareSubmitData(true));
  };


  return (
    <div className="w-full hover-animated-rgb-border-effect rounded-lg font-headline">
      <div className="hover-animated-rgb-border-inner">
        <form onSubmit={handleSubmit(handleStandardSubmit)} className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
            <Utensils className="mr-3 h-7 w-7" />
            <span className="animate-subtle-opacity-pulse">SmartChef: Your pantry’s personal chef.</span>
          </h2>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="ingredients" className="block text-sm font-medium text-foreground/90">Ingredients (required)</Label>
              <Button 
                type="button" 
                onClick={toggleListening} 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-primary hover:bg-primary/10"
                disabled={isLoading || !speechRecognitionRef.current}
                aria-label={isListening ? "Stop listening" : "Start voice input for ingredients"}
              >
                {isListening ? <MicOff className="h-5 w-5 animate-pulse text-destructive" /> : <Mic className="h-5 w-5" />}
              </Button>
            </div>
            <Textarea
              id="ingredients"
              {...register("ingredients")}
              placeholder="e.g., chicken breast, tomatoes, onion, garlic, olive oil, or use the scanner/mic!"
              rows={3}
              className="bg-background/50 border-white/20 focus:border-primary focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isLoading}
            />
            {errors.ingredients && <p className="text-sm text-destructive mt-1">{errors.ingredients.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="language" className="block text-sm font-medium text-foreground/90 mb-1">Recipe Language</Label>
              <Select onValueChange={(value) => setValue("language", value)} defaultValue="english" name="language" disabled={isLoading}>
                <SelectTrigger id="language" className="bg-background/50 border-white/20 focus:ring-primary">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="mealType" className="block text-sm font-medium text-foreground/90 mb-1">Meal Type</Label>
               <Select onValueChange={(value) => setValue("mealType", value)} defaultValue="Any" name="mealType" disabled={isLoading}>
                <SelectTrigger id="mealType" className="bg-background/50 border-white/20 focus:ring-primary">
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map(mt => <SelectItem key={mt} value={mt === "Any" ? "Any" : mt.toLowerCase()}>{mt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="cuisine" className="block text-sm font-medium text-foreground/90 mb-1">Cuisine</Label>
              <Select onValueChange={(value) => setValue("cuisine", value)} defaultValue="Any" name="cuisine" disabled={isLoading}>
                <SelectTrigger id="cuisine" className="bg-background/50 border-white/20 focus:ring-primary">
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {commonCuisines.map(c => <SelectItem key={c} value={c === "Any" ? "Any" : c.toLowerCase()}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-foreground/90 mb-1">Dietary Restrictions</Label>
              <Select onValueChange={(value) => setValue("dietaryRestrictions", value)} defaultValue="None" name="dietaryRestrictions" disabled={isLoading}>
                <SelectTrigger id="dietaryRestrictions" className="bg-background/50 border-white/20 focus:ring-primary">
                  <SelectValue placeholder="Select restrictions" />
                </SelectTrigger>
                <SelectContent>
                  {commonDietaryRestrictions.map(dr => <SelectItem key={dr} value={dr === "None" ? "None" : dr.toLowerCase()}>{dr}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" disabled={isLoading || isListening} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/20 hover:text-primary text-lg py-3">
              <Sparkles className="mr-2 h-5 w-5" />
              {isLoading ? "Generating..." : "Generate Recipe"}
            </Button>
            <Button 
              type="button" 
              onClick={handleSurpriseMeSubmit}
              disabled={isLoading || isListening} 
              variant="outline"
              className="flex-1 border-accent text-accent hover:bg-accent/20 hover:text-accent text-lg py-3"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              {isLoading ? "Generating..." : "Surprise Me!"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

    