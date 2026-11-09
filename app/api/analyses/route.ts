
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { analyzeResume } from "@/lib/ai/groq";
import {
  analysisRequestSchema,
  listQuerySchema,
} from "@/lib/schemas/analysis.schema";
import { toDTO } from "@/lib/dto";
import AnalysisModel from "@/models/analysis.model";

export async function POST(request: NextRequest) {
  // 1. Parse request body
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  // 2. Validate input
  const validation = analysisRequestSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        message: "Invalid input",
        errors: validation.error.flatten(),
      },
      { status: 400 }
    );
  }

  const {
    candidateName,
    jobDescription,
    resumeText,
  } = validation.data;

  // 3. Connect to MongoDB
  try {
    await connectDB();
  } catch (error) {
    console.error(
      "Database connection failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return NextResponse.json(
      { message: "Database temporarily unavailable" },
      { status: 503 }
    );
  }

  // 4. Generate AI analysis
  let outcome;

  try {
    outcome = await analyzeResume(jobDescription, resumeText);
  } catch (error) {
    console.error(
      "AI analysis failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return NextResponse.json(
      { message: "Unable to analyze resume. Please try again." },
      { status: 502 }
    );
  }

  // 5. Save analysis
  try {
    const analysis = await AnalysisModel.create({
      candidateName,
      ...outcome.result,
    });

    // 6. Return result
    return NextResponse.json(
      {
        message: "Analysis completed successfully",
        data: toDTO(analysis),
        truncated: outcome.truncated,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Analysis persistence failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return NextResponse.json(
      { message: "Unable to save analysis" },
      { status: 503 }
    );
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = listQuerySchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid query", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, minScore, maxScore, page, limit } = parsed.data;

  const filter: Record<string, unknown> = {};

  if (name) {
    filter.candidateName = { $regex: escapeRegex(name), $options: "i" };
  }

  if (minScore !== undefined || maxScore !== undefined) {
    filter.matchScore = {
      ...(minScore !== undefined && { $gte: minScore }),
      ...(maxScore !== undefined && { $lte: maxScore }),
    };
  }

  try {
    await connectDB();

    const [docs, total] = await Promise.all([
      AnalysisModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AnalysisModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      data: docs.map(toDTO),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error(
      "Analysis listing failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return NextResponse.json(
      { message: "Unable to load analyses" },
      { status: 503 }
    );
  }
}
