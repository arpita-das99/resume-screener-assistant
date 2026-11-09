
import { z } from "zod";

export const analysisResultSchema = z.object({
  matchScore: z.number().int().min(0).max(100),

  matchingSkills: z
    .array(z.string().trim().min(1))
    .length(5),

  skillGaps: z
    .array(z.string().trim().min(1))
    .length(3),

  interviewQuestions: z
    .array(z.string().trim().min(1))
    .length(3),
}).strict();

export const createAnalysisSchema = z.object({
  candidateName: z.string().trim().min(2).max(100),

  ...analysisResultSchema.shape,
}).strict();

export type AnalysisResult = z.infer<
  typeof analysisResultSchema
>;

export type CreateAnalysisInput = z.infer<
  typeof createAnalysisSchema
>;
