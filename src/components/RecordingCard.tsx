import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDuration, formatDate } from "@/lib/utils";
import type { RecordingMetadata } from "@/lib/types";

// No "use client" needed — pure rendering, no hooks

interface RecordingCardProps {
  recording: RecordingMetadata;
}

export default function RecordingCard({ recording }: RecordingCardProps) {
  // Date display per D-10:
  // Use recorded_at if available; else fall back to file_created_at with "(file date)" suffix
  const recordedLabel = recording.recorded_at
    ? `Recorded ${formatDate(recording.recorded_at)}`
    : recording.file_created_at
    ? `Recorded ${formatDate(recording.file_created_at)} (file date)`
    : null;

  const badgeVariant =
    recording.status === "completed"
      ? "default"
      : recording.status === "error"
      ? "destructive"
      : "secondary";

  return (
    <Link href={`/recordings/${recording.id}`} className="block">
      <Card className="hover:bg-accent active:scale-[0.98] transition-all duration-150 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Title: strip file extension per D-12 */}
              <h3 className="text-base font-semibold truncate">
                {recording.filename.replace(/\.[^.]+$/, "")}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                {recordedLabel && <span>{recordedLabel}</span>}
                {recording.audio_duration != null && (
                  <span>{formatDuration(recording.audio_duration)}</span>
                )}
                {recording.speaker_count != null && recording.speaker_count > 0 && (
                  <span>
                    {recording.speaker_count}{" "}
                    {recording.speaker_count === 1 ? "speaker" : "speakers"}
                  </span>
                )}
              </div>
            </div>
            <Badge variant={badgeVariant}>{recording.status}</Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
