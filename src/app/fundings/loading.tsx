export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-border bg-gray-50 py-16 md:py-24">
        <div className="mx-auto max-w-screen-xl px-6 md:px-12">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="space-y-4">
              <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-12 w-64 animate-pulse rounded bg-gray-200 md:h-14" />
              <div className="h-4 w-80 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex gap-8 pb-2 md:gap-12">
              <div className="space-y-1">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-screen-xl px-6 py-12 md:px-12">
        <div className="mb-12 flex items-center gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/5] w-full animate-pulse rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
