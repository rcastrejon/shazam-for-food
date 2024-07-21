"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "~/components/ui/skeleton";

function AnimatedTitle() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((counter) => counter + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const dots = ".".repeat(counter % 4);
  return <span>Thinking{dots}</span>;
}

function PlacehoderContent() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-[0.75rem] w-full" />
      <Skeleton className="h-[0.75rem] w-full" />
      <Skeleton className="h-[0.75rem] w-full" />
      <Skeleton className="h-[0.75rem] w-full" />
    </div>
  );
}

export function ThoughtsContainer({
  isGenerating,
  children,
}: React.PropsWithChildren<{
  isGenerating: boolean;
}>) {
  const isPlaceholder = !children;

  return (
    <div className="space-y-1.5 rounded-lg border p-3 text-sm">
      <div className="font-semibold leading-none tracking-tight">
        {isGenerating ? <AnimatedTitle /> : <span>Thoughts</span>}
      </div>
      {isPlaceholder ? <PlacehoderContent /> : children}
    </div>
  );
}

export function ThoughtsContent({ children }: React.PropsWithChildren) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
