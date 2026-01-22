import { Commander, SpeechToTextProvider } from "@enconvo/api";
import Groq from "groq-sdk";
import { AudioChunk, mergeTranscriptionResults, preHandleAudio, preprocessAudio, splitAudio } from "./audio_util.ts";
import fs from "fs"
import path from "path"
import { DiarizeResult, DiarizeUtils } from "./utils/diarize_utils.ts";

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new GroqProvider(options)
}

export class GroqProvider extends SpeechToTextProvider {

    private client: Groq
    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)
        console.log("options-", options)
        const credentials = this.options.credentials
        this.client = new Groq({ apiKey: credentials.apiKey })
    }

    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")

        const chunkSize = 24 * 1024 * 1024
        const chunkOverlapTime = 5 // seconds
        const processedPath = preHandleAudio({
            inputPath,
            supportedFormats: [".mp3", ".wav"]
        })

        const chunks = await splitAudio(processedPath, chunkSize, chunkOverlapTime)

        console.log("processedPath", processedPath)
        const transcribeResults = await this.transcribeChunks(chunks, this.options)
        // clean up
        if (inputPath !== processedPath) {
            fs.unlinkSync(processedPath)
        }

        // Merge the transcription results with segments (pass chunks for time offset adjustment)
        const mergedResult = mergeTranscriptionResults(transcribeResults, chunks);
        // console.log("mergedResult", JSON.stringify(mergedResult, null, 2))

        // Convert segments to TranscriptSegment format
        let transcriptSegments: SpeechToTextProvider.SpeechToTextResult['segments'] = mergedResult.segments.map(segment => ({
            text: segment.text,
            start: segment.start,
            end: segment.end
        }))

        if (params.diarization) {
            // Get diarization results
            const diarizeResult = await Commander.send("fluidDiarize", {
                file_path: inputPath,
            }) as DiarizeResult
            console.log("diarizeResult", JSON.stringify(diarizeResult, null, 2))

            // Merge speaker info into segments
            transcriptSegments = DiarizeUtils.mergeDiarization(transcriptSegments, diarizeResult);
            mergedResult.text = transcriptSegments.map(segment => `${segment.speaker}: ${segment.text}`).join(" ")
        }

        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: mergedResult.text,
            segments: transcriptSegments
        }
        return result
    }




    /**
 * Transcribe a single audio chunk with Groq API
 */
    async transcribeChunks(
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
                        console.log("params", options.prompt)
                        // Attempt transcription
                        const result = await this.client.audio.transcriptions.create({
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

}


