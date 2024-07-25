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
import {
  TableBody,
  TableCell,
  TableFooter,
  TableRow,
} from "~/components/ui/table";
import {
  BreakdownTable,
  BreakdownTablePlaceholderRows,
} from "../_components/breakdown-table";
import { analysisSchema } from "./schemas";

initializeLanguage();

const openai = () => {
  const cookieStore = cookies();
  return createOpenAI({
    apiKey: cookieStore.get("X-API-KEY")?.value,
    compatibility: "strict",
  });
};

export async function streamAnalysis(image: string) {
  "use server";

  const history = getMutableAIState<ServerAI>();
  const stream = createStreamableValue<PartialAnalysisSchema>();

  const language = languageTag() === "en" ? "English" : "Spanish";

  void (async () => {
    // Add the system prompt to the history, so the AI knows the rules.
    // Also, add the image to the history.
    history.update([
      {
        role: "system",
        content: `\
You have perfect vision and pay great attention to detail which makes you an expert at identifying ingredients in food. You are tasked with figuring out the exact ingredients shown in the picture and give the dish an appropriate name. Follow these step-by-step instructions:

**Step 1** - First, think step-by-step in 'thinking' field and analyze every part of the image. You will be as descriptive as possible; describe the portions, harmony of flavors, and your certainty about each ingredient. Discuss any uncertainties and provide potential options to clear them up.

**Step 2** - Before providing a list of ingredients, and to clear up any uncertainties you have, I will help you out. For that, provide a list of checkboxes I can choose from. So, for every uncertainty, you will give me different options and I will select the ones that best apply to the dish. Assume that any option not chosen does not apply.

**RULES**:
- The 'thinking' field should be explicit, written in natural language, easy to follow and written in plain text.
- The 'checkboxes' field should only be used to clear up uncertainties. If you are certain about an ingredient, you should not include it.
- Do not include ambiguous options in the 'checkboxes' field. For example, do not include "**Other** type of sauce", "**Other** type of cheese", etc. Instead, provide a list of **specific options** that are relevant to the dish.
- Ensure the 'checkboxes' field is a list of clickable checkboxes; the user cannot provide custom text.
- Every message you send should be in **${language}**, no matter the language of the user.
- **Carefully follow these instructions.**\
`,
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
      model: openai()("gpt-4o"),
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
  })();

  return {
    object: stream.value,
  };
}

export async function streamBreakdownUI(selection: string[]) {
  "use server";

  const history = getAIState<ServerAI>();
  const stream = createStreamableUI(
    <BreakdownTable description="...">
      <TableBody>
        <BreakdownTablePlaceholderRows n={4} />
      </TableBody>
    </BreakdownTable>,
  );

  void (async () => {
    const { partialObjectStream } = await streamObject({
      model: openai()("gpt-4o"),
      temperature: 0.7,
      messages: [
        ...history,
        {
          role: "user",
          content: `\
**Selection**: ${selection.join(", ")}.

Determine the **exact** portions of each ingredient in the picture and give me the full calorie breakdown of each ingredient.
`,
        },
      ],
      schema: z.object({
        name: z
          .string()
          .describe("The name of the dish. Starting with 'It looks like'"),
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
          <BreakdownTable description={object.name}>
            <TableBody>
              {object.breakdown.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item.ingredient}</TableCell>
                  <TableCell>{item.portions}</TableCell>
                  <TableCell>{item.totalCalories}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2}>Total</TableCell>
                <TableCell>
                  {object.breakdown.reduce(
                    (acc, item) => acc + item.totalCalories,
                    0,
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </BreakdownTable>,
        );
      },
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(
        <BreakdownTable description={partialObject.name ?? ""}>
          <TableBody>
            {partialObject.breakdown?.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item?.ingredient}</TableCell>
                <TableCell>{item?.portions}</TableCell>
                <TableCell>{item?.totalCalories}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </BreakdownTable>,
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
