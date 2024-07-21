"use server";

// import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";

import type { PartialAnalysisSchema } from "./schemas";
import { analysisSchema } from "./schemas";

export async function streamAnalysis(image: string) {
  const stream = createStreamableValue<PartialAnalysisSchema>();

  void (async () => {
    const { partialObjectStream } = await streamObject({
      // model: google("models/gemini-1.5-pro-latest"), // TODO: Change to the final model
      model: openai("gpt-4o"),
      temperature: 0.7,
      system: `You have perfect vision and pay great attention to detail which \
makes you an expert at identifying ingredients in food. You are tasked with \
figuring out the exact ingredients shown in the picture and give the dish an \
appropriate name.`,
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
analyze every part of the image.

When thinking, be as descriptive as possible, consider every detail in the \
image, discuss the portions, the harmony of flavours, and how certain are you \
about each ingredient.

The 'checkboxes' field should only be used to clear up uncertainties. If you \
are certain about an ingredient, you should not include it in the 'checkboxes' \
field.`,
            },
          ],
        },
      ],
      schema: analysisSchema,
    });

    for await (const partialObject of partialObjectStream) {
      console.debug(partialObject);

      stream.update({
        thinking: partialObject.thinking,
        checkboxes: partialObject.checkboxes?.filter(
          (checkbox): checkbox is { label: string } =>
            checkbox?.label !== undefined,
        ),
      });
    }

    stream.done();
  })();

  return {
    object: stream.value,
  };
}
