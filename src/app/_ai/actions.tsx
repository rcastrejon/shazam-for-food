import "server-only";

import type { CoreMessage } from "ai";
import { cookies } from "next/headers";
import { createOpenAI } from "@ai-sdk/openai";
import { initializeLanguage } from "@inlang/paraglide-next";
import { streamObject } from "ai";
import {
  createAI,
  createStreamableUI,
  createStreamableValue,
  getAIState,
  getMutableAIState,
} from "ai/rsc";
import { z } from "zod";

import { languageTag } from "~/paraglide/runtime";
import type { PartialAnalysisSchema } from "./schemas";
import { BreakdownTable } from "../_components/breakdown-table";
import * as Prompts from "./prompts";
import { analysisSchema } from "./schemas";

initializeLanguage();

function getProvider() {
  const cookieStore = cookies();
  return createOpenAI({
    apiKey: cookieStore.get("API_KEY")?.value,
    compatibility: "strict",
  });
}

export async function streamAnalysis(image: string) {
  "use server";

  const history = getMutableAIState<ServerAI>();
  const stream = createStreamableValue<PartialAnalysisSchema>();

  const lang = languageTag();

  void (async () => {
    // Add the system prompt to the history, so the AI knows the rules.
    // Also, add the image to the history.
    history.update([
      {
        role: "system",
        content: Prompts.system[lang],
      },
      {
        role: "user",
        content: [
          {
            type: "image",
            image,
          },
        ],
      },
    ]);

    const { partialObjectStream } = await streamObject({
      model: getProvider()("gpt-4o"),
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

**Checkboxes**: ${object.checkboxes.map((checkbox) => checkbox.label).join(", ")}
`,
          },
        ]);
      },
    });

    for await (const partialObject of partialObjectStream) {
      stream.update({
        thinking: partialObject.thinking,
        checkboxes: partialObject.checkboxes,
      });
    }

    stream.done();
  })().catch((error) => {
    console.error(error);
    if (error instanceof Error) {
      stream.error(error.message);
    }
  });

  return {
    object: stream.value,
  };
}

export async function streamBreakdownUI(selection: string[]) {
  "use server";

  const lang = languageTag();

  const history = getAIState<ServerAI>();
  const stream = createStreamableUI(
    <BreakdownTable description={undefined} rows={undefined} />,
  );

  void (async () => {
    const { partialObjectStream } = await streamObject({
      model: getProvider()("gpt-4o"),
      messages: [
        ...history,
        {
          role: "user",
          content: Prompts.breakdown[lang](selection),
        },
      ],
      schema: z.object({
        introduction: z.string(),
        breakdown: z.array(
          z.object({
            ingredient: z.string(),
            portions: z.string(),
            totalCalories: z
              .number()
              .describe(
                "The total calories of the ingredient as a whole number",
              ),
          }),
        ),
      }),
      onFinish: ({ object }) => {
        if (!object) {
          throw new Error("No object returned");
        }

        stream.done(
          <BreakdownTable
            description={object.introduction}
            rows={object.breakdown.map((item) => ({
              ingredients: item.ingredient,
              portions: item.portions,
              calories: item.totalCalories,
            }))}
          />,
        );
      },
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(
        <BreakdownTable
          description={partialObject.introduction ?? ""}
          rows={partialObject.breakdown?.map((item) => ({
            ingredients: item?.ingredient ?? "",
            portions: item?.portions ?? "",
            calories: item?.totalCalories ?? 0,
          }))}
        />,
      );
    }
  })();

  return stream.value;
}

export type ServerMessage = CoreMessage;

export type AIState = ServerMessage[];

export const AI = createAI({
  initialAIState: [] as AIState,
  initialUIState: [],
  actions: {
    streamAnalysis,
    streamBreakdownUI,
  },
});

export type ServerAI = typeof AI;
