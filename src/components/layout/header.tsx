
"use client"; // Required for useState and Sheet interactions

import Link from 'next/link';
import { ChefHat, Menu } from 'lucide-react';
import { NavLink } from './nav-link';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-headline">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">SmartChef</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 sm:space-x-4">
          <NavLink href="/">Generator</NavLink>
          <NavLink href="/favorites">Favorites</NavLink>
          <NavLink href="/history">History</NavLink>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <SheetHeader className="mb-6">
                <SheetTitle>
                  <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
                    <ChefHat className="h-7 w-7 text-primary" />
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
