import { SpeechToTextProvider } from "@enconvo/api";
import { GoogleGenAI, Type } from "@google/genai";
import { preHandleAudio } from "./audio_util.ts";
import fs from "fs";
import path from "path";
import { env } from "process";

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {
    return new GeminiProvider(options);
}

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.aiff'];

export class GeminiProvider extends SpeechToTextProvider {
    private ai: GoogleGenAI;
    private httpOptions: { baseUrl?: string; headers?: Record<string, string> };

    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options);
        const credentials = this.options.credentials;
        this.ai = new GoogleGenAI({ apiKey: credentials?.apiKey || "default", vertexai: false });
        this.httpOptions = {};

        if (this.options.useEnconvoCloudPlan) {
            const model = this.options.modelName?.value || "";
            // this.httpOptions.baseUrl = "http://127.0.0.1:8181";
            this.httpOptions.baseUrl = "https://api.enconvo.com";
            this.httpOptions.headers = {
                accessToken: `${env["accessToken"]}`,
                client_id: `${env["client_id"]}`,
                commandKey: `${env["commandKey"]}`,
                commandTitle: `${env["commandTitle"]}`,
                modelName: model,
            };
        } else if (credentials?.baseUrl) {
            this.httpOptions.baseUrl = credentials.baseUrl;
        }
    }

    private getModel(): string {
        let model = this.options.modelName?.value || "gemini-3.1-flash-lite-preview";
        if (model.includes("/")) {
            model = model.split("/")[1];
        }
        return model;
    }

    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            ".mp3": "audio/mp3",
            ".wav": "audio/wav",
            ".flac": "audio/flac",
            ".aac": "audio/aac",
            ".ogg": "audio/ogg",
            ".aiff": "audio/aiff",
        };
        return mimeTypes[ext] || "audio/mp3";
    }

    private async buildContents(inputPath: string, mimeType: string, prompt: string) {
        const fileSize = fs.statSync(inputPath).size;
        const MAX_INLINE_SIZE = 15 * 1024 * 1024;

        if (fileSize < MAX_INLINE_SIZE) {
            const base64Audio = fs.readFileSync(inputPath, { encoding: "base64" });
            return [
                { text: prompt },
                { inlineData: { mimeType, data: base64Audio } },
            ];
        } else {
            const uploadedFile = await this.ai.files.upload({
                file: inputPath,
                config: { mimeType },
            });
            return [
                { text: prompt },
                { fileData: { fileUri: uploadedFile.uri, mimeType: uploadedFile.mimeType } },
            ];
        }
    }

    protected async _audioToText(
        params: SpeechToTextProvider.AudioToTextParams
    ): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "");
        const processedPath = preHandleAudio({
            inputPath,
            supportedFormats: SUPPORTED_FORMATS,
            targetFormat: 'wav',
        });

        try {
            const mimeType = this.getMimeType(processedPath);
            const modelName = this.getModel();
            const enableTimestamps = this.options.timestamps?.value === "true";
            const language = params.language || this.options.speechRecognitionLanguage?.value;

            let prompt = "Generate an accurate transcript of the speech. Output only the transcribed text without any additional commentary.";
            if (language && language !== "auto") {
                prompt += ` The audio is in ${language}.`;
            }
            if (params.words && params.words.length > 0) {
                prompt += ` Custom vocabulary: ${params.words.join(", ")}.`;
            }

            if (enableTimestamps) {
                prompt += " For each segment, provide the start and end timestamps in seconds.";
                return await this.transcribeWithTimestamps(processedPath, mimeType, modelName, prompt, params.audioFilePath);
            } else {
                return await this.transcribeText(processedPath, mimeType, modelName, prompt, params.audioFilePath);
            }
        } finally {
            if (processedPath !== inputPath) {
                fs.unlinkSync(processedPath);
            }
        }
    }

    private async transcribeText(
        inputPath: string,
        mimeType: string,
        modelName: string,
        prompt: string,
        originalPath: string
    ): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const contents = await this.buildContents(inputPath, mimeType, prompt);
        const response = await this.ai.models.generateContent({
            model: modelName,
            contents,
            config: {
                httpOptions: this.httpOptions,
            },
        });
        return {
            path: originalPath,
            text: response.text || "",
        };
    }

    private async transcribeWithTimestamps(
        inputPath: string,
        mimeType: string,
        modelName: string,
        prompt: string,
        originalPath: string
    ): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const contents = await this.buildContents(inputPath, mimeType, prompt);
        const response = await this.ai.models.generateContent({
            model: modelName,
            contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        text: {
                            type: Type.STRING,
                            description: "The full transcription text",
                        },
                        segments: {
                            type: Type.ARRAY,
                            description: "List of transcribed segments with timestamps",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    start: { type: Type.NUMBER, description: "Start time in seconds" },
                                    end: { type: Type.NUMBER, description: "End time in seconds" },
                                },
                                required: ["text", "start", "end"],
                            },
                        },
                    },
                    required: ["text", "segments"],
                },
                httpOptions: this.httpOptions,
            },
        });

        const json = JSON.parse(response.text || "{}");
        return {
            path: originalPath,
            text: json.text || "",
            segments: json.segments?.map((s: any) => ({
                text: s.text,
                start: s.start,
                end: s.end,
            })) || [],
        };
    }
}
