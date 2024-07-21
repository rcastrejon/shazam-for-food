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
      temperature: 0.5,
      system: `You have perfect vision and pay great attention to detail which makes you an expert at identifying ingredients in food. You are tasked with figuring out the exact ingredients shown in the picture and give the dish an appropriate name. Follow these step-by-step instructions:

Step 1 - First, think step-by-step in 'thinking' field and analyze every part of the image. You will be as descriptive as possible; describe the portions, harmony of flavors, and your certainty about each ingredient. Discuss any uncertainties and potential options to clear them up.

Step 2 - Before providing a list of ingredients, and to clear up any uncertainties you have, I will help you out. For that, provide a list of checkboxes I can choose from. So, for every uncertainty, you will give me different options and I will select the ones that best apply to the dish. Assume that any option not chosen does not apply.

RULES:
- The 'thinking' field should be explicit, written in natural language, and easy to follow.
- The 'checkboxes' field should only be used to clear up uncertainties. If you are certain about an ingredient, you should not include it in the 'checkboxes' field.
- Do not include ambiguous options in the 'checkboxes' field.
- Ensure the 'checkboxes' field is a list of clickable checkboxes; the user cannot provide custom text.
- Follow these instructions strictly without deviation.`,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image },
            {
              type: "text",
              text: '"""Insert answer here"""',
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
