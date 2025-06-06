
import Link from 'next/link';
import { ChefHat } from 'lucide-react';
import { NavLink } from './nav-link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 font-headline">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <ChefHat className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">SmartChef</span>
        </Link>
        <nav className="flex items-center space-x-2 sm:space-x-4">
          <NavLink href="/">Generator</NavLink>
          <NavLink href="/favorites">Favorites</NavLink>
          <NavLink href="/history">History</NavLink>
        </nav>
      </div>
    </header>
  );
}
