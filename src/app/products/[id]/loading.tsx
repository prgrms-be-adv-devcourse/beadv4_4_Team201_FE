export default function Loading() {
  return (
    <div className="mx-auto max-w-screen-2xl px-8">
      <div className="flex min-h-screen gap-12">
        <aside className="hidden lg:block sticky top-40 h-[calc(100vh-10rem)] w-40 flex-shrink-0 overflow-y-auto pt-4">
          <div className="mb-6 h-3 w-24 animate-pulse rounded bg-gray-200" />
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            ))}
          </ul>
        </aside>
        <main className="min-w-0 flex-1 pb-20">
          <div className="py-4">
            <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 gap-8 pb-8 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <div className="aspect-square max-w-[90%] animate-pulse rounded bg-gray-200" />
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-square animate-pulse rounded bg-gray-200" />
                ))}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="space-y-6">
                <div>
                  <div className="mb-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-full animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-px w-full animate-pulse rounded bg-gray-200" />
                <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              <div className="flex-1" />
              <div className="mt-6 space-y-4">
                <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
                <div className="flex gap-3">
                  <div className="h-12 w-14 flex-shrink-0 animate-pulse rounded bg-gray-200" />
                  <div className="h-12 w-14 flex-shrink-0 animate-pulse rounded bg-gray-200" />
                  <div className="h-12 flex-1 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-14 w-full animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
