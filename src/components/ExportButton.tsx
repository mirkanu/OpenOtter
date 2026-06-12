"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { formatDuration, formatDate } from "@/lib/utils";
import type { RecordingMetadata } from "@/lib/types";

// Build markdown export content synchronously from already-loaded data.
// Must be synchronous so clipboard API call occurs in the same gesture context (iOS Safari requirement).
function buildMarkdownExport(recording: RecordingMetadata): string {
  const title = recording.filename.replace(/\.[^.]+$/, "");
  const recordedDate = recording.recorded_at ?? recording.file_created_at;

  const lines: string[] = [
    `# ${title}`,
    "",
    recordedDate ? `**Recorded:** ${formatDate(recordedDate)}` : "",
    recording.transcribed_at ? `**Transcribed:** ${formatDate(recording.transcribed_at)}` : "",
    recording.audio_duration ? `**Duration:** ${formatDuration(recording.audio_duration)}` : "",
    recording.speaker_count ? `**Speakers:** ${recording.speaker_count}` : "",
    "",
    "---",
    "",
  ].filter(Boolean);

  for (const utterance of recording.utterances ?? []) {
    lines.push(`**${utterance.speaker}:** ${utterance.text}`);
    lines.push("");
  }

  // Remove consecutive blank lines
  return lines
    .reduce<string[]>((acc, line) => {
      if (line === "" && acc[acc.length - 1] === "") return acc;
      return [...acc, line];
    }, [])
    .join("\n");
}

function downloadMarkdownFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ExportButtonProps {
  recording: RecordingMetadata;
}

export function ExportButton({ recording }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Build content synchronously BEFORE any async work — preserves iOS gesture context
      const content = buildMarkdownExport(recording);
      const bytes = new TextEncoder().encode(content).length;

      const title = recording.filename
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/\s+/g, "-");
      const date = new Date().toISOString().slice(0, 10);
      const filename = `${title}-${date}.md`;

      if (bytes <= 50 * 1024) {
        // ≤ 50KB: copy to clipboard
        await navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard");
      } else {
        // > 50KB: download as .md file
        downloadMarkdownFile(content, filename);
        toast.success("Downloaded as .md");
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
    >
      <Download className="h-4 w-4 mr-2" />
      {exporting ? "Exporting…" : "Export"}
    </Button>
  );
}
