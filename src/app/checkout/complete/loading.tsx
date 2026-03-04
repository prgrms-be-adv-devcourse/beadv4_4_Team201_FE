export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
      <div className="space-y-1">
        <div className="mx-auto h-5 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
