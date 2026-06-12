import fs from 'fs/promises';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/home/services/openotter/uploads';

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Save uploaded file to local storage
 * @param fileBuffer - File buffer from upload
 * @param filename - Original filename
 * @returns Local file path for AssemblyAI access
 */
export async function saveUploadedFile(
  fileBuffer: Buffer,
  filename: string
): Promise<string> {
  await ensureUploadDir();

  // Sanitize filename to prevent path traversal
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filepath = path.join(UPLOAD_DIR, `${Date.now()}-${safeFilename}`);

  await writeFile(filepath, fileBuffer);

  return filepath;
}

/**
 * Delete file from local storage
 * @param filepath - Path to file to delete
 */
export async function deleteFile(filepath: string): Promise<void> {
  try {
    await fs.unlink(filepath);
  } catch (error) {
    console.warn(`Failed to delete file ${filepath}:`, error);
  }
}

/**
 * Get storage stats for monitoring
 * @returns Storage usage information
 */
export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  uploadDir: string;
}> {
  await ensureUploadDir();

  const files = await fs.readdir(UPLOAD_DIR);
  let totalSize = 0;

  for (const file of files) {
    const filepath = path.join(UPLOAD_DIR, file);
    const stats = await fs.stat(filepath);
    totalSize += stats.size;
  }

  return {
    totalFiles: files.length,
    totalSize,
    uploadDir: UPLOAD_DIR,
  };
}
