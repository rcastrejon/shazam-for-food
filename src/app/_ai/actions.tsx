import "server-only";

import { streamObject } from "ai";
import { createAI, createStreamableUI } from "ai/rsc";
import { ollama } from "ollama-ai-provider";
import { z } from "zod";

export async function streamFirstAnalysisComponents(image: string) {
  "use server";

  const thoughtsUI = createStreamableUI(<span>llm loading</span>);

  void (async () => {
    const { partialObjectStream } = await streamObject({
      model: ollama("llava"), // TODO: Change to the final model
      system: `You have perfect vision and pay great attention to detail which \
makes you an expert at identifying ingredients in food. You are tasked with \
figuring out the exact ingredients shown in the picture and give the dish an \
appropriate name.

When thinking, be as descriptive as possible, consider every detail in the \
image, discuss the portions, the harmony of flavours, and how certain are you \
about each ingredient.`,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image },
            {
              type: "text",
              text: `What ingredients are in the dish? How certain are you \
about each one of them? To clear up any uncertainties you have, I will help \
you out. For that, you will give me a list of checkboxes I can choose from. \
So, for every uncertainty, you will give me different options and I will \
select the ones that best apply to the dish. You can safely assume that any \
option that I don't choose, does not apply to the dish. Before providing the \
answer in 'checkboxes' field, think step-by-step in 'thinking' field and \
analyze every part of the image.`,
            },
          ],
        },
      ],
      schema: z.object({
        thinking: z.string(),
        isFood: z.boolean(),
        checkboxes: z.array(z.string()),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      if (partialObject.thinking) {
        thoughtsUI.update(<span>{partialObject.thinking}</span>);
        continue;
      }
    }

    thoughtsUI.done();
  })();

  return {
    thoughtsUI: thoughtsUI.value,
  };
}

export const AI = createAI({
  actions: {
    streamFirstAnalysisComponents,
  },
});

export type ServerAI = typeof AI;
