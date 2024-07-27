import { AnimatePresence, motion } from "framer-motion";
import { Bot } from "lucide-react";

import * as m from "~/paraglide/messages";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

function PlaceholderHeader() {
  return (
    <div className="flex">
      <Skeleton className="mr-2 h-4 w-4 rounded bg-muted-foreground/20" />
      <Skeleton className="h-4 w-[100px] rounded bg-muted-foreground/20" />
    </div>
  );
}

function PlaceholderContent() {
  return (
    <div className="space-y-1.5 sm:space-y-2">
      <Skeleton className="h-3 w-full rounded bg-foreground/20 sm:h-4" />
      <Skeleton className="h-3 w-full rounded bg-foreground/20 sm:h-4" />
      <Skeleton className="h-3 w-full rounded bg-foreground/20 sm:h-4" />
    </div>
  );
}

function ThoughtsHeader() {
  return (
    <div className="flex items-center">
      <Bot className="mr-2 h-4 w-4 text-muted-foreground" />
      <h5 className="text-sm font-semibold leading-none text-muted-foreground">
        {m.c_thoughts()}
      </h5>
    </div>
  );
}

export function Thoughts({
  status,
  children,
}: React.PropsWithChildren<{
  status: "generating" | "done";
}>) {
  const classNames = {
    generating: "opacity-50",
    done: "opacity-40",
  } as const;

  return (
    <div className="relative">
      <AnimatePresence>
        {status === "generating" && (
          <motion.div
            style={{
              backgroundSize: "200% 200%",
              backgroundPosition: "0% 0%",
            }}
            className={cn(
              "absolute inset-0 -z-50 rounded-lg bg-ai-gradient bg-blend-normal blur-sm",
            )}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
              transition: {
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                repeatType: "reverse",
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.7,
              },
            }}
          ></motion.div>
        )}
      </AnimatePresence>
      <div>
        <div className="absolute inset-0 -z-20 rounded-lg bg-card"></div>
        <motion.div
          style={{
            backgroundSize: "200% 200%",
            backgroundPosition: "0% 0%",
          }}
          className={cn(
            "absolute inset-0 -z-10 rounded-lg bg-ai-gradient bg-blend-normal transition-opacity duration-700",
            classNames[status],
          )}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
            transition: {
              duration: 8,
              repeat: Infinity,
              ease: "linear",
              repeatType: "reverse",
            },
          }}
        ></motion.div>
        <div className="grid gap-2 rounded-lg border p-4">
          {children ? (
            <>
              <ThoughtsHeader />
              {children}
            </>
          ) : (
            <>
              <PlaceholderHeader />
              <PlaceholderContent />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ThoughtsContent({ children }: React.PropsWithChildren) {
  return <p className="text-xs text-foreground sm:text-sm">{children}</p>;
}
