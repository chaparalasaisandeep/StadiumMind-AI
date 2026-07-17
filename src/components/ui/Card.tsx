import React from "react";
import { clsx } from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className, hoverable = false, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-xl transition-all duration-300",
        hoverable && "hover:border-slate-800 hover:shadow-2xl hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx("text-base font-bold tracking-tight text-white", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("text-xs text-slate-400 leading-normal", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("text-xs text-slate-300 leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("flex items-center pt-4 border-t border-slate-900 mt-4", className)} {...props}>
      {children}
    </div>
  );
}
