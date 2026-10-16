// Placeholder shaped like the dashboard: header, four metrics, table rows.
export default function Skeleton() {
  const block = "animate-pulse rounded bg-surface-elevated";

  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading results">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:py-12">
        <div className="flex items-center gap-4">
          <div className={`${block} size-14 shrink-0`} />
          <div className="space-y-2.5">
            <div className={`${block} h-7 w-56`} />
            <div className={`${block} h-4 w-80 max-w-full`} />
          </div>
        </div>

        <div className="home-panel overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-4 bg-surface p-6">
                <div className={`${block} h-3 w-20`} />
                <div className={`${block} h-9 w-28`} />
                <div className={`${block} h-3 w-24`} />
              </div>
            ))}
          </div>
        </div>

        <div className="home-panel overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between border-b border-border px-5 py-5 last:border-0">
              <div className={`${block} h-4 w-1/2`} />
              <div className={`${block} h-4 w-16`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
