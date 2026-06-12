import Link from "next/link";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

// No "use client" needed

export function EmptyState() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-2">
        <Mic className="w-8 h-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No transcripts yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Upload an audio file to get started.
        </p>
      </div>
      <Button asChild>
        <Link href="/upload">New Transcript</Link>
      </Button>
    </div>
  );
}
