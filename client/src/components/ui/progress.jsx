import React from 'react';
import { cn } from "../../lib/utils";

const Progress = React.forwardRef(({ 
  className, 
  value = 0,
  max = 100,
  variant = "default",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500"
  };

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 transition-all",
          variants[variant]
        )}
        style={{ 
          transform: `translateX(-${100 - (value / max * 100)}%)`,
        }}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };