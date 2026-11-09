
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { analyzeResume } from "@/lib/ai/gorq";
import { analysisRequestSchema } from "@/lib/schemas/analysis.schema";
import AnalysisModel from "@/models/analysis.model";

export const runtime = "nodejs";

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
  let result;

  try {
    result = await analyzeResume(jobDescription, resumeText);
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
      ...result,
    });

    // 6. Return result
    return NextResponse.json(
      {
        message: "Analysis completed successfully",
        data: analysis,
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
