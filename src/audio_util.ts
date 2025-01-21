import { parseFile } from 'music-metadata';
import * as fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Command, CommandUtil, uuid } from '@enconvo/api';

export const getDuration = async (filePath: string): Promise<number> => {
  const metadata = await parseFile(filePath);
  return metadata.format.duration || 0
}

export interface AudioChunk {
  path: string;
  start: number;
  duration: number;
}


/**
 * Preprocess audio file to 16kHz mono FLAC using ffmpeg
 */
export function preprocessAudio(inputPath: string, targetFormat: 'flac' | 'wav' | 'unknown' = "unknown"): string {

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  // If input is already a FLAC file, return it directly
  // Check if input is a common audio format
  const ext = path.extname(inputPath).toLowerCase()
  if (['.flac', '.mp3', '.wav'].includes(ext) && targetFormat === "unknown") {
    return inputPath;
  }

  if (ext === `.${targetFormat}`) {
    return inputPath;
  }
  if (targetFormat === "unknown") {
    targetFormat = 'flac'
  }

  // Get the directory of the input file and create output path in same directory
  const outputPath = path.join(CommandUtil.cachePath(), `${path.basename(inputPath).split(".")[0]}.${targetFormat}`);

  console.log("Converting audio to 16kHz mono FLAC...");
  try {
    let encoder = targetFormat === "wav" ? "pcm_s16le" : "flac"
    execSync(`ffmpeg -hide_banner -loglevel error -i "${inputPath}" -ar 16000 -ac 1 -c:a ${encoder} -y "${outputPath}"`);
    return outputPath;
  } catch (e: any) {
    throw new Error(`FFmpeg conversion failed: ${e.message}`);
  }
}

export const splitAudio = async (filename: string, chunkSize: number, chunkOverlapTime: number): Promise<AudioChunk[]> => {
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

  if (numChunks === 1) {
    return [{ path: filename, start: 0, duration: duration }]
  }

  console.log(`Audio will be split into ${numChunks} chunks of max ${MAX_CHUNK_SIZE} bytes (1MB) each`);
  const chunkSeconds = duration / numChunks
  console.log(`Chunk seconds: ${chunkSeconds}`)

  // Create directory for audio chunks
  const chunkDir = path.join(path.dirname(filename), uuid());
  fs.mkdirSync(chunkDir, { recursive: true });

  // Calculate chunk parameters with 5 second overlap
  const OVERLAP_SECONDS = chunkOverlapTime;
  const chunkDuration = chunkSeconds; // Duration per chunk from previous calculation
  const chunks: AudioChunk[] = [];

  // Split audio into overlapping chunks
  for (let i = 0; i < numChunks; i++) {
    const startTime = i * chunkDuration;
    const duration = chunkDuration + (i < numChunks - 1 ? OVERLAP_SECONDS : 0);

    // Output path for this chunk
    const chunkPath = path.join(chunkDir, `chunk_${i.toString().padStart(3, '0')}${path.extname(filename)}`);

    // Use ffmpeg to extract chunk with overlap
    // Don't use -c copy for splitting as it can cause duration issues
    // Instead re-encode with same codec to ensure accurate splitting
    const ffmpegCommand =
      `ffmpeg -hide_banner -loglevel error -i "${filename}" -ss ${startTime} -t ${duration}  "${chunkPath}"`;

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
