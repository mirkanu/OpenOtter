import { NextRequest, NextResponse } from "next/server";
import { saveUploadedFile } from "@/lib/vercel-blob";
import { isValidAudioFile } from "@/lib/validation";
import { parseBuffer } from "music-metadata";
import type { UploadResponse } from "@/lib/types";

// Disable caching for upload endpoint
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidAudioFile(file)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload MP3, WAV, M4A, or AAC audio file." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Read fileLastModified from FormData (sent by AudioUploader per D-11)
    // Validation: parseInt with NaN check; if invalid, fall back to current time (T-01.6-04)
    const fileLastModifiedStr = formData.get("fileLastModified") as string | null;
    const parsedMs = fileLastModifiedStr ? parseInt(fileLastModifiedStr, 10) : NaN;
    const fileCreatedAt = !isNaN(parsedMs)
      ? new Date(parsedMs).toISOString()
      : new Date().toISOString();

    // Extract recorded_at from audio file metadata — nullable, never blocks upload (T-01.6-06)
    let recordedAt: string | null = null;
    try {
      const metadata = await parseBuffer(buffer, { mimeType: file.type });
      // common.date is "YYYY-MM-DD" string for M4A files (iPhone Voice Memos may or may not set it)
      recordedAt = metadata.common.date ?? null;
    } catch {
      // music-metadata failure must never block the upload
      recordedAt = null;
    }

    // Save to local storage
    const filepath = await saveUploadedFile(buffer, file.name);

    const response: UploadResponse = {
      filepath,
      filename: file.name,
      fileCreatedAt,
      recordedAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("File upload failed:", error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
