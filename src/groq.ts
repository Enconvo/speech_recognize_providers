import { SpeechToTextProvider } from "@enconvo/api";
import Groq from "groq-sdk";
import { AudioChunk, preprocessAudio, splitAudio } from "./audio_util.ts";
import fs from "fs"
import path from "path"

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new GroqProvider(options)
}

export class GroqProvider extends SpeechToTextProvider {

    private client: Groq
    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)
        console.log("options-", options)
        this.client = new Groq({ apiKey: options.apiKey })
    }

    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")

        const chunkSize = 24 * 1024 * 1024
        const chunkOverlapTime = 5 // seconds
        const processedPath = preprocessAudio(inputPath)
        console.log("processedPath", processedPath)

        const chunks = await splitAudio(processedPath, chunkSize, chunkOverlapTime)
        const transcribeResults = await transcribeChunks(this.client, chunks, this.options)
        // clean up
        if (inputPath !== processedPath) {
            fs.unlinkSync(processedPath)
        }

        // Merge the transcription results
        const mergedText = mergeTranscriptionResults(transcribeResults);
        console.log("mergedText", mergedText)

        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: mergedText
        }
        return result
    }


}




/**
 * Find optimal alignment between sequences and merge them using sliding window matching
 */
function findLongestCommonSequence(sequences: string[], matchByWords: boolean = true): string {
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

/**
 * Merge transcription chunks and handle overlaps
 */
function mergeTranscriptionResults(results: SpeechToTextProvider.SpeechToTextResult[]): string {
    // Sort results by start time
    const sortedResults = results

    if (!sortedResults.length) {
        return "";
    }

    // Extract text sequences
    const sequences = sortedResults.map(r => r.text);

    // Merge using longest common sequence alignment
    return findLongestCommonSequence(sequences);
}




/**
 * Transcribe a single audio chunk with Groq API
 */
async function transcribeChunks(
    client: Groq,
    chunks: AudioChunk[],
    options: SpeechToTextProvider.SpeechToTextOptions
): Promise<SpeechToTextProvider.SpeechToTextResult[]> {
    let totalApiTime = 0;
    const results: SpeechToTextProvider.SpeechToTextResult[] = []
    for (const chunk of chunks) {

        console.log("Transcribing chunk: ", chunk.path)

        const tempFile = chunk.path;
        const MAX_RETRIES = 3; // Maximum number of retry attempts
        const INITIAL_RETRY_DELAY = 60000; // Initial retry delay in milliseconds
        let retryCount = 0;

        try {
            while (retryCount < MAX_RETRIES) {
                const startTime = Date.now();
                try {
                    // Attempt transcription
                    const result = await client.audio.transcriptions.create({
                        file: fs.createReadStream(tempFile),
                        model: options.modelName.value || "whisper-large-v3-turbo",
                        response_format: "verbose_json",
                        prompt: options.prompt || ""
                    });

                    // Calculate and log processing time
                    const apiTime = (Date.now() - startTime) / 1000;
                    totalApiTime += apiTime;
                    console.log(`Chunk api completed, time: ${chunk.path}`, apiTime)
                    // Store successful result
                    results.push({
                        path: chunk.path,
                        text: result.text,
                        // @ts-ignore
                        segments: result.segments
                    });
                    break; // Exit retry loop on success

                } catch (e: any) {
                    if (e.code === 'rate_limit_exceeded') {
                        retryCount++;
                        if (retryCount >= MAX_RETRIES) {
                            throw new Error(`Failed to process chunk ${chunk.path} after ${MAX_RETRIES} retries`);
                        }
                        // Exponential backoff delay
                        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
                        console.log(`\nRate limit hit for chunk ${chunk.path} - retry ${retryCount}/${MAX_RETRIES} in ${delay / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw e; // Re-throw non-rate-limit errors
                }
            }
        } finally {
            // Cleanup temp file
            if (fs.existsSync(tempFile) && chunks.length > 1) {
                fs.unlinkSync(tempFile);
            }
        }
    }

    if (chunks.length > 1) {
        fs.rmdirSync(path.dirname(chunks[0].path))
    }

    console.log(" total api time: ", totalApiTime)
    return results
}