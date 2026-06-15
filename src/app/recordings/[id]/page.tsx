import { notFound } from "next/navigation";
import { ExportButton } from "@/components/ExportButton";
import SyncedTranscript from "@/components/SyncedTranscript";
import { formatDuration, formatDate } from "@/lib/utils";
import type { RecordingMetadata } from "@/lib/types";
import { getRecordingById } from "@/lib/recording-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RecordingDetailPage({ params }: PageProps) {
  const { id } = await params; // Next.js 15: params is a Promise

  let recording: RecordingMetadata | null = null;
  let error: string | null = null;

  try {
    recording = getRecordingById(id);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  if (!recording && !error) {
    notFound();
  }

  if (error || !recording) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load recording. Refresh the page to try again.
      </div>
    );
  }

  // Date display per D-10
  const recordedDisplay = recording.recorded_at
    ? `Recorded ${formatDate(recording.recorded_at)}`
    : recording.file_created_at
    ? `Recorded ${formatDate(recording.file_created_at)} (file date)`
    : null;

  const transcribedDisplay = recording.transcribed_at
    ? `Transcribed ${formatDate(recording.transcribed_at)}`
    : null;

  // Confidence: show as percentage if >= 50%, omit otherwise
  const confidenceDisplay =
    recording.confidence != null && recording.confidence >= 0.5
      ? `${Math.round(recording.confidence * 100)}% confidence`
      : null;

  // Proxy URL for audio playback
  const audioUrl = `/api/audio/${id}`;

  return (
    <div className="py-2 space-y-6">
      {/* Metadata block per D-12 */}
      <section className="space-y-3">
        <h1 className="text-xl font-semibold leading-tight">
          {recording.filename.replace(/\.[^.]+$/, "")}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {recordedDisplay && <span>{recordedDisplay}</span>}
          {transcribedDisplay && <span>{transcribedDisplay}</span>}
          {recording.audio_duration != null && (
            <span>{formatDuration(recording.audio_duration)}</span>
          )}
          {recording.speaker_count != null && recording.speaker_count > 0 && (
            <span>
              {recording.speaker_count}{" "}
              {recording.speaker_count === 1 ? "speaker" : "speakers"}
            </span>
          )}
          {confidenceDisplay && <span>{confidenceDisplay}</span>}
        </div>
        {/* Export button per D-13 */}
        <ExportButton recording={recording} />
      </section>

      {/* Synced transcript + audio player */}
      {recording.utterances && recording.utterances.length > 0 ? (
        <SyncedTranscript
          audioUrl={audioUrl}
          utterances={recording.utterances}
        />
      ) : (
        <div className="rounded-lg border border-muted bg-muted/20 p-4 text-sm text-muted-foreground">
          This recording does not have a transcript yet.
        </div>
      )}
    </div>
  );
}
