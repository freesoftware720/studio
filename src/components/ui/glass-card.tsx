import { cn } from "@/lib/utils";
import type React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCard: React.FC<GlassCardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white/5 backdrop-blur-10", // backdrop-blur-10 is custom in globals.css for 10px
        "shadow-glass", // Using custom shadow from tailwind.config.ts
        "rounded-lg", // Uses --radius from globals.css (1.5rem / 24px)
        "border border-white/10", // Subtle border
        "p-6", // Default padding
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
