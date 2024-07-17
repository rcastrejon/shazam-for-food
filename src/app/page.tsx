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
import { streamFirstAnalysisComponent } from "./_ai/actions";
import {
  GenerativeAreaProvider,
  useGenerativeArea,
} from "./_components/generative-area-provider";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-screen-lg">
        <GenerativeAreaProvider>
          <GenerativeArea>
            {(picture, onImageInputChange, onRetakePicture) => (
              <div className="px-6 py-8">
                <Viewfinder
                  picture={picture}
                  onImageInputChange={onImageInputChange}
                />
                <Controls
                  picture={picture}
                  onImageInputChange={onImageInputChange}
                  onRetakePicture={onRetakePicture}
                />
              </div>
            )}
          </GenerativeArea>
        </GenerativeAreaProvider>
      </div>
    </div>
  );
}

type GenerativeAreaProps = {
  children: (
    picture: string | null,
    onImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRetakePicture: () => void,
  ) => React.ReactNode;
};

function GenerativeArea({ children }: GenerativeAreaProps) {
  const { state, dispatch } = useGenerativeArea(); // TODO: Context may not be necessary
  const { picture } = state;

  function onImageInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      throw new Error("Invalid file type");
    }

    const reader = new FileReader();
    reader.onload = () => {
      dispatch({
        type: "SET_PICTURE",
        payload: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  function onRetakePicture() {
    dispatch({
      type: "UNSET_PICTURE",
    });
  }

  return children(picture, onImageInputChange, onRetakePicture);
}

type ViewfinderProps = {
  picture: string | null;
  onImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Viewfinder({ picture, onImageInputChange }: ViewfinderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative mx-auto h-[270px] w-[270px] overflow-hidden rounded-3xl bg-muted">
      {!picture && (
        <div className="absolute inset-0 grid place-content-center">
          <input
            className="hidden"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onImageInputChange}
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
      )}

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
  picture: string | null;
  onImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRetakePicture: () => void;
};

function Controls({
  picture,
  onImageInputChange,
  onRetakePicture,
}: ControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
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
        <input
          className="hidden"
          type="file"
          accept="image/*"
          onChange={onImageInputChange}
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

  return (
    <div className="mx-auto grid max-w-fit gap-2 pt-4">
      <Button size="sm" onClick={handleStartAnalysis}>
        Continue
      </Button>
      <Button size="sm" variant="outline" onClick={onRetakePicture}>
        Retake picture
      </Button>
    </div>
  );
}
