
import { Schema, models, model, InferSchemaType } from "mongoose";

const analysisSchema = new Schema(
  {
    candidateName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    matchingSkills: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length === 5,
        message: "Exactly 5 matching skills are required",
      },
    },

    skillGaps: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length === 3,
        message: "Exactly 3 skill gaps are required",
      },
    },

    interviewQuestions: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length === 3,
        message: "Exactly 3 interview questions are required",
      },
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

analysisSchema.index({ candidateName: 1 });
analysisSchema.index({ matchScore: 1 });
analysisSchema.index({ createdAt: -1 });

export type Analysis = InferSchemaType<typeof analysisSchema>;

const AnalysisModel =
  models.Analysis || model("Analysis", analysisSchema);

export default AnalysisModel;
