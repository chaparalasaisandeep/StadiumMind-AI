import React from "react";
import { clsx } from "clsx";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("animate-pulse rounded bg-slate-900/80", className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-slate-900 bg-slate-950 p-5 rounded-2xl space-y-4">
      <Skeleton className="h-4 w-2/5" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <Skeleton className="h-8 w-full rounded-xl" />
    </div>
  );
}
