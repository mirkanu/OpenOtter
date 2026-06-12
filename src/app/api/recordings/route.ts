import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveRecording, getAllRecordings } from "@/lib/recording-store";
import type { TranscriptResult } from "@/lib/types";

export const dynamic = "force-dynamic";

// Zod schema for POST request validation
const SaveRecordingSchema = z.object({
  transcript: z.object({
    id: z.string(),
    status: z.enum(["processing", "completed", "error"]),
    text: z.string().optional(),
    utterances: z
      .array(
        z.object({
          speaker: z.string(),
          text: z.string(),
          start: z.number(),
          end: z.number(),
          confidence: z.number(),
        })
      )
      .optional(),
    error: z.string().optional(),
    audio_duration: z.number().optional(),
    confidence: z.number().optional(),
  }),
  filename: z.string().min(1),
  filepath: z.string().min(1), // local filesystem path — NOT a URL
});

// POST: Save transcription result to database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = SaveRecordingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { transcript, filename, filepath } = validation.data;

    // Save recording to database (synchronous better-sqlite3 call — no await)
    const recordingId = saveRecording(
      transcript as TranscriptResult,
      filename,
      filepath
    );

    return NextResponse.json(
      { id: recordingId, message: "Recording saved" },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to save recording:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET: List all recordings ordered by creation date DESC
export async function GET() {
  try {
    // Synchronous better-sqlite3 call — no await
    const recordings = getAllRecordings();

    return NextResponse.json({ recordings }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch recordings:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
