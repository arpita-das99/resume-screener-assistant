import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectDB } from "@/lib/mongodb";
import AnalysisModel from "@/models/analysis.model";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/analyses/[id]">
) {
  const { id } = await ctx.params;

  // Reject malformed ids up front so they return 400, not a 500 cast error.
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: "Invalid analysis id" }, { status: 400 });
  }

  try {
    await connectDB();
    const deleted = await AnalysisModel.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "Analysis not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Analysis deleted" });
  } catch (error) {
    console.error(
      "Analysis deletion failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return NextResponse.json(
      { message: "Unable to delete analysis" },
      { status: 503 }
    );
  }
}
