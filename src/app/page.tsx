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
import { Thoughts } from "./_components/thoughts";
import { useGenerativeArea } from "./_hooks/use-generative-area";

export const maxDuration = 120;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[99] bg-background/85 backdrop-blur-xl">
        <div className="mx-4 flex h-[56px] items-center justify-center">
          <span className="text-lg font-semibold leading-none tracking-tight">
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
      {["thinking", "thinking-selection", "selection"].includes(
        state.status,
      ) && (
        <div className="mx-8 mt-4">
          <Thoughts isGenerating={state.status === "thinking"}>
            {state.generation?.thinking}
          </Thoughts>
        </div>
      )}
      {["thinking-selection", "selection"].includes(state.status) && (
        <div className="mx-8 mt-4">
          <SelectionContainer enabled={state.status === "selection"}>
            {state.generation?.checkboxes?.map((cb, i) => (
              <SelectionItem label={cb.label} key={i} />
            ))}
          </SelectionContainer>
        </div>
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
    <div className="w-full sm:w-[256px]">
      <AspectRatio ratio={1}>
        <div className="absolute inset-0 overflow-hidden rounded-3xl bg-muted">
          <div
            className={cn(
              "absolute inset-0 grid place-content-center",
              picture && "hidden",
            )}
          >
            <TooltipProvider delayDuration={350}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="mx-auto" onClick={startCamera}>
                    Start camera
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">
                    Camera only available on mobile devices
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <AnimatePresence>
            {picture && (
              <div className="absolute inset-0">
                <motion.img
                  className="pointer-events-none h-full w-full touch-none object-cover"
                  initial={{ filter: "blur(20px)", scale: 1.5 }}
                  animate={{ filter: "blur(0px)", scale: 1 }}
                  exit={{ filter: "blur(20px)", scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  src={picture}
                  alt="A user uploaded picture."
                  draggable={false}
                />
              </div>
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
      <div className="mt-2 max-w-fit space-y-2">
        <div className="flex justify-center">
          <span className="text-xs leading-none text-muted-foreground">or</span>
        </div>
        <Button onClick={openCameraRoll} size="sm" variant="secondary">
          Upload from camera roll
        </Button>
      </div>
    );
  }

  if (status === "picture-confirmation") {
    return (
      <div className="mt-4 grid max-w-fit space-y-2">
        <Button className="px-8" size="sm" onClick={startAnalysis}>
          Continue
        </Button>
        <Button
          className="px-8"
          size="sm"
          variant="outline"
          onClick={retakePicture}
        >
          Retake picture
        </Button>
      </div>
    );
  }

  return null;
}
