"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/ui/glass-card";
import { MessageCircle, Send, User, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "./loading-spinner";
import type { RecipeQuestionContext } from "@/lib/types";
import { answerRecipeQuestion, type AnswerRecipeQuestionInput } from "@/ai/flows/answer-recipe-question";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface RecipeChatbotProps {
  recipeContext: RecipeQuestionContext | null;
}

export function RecipeChatbot({ recipeContext }: RecipeChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), text: inputValue, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      if (!recipeContext) {
        throw new Error("No recipe context available for the chatbot.");
      }
      
      const recipeString = `Title: ${recipeContext.recipeTitle}\nIngredients: ${recipeContext.recipeIngredients.join(", ")}\nInstructions: ${recipeContext.recipeInstructions.join(" ")}`;
      const input: AnswerRecipeQuestionInput = {
        recipe: recipeString,
        question: userMessage.text,
      };
      
      const response = await answerRecipeQuestion(input);
      const botMessage: Message = { id: crypto.randomUUID(), text: response.answer, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error with chatbot:", error);
      const errorMessage: Message = { id: crypto.randomUUID(), text: "Sorry, I encountered an error. Please try again.", sender: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!recipeContext) {
    return (
      <GlassCard className="w-full mt-8">
        <div className="p-4 text-center text-muted-foreground">
          <MessageCircle className="mx-auto h-12 w-12 mb-2 text-primary" />
          Select a recipe or generate a new one to start chatting about it!
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full mt-8 flex flex-col" style={{height: '500px'}}>
      <h2 className="text-xl font-headline font-semibold text-primary mb-4 p-4 border-b border-white/10 flex items-center">
        <MessageCircle className="mr-2 h-6 w-6" />
        Chat about "{recipeContext.recipeTitle}"
      </h2>
      
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`p-3 rounded-lg max-w-[70%] flex items-start space-x-2 ${
                msg.sender === "user" 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-primary/20 text-foreground"
              }`}>
                {msg.sender === "user" ? <User className="h-5 w-5 mt-0.5 shrink-0" /> : <Bot className="h-5 w-5 mt-0.5 shrink-0 text-primary" />}
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-primary/20 text-foreground flex items-center space-x-2">
                <Bot className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                <LoadingSpinner size={20} className="p-0" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 flex items-center space-x-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about the recipe..."
          disabled={isLoading}
          className="flex-grow bg-background/50 border-white/20 focus:border-primary focus:ring-primary"
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" className="bg-primary hover:bg-primary/90">
          <Send className="h-5 w-5 text-primary-foreground" />
        </Button>
      </form>
    </GlassCard>
  );
}
