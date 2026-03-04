export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-xl px-6 py-10">
      <div className="mb-10 rounded-xl border border-border bg-card p-8">
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mb-6 h-5 w-72 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="flex gap-10">
        <div className="w-48 shrink-0 space-y-8">
          <div className="h-40 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-40 w-full animate-pulse rounded bg-gray-200" />
        </div>
        <div className="flex-1 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i}>
              <div className="aspect-[3/4] animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
