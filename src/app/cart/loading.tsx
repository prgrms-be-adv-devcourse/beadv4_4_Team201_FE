export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="h-7 w-24 animate-pulse rounded bg-gray-200 mb-8 md:mb-12" />
      <div className="md:hidden space-y-0">
        <div className="flex items-center justify-between py-4 border-b border-foreground">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 py-5 border-b border-border">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200 mt-1" />
            <div className="h-24 w-20 animate-pulse rounded bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-1 w-full animate-pulse rounded bg-gray-200" />
              <div className="flex justify-between">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block">
        <div className="grid grid-cols-8 gap-4 border-b border-foreground pb-3 pt-4">
          <div className="col-span-1 h-4 w-4 animate-pulse rounded bg-gray-200" />
          <div className="col-span-5 h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="col-span-2 mx-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="grid grid-cols-8 items-start gap-4 border-b border-border py-6">
            <div className="col-span-1 mt-1 h-4 w-4 animate-pulse rounded bg-gray-200" />
            <div className="col-span-5 flex gap-4">
              <div className="h-[130px] w-[100px] animate-pulse rounded bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="col-span-2 mx-auto h-6 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
