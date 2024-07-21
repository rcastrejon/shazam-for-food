import { z } from "zod";

export const analysisSchema = z.object({
  thinking: z.string(),
  checkboxes: z.array(
    z.object({
      label: z.string(),
    }),
  ),
});

const partialAnalysisSchema = analysisSchema.partial();

export type AnalysisSchema = z.infer<typeof analysisSchema>;
export type PartialAnalysisSchema = z.infer<typeof partialAnalysisSchema>;
