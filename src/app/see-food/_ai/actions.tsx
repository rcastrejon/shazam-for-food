"use server";

import { cookies } from "next/headers";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

function getProvider() {
  const cookieStore = cookies();
  return createOpenAI({
    apiKey: cookieStore.get("API_KEY")?.value,
    compatibility: "strict",
  });
}

export async function getIsHotdog(dataURL: string) {
  "use server";

  const { object } = await generateObject({
    model: getProvider()("gpt-4o-mini"),
    system: "You generate three notifications for a messages app.",
    messages: [
      {
        role: "system",
        content: `\
You have perfect vision and pay great attention to detail which makes you an expert at identifying hotdogs. You are tasked with figuring out if the image is of a hotdog or not. Follow these step-by-step instructions:
Step 1: Identify the main object in the image.
Step 2: Check if the object is a hotdog.
Step 3: Return the result.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image",
            image: dataURL,
          },
        ],
      },
    ],
    schema: z.object({
      isHotdog: z.boolean().describe("Whether the image is a hotdog or not."),
    }),
  });

  return { isHotdog: object.isHotdog };
}
