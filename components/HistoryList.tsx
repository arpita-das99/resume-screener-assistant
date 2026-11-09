"use client";

import { useEffect, useState } from "react";
import type { AnalysisDTO } from "@/lib/dto";
import { friendlyError, type ApiErrorBody } from "@/lib/api-errors";
import AnalysisReport from "./AnalysisReport";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const inputClass =
  "rounded-md border border-neutral-300 bg-transparent p-2 text-sm dark:border-neutral-700";

// The list is fetched on the client at request time so it is never a stale
// prerendered snapshot (the app uses cacheComponents).
export default function HistoryList() {
  const [name, setName] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<AnalysisDTO[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    // Debounce typing so we don't fire a request per keystroke.
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (name.trim()) params.set("name", name.trim());
      if (minScore) params.set("minScore", minScore);
      if (maxScore) params.set("maxScore", maxScore);

      try {
        const res = await fetch(`/api/analyses?${params}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const body = await res.json().catch(() => null);

        if (!res.ok) {
          setError(friendlyError(res.status, body as ApiErrorBody | null));
          return;
        }
        setItems(body.data as AnalysisDTO[]);
        setPagination(body.pagination as Pagination);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError(friendlyError(0, null));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, minScore, maxScore, page, reloadKey]);

  async function onDelete(id: string) {
    setDeleteError(null);
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) {
        const body = await res.json().catch(() => null);
        setDeleteError(friendlyError(res.status, body as ApiErrorBody | null));
        return;
      }
      setConfirmId(null);
      setOpenId(null);
      // If this was the last item on the page, step back a page.
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else setReloadKey((k) => k + 1);
    } catch {
      setDeleteError(friendlyError(0, null));
    }
  }

  function resetPageAnd(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setPage(1);
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-xs">
          Candidate name
          <input className={`${inputClass} w-56`} value={name} onChange={resetPageAnd(setName)} placeholder="Search…" />
        </label>
        <label className="flex flex-col text-xs">
          Min score
          <input type="number" min={0} max={100} className={`${inputClass} w-24`} value={minScore} onChange={resetPageAnd(setMinScore)} />
        </label>
        <label className="flex flex-col text-xs">
          Max score
          <input type="number" min={0} max={100} className={`${inputClass} w-24`} value={maxScore} onChange={resetPageAnd(setMaxScore)} />
        </label>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}

      {deleteError && (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {deleteError}
        </p>
      )}

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-neutral-500">No analyses match these filters.</p>
      )}

      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="rounded-lg border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setOpenId(openId === a.id ? null : a.id)}
              aria-expanded={openId === a.id}
              className="flex w-full items-center justify-between gap-4 p-3 text-left text-sm"
            >
              <span className="font-medium">{a.candidateName}</span>
              <span className="text-neutral-500">
                {new Date(a.createdAt).toLocaleString()} · score{" "}
                <strong className="text-foreground">{a.matchScore}</strong>
              </span>
            </button>
            {openId === a.id && (
              <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
                <AnalysisReport analysis={a} />
                <div className="mt-3 flex items-center gap-3 text-sm">
                  {confirmId === a.id ? (
                    <>
                      <span>Delete this analysis permanently?</span>
                      <button type="button" onClick={() => onDelete(a.id)} className="rounded-md bg-red-600 px-3 py-1 text-white">
                        Yes, delete
                      </button>
                      <button type="button" onClick={() => setConfirmId(null)} className="rounded-md border border-neutral-300 px-3 py-1 dark:border-neutral-700">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirmId(a.id)} className="text-red-600 hover:underline">
                      Delete analysis
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-40 dark:border-neutral-700"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-neutral-300 px-3 py-1 disabled:opacity-40 dark:border-neutral-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
