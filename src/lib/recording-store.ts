import { getDatabase } from './database';
import { nanoid } from 'nanoid';
import type { TranscriptResult } from './types';
import type { RecordingMetadata } from './types';

export function saveRecording(
  transcript: TranscriptResult,
  filename: string,
  filepath: string,  // local filesystem path
  fileCreatedAt?: string,
  recordedAt?: string | null
): string {
  const db = getDatabase();

  const speakerCount = transcript.utterances
    ? new Set(transcript.utterances.map(u => u.speaker)).size
    : 0;

  const recordingId = nanoid();

  const stmt = db.prepare(`
    INSERT INTO recordings (id, filename, filepath, status, audio_duration, confidence, speaker_count, utterances_json, file_created_at, recorded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    recordingId,
    filename,
    filepath,
    transcript.status,
    transcript.audio_duration ?? null,
    transcript.confidence ?? null,
    speakerCount,
    transcript.utterances ? JSON.stringify(transcript.utterances) : null,
    fileCreatedAt ?? null,
    recordedAt ?? null
  );

  return recordingId;
}

export function updateTranscribedAt(id: string, transcribedAt: string): void {
  const db = getDatabase();
  db.prepare(`UPDATE recordings SET transcribed_at = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(transcribedAt, id);
}

export function getAllRecordings(): RecordingMetadata[] {
  const db = getDatabase();

  const rows = db.prepare(`
    SELECT id, filename, filepath, status, audio_duration, confidence, speaker_count,
           utterances_json, created_at, updated_at, file_created_at, recorded_at, transcribed_at
    FROM recordings
    ORDER BY created_at DESC
  `).all() as any[];

  return rows.map(row => ({
    id: row.id as string,
    filename: row.filename as string,
    filepath: row.filepath as string,  // local filesystem path
    status: row.status as RecordingMetadata['status'],
    audio_duration: row.audio_duration as number | undefined,
    confidence: row.confidence as number | undefined,
    speaker_count: row.speaker_count as number | undefined,
    utterances: row.utterances_json ? JSON.parse(row.utterances_json as string) : undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    file_created_at: row.file_created_at as string | undefined,
    recorded_at: row.recorded_at as string | undefined,
    transcribed_at: row.transcribed_at as string | undefined,
  }));
}

export function getRecordingById(id: string): RecordingMetadata | null {
  const db = getDatabase();

  const row = db.prepare(`
    SELECT id, filename, filepath, status, audio_duration, confidence, speaker_count,
           utterances_json, created_at, updated_at, file_created_at, recorded_at, transcribed_at
    FROM recordings
    WHERE id = ?
  `).get(id) as any;

  if (!row) return null;

  return {
    id: row.id as string,
    filename: row.filename as string,
    filepath: row.filepath as string,  // local filesystem path
    status: row.status as RecordingMetadata['status'],
    audio_duration: row.audio_duration as number | undefined,
    confidence: row.confidence as number | undefined,
    speaker_count: row.speaker_count as number | undefined,
    utterances: row.utterances_json ? JSON.parse(row.utterances_json as string) : undefined,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    file_created_at: row.file_created_at as string | undefined,
    recorded_at: row.recorded_at as string | undefined,
    transcribed_at: row.transcribed_at as string | undefined,
  };
}

export function deleteRecording(id: string): boolean {
  const db = getDatabase();
  const info = db.prepare('DELETE FROM recordings WHERE id = ?').run(id);
  return info.changes > 0;
}
