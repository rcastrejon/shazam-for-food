"use client";

import { useRef } from "react";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useWindowScroll } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Settings } from "lucide-react";
import { z } from "zod";

import * as m from "~/paraglide/messages.js";
import { availableLanguageTags } from "~/paraglide/runtime";
import type { ThoughtsStatus } from "./_components/thoughts";
import type { Status } from "./_hooks/use-generative-area";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ConditionalRender } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import { Suggestions, SuggestionsCheckbox } from "./_components/suggestions";
import { Thoughts, ThoughtsContent } from "./_components/thoughts";
import { useGenerativeArea } from "./_hooks/use-generative-area";
import { setSettings, useSettingsStore } from "./_hooks/use-settings-store";
import { useStore } from "./_hooks/use-store";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header rightContent={<SettingsButton />} />
      <MainContent />
    </div>
  );
}

function Header({ rightContent }: { rightContent: React.ReactNode }) {
  const [state] = useWindowScroll();
  const scrollY = state.y ?? 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-transparent transition-all duration-300",
        scrollY > 0 && "bg-background/85 backdrop-blur-xl",
      )}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="flex-1 sm:hidden" />
        <div className="min-w-max">
          <div className="text-center text-lg font-semibold tracking-tight">
            {m.title()}
          </div>
        </div>
        <div className="flex flex-1 justify-end">{rightContent}</div>
      </div>
    </header>
  );
}

// Validation schema for the settings form
const settingsFormSchema = z.object({
  apiKey: z.string().optional(),
  language: z.enum(availableLanguageTags).optional(),
});

function SettingsButton() {
  const settings = useStore(useSettingsStore, (state) => state);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = settingsFormSchema.parse(
      Object.fromEntries(formData.entries()),
    );
    setSettings({
      API_KEY: data.apiKey,
      NEXT_LOCALE: data.language,
    });
    if (typeof window !== "undefined") {
      // User might change the language, so we reload the page to apply the
      // changes.
      window.location.reload();
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Settings className="h-5 w-5" />
          <VisuallyHidden.Root>{m.app_settings()}</VisuallyHidden.Root>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.app_settings()}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" autoComplete="off" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">{m.app_settings_key()}</Label>
            <Input
              id="apiKey"
              name="apiKey"
              defaultValue={settings?.API_KEY}
              type="password"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              {m.app_settings_key_description()}
            </p>
          </div>
          <div className="grid gap-2">
            <Label>{m.app_settings_language()}</Label>
            <Select name="language" defaultValue={settings?.NEXT_LOCALE}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="en">{m.english()}</SelectItem>
                  <SelectItem value="es">{m.spanish()}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {m.app_settings_language_description()}
            </p>
          </div>
          <div className="grid sm:flex sm:justify-end">
            <Button type="submit">{m.app_settings_language_button()}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MainContent() {
  const captureInputRef = useRef<HTMLInputElement>(null);
  const diskInputRef = useRef<HTMLInputElement>(null);
  const { status, state, actions } = useGenerativeArea();

  function resetInputs() {
    if (captureInputRef.current && diskInputRef.current) {
      captureInputRef.current.value = "";
      diskInputRef.current.value = "";
    }
  }

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
    resetInputs();
    actions.retakePicture();
  }

  async function handleStartAnalysis() {
    try {
      await actions.startAnalysis();
    } catch (error) {
      alert(m.app_generation_error());
      resetInputs();
      actions.resetState();
    }
  }

  async function handleSubmitSuggestions(suggestions: string[]) {
    try {
      await actions.submitSuggestions(suggestions);
    } catch (error) {
      alert(m.app_generation_error());
      resetInputs();
      actions.resetState();
    }
  }

  return (
    <main className="mb-4 flex-1">
      <div className="container mt-4 px-12">
        <input
          onChange={handleInputChange}
          type="file"
          capture="environment"
          accept="image/png, image/jpeg"
          ref={captureInputRef}
          hidden
        />
        <input
          onChange={handleInputChange}
          type="file"
          accept="image/png, image/jpeg"
          ref={diskInputRef}
          hidden
        />
        <Viewfinder status={getViewfinderStatus(status)}>
          <ViewfinderContent
            picture={state.picture}
            startCamera={() => startPictureUploadMethod("capture")}
          />
        </Viewfinder>
        <div className="px-10">
          <Controls
            status={status}
            openCameraRoll={() => startPictureUploadMethod("disk")}
            startAnalysis={handleStartAnalysis}
            retakePicture={handleRetakePicture}
          />
        </div>
      </div>
      <ConditionalRender condition={shouldRenderThoughts(status)}>
        <div className="container mt-8">
          <Thoughts status={getThoughtsStatus(status)}>
            {state.analysis?.thinking && (
              <ThoughtsContent>{state.analysis.thinking}</ThoughtsContent>
            )}
          </Thoughts>
        </div>
      </ConditionalRender>
      <ConditionalRender condition={shouldRenderSuggestions(status)}>
        <div className="container mt-8">
          <Suggestions
            isGenerating={status === "analysis:suggestions-generation"}
            submitSuggestions={handleSubmitSuggestions}
          >
            {state.analysis?.checkboxes?.map((checkbox, index) => (
              <SuggestionsCheckbox key={index} label={checkbox?.label ?? ""} />
            ))}
          </Suggestions>
        </div>
      </ConditionalRender>
      <ConditionalRender condition={state.breakdownUI !== undefined}>
        <div className="container mt-8">{state.breakdownUI}</div>
      </ConditionalRender>
    </main>
  );
}

type ViewfinderStatus = "idle" | "focus" | "generating" | "done";

function Viewfinder({
  status,
  children,
}: React.PropsWithChildren<{
  status: ViewfinderStatus;
}>) {
  const blurVariants = {
    idle: {
      opacity: [0.6, 0.8],
      scale: [1, 1.1],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
    focus: {
      scale: 1,
      opacity: 1,
      transition: {
        ease: "easeInOut",
      },
    },
    generating: {
      opacity: [0.6, 0.8],
      scale: [1, 1.05],
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const,
      },
    },
    done: {
      opacity: 0.8,
      scale: 1.1,
      transition: {
        ease: "easeInOut",
      },
    },
  };

  const blurClassNames = {
    idle: "blur-xl opacity-60",
    focus: "blur-md",
    generating: "blur-md opacity-60",
    done: "blur-xl",
  };

  return (
    <div className="mx-auto sm:w-[300px]">
      <AspectRatio ratio={1}>
        <motion.div
          className={cn(
            "absolute inset-0 -z-50 rounded-lg bg-ai-gradient bg-blend-normal transition-[filter]",
            blurClassNames[status],
          )}
          variants={blurVariants}
          animate={status}
        ></motion.div>
        {children}
      </AspectRatio>
    </div>
  );
}

function ViewfinderContent({
  picture,
  startCamera,
}: {
  picture: string | undefined;
  startCamera: () => void;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border bg-muted shadow-classic">
      <div
        className={cn(
          "absolute inset-0 z-0 grid place-content-center gap-2",
          picture && "hidden",
        )}
      >
        <div className="h-4" />
        <TooltipProvider delayDuration={250}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4"></Camera> {m.app_startCamera()}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{m.app_cameraWarning()}</p>
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
          ></motion.img>
        )}
      </AnimatePresence>
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

/*
 * Helper functions
 */

function getViewfinderStatus(status: Status): ViewfinderStatus {
  if (status === "idle") return "idle";
  if (status === "picture-confirmation") return "focus";
  if (status === "analysis:thoughts-generation") return "generating";
  return "done";
}

function getThoughtsStatus(status: Partial<Status>): ThoughtsStatus {
  if (status === "analysis:thoughts-generation") return "generating";
  return "done";
}

function shouldRenderThoughts(status: Status) {
  const guard: Status[] = [
    "analysis:thoughts-generation",
    "analysis:suggestions-generation",
    "analysis:suggestions-selection",
    "analysis:suggestions-generation",
    "end",
  ];
  return guard.includes(status);
}

function shouldRenderSuggestions(status: Status) {
  const guard: Status[] = [
    "analysis:suggestions-generation",
    "analysis:suggestions-selection",
  ];
  return guard.includes(status);
}
