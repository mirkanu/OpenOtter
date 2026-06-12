import { NextRequest, NextResponse } from "next/server";
import { submitTranscription } from "@/lib/assemblyai";
import type { TranscribeResponse } from "@/lib/types";
import { z } from "zod";

// Disable caching for transcription endpoint
export const dynamic = "force-dynamic";

// Zod schema for request validation
// filepath is a local filesystem path (not a URL) — migration from Vercel Blob to local storage
const TranscribeRequestSchema = z.object({
  filepath: z.string().min(1, "filepath must be a non-empty local path"),
  filename: z.string().min(1, "filename is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = TranscribeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { filepath, filename } = validation.data;

    // Submit transcription job to AssemblyAI (accepts local file paths)
    const jobId = await submitTranscription(filepath);

    const response: TranscribeResponse & { filename: string; filepath: string } = {
      jobId,
      status: "queued",
      // Return filename and filepath so the client can pass them back
      // to GET /api/transcribe/[jobId] for database save on completion
      filename,
      filepath,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Transcription submission failed:", error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
