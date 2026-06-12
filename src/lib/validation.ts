/**
 * Client-side file validation utilities
 * These functions must be separate from server-side storage utilities
 * because they run in the browser.
 */

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB default

/**
 * Validate audio file MIME type and size
 * @param file - File object from file input
 * @returns true if file is valid audio format and size
 */
export function isValidAudioFile(file: File): boolean {
  const validTypes = [
    'audio/mpeg',     // MP3
    'audio/wav',      // WAV
    'audio/mp4',      // M4A
    'audio/x-m4a',    // M4A alternative
    'audio/mp3',      // MP3 alternative
  ];

  const validExtensions = ['.mp3', '.wav', '.m4a'];
  const hasValidExtension = validExtensions.some(ext =>
    file.name.toLowerCase().endsWith(ext)
  );

  const isValidSize = file.size > 0 && file.size <= MAX_FILE_SIZE;

  return (validTypes.includes(file.type) || hasValidExtension) && isValidSize;
}
