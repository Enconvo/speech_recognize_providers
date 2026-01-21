import { SpeechToTextProvider } from "@enconvo/api";
import { AudioChunk, mergeTranscriptionResults, splitAudio } from "./audio_util.ts";
import fs from "fs"
import path from "path"
import OpenAI from "openai";
import { env } from "process";

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
        const inputPath = params.audioFilePath.replace("file://", "")

        const chunkSize = 24 * 1024 * 1024
        const chunkOverlapTime = 5 // seconds
        const processedPath = inputPath
        console.log("processedPath", processedPath)

        const chunks = await splitAudio(processedPath, chunkSize, chunkOverlapTime)
        const transcribeResults = await this.transcribeChunks(chunks, this.options)
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



    /**
     * Transcribe a single audio chunk with OpenAI API
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
                        const language = options.speechRecognitionLanguage.value === 'auto' ? undefined : options.speechRecognitionLanguage.value
                        const responseFormat = options.modelName.value.includes('whisper') ? 'verbose_json' : 'json'
                        // Attempt transcription
                        const result = await this.openai.audio.transcriptions.create({
                            file: fs.createReadStream(tempFile),
                            model: options.modelName.value,
                            response_format: responseFormat,
                            prompt: options.prompt,
                            language: language
                        });
                        console.log("result", result)

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




