import type { DeepPartial } from "ai";
import { z } from "zod";

export const analysisSchema = z.object({
  thinking: z.string(),
  checkboxes: z.array(
    z.object({
      label: z.string(),
    }),
  ),
});

export type AnalysisSchema = z.infer<typeof analysisSchema>;
export type PartialAnalysisSchema = DeepPartial<AnalysisSchema>;
