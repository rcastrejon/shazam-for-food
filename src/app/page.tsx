"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
import { SelectionContainer, SelectionItem } from "./_components/selection";
import { ThoughtsContainer, ThoughtsContent } from "./_components/thoughts";
import { useGenerativeArea } from "./_hooks/use-generative-area";

export const maxDuration = 120;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky left-0 right-0 top-0 z-[99] bg-background/85 backdrop-blur-xl">
        <div className="mx-4 grid h-[56px] place-content-center">
          <span className="text-center text-lg font-semibold leading-none tracking-tight">
            Shazam for Food
          </span>
        </div>
      </header>
      <div className="flex-grow">
        <MainContent />
      </div>
    </div>
  );
}

export function MainContent() {
  const captureInputRef = useRef<HTMLInputElement>(null);
  const diskInputRef = useRef<HTMLInputElement>(null);

  const { state, onUploadPicture, onRetakePicture, onStartAnalysis } =
    useGenerativeArea();

  function startPictureUpload(type: "disk" | "capture") {
    if (type === "disk") {
      diskInputRef.current?.click();
    } else if (type === "capture") {
      captureInputRef.current?.click();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      throw new Error("Invalid file type");
    }

    const reader = new FileReader();
    reader.onload = () => {
      onUploadPicture(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRetakePicture() {
    if (captureInputRef.current && diskInputRef.current) {
      captureInputRef.current.value = "";
      diskInputRef.current.value = "";
      onRetakePicture();
    }
  }

  return (
    <main className="mx-auto w-full max-w-screen-md">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        ref={captureInputRef}
        hidden
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        ref={diskInputRef}
        hidden
      />
      <div className="mx-8 mt-4 flex flex-col items-center">
        <Viewfinder
          picture={state.picture}
          startCamera={() => startPictureUpload("capture")}
        />
        <Controls
          status={state.status}
          openCameraRoll={() => startPictureUpload("disk")}
          startAnalysis={onStartAnalysis}
          retakePicture={handleRetakePicture}
        />
      </div>
      <GenerativeContainer status={state.status}>
        <div className="mx-8 mt-4">
          <ThoughtsContainer isGenerating={state.status === "thinking"}>
            {state.generation?.thinking && (
              <ThoughtsContent>{state.generation.thinking}</ThoughtsContent>
            )}
          </ThoughtsContainer>
        </div>
        {state.generation?.checkboxes && (
          <div className="mx-8 mt-4">
            <SelectionContainer enabled={state.status === "selection"}>
              {state.generation.checkboxes.map((cb, i) => (
                <SelectionItem label={cb.label} key={i} />
              ))}
            </SelectionContainer>
          </div>
        )}
      </GenerativeContainer>
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
    <div className="w-full sm:w-[256px]">
      <AspectRatio ratio={1}>
        <div className="absolute inset-0 grid overflow-hidden rounded-3xl bg-muted">
          <div className={cn("m-auto", picture && "hidden")}>
            <TooltipProvider delayDuration={350}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="mx-auto" onClick={startCamera}>
                    Start camera
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    Camera only available on mobile devices
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="mt-1.5 text-center text-xs text-muted-foreground">
              Image up to 20MB
            </p>
          </div>

          <AnimatePresence>
            {picture && (
              <motion.img
                className="pointer-events-none absolute h-full w-full touch-none object-cover"
                initial={{ filter: "blur(20px)", scale: 1.5 }}
                animate={{ filter: "blur(0px)", scale: 1 }}
                exit={{ filter: "blur(20px)", scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                src={picture}
                alt="A user uploaded picture."
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
      <div className="mt-2 w-fit space-y-2">
        <div className="text-center text-xs leading-none text-muted-foreground">
          or
        </div>
        <Button onClick={openCameraRoll} size="sm" variant="secondary">
          Upload from camera roll
        </Button>
      </div>
    );
  }

  if (status === "picture-confirmation") {
    return (
      <div className="mt-4 grid w-fit space-y-2">
        <Button onClick={startAnalysis}>Continue</Button>
        <Button variant="outline" onClick={retakePicture}>
          Retake picture
        </Button>
      </div>
    );
  }

  return null;
}

function GenerativeContainer({
  status,
  children,
}: React.PropsWithChildren<{ status: Status }>) {
  const isGenerativeContentVisible = [
    "thinking",
    "thinking-selection",
    "selection",
  ].includes(status);

  if (!isGenerativeContentVisible) {
    return null;
  }

  return <>{children}</>;
}
