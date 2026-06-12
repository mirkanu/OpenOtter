import { RecordingCardSkeleton } from "@/components/RecordingCardSkeleton";

export default function Loading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <RecordingCardSkeleton key={i} />
      ))}
    </div>
  );
}
