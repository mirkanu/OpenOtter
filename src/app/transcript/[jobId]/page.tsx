"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import type { TranscriptResult } from "@/lib/types";

export default function TranscriptPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = params.jobId as string;
  const filename = searchParams.get("filename") ?? "";
  const filepath = searchParams.get("filepath") ?? "";
  const fileCreatedAt = searchParams.get("fileCreatedAt");
  const recordedAt = searchParams.get("recordedAt");

  const [transcript, setTranscript] = useState<TranscriptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let shouldContinue = true;

    const pollTranscript = async () => {
      if (!shouldContinue) return;

      try {
        const pollParams = new URLSearchParams();
        if (filename) pollParams.set("filename", filename);
        if (filepath) pollParams.set("filepath", filepath);
        if (fileCreatedAt) pollParams.set("fileCreatedAt", fileCreatedAt);
        if (recordedAt) pollParams.set("recordedAt", recordedAt);
        const qs = pollParams.toString() ? `?${pollParams.toString()}` : "";
        const response = await fetch(`/api/transcribe/${jobId}${qs}`);
        if (!response.ok) {
          throw new Error("Failed to fetch transcript");
        }

        const data: TranscriptResult = await response.json();
        setTranscript(data);

        if (data.status === "completed" || data.status === "error") {
          setLoading(false);
          shouldContinue = false;
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err) {
        if (shouldContinue) {
          const message = err instanceof Error ? err.message : "Failed to load transcript";
          setError(message);
          setLoading(false);
          shouldContinue = false;
          if (intervalId) clearInterval(intervalId);
        }
      }
    };

    // Initial poll
    pollTranscript();

    // Poll every 3 seconds if still processing
    if (loading) {
      intervalId = setInterval(() => {
        pollTranscript();
      }, 3000);
    }

    return () => {
      shouldContinue = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Transcript
            </h1>
            <button
              onClick={() => router.push("/upload")}
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Upload Another
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing audio... This may take a few minutes.</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && transcript && transcript.status === "completed" && (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Duration: {transcript.audio_duration ? Math.floor(transcript.audio_duration / 60) : 0} minutes
                </p>
                <p className="text-sm text-gray-600">
                  Speakers: {transcript.utterances ? [...new Set(transcript.utterances.map(u => u.speaker))].length : 0}
                </p>
              </div>
              <TranscriptDisplay utterances={transcript.utterances || []} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
