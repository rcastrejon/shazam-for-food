"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import {
  GenerativeAreaProvider,
  useGenerativeArea,
} from "./_components/generative-area-provider";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-screen-sm">
        <GenerativeAreaProvider>
          <GenerativeArea />
        </GenerativeAreaProvider>
      </div>
    </div>
  );
}

function GenerativeArea() {
  const { state, dispatch } = useGenerativeArea(); // TODO: Context may not be necessary

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      dispatch({
        type: "SET_PICTURE",
        payload: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleRetakePicture() {
    dispatch({
      type: "UNSET_PICTURE",
    });
  }

  function handleStartAnalysis() {
    console.log("start analysis");
  }

  return (
    <div className="px-6 py-8">
      <Viewfinder picture={state.picture} onInputChange={handleInputChange} />
      <ViewfinderControls
        isPictureLoaded={state.picture !== null}
        onInputChange={handleInputChange}
        handleRetakePicture={handleRetakePicture}
        handleStartAnalysis={handleStartAnalysis}
      />
    </div>
  );
}

type ViewfinderProps = {
  picture: string | null;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Viewfinder({ picture, onInputChange }: ViewfinderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mx-auto h-[270px] w-[270px] overflow-hidden rounded-3xl bg-muted">
      <div
        className={cn("grid h-full place-content-center", picture && "hidden")}
      >
        <input
          className="hidden"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onInputChange}
          ref={inputRef}
        />
        <TooltipProvider delayDuration={500}>
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
          <div className="absolute left-0 top-0 h-full w-full">
            <ViewfinderPicture picture={picture} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ViewfinderPicture({ picture }: { picture: string }) {
  return (
    <motion.img
      className="pointer-events-none touch-none object-cover"
      initial={{ filter: "blur(20px)", scale: 1.5 }}
      animate={{ filter: "blur(0px)", scale: 1 }}
      exit={{ filter: "blur(20px)", scale: 1.5, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      src={picture}
      alt="A user uploaded picture."
      draggable={false}
    />
  );
}

type ViewfinderControlsProps = {
  isPictureLoaded: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRetakePicture: () => void;
  handleStartAnalysis: () => void;
};

function ViewfinderControls({
  isPictureLoaded,
  onInputChange,
  handleRetakePicture,
  handleStartAnalysis,
}: ViewfinderControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (isPictureLoaded) {
    return (
      <div className="mx-auto grid max-w-fit gap-2 pt-4">
        <Button size="sm" onClick={handleStartAnalysis}>
          Continue
        </Button>
        <Button size="sm" variant="outline" onClick={handleRetakePicture}>
          Retake picture
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <span className="text-xs text-muted-foreground">or</span>
      <input
        className="hidden"
        type="file"
        accept="image/*"
        onChange={onInputChange}
        ref={inputRef}
      />
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
