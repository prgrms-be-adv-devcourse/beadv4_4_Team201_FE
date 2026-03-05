export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-7 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/50">
            <div className="flex gap-4 p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 border-b p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
