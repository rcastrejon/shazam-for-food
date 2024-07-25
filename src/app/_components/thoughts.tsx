import { useEffect, useState } from "react";
import { Bot } from "lucide-react";

import * as m from "~/paraglide/messages.js";
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
  return (
    <span>
      {m.c_thinking()}
      {dots}
    </span>
  );
}

function PlaceholderContent() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-[0.75rem] w-full" />
      <Skeleton className="h-[0.75rem] w-full" />
      <Skeleton className="h-[0.75rem] w-full" />
    </div>
  );
}

export function Thoughts({
  isGenerating,
  children,
}: React.PropsWithChildren<{
  isGenerating: boolean;
}>) {
  const isPlaceholder = !children;

  return (
    <div className="space-y-1.5 rounded-lg border bg-card p-3 text-sm">
      <div className="flex items-center font-semibold leading-none tracking-tight">
        <Bot className="mr-2 h-4 w-4" />
        {isGenerating ? <AnimatedTitle /> : <span>{m.c_thoughts()}</span>}
      </div>
      {isPlaceholder ? <PlaceholderContent /> : children}
    </div>
  );
}

export function ThoughtsContent({ children }: React.PropsWithChildren) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}
