export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 py-6 md:space-y-8 md:px-8 md:py-10">
      <div className="border-b border-border pb-8">
        <div className="mb-4 h-3 w-16 animate-pulse rounded bg-gray-200" />
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="h-9 w-40 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            <div className="h-11 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-11 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-12 animate-pulse rounded bg-gray-200" />
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="h-5 w-5 shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-1 text-right">
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
