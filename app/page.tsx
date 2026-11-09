import AnalyzeForm from "@/components/AnalyzeForm";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">New analysis</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Paste a job description and a resume to get a structured match report.
      </p>
      <AnalyzeForm />
    </main>
  );
}
