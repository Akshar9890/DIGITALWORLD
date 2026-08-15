import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "default", isLoading, children, disabled, ...props },
    ref
  ) => {
    // We map to the CSS classes defined in globals.css
    let variantClass = "";
    switch (variant) {
      case "primary":
        variantClass = "btn-primary";
        break;
      case "secondary":
        variantClass = "btn-secondary";
        break;
      case "danger":
        variantClass = "btn-danger";
        break;
      case "ghost":
        variantClass = "hover:bg-surface-container-high rounded-control px-4 py-2 text-on-surface transition-colors";
        break;
      case "link":
        variantClass = "text-tertiary hover:underline underline-offset-4";
        break;
    }

    let sizeClass = "";
    if (variant !== "primary" && variant !== "secondary" && variant !== "danger") {
      switch (size) {
        case "sm":
          sizeClass = "h-9 px-3 text-sm";
          break;
        case "lg":
          sizeClass = "h-11 px-8";
          break;
        case "icon":
          sizeClass = "h-10 w-10 flex items-center justify-center p-0";
          break;
      }
    }

    return (
      <button
        ref={ref}
        className={cn(variantClass, sizeClass, className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
