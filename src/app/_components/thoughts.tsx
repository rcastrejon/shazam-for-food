"use client";

import { useEffect, useState } from "react";

import { cn } from "~/lib/utils";

export function Thoughts({
  isGenerating,
  children,
}: React.PropsWithChildren<{
  isGenerating: boolean;
}>) {
  const isPlaceholder = !children;

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border p-3 text-sm transition-all",
        !isPlaceholder && "hover:bg-accent",
      )}
    >
      <div className="font-semibold">
        {isGenerating ? <AnimatedTitle /> : <span>Thoughts</span>}
      </div>
      <div className="text-xs text-muted-foreground">{children}</div>
    </div>
  );
}

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
