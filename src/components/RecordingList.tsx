import RecordingCard from "@/components/RecordingCard";
import type { RecordingMetadata } from "@/lib/types";

// No "use client" needed — pure rendering, no hooks

interface RecordingListProps {
  recordings: RecordingMetadata[];
}

export default function RecordingList({ recordings }: RecordingListProps) {
  return (
    <div className="space-y-3">
      {recordings.map((recording) => (
        <RecordingCard key={recording.id} recording={recording} />
      ))}
    </div>
  );
}
