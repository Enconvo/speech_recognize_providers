import { promisify } from 'util';
const exec = promisify(require('child_process').exec);
import fs from 'fs-extra';
import { parseFile } from 'music-metadata';
import path from 'path';
import { execSync } from 'child_process';

export const getDuration = async (filePath: string): Promise<number> => {
  const metadata = await parseFile(filePath);
  return metadata.format.duration || 0
}

export interface AudioChunk {
  path: string;
  start: number;
  duration: number;
}

export const splitAudio = async (filename: string, chunkSize: number): Promise<AudioChunk[]> => {
  // Get duration of processed audio file
  const duration = await getDuration(filename);
  console.log(`Audio duration: ${duration} seconds`);
  // Get file size in bytes
  const fileSize = fs.statSync(filename).size;
  console.log(`File size: ${fileSize} bytes`);
  // Maximum size per chunk in bytes (1MB)
  const MAX_CHUNK_SIZE = chunkSize; // 1MB in bytes

  // Calculate number of chunks needed based on file size
  const numChunks = Math.ceil(fileSize / MAX_CHUNK_SIZE);
  console.log(`Audio will be split into ${numChunks} chunks of max ${MAX_CHUNK_SIZE} bytes (1MB) each`);
  const chunkSeconds = duration / numChunks
  console.log(`Chunk seconds: ${chunkSeconds}`)



  // Create directory for audio chunks
  const chunkDir = path.join(path.dirname(filename), 'audio_chunks');
  fs.mkdirSync(chunkDir, { recursive: true });

  // Calculate chunk parameters with 5 second overlap
  const OVERLAP_SECONDS = 5;
  const chunkDuration = chunkSeconds; // Duration per chunk from previous calculation
  const chunks: AudioChunk[] = [];

  // Split audio into overlapping chunks
  for (let i = 0; i < numChunks; i++) {
    const startTime = i * chunkDuration;
    const duration = chunkDuration + (i < numChunks - 1 ? OVERLAP_SECONDS : 0);

    // Output path for this chunk
    const chunkPath = path.join(chunkDir, `chunk_${i.toString().padStart(3, '0')}.flac`);

    // Use ffmpeg to extract chunk with overlap
    // Don't use -c copy for splitting as it can cause duration issues
    // Instead re-encode with same codec to ensure accurate splitting
    const ffmpegCommand =
      `ffmpeg -hide_banner -loglevel error -i "${filename}" -ss ${startTime} -t ${duration} -c:a flac "${chunkPath}"`;

    try {
      execSync(ffmpegCommand);
      const splitDuration = await getDuration(chunkPath);
      console.log(`Chunk ${i} duration: ${splitDuration} seconds`);
      chunks.push({ path: chunkPath, start: startTime, duration: duration });
    } catch (error) {
      console.error(`Error splitting chunk ${i}: ${error}`);
      throw error;
    }
  }

  console.log(`Split audio into ${chunks.length} overlapping chunks in ${chunkDir}`);
  return chunks;
}
