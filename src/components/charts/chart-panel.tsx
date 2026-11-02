export function ChartPanel({
  id,
  title,
  description,
  action,
  children,
  className,
}: {
  id: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={`border bg-card ${className ?? ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div>
          <h2 id={id} className="text-sm font-semibold">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}
