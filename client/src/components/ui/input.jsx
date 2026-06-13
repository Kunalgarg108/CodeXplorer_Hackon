import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-btn border border-steel/50 bg-indigo/40 px-4 py-2 text-sm font-thin text-paper",
        "placeholder:text-mist focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal",
        "shadow-neo-pressed disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
