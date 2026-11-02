import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl border bg-card px-6 py-10">
      <p className="font-mono text-[11px] text-muted-foreground">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">This view does not exist</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        The market, product or page may have moved. Return to the portfolio to pick a valid scope.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex h-9 items-center border px-3 text-xs font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Back to overview
      </Link>
    </div>
  );
}
