/**
 * Client-side file validation utilities
 * These functions must be separate from server-side storage utilities
 * because they run in the browser.
 */

/**
 * Validate audio file MIME type only (size is checked separately in AudioUploader)
 * @param file - File object from file input
 * @returns true if file is a valid audio format
 */
export function isValidAudioFile(file: File): boolean {
  const validTypes = [
    'audio/mpeg',     // MP3
    'audio/wav',      // WAV
    'audio/mp4',      // M4A/MP4
    'audio/x-m4a',    // M4A alternative
    'audio/mp3',      // MP3 alternative
    'audio/aac',      // AAC audio (common in m4a)
    'audio/x-m4p',    // Protected M4A (unlikely for voice memos)
    'video/mp4',      // Some iOS m4a files are misidentified as video/mp4
  ];

  const validExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.mp4'];
  const hasValidExtension = validExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  );

  return file.size > 0 && (validTypes.includes(file.type) || hasValidExtension);
}
