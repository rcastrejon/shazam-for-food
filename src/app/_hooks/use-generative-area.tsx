import { useState } from "react";
import { readStreamableValue, useActions } from "ai/rsc";

import type { AIType } from "../_ai/actions";
import type { PartialAnalysisSchema } from "../_ai/schemas";

export type Status =
  | "idle"
  | "picture-confirmation"
  | "thinking"
  | "thinking-selection"
  | "selection"
  | "answer";

export function useGenerativeArea() {
  const { streamAnalysis, streamAnswer } = useActions<AIType>();

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

  async function onSelectOptions(options: string[]) {
    setStatus(() => "answer");
    const result = await streamAnswer(options);
    console.debug(result);
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
    onSelectOptions,
  };
}
