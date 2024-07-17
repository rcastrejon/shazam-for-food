"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { streamFirstAnalysisComponent } from "./_ai/actions";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-screen-lg">
        <GenerativeArea>
          {({ state, captureInputRef, diskInputRef, onRetakePicture }) => (
            <div className="px-6 py-8">
              <Viewfinder inputRef={captureInputRef} picture={state.picture} />
              <Controls
                inputRef={diskInputRef}
                picture={state.picture}
                onRetakePicture={onRetakePicture}
              />
            </div>
          )}
        </GenerativeArea>
      </div>
    </div>
  );
}

type GenerativeAreaProps = {
  children: (props: {
    state: { picture: string | null };
    captureInputRef: React.RefObject<HTMLInputElement>;
    diskInputRef: React.RefObject<HTMLInputElement>;
    onRetakePicture: () => void;
  }) => React.ReactNode;
};

function GenerativeArea({ children }: GenerativeAreaProps) {
  const captureInputRef = useRef<HTMLInputElement>(null);
  const diskInputRef = useRef<HTMLInputElement>(null);
  const [picture, setPicture] = useState<string | null>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      throw new Error("Invalid file type");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPicture(() => reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function onRetakePicture() {
    setPicture(() => null);
    if (captureInputRef.current && diskInputRef.current) {
      captureInputRef.current.value = "";
      diskInputRef.current.value = "";
    }
  }

  return (
    <>
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
      {children({
        state: { picture },
        captureInputRef,
        diskInputRef,
        onRetakePicture,
      })}
    </>
  );
}

type ViewfinderProps = {
  inputRef: React.RefObject<HTMLInputElement>;
  picture: string | null;
};

function Viewfinder({ inputRef, picture }: ViewfinderProps) {
  return (
    <div className="relative mx-auto h-[270px] w-[270px] overflow-hidden rounded-3xl bg-muted">
      <div
        className={cn(
          "absolute inset-0 grid place-content-center",
          picture && "hidden",
        )}
      >
        <TooltipProvider delayDuration={350}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="mx-auto"
                onClick={() => inputRef.current?.click()}
              >
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
  );
}

type ControlsProps = {
  inputRef: React.RefObject<HTMLInputElement>;
  picture: string | null;
  onRetakePicture: () => void;
};

function Controls({ inputRef, picture, onRetakePicture }: ControlsProps) {
  const [genUI, setGenUI] = useState<React.ReactNode | null>(null);

  async function handleStartAnalysis() {
    if (!picture) {
      throw new Error("No picture to analyze");
    }
    setGenUI(await streamFirstAnalysisComponent({ image: picture }));
  }

  if (genUI) {
    return genUI;
  }

  if (picture === null) {
    return (
      <div className="flex flex-col items-center gap-2 pt-2">
        <span className="text-xs text-muted-foreground">or</span>
        <Button
          onClick={() => inputRef.current?.click()}
          size="sm"
          variant="secondary"
        >
          Upload from camera roll
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-fit gap-2 pt-4">
      <Button className="px-8" size="sm" onClick={handleStartAnalysis}>
        Continue
      </Button>
      <Button
        className="px-8"
        size="sm"
        variant="outline"
        onClick={onRetakePicture}
      >
        Retake picture
      </Button>
    </div>
  );
}
