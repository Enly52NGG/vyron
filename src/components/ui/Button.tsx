"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "icon";
  size?: "sm" | "md" | "lg" | "icon";
  active?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      active,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-40 disabled:pointer-events-none select-none",
          // sizes
          size === "sm" && "h-8 px-3 text-xs rounded-lg",
          size === "md" && "h-10 px-4 text-sm rounded-xl",
          size === "lg" && "h-12 px-6 text-base rounded-xl",
          size === "icon" && "h-10 w-10 rounded-full",
          // variants
          variant === "primary" &&
            "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.15)]",
          variant === "secondary" &&
            "glass glass-hover text-white border border-white/10",
          variant === "ghost" &&
            "bg-transparent text-white/80 hover:bg-white/10 hover:text-white",
          variant === "icon" &&
            "bg-transparent text-white/70 hover:text-white hover:bg-white/10",
          active && "text-white glow-sm",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
