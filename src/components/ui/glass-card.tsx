import { cn } from "@/lib/utils";
import type React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

const GlassCard: React.FC<GlassCardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "hover-animated-rgb-border-effect rounded-lg", // Applies effect, outer rounding, and shadow
        className // User's custom classes are preserved
      )}
      {...props} // Spread props to the outer div
    >
      <div className="hover-animated-rgb-border-inner"> {/* Handles solid bg and padding */}
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
