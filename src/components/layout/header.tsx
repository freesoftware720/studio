
"use client"; 

import Link from 'next/link';
import { ChefHat, Menu, LogOut, Sun, Moon } from 'lucide-react'; // Added Sun, Moon
import { NavLink } from './nav-link';
import { useState, useEffect } from 'react'; // Added useEffect
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/context/theme-context'; // Updated import for consistency

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering theme-dependent UI to avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
      router.refresh(); 
      if (isMobileMenuOpen) {
        closeMobileMenu();
      }
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
      console.error("Logout error:", error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const ThemeToggleButton = ({ forMobileSheet = false }: { forMobileSheet?: boolean }) => {
    if (!mounted) {
      // Render a placeholder or null during server-side rendering/hydration
      return (
        <Button variant="ghost" size={forMobileSheet ? "default" : "icon"} className={forMobileSheet ? "text-lg py-2 justify-start px-3 w-full" : ""} disabled>
          {forMobileSheet && (theme === 'dark' ? <Sun className="mr-2 h-5 w-5" /> : <Moon className="mr-2 h-5 w-5" />)}
          {forMobileSheet ? (theme === 'dark' ? "Light Mode" : "Dark Mode") : (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
        </Button>
      );
    }
    return (
      <Button
        variant="ghost"
        size={forMobileSheet ? "default" : "icon"}
        onClick={toggleTheme}
        className={cn(
          "transition-colors",
          forMobileSheet ? "text-lg py-2 justify-start px-3 w-full text-foreground/80 hover:bg-primary/20 hover:text-primary" : "text-foreground/80 hover:bg-primary/20 hover:text-primary"
        )}
        aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === 'dark' ? <Sun className={cn("h-5 w-5", forMobileSheet && "mr-2")} /> : <Moon className={cn("h-5 w-5", forMobileSheet && "mr-2")} />}
        {forMobileSheet && (theme === 'dark' ? "Light Mode" : "Dark Mode")}
      </Button>
    );
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-headline">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">SmartChef</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
          <NavLink href="/">Generator</NavLink>
          <NavLink href="/favorites">Favorites</NavLink>
          <NavLink href="/history">History</NavLink>
          <ThemeToggleButton />
          <Button variant="ghost" onClick={handleLogout} className="text-foreground/80 hover:bg-primary/20 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </nav>

        <div className="md:hidden flex items-center">
          <ThemeToggleButton />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] font-headline">
              <SheetHeader className="mb-6">
                <SheetTitle>
                  <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                    <ChefHat className="h-7 w-7 animate-rgb-icon" />
                    <span className="text-xl font-bold text-primary">SmartChef</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-3">
                <NavLink 
                  href="/" 
                  onClick={closeMobileMenu} 
                  className="text-lg py-2"
                >
                  Generator
                </NavLink>
                <NavLink 
                  href="/favorites" 
                  onClick={closeMobileMenu} 
                  className="text-lg py-2"
                >
                  Favorites
                </NavLink>
                <NavLink 
                  href="/history" 
                  onClick={closeMobileMenu} 
                  className="text-lg py-2"
                >
                  History
                </NavLink>
                <ThemeToggleButton forMobileSheet={true} />
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="text-lg py-2 justify-start px-3 text-foreground/80 hover:bg-primary/20 hover:text-primary rounded-md font-medium transition-colors"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
