import "server-only";

import type { CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
} from "ai/rsc";
// import { ollama } from "ollama-ai-provider";
import { z } from "zod";

import type { PartialAnalysisSchema } from "./schemas";
import { SYSTEM_PROMPT } from "./prompts";
import { analysisSchema } from "./schemas";

export type ServerMessage = CoreMessage;

export async function streamAnalysis(image: string) {
  "use server";

  const history = getMutableAIState<AIType>();
  const stream = createStreamableValue<PartialAnalysisSchema>();

  void (async () => {
    // Add the user input to the history
    history.update([
      ...history.get(),
      {
        role: "user",
        content: [
          {
            type: "image",
            image,
          },
          {
            type: "text",
            text: '"""Insert answer here"""',
          },
        ],
      },
    ]);

    const { partialObjectStream } = await streamObject({
      model: openai("gpt-4o"),
      // model: ollama("llava-llama3"), // TODO: Change to the final model
      temperature: 0.5,
      messages: history.get(),
      schema: analysisSchema,
      onFinish: ({ object }) => {
        if (!object) {
          throw new Error("No object returned");
        }

        history.done([
          ...history.get(),
          {
            role: "assistant",
            content: `\
**Thinking**: ${object.thinking}

**Select from the following**: ${object.checkboxes.map((checkbox) => checkbox.label).join(", ")}
`,
          },
        ]);
      },
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

export async function streamAnswer(selection: string[]) {
  "use server";

  const history = getAIState<AIType>();
  const stream = createStreamableUI(<>Loading...</>);

  void (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai("gpt-4o"),
      temperature: 0.7,
      messages: [
        ...history,
        {
          role: "user",
          content: `\
**Selection**: ${selection.join(", ")}.

Given all of the above, print the full calorie breakdown of the dish from the picture.
`,
        },
      ],
      schema: z.object({
        name: z.string().describe("The name of the dish"),
        breakdown: z.array(
          z.object({
            ingredient: z.string(),
            portions: z
              .string()
              .describe("The individual portion size of the ingredient"),
            totalCalories: z.string(),
          }),
        ),
      }),
    });

    for await (const partialObject of partialObjectStream) {
      console.debug(partialObject.breakdown);
      stream.update(<>{partialObject.name}</>);
    }

    stream.done();
  })();

  return stream.value;
}

export type AIState = ServerMessage[];

export const AI = createAI({
  initialAIState: [
    // Set the initial state of the AI history with the system prompt.
    SYSTEM_PROMPT,
  ] as AIState,
  initialUIState: [],
  actions: {
    streamAnalysis,
    streamAnswer,
  },
});

export type AIType = typeof AI;
