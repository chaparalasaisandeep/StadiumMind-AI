import React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const baseStyle =
      "inline-flex items-center justify-center font-semibold rounded-xl tracking-tight transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#6EB8E1]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
      primary: "bg-gradient-to-r from-sky-500 to-[#6EB8E1] hover:from-sky-400 hover:to-sky-300 text-black shadow-lg shadow-sky-500/10",
      secondary: "bg-gradient-to-r from-purple-600 to-[#C8ABE6] hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-600/10",
      accent: "bg-[#D6E6F2] hover:bg-white text-slate-900 border border-slate-200",
      outline: "bg-transparent border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white",
      danger: "bg-rose-600 hover:bg-rose-500 text-white",
      ghost: "bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4.5 py-2 text-xs",
      lg: "px-6 py-2.5 text-sm"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(baseStyle, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
