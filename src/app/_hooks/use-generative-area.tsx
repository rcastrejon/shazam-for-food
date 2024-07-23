import { useState } from "react";
import { readStreamableValue, useActions } from "ai/rsc";

import type { ServerAI } from "../_ai/actions";
import type { PartialAnalysisSchema } from "../_ai/schemas";

export type Status =
  | "idle"
  | "picture-confirmation"
  | "analysis:thoughts-generation"
  | "analysis:suggestions-generation"
  | "analysis:suggestions-selection"
  | "end";

export function useGenerativeArea() {
  const { streamAnalysis, streamBreakdownUI } = useActions<ServerAI>();

  const [status, setStatus] = useState<Status>("idle");
  const [picture, setPicture] = useState<string>();
  const [analysis, setAnalysis] = useState<PartialAnalysisSchema>();
  const [breakdownUI, setBreakdownUI] = useState<React.ReactNode>();

  function loadPicture(picture: string) {
    setPicture(() => picture);
    setStatus(() => "picture-confirmation");
  }

  function retakePicture() {
    setPicture(() => undefined);
    setStatus(() => "idle");
  }

  async function startAnalysis() {
    if (!picture) {
      throw new Error("No picture to analyze");
    }

    setStatus(() => "analysis:thoughts-generation");

    const { object } = await streamAnalysis(picture);
    for await (const partialObject of readStreamableValue(object)) {
      setAnalysis(() => partialObject);
      if (partialObject?.checkboxes) {
        // The object generation is sequential, so, if the checkboxes are
        // present, the model has finished thinking (CoT). We can now proceed
        // to the generation of the selection phase.
        setStatus(() => "analysis:suggestions-generation");
      }
    }
    // The generation phase of the analysis is done, we can now proceed to the
    // extra step selection phase.
    setStatus(() => "analysis:suggestions-selection");
  }

  async function submitSuggestions(suggestions: string[]) {
    setStatus(() => "end");
    const result = await streamBreakdownUI(suggestions);
    setBreakdownUI(() => result);
  }

  return {
    status,
    state: {
      picture,
      analysis,
      breakdownUI,
    },
    actions: {
      loadPicture,
      retakePicture,
      startAnalysis,
      submitSuggestions,
    },
  };
}
