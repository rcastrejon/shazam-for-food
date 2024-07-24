"use client";

import { useRef } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useWindowScroll } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Settings } from "lucide-react";

import type { Status } from "./_hooks/use-generative-area";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import * as m from "~/paraglide/messages.js";
import { Suggestions, SuggestionsCheckbox } from "./_components/suggestions";
import { Thoughts, ThoughtsContent } from "./_components/thoughts";
import { useGenerativeArea } from "./_hooks/use-generative-area";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MainContent />
    </div>
  );
}

function Header() {
  const [state] = useWindowScroll();
  const scrollY = state.y ?? 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-transparent transition-all duration-300",
        scrollY > 0 && "bg-background/85 backdrop-blur-xl",
      )}
    >
      <div className="container flex h-14 items-center">
        <div className="flex-1" />
        <div className="min-w-max">
          <div className="text-center text-lg font-semibold tracking-tight">
            {m.title()}
          </div>
        </div>
        <div className="flex flex-1 justify-end">
          <Button size="icon" variant="ghost">
            <Settings className="h-5 w-5" />
            <VisuallyHidden.Root>{m.app_settings()}</VisuallyHidden.Root>
          </Button>
        </div>
      </div>
    </header>
  );
}

function MainContent() {
  const captureInputRef = useRef<HTMLInputElement>(null);
  const diskInputRef = useRef<HTMLInputElement>(null);

  const { status, state, actions } = useGenerativeArea();

  function startPictureUploadMethod(method: "disk" | "capture") {
    if (method === "disk") {
      diskInputRef.current?.click();
    } else if (method === "capture") {
      captureInputRef.current?.click();
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      throw new Error("File is not an image");
    }

    const reader = new FileReader();
    reader.onload = () => {
      actions.loadPicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRetakePicture() {
    if (captureInputRef.current && diskInputRef.current) {
      captureInputRef.current.value = "";
      diskInputRef.current.value = "";
      actions.retakePicture();
    }
  }

  return (
    <main className="mb-4 flex-1">
      <div className="container mt-4">
        <input
          onChange={handleInputChange}
          type="file"
          accept="image/*"
          capture="environment"
          ref={captureInputRef}
          hidden
        />
        <input
          onChange={handleInputChange}
          type="file"
          accept="image/*"
          ref={diskInputRef}
          hidden
        />
        <Viewfinder
          picture={state.picture}
          startCamera={() => startPictureUploadMethod("capture")}
        />
        <div className="px-10">
          <Controls
            status={status}
            openCameraRoll={() => startPictureUploadMethod("disk")}
            startAnalysis={actions.startAnalysis}
            retakePicture={handleRetakePicture}
          />
        </div>
      </div>
      <ThoughtsContainer status={status}>
        <div className="container mt-8">
          <Thoughts isGenerating={status === "analysis:thoughts-generation"}>
            {state.analysis?.thinking && (
              <ThoughtsContent>{state.analysis.thinking}</ThoughtsContent>
            )}
          </Thoughts>
        </div>
      </ThoughtsContainer>
      <SuggestionsContainer status={status}>
        <div className="container mt-8">
          <Suggestions
            isGenerating={status === "analysis:suggestions-generation"}
            submitSuggestions={actions.submitSuggestions}
          >
            {state.analysis?.checkboxes?.map((checkbox, index) => (
              <SuggestionsCheckbox key={index} label={checkbox?.label ?? ""} />
            ))}
          </Suggestions>
        </div>
      </SuggestionsContainer>
      {state.breakdownUI && (
        <div className="container mt-8">{state.breakdownUI}</div>
      )}
    </main>
  );
}

function Viewfinder({
  picture,
  startCamera,
}: {
  picture: string | undefined;
  startCamera: () => void;
}) {
  return (
    <div className="mx-auto sm:w-[300px]">
      <AspectRatio ratio={1}>
        <motion.div
          className={cn(
            "absolute inset-0 -z-50 rounded-3xl bg-[hsla(0,100%,50%,1)] opacity-60 bg-blend-normal blur-xl",
            "bg-[radial-gradient(circle_at_40%_20%,hsla(28,100%,74%,1)_0%,transparent_50%),radial-gradient(circle_at_80%_0%,hsla(189,100%,56%,1)_0%,transparent_50%),radial-gradient(circle_at_0%_50%,hsla(355,100%,93%,1)_0%,transparent_50%),radial-gradient(circle_at_80%_50%,hsla(340,100%,76%,1)_0%,transparent_50%),radial-gradient(circle_at_0%_100%,hsla(22,100%,77%,1)_0%,transparent_50%),radial-gradient(circle_at_80%_100%,hsla(242,100%,70%,1)_0%,transparent_50%),radial-gradient(circle_at_0%_0%,hsla(343,100%,76%,1)_0%,transparent_50%)]",
          )}
          animate={{ opacity: [0.6, 0.8] }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        ></motion.div>
        <div className="absolute inset-0 overflow-hidden rounded-3xl border bg-muted shadow-classic">
          <div
            className={cn(
              "absolute inset-0 z-0 grid min-w-max place-content-center gap-2",
              picture && "hidden",
            )}
          >
            <div className="h-[1rem]" />
            <TooltipProvider delayDuration={250}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={startCamera}>
                    <Camera className="mr-2 h-4 w-4" /> {m.app_startCamera()}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{m.app_cameraWarning()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-center text-xs text-muted-foreground">
              {m.app_imageLimit()}
            </p>
          </div>

          <AnimatePresence>
            {picture && (
              <motion.img
                key="picture"
                className="pointer-events-none absolute z-10 h-full w-full touch-none object-cover"
                initial={{
                  filter: "blur(20px)",
                  scale: 1.5,
                }}
                animate={{
                  filter: "blur(0px)",
                  scale: 1,
                }}
                exit={{
                  filter: "blur(20px)",
                  scale: 1.5,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                src={picture}
                alt={m.app_pictureAlt()}
                draggable={false}
              />
            )}
          </AnimatePresence>
        </div>
      </AspectRatio>
    </div>
  );
}

type ControlsProps = {
  status: Status;
  openCameraRoll: () => void;
  startAnalysis: () => void;
  retakePicture: () => void;
};

function Controls({
  status,
  openCameraRoll,
  startAnalysis,
  retakePicture,
}: ControlsProps) {
  if (status === "idle") {
    return (
      <div className="mx-auto mt-2 w-max space-y-2">
        <div className="text-center text-xs text-muted-foreground">
          {m.or()}
        </div>
        <Button size="sm" variant="outline" onClick={openCameraRoll}>
          {m.app_uploadPicture()}
        </Button>
      </div>
    );
  }
  if (status === "picture-confirmation") {
    return (
      <div className="mt-4 grid space-y-2 sm:mx-auto sm:w-max">
        <Button onClick={startAnalysis}>{m.app_confirm()}</Button>
        <Button variant="outline" onClick={retakePicture}>
          {m.app_retake()}
        </Button>
      </div>
    );
  }
  return null;
}

function ThoughtsContainer({
  status,
  children,
}: React.PropsWithChildren<{ status: Status }>) {
  const guard: Status[] = [
    "analysis:thoughts-generation",
    "analysis:suggestions-generation",
    "analysis:suggestions-selection",
    "analysis:suggestions-generation",
    "end",
  ];
  if (guard.includes(status)) {
    return <>{children}</>;
  }
  return null;
}

function SuggestionsContainer({
  status,
  children,
}: React.PropsWithChildren<{ status: Status }>) {
  const guard: Status[] = [
    "analysis:suggestions-generation",
    "analysis:suggestions-selection",
  ];
  if (guard.includes(status)) {
    return <>{children}</>;
  }
  return null;
}
