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
import * as Prompts from "./prompts";
import { analysisSchema } from "./schemas";

initializeLanguage();

const openai = () => {
  const cookieStore = cookies();
  return createOpenAI({
    apiKey: cookieStore.get("API_KEY")?.value,
    compatibility: "strict",
  });
};

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
  })().catch((error) => {
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
          content: Prompts.breakdown[lang](selection),
        },
      ],
      schema: z.object({
        name: z.string(),
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
