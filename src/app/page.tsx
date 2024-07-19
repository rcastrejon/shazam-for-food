"use client";

import { AnimatePresence, motion } from "framer-motion";

import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { GenerativeArea } from "./_components/generative-area";

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
        <GenerativeArea>
          {({ state, startPictureUpload, startAnalysis, retakePicture }) => (
            <main className="mx-auto w-full max-w-screen-md">
              <div className="mx-8 mt-4 flex flex-col items-center">
                <Viewfinder
                  picture={state.picture}
                  handleStartCamera={() => startPictureUpload("capture")}
                />
                {["idle", "picture-confirmation"].includes(state.status) && (
                  <Controls
                    isPictureLoaded={!!state.picture}
                    handleOpenFilePicker={() => startPictureUpload("default")}
                    handleStartAnalysis={startAnalysis}
                    handleRetakePicture={retakePicture}
                  />
                )}
              </div>
              {state.thoughtsUI}
            </main>
          )}
        </GenerativeArea>
      </div>
    </div>
  );
}

type ViewfinderProps = {
  picture: string | null;
  handleStartCamera: () => void;
};

function Viewfinder({ picture, handleStartCamera }: ViewfinderProps) {
  return (
    <div className="w-full sm:max-w-[256px]">
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
                  <Button className="mx-auto" onClick={handleStartCamera}>
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
  isPictureLoaded: boolean;
  handleOpenFilePicker: () => void;
  handleStartAnalysis: () => void;
  handleRetakePicture: () => void;
};

function Controls({
  isPictureLoaded,
  handleOpenFilePicker,
  handleStartAnalysis,
  handleRetakePicture,
}: ControlsProps) {
  if (!isPictureLoaded) {
    return (
      <div className="mt-2 max-w-fit space-y-2">
        <div className="flex justify-center">
          <span className="text-xs leading-none text-muted-foreground">or</span>
        </div>
        <Button onClick={handleOpenFilePicker} size="sm" variant="secondary">
          Upload from camera roll
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 grid max-w-fit space-y-2">
      <Button className="px-8" size="sm" onClick={handleStartAnalysis}>
        Continue
      </Button>
      <Button
        className="px-8"
        size="sm"
        variant="outline"
        onClick={handleRetakePicture}
      >
        Retake picture
      </Button>
    </div>
  );
}
