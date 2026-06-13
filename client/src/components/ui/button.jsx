import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-thin transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-signal text-paper hover:bg-signal/90 rounded-btn px-5 py-3",
        destructive: "bg-tag-coral text-paper hover:bg-tag-coral/90 rounded-btn px-5 py-3",
        outline: "border border-paper/30 bg-transparent text-paper hover:bg-indigo/40 rounded-btn px-5 py-3",
        secondary: "bg-deep text-fog hover:bg-indigo border border-steel/30 rounded-btn px-5 py-3 shadow-neo",
        ghost: "text-fog hover:text-paper hover:bg-indigo/30 rounded-btn px-5 py-3",
        link: "text-signal underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-btn px-4 text-xs",
        lg: "h-12 rounded-btn px-8 text-base",
        icon: "h-10 w-10 rounded-btn",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
