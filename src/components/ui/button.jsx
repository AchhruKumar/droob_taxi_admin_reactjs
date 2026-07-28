import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import Loadingbutton from "./Loadingbutton"; // Make sure the correct path is used

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-theme-primary border-2 border-theme-primary text-theme-primary-foreground shadow-xs hover:bg-theme-primary/90 hover:border-theme-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 border-theme-primary text-theme-primary bg-background shadow-xs hover:bg-theme-secondary hover:border-theme-secondary hover:text-white dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-theme-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[54px] px-7 py-4 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled = false,
  style = {},
  children,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  const mergedStyle = {
    ...style,
    pointerEvents: disabled || loading ? "none" : "auto",
    opacity: disabled || loading ? 0.6 : 1,
    cursor: disabled || loading ? "not-allowed" : "pointer",
  };

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      style={mergedStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loadingbutton /> : children}
    </Comp>
  );
}

export { Button, buttonVariants };
