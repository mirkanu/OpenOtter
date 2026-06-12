import { NextRequest, NextResponse } from "next/server";
import { getTranscriptionResult } from "@/lib/assemblyai";
import { saveRecording, updateTranscribedAt } from "@/lib/recording-store";
import type { TranscriptResult } from "@/lib/types";

// Disable caching for status endpoint
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    // Fetch transcription status from AssemblyAI
    const result = await getTranscriptionResult(jobId);

    // Save to database when transcription completes or errors.
    // filename and filepath are passed as query params from the client
    // (returned by POST /api/transcribe at submission time).
    // fileCreatedAt and recordedAt are forwarded from the upload response.
    let recordingId: string | undefined;
    if (result.status === "completed" || result.status === "error") {
      const { searchParams } = new URL(request.url);
      const filename = searchParams.get("filename");
      const filepath = searchParams.get("filepath");
      const fileCreatedAt = searchParams.get("fileCreatedAt") ?? undefined;
      const recordedAt = searchParams.get("recordedAt") ?? null;

      if (filename && filepath) {
        // Synchronous better-sqlite3 call — no await
        recordingId = saveRecording(
          result as TranscriptResult,
          filename,
          filepath,
          fileCreatedAt,
          recordedAt
        );

        // Set transcribed_at when status is 'completed' (not on error)
        if (result.status === "completed" && recordingId) {
          updateTranscribedAt(recordingId, new Date().toISOString());
        }
      }
    }

    return NextResponse.json(
      { ...result, ...(recordingId ? { recordingId } : {}) },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Transcription status check failed:", error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
