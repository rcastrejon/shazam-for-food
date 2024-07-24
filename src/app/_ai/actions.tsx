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
import { z } from "zod";

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
import { SYSTEM_PROMPT } from "./prompts";
import { analysisSchema } from "./schemas";

export type ServerMessage = CoreMessage;

export async function streamAnalysis(image: string) {
  "use server";

  const history = getMutableAIState<ServerAI>();
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
        ],
      },
    ]);

    const { partialObjectStream } = await streamObject({
      model: openai("gpt-4o"),
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
    <BreakdownTable>
      <TableBody>
        <BreakdownTablePlaceholderRows n={4} />
      </TableBody>
    </BreakdownTable>,
  );

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
          <div>
            <h2 className="font-semibold tracking-tight">Calorie breakdown:</h2>
            <p className="text-sm">{object.name}</p>
            <BreakdownTable>
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
            </BreakdownTable>
          </div>,
        );
      },
    });

    for await (const partialObject of partialObjectStream) {
      stream.update(
        <div>
          <h2 className="font-semibold tracking-tight">Calorie breakdown:</h2>
          <p className="text-sm">{partialObject.name}</p>
          <BreakdownTable>
            <TableBody>
              {partialObject.breakdown?.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>{item?.ingredient}</TableCell>
                  <TableCell>{item?.portions}</TableCell>
                  <TableCell>{item?.totalCalories}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </BreakdownTable>
        </div>,
      );
    }
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
    streamBreakdownUI,
  },
});

export type ServerAI = typeof AI;
