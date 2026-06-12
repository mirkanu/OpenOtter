import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getRecordingById } from "@/lib/recording-store";

export const dynamic = "force-dynamic";

/**
 * Infer MIME type from file extension.
 * .m4a files are MPEG-4 Audio — content-type is audio/mp4.
 */
function getContentType(filepath: string): string {
  const ext = path.extname(filepath).toLowerCase();
  switch (ext) {
    case ".m4a":
      return "audio/mp4";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    case ".webm":
      return "audio/webm";
    default:
      return "application/octet-stream";
  }
}

/**
 * Audio proxy — streams a local audio file to the browser by recording ID.
 *
 * Security: The [id] param is ONLY used as a database lookup key.
 * The actual file path comes from recording.filepath (trusted DB value),
 * never from the URL — preventing path traversal attacks.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Recording ID is required" },
        { status: 400 }
      );
    }

    // Synchronous DB lookup — filepath from trusted DB record, not from URL
    const recording = getRecordingById(id);

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    // Read local audio file using the trusted DB filepath
    const fileBuffer = await readFile(recording.filepath);
    const contentType = getContentType(recording.filepath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to stream audio file:", error);

    // Return 404 if file not found on disk (deleted but still in DB)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
