"use client";

import { useState } from "react";
import type { AnalysisDTO } from "@/lib/dto";
import { friendlyError, type ApiErrorBody } from "@/lib/api-errors";
import AnalysisReport from "./AnalysisReport";

const JD_MAX = 20000;
const RESUME_MAX = 30000;

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-transparent p-2 text-sm dark:border-neutral-700";

function FileButton({ onText }: { onText: (text: string) => void }) {
  return (
    <input
      type="file"
      accept=".txt,text/plain"
      className="text-xs"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) onText(await file.text());
        e.target.value = "";
      }}
    />
  );
}

export default function AnalyzeForm() {
  const [candidateName, setCandidateName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [result, setResult] = useState<AnalysisDTO | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setTruncated(false);

    try {
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateName, jobDescription, resumeText }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setError(friendlyError(res.status, body as ApiErrorBody | null));
        return;
      }
      setResult(body.data as AnalysisDTO);
      setTruncated(Boolean(body.truncated));
    } catch {
      setError(friendlyError(0, null));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Candidate name
          </label>
          <input
            id="name"
            className={inputClass}
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="jd" className="text-sm font-medium">
              Job description
            </label>
            <FileButton onText={setJobDescription} />
          </div>
          <textarea
            id="jd"
            rows={8}
            className={inputClass}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
          <p className={`text-xs ${jobDescription.length > JD_MAX ? "text-red-600" : "text-neutral-500"}`}>
            {jobDescription.length.toLocaleString()} / {JD_MAX.toLocaleString()} characters (min 50)
          </p>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="resume" className="text-sm font-medium">
              Resume
            </label>
            <FileButton onText={setResumeText} />
          </div>
          <textarea
            id="resume"
            rows={10}
            className={inputClass}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            required
          />
          <p className={`text-xs ${resumeText.length > RESUME_MAX ? "text-red-600" : "text-neutral-500"}`}>
            {resumeText.length.toLocaleString()} / {RESUME_MAX.toLocaleString()} characters (min 50).
            Paste text or upload a .txt file; PDFs are not supported.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {loading ? "Analysing…" : "Analyse resume"}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}
      {truncated && (
        <p role="status" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Input was shortened to fit the AI model&apos;s limits; the analysis covers the beginning of the text.
        </p>
      )}
      {result && <AnalysisReport analysis={result} />}
    </div>
  );
}
