import { Groq } from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as os from 'os';
import { AudioChunk, splitAudio } from './audio_util.ts';
import { RequestOptions } from '@enconvo/api';


export default async function main(request: Request) {
    const options: RequestOptions = await request.json()
    const inputPath = (options.context_files?.[0] || "").replace("file://", "")
    // const inputPath = "/Users/ysnows/Desktop/demo.mp3"

    const chunkSize = 1024 * 1024
    const processedPath = preprocessAudio(inputPath)

    const chunks = await splitAudio(processedPath, chunkSize)
    console.log("Chunks: ", JSON.stringify(chunks, null, 2))


    return processedPath
}



// Types
interface TranscriptionSegment {
    text: string;
    start: number;
    end: number;
    [key: string]: any; // For additional properties
}

interface TranscriptionResult {
    text: string;
    segments: TranscriptionSegment[];
}

interface ChunkResult {
    result: string;
    startTime: number;
}

/**
 * Preprocess audio file to 16kHz mono FLAC using ffmpeg
 */
function preprocessAudio(inputPath: string): string {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
    }
    // Get the directory of the input file and create output path in same directory
    const outputPath = path.join(path.dirname(inputPath), `${path.basename(inputPath).split(".")[0]}.flac`);

    console.log("Converting audio to 16kHz mono FLAC...");
    try {
        execSync(`ffmpeg -hide_banner -loglevel error -i "${inputPath}" -ar 16000 -ac 1 -c:a flac -y "${outputPath}"`);
        return outputPath;
    } catch (e) {
        throw new Error(`FFmpeg conversion failed: ${e.message}`);
    }
}

/**
 * Transcribe a single audio chunk with Groq API
 */
async function transcribeSingleChunk(
    client: Groq,
    chunks: AudioChunk[],
    chunkNum: number,
    totalChunks: number
): Promise<ChunkResult[]> {
    let totalApiTime = 0;
    const results: ChunkResult[] = []
    for (const chunk of chunks) {
        const tempFile = chunk.path
        try {
            const startTime = Date.now();
            try {
                const result = await client.audio.transcriptions.create({
                    file: fs.createReadStream(tempFile),
                    model: "whisper-large-v3",
                    language: "en",
                    response_format: "verbose_json"
                });

                const apiTime = (Date.now() - startTime) / 1000;
                totalApiTime += apiTime;

                console.log(`Chunk ${chunkNum}/${totalChunks} processed in ${apiTime.toFixed(2)}s`);
                results.push({ result: result.text, startTime: chunk.start });

            } catch (e: any) {
                if (e.code === 'rate_limit_exceeded') {
                    console.log(`\nRate limit hit for chunk ${chunkNum} - retrying in 60 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 60000));
                    continue;
                }
                throw e;
            }
        } finally {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
    }
    return results
}

/**
 * Find the longest common sequence between multiple text segments
 */
function findLongestCommonSequence(sequences: string[], matchByWords: boolean = true): string {
    if (!sequences.length) return "";

    // Convert input based on matching strategy
    let processedSequences: string[][] = matchByWords
        ? sequences.map(seq => seq.match(/(?:\s+\w+)/g) || [])
        : sequences.map(seq => seq.split(''));

    const leftSequence = processedSequences[0];
    let leftLength = leftSequence.length;
    const totalSequence: string[] = [];

    for (const rightSequence of processedSequences.slice(1)) {
        let maxMatching = 0.0;
        const rightLength = rightSequence.length;
        let maxIndices: [number, number, number, number] = [leftLength, leftLength, 0, 0];

        // Try different alignments
        for (let i = 1; i <= leftLength + rightLength; i++) {
            const eps = i / 10000.0;

            const leftStart = Math.max(0, leftLength - i);
            const leftStop = Math.min(leftLength, leftLength + rightLength - i);
            const left = leftSequence.slice(leftStart, leftStop);

            const rightStart = Math.max(0, i - leftLength);
            const rightStop = Math.min(rightLength, i);
            const right = rightSequence.slice(rightStart, rightStop);

            if (left.length !== right.length) {
                throw new Error("Mismatched subsequences detected during transcript merging.");
            }

            const matches = left.reduce((acc, curr, idx) => acc + (curr === right[idx] ? 1 : 0), 0);
            const matching = matches / i + eps;

            if (matches > 1 && matching > maxMatching) {
                maxMatching = matching;
                maxIndices = [leftStart, leftStop, rightStart, rightStop];
            }
        }

        const [leftStart, leftStop, rightStart, rightStop] = maxIndices;
        const leftMid = Math.floor((leftStop + leftStart) / 2);
        const rightMid = Math.floor((rightStop + rightStart) / 2);

        totalSequence.push(...leftSequence.slice(0, leftMid));
        leftSequence.splice(0, leftSequence.length, ...rightSequence.slice(rightMid));
        leftLength = leftSequence.length;
    }

    totalSequence.push(...leftSequence);
    return matchByWords ? totalSequence.join('') : totalSequence.join('');
}

/**
 * Merge transcription chunks and handle overlaps
 */
function mergeTranscripts(results: ChunkResult[]): TranscriptionResult {
    console.log("\nMerging results...");
    const finalSegments: TranscriptionSegment[] = [];

    // Process each chunk's segments
    const processedChunks: TranscriptionSegment[][] = [];

    results.forEach((result, i) => {
        const segments = result.result.segments;

        if (i < results.length - 1) {
            const nextStart = results[i + 1].startTime;
            const currentSegments: TranscriptionSegment[] = [];
            const overlapSegments: TranscriptionSegment[] = [];

            segments.forEach(segment => {
                if (segment.end * 1000 > nextStart) {
                    overlapSegments.push(segment);
                } else {
                    currentSegments.push(segment);
                }
            });

            if (overlapSegments.length) {
                const mergedOverlap = {
                    ...overlapSegments[0],
                    text: overlapSegments.map(s => s.text).join(' '),
                    end: overlapSegments[overlapSegments.length - 1].end
                };
                currentSegments.push(mergedOverlap);
            }

            processedChunks.push(currentSegments);
        } else {
            processedChunks.push(segments);
        }
    });

    // Continue with rest of merging logic...
    // (Similar to Python version but with TypeScript syntax)

    return {
        text: finalSegments.map(segment => segment.text).join(' '),
        segments: finalSegments
    };
}

/**
 * Save transcription results to files
 */
function saveResults(result: TranscriptionResult, audioPath: string): string {
    try {
        const outputDir = path.join(process.cwd(), "transcriptions");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
        const basePath = path.join(outputDir, `${path.parse(audioPath).name}_${timestamp}`);

        fs.writeFileSync(`${basePath}.txt`, result.text, 'utf-8');
        fs.writeFileSync(`${basePath}_full.json`, JSON.stringify(result, null, 2), 'utf-8');
        fs.writeFileSync(`${basePath}_segments.json`, JSON.stringify(result.segments, null, 2), 'utf-8');

        console.log(`\nResults saved to transcriptions folder:`);
        console.log(`- ${basePath}.txt`);
        console.log(`- ${basePath}_full.json`);
        console.log(`- ${basePath}_segments.json`);

        return basePath;
    } catch (e) {
        throw new Error(`Error saving results: ${e.message}`);
    }
}

/**
 * Main function to transcribe audio in chunks
 */
async function transcribeAudioInChunks(
    audioPath: string,
    chunkLength: number = 600,
    overlap: number = 10
): Promise<TranscriptionResult> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY environment variable not set");
    }

    console.log(`\nStarting transcription of: ${audioPath}`);
    const client = new Groq({ apiKey });

    let processedPath: string | null = null;
    try {
        processedPath = preprocessAudio(audioPath);
        const audio = await AudioSegment.fromFile(processedPath);

        const duration = audio.duration();
        console.log(`Audio duration: ${duration / 1000}s`);

        const chunkMs = chunkLength * 1000;
        const overlapMs = overlap * 1000;
        const totalChunks = Math.floor(duration / (chunkMs - overlapMs)) + 1;

        console.log(`Processing ${totalChunks} chunks...`);

        const results: ChunkResult[] = [];
        let totalTranscriptionTime = 0;

        for (let i = 0; i < totalChunks; i++) {
            const start = i * (chunkMs - overlapMs);
            const end = Math.min(start + chunkMs, duration);

            console.log(`\nProcessing chunk ${i + 1}/${totalChunks}`);
            console.log(`Time range: ${(start / 1000).toFixed(1)}s - ${(end / 1000).toFixed(1)}s`);

            const chunk = audio.slice(start, end);
            const [result, chunkTime] = await transcribeSingleChunk(client, chunk, i + 1, totalChunks);
            totalTranscriptionTime += chunkTime;
            results.push({ result, startTime: start });
        }

        const finalResult = mergeTranscripts(results);
        saveResults(finalResult, audioPath);

        console.log(`\nTotal Groq API transcription time: ${totalTranscriptionTime.toFixed(2)}s`);

        return finalResult;
    } finally {
        if (processedPath && fs.existsSync(processedPath)) {
            fs.unlinkSync(processedPath);
        }
    }
}

// Export the main function
export { transcribeAudioInChunks }; 