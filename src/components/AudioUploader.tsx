"use client";

import { useState, useCallback } from "react";
import { isValidAudioFile } from "@/lib/validation";
import type { UploadResponse } from "@/lib/types";

interface AudioUploaderProps {
  onUploadComplete: (
    filepath: string,
    jobId: string,
    filename: string,
    fileCreatedAt?: string,
    recordedAt?: string | null
  ) => void;
}

export default function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    if (!isValidAudioFile(file)) {
      setError("Please select an MP3, WAV, or M4A audio file");
      return;
    }

    // Validate file size (5GB = 5 * 1024 * 1024 * 1024 bytes)
    const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5GB limit. Please use a smaller file.");
      return;
    }

    // Validate file is not empty
    if (file.size === 0) {
      setError("File is empty. Please select a valid audio file.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("file", file);
      // Send file.lastModified so the server can store file_created_at (D-11)
      formData.append("fileLastModified", file.lastModified.toString());

      // Upload file to server-side storage
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload file");
      }

      const uploadData: UploadResponse = await uploadResponse.json();
      setProgress(100);

      // Submit transcription job with filepath
      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filepath: uploadData.filepath, filename: uploadData.filename }),
      });

      if (!transcribeResponse.ok) {
        throw new Error("Failed to submit transcription job");
      }

      const transcribeData = await transcribeResponse.json();
      onUploadComplete(
        uploadData.filepath,
        transcribeData.jobId,
        uploadData.filename,
        uploadData.fileCreatedAt,
        uploadData.recordedAt
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Uploading... {progress.toFixed(0)}%</p>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">MP3, WAV, or M4A (MAX. 5GB)</p>
              </>
            )}
          </div>
          <input
            type="file"
            className="hidden"
            accept="audio/*,.mp3,.wav,.m4a"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            disabled={uploading}
          />
        </label>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
