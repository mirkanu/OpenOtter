import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="py-2 space-y-6">
      {/* Metadata block skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-3/4" />
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      {/* Transcript skeleton — 8 bars */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
