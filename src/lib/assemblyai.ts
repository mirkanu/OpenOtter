import { AssemblyAI } from "assemblyai";
import type { TranscriptResult } from './types';

/**
 * AssemblyAI client singleton for audio transcription.
 * NEVER import this in client-side code — API key must be protected.
 */
let client: AssemblyAI | null = null;

export function getAssemblyAIClient(): AssemblyAI {
  if (!client) {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error("ASSEMBLYAI_API_KEY environment variable is not set");
    }

    client = new AssemblyAI({ apiKey });
  }

  return client;
}

/**
 * Submit audio file for transcription with speaker diarization.
 * @param filepath - Local path to audio file
 * @returns Transcript ID for status polling
 */
export async function submitTranscription(filepath: string): Promise<string> {
  const client = getAssemblyAIClient();

  const transcript = await client.transcripts.submit({
    audio: filepath,  // AssemblyAI accepts local file paths
    speaker_labels: true,
    speaker_options: {
      min_speakers_expected: 1,
      max_speakers_expected: 10,
    },
  });

  return transcript.id;
}

/**
 * Get transcription status and result.
 * @param transcriptId - AssemblyAI transcript ID
 * @returns Transcript result with utterances if completed
 */
export async function getTranscriptionResult(
  transcriptId: string
): Promise<TranscriptResult> {
  const client = getAssemblyAIClient();

  const transcript = await client.transcripts.get(transcriptId);

  // Map AssemblyAI status to our status type
  let status: 'queued' | 'processing' | 'completed' | 'error';

  const transcriptStatus = transcript.status as string;
  if (transcriptStatus === 'completed') {
    status = 'completed';
  } else if (transcriptStatus === 'error' || transcriptStatus === 'cancelled') {
    status = 'error';
  } else if (transcriptStatus === 'queued') {
    status = 'queued';
  } else {
    status = 'processing';
  }

  return {
    id: transcript.id,
    status,
    text: transcript.text ?? undefined,
    utterances: transcript.utterances?.map(u => ({
      speaker: u.speaker,
      text: u.text,
      start: u.start,
      end: u.end,
      confidence: u.confidence,
    })) ?? [],
    error: transcript.error ?? undefined,
    audio_duration: transcript.audio_duration ?? undefined,
    confidence: transcript.confidence ?? undefined,
  };
}
