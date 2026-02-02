import { parseFile } from 'music-metadata';
import * as fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { CommandUtil, SpeechToTextProvider, uuid } from '@enconvo/api';

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
export function preHandleAudio(params: {
  inputPath: string,
  supportedFormats: string[],
  targetFormat?: string,
}): string {
  let { inputPath, targetFormat, supportedFormats } = params;

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  const ext = path.extname(inputPath).toLowerCase()
  if (supportedFormats.includes(ext)) {
    return inputPath;
  }

  if (ext === `.${targetFormat}`) {
    return inputPath;
  }

  if (targetFormat === undefined) {
    targetFormat = 'wav'
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


/**
 * Preprocess audio file to 16kHz mono FLAC using ffmpeg
 */
export function preprocessAudio(inputPath: string, targetFormat: 'flac' | 'wav' | 'unknown' = "unknown"): string {
  inputPath = decodeURIComponent(inputPath)

  if (!fs.existsSync(inputPath)) {
    console.log("inputPath-44444", inputPath)
    throw new Error(`Input file not found: ${inputPath}`);
  }

  // If input is already a FLAC file, return it directly
  // Check if input is a common audio format
  const ext = path.extname(inputPath).toLowerCase()
  console.log("ext-", ext)
  if (['.flac', '.mp3', '.wav'].includes(ext) && targetFormat === "unknown") {
    return inputPath;
  }

  if (ext === `.${targetFormat}`) {
    console.log("ext-22222", ext)
    return inputPath;
  }
  if (targetFormat === "unknown") {
    console.log("targetFormat-33333", targetFormat)
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
  console.log(`File size: ${fileSize / 1024 / 1024} MB`);
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



/**
 * Find optimal alignment between sequences and merge them using sliding window matching
 */
export function findLongestCommonSequence(sequences: string[], matchByWords: boolean = true): string {
  // Handle empty input
  if (!sequences.length) {
    return "";
  }

  // Convert input based on matching strategy
  const processedSequences = matchByWords ?
    sequences.map(seq => seq.split(/(\s+\w+)/).filter(Boolean)) :
    sequences.map(seq => seq.split(''));

  let leftSequence = processedSequences[0];
  let leftLength = leftSequence.length;
  const totalSequence: string[] = [];

  // Process each sequence after the first
  for (const rightSequence of processedSequences.slice(1)) {
    let maxMatching = 0.0;
    const rightLength = rightSequence.length;
    let maxIndices = [leftLength, leftLength, 0, 0];

    // Try different alignments
    for (let i = 1; i < leftLength + rightLength + 1; i++) {
      // Add epsilon to favor longer matches
      const eps = i / 10000.0;

      const leftStart = Math.max(0, leftLength - i);
      const leftStop = Math.min(leftLength, leftLength + rightLength - i);
      const left = leftSequence.slice(leftStart, leftStop);

      const rightStart = Math.max(0, i - leftLength);
      const rightStop = Math.min(rightLength, i);
      const right = rightSequence.slice(rightStart, rightStop);

      if (left.length !== right.length) {
        throw new Error("Mismatched subsequences detected during transcript merging");
      }

      // Count matching elements
      const matches = left.reduce((sum, val, idx) => sum + (val === right[idx] ? 1 : 0), 0);

      // Normalize matches and add epsilon
      const matching = matches / i + eps;

      // Update max if better match found (require at least 2 matches)
      if (matches > 1 && matching > maxMatching) {
        maxMatching = matching;
        maxIndices = [leftStart, leftStop, rightStart, rightStop];
      }
    }

    // Use best alignment found
    const [leftStart, leftStop, rightStart, rightStop] = maxIndices;

    // Take left half from left sequence and right half from right sequence
    const leftMid = Math.floor((leftStop + leftStart) / 2);
    const rightMid = Math.floor((rightStop + rightStart) / 2);

    totalSequence.push(...leftSequence.slice(0, leftMid));
    leftSequence = rightSequence.slice(rightMid);
    leftLength = leftSequence.length;
  }

  // Add remaining sequence
  totalSequence.push(...leftSequence);

  return totalSequence.join('');
}

// Segment structure from OpenAI verbose_json response
export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  tokens?: number[];
  speaker?: string;
  temperature?: number;
  avg_logprob?: number;
  compression_ratio?: number;
  no_speech_prob?: number;
}

// Result structure with merged text and segments
export interface MergedTranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
}

/**
* Merge transcription chunks and handle overlaps
* Also merges segments with adjusted timestamps based on chunk start times
*/
export function mergeTranscriptionResults(
  results: SpeechToTextProvider.SpeechToTextResult[],
  chunks?: AudioChunk[]
): MergedTranscriptionResult {
  // Handle empty input
  if (!results.length) {
    return { text: "", segments: [] };
  }

  // Extract text sequences
  const sequences = results.map(r => r.text);

  // Merge text using longest common sequence alignment
  const mergedText = findLongestCommonSequence(sequences);

  // Merge segments with adjusted timestamps
  const mergedSegments = mergeSegments(results, chunks);

  return { text: mergedText, segments: mergedSegments };
}

/**
 * Merge segments from multiple transcription results
 * Adjusts timestamps based on chunk start times when audio is split
 */
function mergeSegments(
  results: SpeechToTextProvider.SpeechToTextResult[],
  chunks?: AudioChunk[]
): TranscriptionSegment[] {
  const allSegments: TranscriptionSegment[] = [];
  let segmentIdCounter = 0;

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const segments = result.segments as TranscriptionSegment[] | undefined;

    if (!segments || segments.length === 0) {
      continue;
    }

    // Get the chunk start time offset (0 if no chunks provided or single chunk)
    const chunkStartTime = chunks && chunks[i] ? chunks[i].start : 0;

    for (const segment of segments) {
      // Adjust segment timestamps by adding chunk start time
      const adjustedSegment: TranscriptionSegment = {
        ...segment,
        id: segmentIdCounter++,
        start: segment.start + chunkStartTime,
        end: segment.end + chunkStartTime
      };
      allSegments.push(adjustedSegment);
    }
  }

  // Sort segments by start time and remove duplicates from overlapping regions
  return deduplicateOverlappingSegments(allSegments);
}

/**
 * Remove duplicate segments from overlapping regions
 * When audio chunks overlap, the same content may be transcribed twice
 */
function deduplicateOverlappingSegments(segments: TranscriptionSegment[]): TranscriptionSegment[] {
  if (segments.length <= 1) {
    return segments;
  }

  // Sort by start time
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const result: TranscriptionSegment[] = [];

  for (const segment of sorted) {
    // Check if this segment overlaps significantly with the last added segment
    const lastSegment = result[result.length - 1];

    if (!lastSegment) {
      result.push(segment);
      continue;
    }

    // Calculate overlap ratio
    const overlapStart = Math.max(lastSegment.start, segment.start);
    const overlapEnd = Math.min(lastSegment.end, segment.end);
    const overlapDuration = Math.max(0, overlapEnd - overlapStart);
    const segmentDuration = segment.end - segment.start;

    // If overlap is more than 50% of the segment duration, consider it a duplicate
    if (overlapDuration > 0 && overlapDuration / segmentDuration > 0.5) {
      // Skip this segment as it's likely a duplicate from overlapping chunks
      continue;
    }

    // If segments overlap but not significantly, adjust the start time
    if (segment.start < lastSegment.end) {
      segment.start = lastSegment.end;
    }

    result.push(segment);
  }

  // Re-assign sequential IDs
  return result.map((seg, idx) => ({ ...seg, id: idx }));
}
