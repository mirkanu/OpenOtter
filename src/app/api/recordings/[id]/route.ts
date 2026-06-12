import { NextRequest, NextResponse } from "next/server";
import { getRecordingById, deleteRecording } from "@/lib/recording-store";
import { deleteFile } from "@/lib/vercel-blob";

export const dynamic = "force-dynamic";

// GET: Fetch individual recording by ID
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

    // Synchronous better-sqlite3 call — no await
    const recording = getRecordingById(id);

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recording, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch recording:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Remove recording from database and delete local audio file
export async function DELETE(
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

    // Synchronous better-sqlite3 call — no await — get recording first for filepath
    const recording = getRecordingById(id);

    if (!recording) {
      return NextResponse.json(
        { error: "Recording not found" },
        { status: 404 }
      );
    }

    // Delete from database (synchronous — no await)
    const deleted = deleteRecording(id);

    if (deleted && recording.filepath) {
      // Delete local audio file — best-effort (continue even if file missing)
      try {
        await deleteFile(recording.filepath);
      } catch (fileError) {
        console.warn(
          `Failed to delete local file ${recording.filepath}:`,
          fileError
        );
        // Continue — database entry is removed; file cleanup is non-critical
      }
    }

    return NextResponse.json({ message: "Recording deleted" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to delete recording:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
