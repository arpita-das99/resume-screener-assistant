"use client";

import { useState } from "react";
import { friendlyError } from "@/lib/api-errors";

export default function FileButton({
  onText,
  onError,
}: {
  onText: (text: string) => void;
  onError: (message: string | null) => void;
}) {
  const [reading, setReading] = useState(false);

  async function handleFile(file: File) {
    onError(null);

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      onText(await file.text());
      return;
    }

    // PDFs are parsed on the server; the text then lands in the textarea.
    setReading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/extract-text", { method: "POST", body });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        onError(data?.message ?? "Could not read this PDF. Please paste the text instead.");
        return;
      }
      onText(data.text as string);
    } catch {
      onError(friendlyError(0, null));
    } finally {
      setReading(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      {reading && <span className="text-xs text-neutral-500">Reading PDF…</span>}
      <input
        type="file"
        accept=".txt,.pdf,text/plain,application/pdf"
        className="text-xs"
        disabled={reading}
        onChange={async (e) => {
          const input = e.target;
          const file = input.files?.[0];
          if (file) await handleFile(file);
          input.value = "";
        }}
      />
    </span>
  );
}
