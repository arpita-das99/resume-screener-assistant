import HistoryList from "@/components/HistoryList";

export const metadata = { title: "History | Resume Screener Assistant" };

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">History</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Past analyses. Search by candidate name or filter by score range.
      </p>
      <HistoryList />
    </main>
  );
}
