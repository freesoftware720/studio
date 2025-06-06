
import type React from 'react';
import { cn } from '@/lib/utils';

interface AuthFormWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ElementType; // Lucide icon component
}

export function AuthFormWrapper({ title, children, className, icon: Icon }: AuthFormWrapperProps) {
  return (
    <div 
      className={cn(
        "w-full p-6 sm:p-8 space-y-6 rounded-lg shadow-glass", // Using shadow-glass for consistency
        "bg-card", // Solid card background
        className
      )}
    >
      <div className="flex flex-col items-center space-y-2 text-center">
        {Icon && <Icon className="h-10 w-10 text-primary mb-3 animate-rgb-icon" />}
        <h1 className="text-3xl font-bold text-primary">{title}</h1>
      </div>
      {children}
    </div>
  );
}
