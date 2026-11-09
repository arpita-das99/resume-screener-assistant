import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          Resume Screener Assistant
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="hover:underline">
            New analysis
          </Link>
          <Link href="/history" className="hover:underline">
            History
          </Link>
        </div>
      </nav>
    </header>
  );
}
