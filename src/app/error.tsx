"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl border bg-card px-6 py-10">
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center border border-destructive/35 bg-destructive/5 text-destructive"
      >
        <CircleAlert className="size-4" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-[-0.03em]">Something went wrong</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        The view could not be rendered. Your selection is preserved in the URL, so retrying is safe.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center gap-1.5 bg-primary px-3 text-xs font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw aria-hidden="true" className="size-3.5" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-9 items-center border px-3 text-xs font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
