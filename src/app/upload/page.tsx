"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AudioUploader from "@/components/AudioUploader";

export default function UploadPage() {
  const router = useRouter();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadComplete = (
    filepath: string,
    jobId: string,
    filename: string,
    fileCreatedAt?: string,
    recordedAt?: string | null
  ) => {
    const params = new URLSearchParams({ filename, filepath });
    if (fileCreatedAt) params.set("fileCreatedAt", fileCreatedAt);
    if (recordedAt) params.set("recordedAt", recordedAt);
    router.push(`/transcript/${jobId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Audio File
          </h1>
          <p className="text-gray-600 mb-6">
            Upload an audio recording (MP3, WAV, or M4A) and we'll transcribe it with speaker identification
          </p>

          <AudioUploader onUploadComplete={handleUploadComplete} />

          {uploadError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Supported Formats</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• MP3 (audio/mpeg)</li>
              <li>• WAV (audio/wav)</li>
              <li>• M4A (audio/mp4)</li>
            </ul>
            <p className="text-xs text-blue-700 mt-2">
              Maximum file size: 5GB. Processing time varies by length.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
