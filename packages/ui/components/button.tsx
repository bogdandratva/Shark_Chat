"use client";
import { ButtonHTMLAttributes, ComponentProps, forwardRef } from "react";

import { tv } from "tailwind-variants";
import { Spinner } from "./spinner";

export const button = tv({
  base: [
    "inline-flex select-none items-center justify-center text-start font-medium focus:outline-none focus-visible:ring",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  variants: {
    color: {
      primary: [
        "rounded-lg transition-colors shadow-lg shadow-brand-400/50",
        "bg-brand-500 hover:bg-brand-400 dark:bg-brand-400 text-gray-50 dark:hover:bg-brand-500 dark:shadow-none",
        "focus-visible:ring-0",
      ],
      secondary: [
        "rounded-md transition-colors shadow-lg bg-secondary shadow-brand-500/10 text-secondary-foreground hover:bg-accent dark:shadow-none",
        "focus-visible:ring-0",
      ],
      ghost: [
        "rounded-md transition-colors text-foreground hover:bg-accent",
        "focus-visible:ring-0",
      ],
      danger: [
        "rounded-md transition-colors",
        "bg-red-500 hover:bg-red-400 dark:bg-red-500 text-gray-50 dark:hover:bg-red-600",
        "focus-visible:ring-0",
      ],
    },
    size: {
      icon: "p-1.5",
      large: "px-6 py-3 text-base",
      medium: "px-4 py-2 text-sm",
      small: "px-3 py-1.5 text-sm",
    },
  },
  defaultVariants: {
    color: "secondary",
    size: "medium",
  },
});

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "primary" | "secondary" | "ghost" | "danger";
  size?: "large" | "medium" | "small";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, color, size, isLoading, ...props }, ref) => (
    <button
      ref={ref}
      disabled={isLoading === true}
      {...props}
      className={button({ color, size, className: props.className })}
    >
      {isLoading === true && (
        <div className="mr-2 inline">
          <Spinner size="small" />
        </div>
      )}
      {children}
    </button>
  ),
);

Button.displayName = "Button";

export interface IconButtonProps extends ComponentProps<"button"> {
  color?: "primary" | "secondary" | "ghost" | "danger";
  size?: "large" | "medium" | "small" | "icon";
  isLoading?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, isLoading, color, size, ...props }, ref) => (
    <button
      {...props}
      ref={ref}
      className={button({ color, size, className: props.className })}
    >
      {isLoading === true ? (
        <div className="inline">
          <Spinner size="small" />
        </div>
      ) : (
        children
      )}
    </button>
  ),
);

IconButton.displayName = "IconButton";
