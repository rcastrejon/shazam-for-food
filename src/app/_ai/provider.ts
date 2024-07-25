import { cookies } from "next/headers";
import { createOpenAI } from "@ai-sdk/openai";

export function initializeProvider() {
  const cookieStore = cookies();
  return createOpenAI({
    apiKey: cookieStore.get("X-API-KEY")?.value,
    compatibility: "strict",
  });
}
