"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type React from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void; // Added for mobile sheet
}

export function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick} // Added onClick handler
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        "hover:bg-primary/20 hover:text-primary",
        isActive ? "text-primary font-semibold" : "text-foreground/80",
        className
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
