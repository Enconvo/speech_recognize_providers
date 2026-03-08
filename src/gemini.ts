import { CommandManageUtils, handleVariables, SpeechToTextProvider } from "@enconvo/api";
import { GoogleGenAI, Type } from "@google/genai";
import { preHandleAudio } from "./audio_util.ts";
import fs from "fs";
import path from "path";
import { env } from "process";
import os from 'os'

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {
    return new GeminiProvider(options);
}

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.aiff'];

const DEFAULT_SYSTEM_INSTRUCTION = "You are a highly accurate speech-to-text transcription engine. Transcribe the audio precisely. Output only the transcribed text without any additional commentary, explanation, or formatting.";

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

    private async buildContents(inputPath: string, mimeType: string, userPrompt?: string) {
        const fileSize = fs.statSync(inputPath).size;
        const MAX_INLINE_SIZE = 15 * 1024 * 1024;

        const parts: any[] = [];
        if (userPrompt) {
            parts.push({ text: userPrompt });
        }

        if (fileSize < MAX_INLINE_SIZE) {
            const base64Audio = fs.readFileSync(inputPath, { encoding: "base64" });
            parts.push({ inlineData: { mimeType, data: base64Audio } });
        } else {
            const uploadedFile = await this.ai.files.upload({
                file: inputPath,
                config: { mimeType },
            });
            parts.push({ fileData: { fileUri: uploadedFile.uri, mimeType: uploadedFile.mimeType } });
        }

        return parts;
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

        let systemInstruction = DEFAULT_SYSTEM_INSTRUCTION;
        let userPrompt: string | undefined;

        if (params.voiceCommand) {
            const voiceCommandConfig = await CommandManageUtils.loadCommandConfig({ commandKey: params.voiceCommand, includes: ['post_action_commands'] })

            const postActionCommandKey: string | undefined = voiceCommandConfig.post_action_commands?.activeId

            if (postActionCommandKey && postActionCommandKey.length > 0) {
                const postActionCommandConfig = await CommandManageUtils.loadCommandConfig({ commandKey: postActionCommandKey, useAsRunParams: true })
                console.log("postActionCommandConfig", JSON.stringify(postActionCommandConfig, null, 2))

                let postPrompt = postActionCommandConfig['prompt']
                let user_prompt_1 = postActionCommandConfig['user_prompt_1']

                const variables = {
                    ...postActionCommandConfig,
                    home_directory: os.homedir(),
                    device_host: os.hostname(),
                    os_version: `${os.type()} ${os.release()}`,
                    node_version: process.version,
                    input_text: '!IMPORTANT:the text if from the audio file, please refer to it.${audio_file_content}',
                }

                const instructionPrompt = await handleVariables(postPrompt, variables)
                const userPromptResult = await handleVariables(user_prompt_1, variables)

                systemInstruction = instructionPrompt.text
                userPrompt = userPromptResult.text
            }
        }

        console.log("[Gemini] systemInstruction:", systemInstruction)
        console.log("[Gemini] userPrompt:", userPrompt)

        try {
            const mimeType = this.getMimeType(processedPath);
            const modelName = this.getModel();
            const enableTimestamps = this.options.timestamps?.value === "true";

            if (enableTimestamps) {
                return await this.transcribeWithTimestamps(processedPath, mimeType, modelName, systemInstruction, userPrompt, params.audioFilePath);
            } else {
                return await this.transcribeText(processedPath, mimeType, modelName, systemInstruction, userPrompt, params.audioFilePath);
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
        systemInstruction: string,
        userPrompt: string | undefined,
        originalPath: string
    ): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const contents = await this.buildContents(inputPath, mimeType, userPrompt);
        const response = await this.ai.models.generateContent({
            model: modelName,
            contents,
            config: {
                systemInstruction,
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
        systemInstruction: string,
        userPrompt: string | undefined,
        originalPath: string
    ): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const contents = await this.buildContents(inputPath, mimeType, userPrompt);
        const response = await this.ai.models.generateContent({
            model: modelName,
            contents,
            config: {
                systemInstruction,
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
