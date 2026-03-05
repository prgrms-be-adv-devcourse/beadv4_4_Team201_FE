export default function Loading() {
  return (
    <div className="max-w-lg mx-auto space-y-6 p-4">
      <div className="space-y-4">
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-px w-full animate-pulse rounded bg-gray-200" />
          <div className="flex justify-between">
            <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="text-right space-y-1">
              <div className="ml-auto h-3 w-8 animate-pulse rounded bg-gray-200" />
              <div className="ml-auto h-6 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
