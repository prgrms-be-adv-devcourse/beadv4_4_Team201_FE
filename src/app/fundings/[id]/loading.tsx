export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col space-y-6 p-4 pb-12">
      <div className="relative mx-auto aspect-square w-full max-h-[300px] max-w-[300px] animate-pulse overflow-hidden rounded-xl bg-gray-200" />
      <div className="space-y-1">
        <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-2 w-full animate-pulse rounded bg-gray-200" />
        <div className="flex justify-between">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 rounded-xl bg-secondary/60 p-4">
          <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-1 rounded-xl border border-primary/20 bg-primary/10 p-4">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="mt-4 h-14 w-full animate-pulse rounded bg-gray-200" />
    </div>
  );
}
