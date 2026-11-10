import { NextResponse } from "next/server";
import { extractText } from "unpdf";

const MAX_PDF_BYTES = 4 * 1024 * 1024;
const MIN_TEXT_CHARS = 50;

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid upload. Please choose a PDF file." },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "No file was uploaded." },
      { status: 400 }
    );
  }

  if (file.size > MAX_PDF_BYTES) {
    return NextResponse.json(
      { message: "PDF is too large. The maximum size is 4 MB." },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Check the real content, not the file name or the client-supplied type.
  const isPdf =
    bytes.length >= 5 &&
    String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]) ===
      "%PDF-";

  if (!isPdf) {
    return NextResponse.json(
      { message: "That file is not a valid PDF." },
      { status: 400 }
    );
  }

  let text: string;

  try {
    const result = await extractText(bytes, { mergePages: true });
    text = result.text.trim();
  } catch (error) {
    // Never log file contents, only the error type.
    console.error(
      "PDF extraction failed:",
      error instanceof Error ? error.name : "Unknown error"
    );

    return NextResponse.json(
      {
        message:
          "Could not read this PDF. It may be corrupt or password-protected.",
      },
      { status: 422 }
    );
  }

  if (text.length < MIN_TEXT_CHARS) {
    return NextResponse.json(
      {
        message:
          "No text found in this PDF. It may be a scanned image; please paste the text instead.",
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ text });
}
