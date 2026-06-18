/**
 * Transcript types for AssemblyAI responses
 * Source: AssemblyAI SDK documentation
 */

export interface TranscriptUtterance {
  speaker: string;
  text: string;
  start: number;  // milliseconds
  end: number;    // milliseconds
  confidence: number;
}

export interface TranscriptResult {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  utterances?: TranscriptUtterance[];
  error?: string;
  audio_duration?: number;
  confidence?: number;
}

export interface TranscriptionJob {
  jobId: string;
  filepath: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  createdAt: Date;
}

export interface UploadRequest {
  filename: string;
  contentType: string;
}

export interface UploadResponse {
  filepath: string;
  filename: string;
  fileCreatedAt?: string;
  recordedAt?: string | null;
}

export interface TranscribeRequest {
  filepath: string;
}

export interface TranscribeResponse {
  jobId: string;
  status: string;
}

export interface RecordingMetadata {
  id: string;
  filename: string;
  filepath: string; // local filesystem path
  status: 'queued' | 'processing' | 'completed' | 'error';
  audio_duration?: number;
  confidence?: number;
  speaker_count?: number;
  utterances?: TranscriptUtterance[];
  created_at: string; // SQLite datetime string (TEXT column)
  updated_at: string; // SQLite datetime string (TEXT column)
  file_created_at?: string;  // ISO string from file.lastModified (sent by client at upload time)
  recorded_at?: string;      // ISO string from audio file metadata (music-metadata); null if not embedded
  transcribed_at?: string;   // ISO string set when AssemblyAI transcription status becomes 'completed'
}

import { z } from 'zod';

export const TranscriptUtteranceSchema = z.object({
  speaker: z.string(),
  text: z.string(),
  start: z.number(),
  end: z.number(),
  confidence: z.number().min(0).max(1),
});

export const TranscriptResultSchema = z.object({
  id: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'error']),
  text: z.string().optional(),
  utterances: z.array(TranscriptUtteranceSchema).optional(),
  error: z.string().optional(),
  audio_duration: z.number().optional(),
  confidence: z.number().optional(),
});
