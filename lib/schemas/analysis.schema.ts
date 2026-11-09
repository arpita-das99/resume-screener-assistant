
import { z } from "zod";


export const analysisRequestSchema = z.object({
  candidateName: z
    .string()
    .trim()
    .min(2, "Candidate name must be at least 2 characters")
    .max(100),

  jobDescription: z
    .string()
    .trim()
    .min(50, "Job description must be at least 50 characters")
    .max(20000),

  resumeText: z
    .string()
    .trim()
    .min(50, "Resume must be at least 50 characters")
    .max(30000),
}).strict();

export type AnalysisRequest = z.infer<
  typeof analysisRequestSchema
>;


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


// Query params for GET /api/analyses. Empty strings (from blank form
// fields) are treated as "not provided".
const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().pipe(schema).optional(),
  );

export const listQuerySchema = z
  .object({
    name: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.string().trim().max(100).optional(),
    ),
    minScore: optionalNumber(z.number().min(0).max(100)),
    maxScore: optionalNumber(z.number().min(0).max(100)),
    page: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.coerce.number().int().min(1).default(1),
    ),
    limit: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.coerce.number().int().min(1).max(50).default(10),
    ),
  })
  .refine(
    (q) =>
      q.minScore === undefined ||
      q.maxScore === undefined ||
      q.minScore <= q.maxScore,
    { message: "minScore must not be greater than maxScore", path: ["minScore"] },
  );

export type ListQuery = z.infer<typeof listQuerySchema>;
