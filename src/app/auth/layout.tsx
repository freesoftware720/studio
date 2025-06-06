
import type React from 'react';
import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 font-headline">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-primary animate-rgb-icon" />
          <span className="text-2xl font-bold text-primary">SmartChef</span>
        </Link>
      </div>
      <main className="w-full max-w-md">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground mt-auto">
        © {new Date().getFullYear()} SmartChef. AI Recipes, Your Way.
      </footer>
    </div>
  );
}
