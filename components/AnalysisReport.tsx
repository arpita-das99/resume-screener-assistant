import type { AnalysisDTO } from "@/lib/dto";

function scoreColor(score: number) {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function List({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <section>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <Tag className={`space-y-1 pl-5 text-sm ${ordered ? "list-decimal" : "list-disc"}`}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Tag>
    </section>
  );
}

export default function AnalysisReport({ analysis }: { analysis: AnalysisDTO }) {
  return (
    <article className="space-y-5 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
      <header className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold">{analysis.candidateName}</h2>
        <p className="text-sm">
          Match score{" "}
          <span className={`text-2xl font-bold ${scoreColor(analysis.matchScore)}`}>
            {analysis.matchScore}
          </span>
          /100
        </p>
      </header>
      <List title="Top matching skills" items={analysis.matchingSkills} />
      <List title="Gaps" items={analysis.skillGaps} />
      <List title="Suggested interview questions" items={analysis.interviewQuestions} ordered />
      <p className="text-xs text-neutral-500">
        The score is an AI estimate to support, not replace, a human hiring decision.
      </p>
    </article>
  );
}
