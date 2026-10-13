import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface GradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export const Component = ({ className, children }: GradientBackgroundProps) => {
  const [count, setCount] = useState(0);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full [background:radial-gradient(125%_125%_at_50%_-50%,#c7d2fe_40%,transparent_100%)] dark:[background:radial-gradient(125%_125%_at_50%_-50%,#6366f136_40%,transparent_100%)] pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );
};

export const GradientBackground = Component;
