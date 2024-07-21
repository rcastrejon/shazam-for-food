import { useState } from "react";
import { readStreamableValue } from "ai/rsc";

import type { PartialAnalysisSchema } from "../_ai/schemas";
import { streamAnalysis } from "../_ai/actions";

export type Status =
  | "idle"
  | "picture-confirmation"
  | "thinking"
  | "thinking-selection"
  | "selection";

export function useGenerativeArea() {
  const [status, setStatus] = useState<Status>("idle");
  const [picture, setPicture] = useState<string>();
  const [generation, setGeneration] = useState<PartialAnalysisSchema>();

  function onUploadPicture(picture: string) {
    setStatus(() => "picture-confirmation");
    setPicture(() => picture);
  }

  function onRetakePicture() {
    setStatus(() => "idle");
    setPicture(() => undefined);
  }

  async function onStartAnalysis() {
    if (!picture) {
      throw new Error("No picture to analyze");
    }

    setStatus(() => "thinking");

    const { object } = await streamAnalysis(picture);
    for await (const partialObject of readStreamableValue(object)) {
      setGeneration(() => partialObject);
      if (partialObject?.checkboxes) {
        // The object generation is sequential, so, if the checkboxes are
        // present, the model has finished thinking (CoT). We can now proceed
        // to the generation of the selection phase.
        setStatus(() => "thinking-selection");
      }
    }

    setStatus(() => "selection");
  }

  return {
    state: {
      status,
      picture,
      generation,
    },
    onUploadPicture,
    onRetakePicture,
    onStartAnalysis,
  };
}
