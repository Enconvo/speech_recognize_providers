import { Commander, SpeechToTextProvider } from "@enconvo/api";
import { AudioChunk, getDuration, mergeTranscriptionResults, splitAudio } from "./audio_util.ts";
import fs from "fs"
import path from "path"
import OpenAI from "openai";
import { env } from "process";
import { DiarizeResult, DiarizeUtils } from "./utils/diarize_utils.ts";
import { AudioResponseFormat } from "openai/resources";

/**
 * Merge consecutive segments with the same speaker into one segment
 */
function mergeConsecutiveSpeakerSegments(
    segments: SpeechToTextProvider.TranscriptSegment[]
): SpeechToTextProvider.TranscriptSegment[] {
    if (!segments || segments.length === 0) {
        return [];
    }

    const mergedSegments: SpeechToTextProvider.TranscriptSegment[] = [];
    let currentMerged: SpeechToTextProvider.TranscriptSegment | null = null;

    for (const segment of segments) {
        if (!currentMerged) {
            // Start a new merged segment
            currentMerged = { ...segment };
        } else if (currentMerged.speaker === segment.speaker) {
            // Same speaker, merge the segments
            currentMerged.text = currentMerged.text + segment.text;
            currentMerged.end = segment.end;
        } else {
            // Different speaker, push current and start new
            mergedSegments.push(currentMerged);
            currentMerged = { ...segment };
        }
    }

    // Don't forget the last segment
    if (currentMerged) {
        mergedSegments.push(currentMerged);
    }

    return mergedSegments;
}

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new EnconvoCloudPlanProvider(options)
}

export class EnconvoCloudPlanProvider extends SpeechToTextProvider {

    private openai: OpenAI
    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)

        // const baseUrl = "http://127.0.0.1:8181/v1"
        const baseUrl = "https://api.enconvo.com/v1"

        this.openai = new OpenAI({
            apiKey: "default",
            baseURL: baseUrl,
            defaultHeaders: {
                "accessToken": `${env['accessToken']}`,
                "client_id": `${env['client_id']}`,
                "commandKey": `${env['commandKey']}`,
                "commandTitle": `${env['commandTitle']}`,
            }
        })
    }

    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        let inputPath = params.audioFilePath.replace("file://", "")

        const chunkSize = 24.5 * 1024 * 1024
        const chunkOverlapTime = 5 // seconds
        const processedPath = inputPath
        console.log("processedPath", processedPath)
        const duration = await getDuration(processedPath);
        const chunks = await splitAudio(processedPath, chunkSize, chunkOverlapTime)
        console.log("chunks", chunks.length)
        const transcribeResults = await this.transcribeChunks(chunks, this.options, params)
        // clean up
        if (inputPath !== processedPath) {
            fs.unlinkSync(processedPath)
        }

        // Merge the transcription results with segments (pass chunks for time offset adjustment)
        const mergedResult = mergeTranscriptionResults(transcribeResults.result, chunks);
        // console.log("mergedResult", JSON.stringify(mergedResult, null, 2))

        // Convert segments to TranscriptSegment format
        let transcriptSegments: SpeechToTextProvider.SpeechToTextResult['segments'] = mergedResult.segments.map(segment => {
            let speaker = segment.speaker;
            // Convert A, B, C, etc. to Speaker1, Speaker2, Speaker3, etc.
            if (speaker && /^[A-Z]$/.test(speaker)) {
                const speakerNumber = speaker.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
                speaker = `Speaker${speakerNumber}`;
            }
            return {
                text: segment.text,
                start: segment.start,
                end: segment.end,
                speaker: speaker
            };
        })

        // if (params.diarization && !transcribeResults.diarized) {
        //     // Get diarization results
        //     const diarizeResult = await Commander.send("fluidDiarize", {
        //         file_path: inputPath,
        //     }) as DiarizeResult
        //     console.log("diarizeResult", JSON.stringify(diarizeResult, null, 2))

        //     // Merge speaker info into segments
        //     transcriptSegments = DiarizeUtils.mergeDiarization(transcriptSegments, diarizeResult);
        // }

        // if (params.diarization) {
            // Merge consecutive segments with the same speaker
            // transcriptSegments = mergeConsecutiveSpeakerSegments(transcriptSegments);
            // mergedResult.text = transcriptSegments.map(segment => `${segment.speaker}: ${segment.text}`).join("\n\n")
        // }


        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: mergedResult.text,
            segments: transcriptSegments,
            duration: Math.round(duration)
        }

        console.log("result", JSON.stringify(result, null, 2))
        return result
    }



    /**
     * Transcribe a single audio chunk with OpenAI API
     */
    async transcribeChunks(
        chunks: AudioChunk[],
        options: SpeechToTextProvider.SpeechToTextOptions,
        params: SpeechToTextProvider.AudioToTextParams
    ): Promise<{
        result: SpeechToTextProvider.SpeechToTextResult[]
        diarized: boolean
    }> {
        let totalApiTime = 0;
        const results: SpeechToTextProvider.SpeechToTextResult[] = []

        const language = options.speechRecognitionLanguage.value === 'auto' ? undefined : options.speechRecognitionLanguage.value
        let responseFormat: AudioResponseFormat = 'json'
        // Attempt transcription
        let modelName = options.modelName.value
        let diarized = false
        if (modelName.includes('gpt-4o-transcribe') && params.diarization) {
            modelName = modelName.replace('gpt-4o-transcribe', 'gpt-4o-transcribe-diarize')
            responseFormat = 'diarized_json'
            diarized = true
        }

        if (modelName.includes('whisper')) {
            responseFormat = 'verbose_json'
        }

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


                        const result = await this.openai.audio.transcriptions.create({
                            file: fs.createReadStream(tempFile),
                            model: modelName,
                            response_format: responseFormat,
                            prompt: options.prompt,
                            language: language,
                            chunking_strategy: modelName.includes('gpt-4o-transcribe-diarize') ? "auto" : undefined
                        });
                        console.log("result...", result)

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
        return {
            result: results,
            diarized: diarized
        }
    }
}





// {
//     "title": "OpenAI gpt-4o-mini-transcribe (100 points per time)",
//     "value": "openai/gpt-4o-mini-transcribe"
//   },
//   {
//     "title": "OpenAI gpt-4o-transcribe (200 points per time)",
//     "value": "openai/gpt-4o-transcribe"
//   }