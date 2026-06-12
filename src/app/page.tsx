import RecordingList from "@/components/RecordingList";
import { EmptyState } from "@/components/EmptyState";
import { getAllRecordings } from "@/lib/recording-store";
import type { RecordingMetadata } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let recordings: RecordingMetadata[] = [];
  let error: string | null = null;

  try {
    recordings = getAllRecordings();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load recordings. Refresh the page to try again.
      </div>
    );
  }

  if (recordings.length === 0) {
    return <EmptyState />;
  }

  return <RecordingList recordings={recordings} />;
}
