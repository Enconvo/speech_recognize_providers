import { SpeechToTextProvider } from "@enconvo/api";
import { preprocessAudio } from "./audio_util";
import fs from "fs";
import crypto from "crypto";
import axios from "axios";

// Response interface matching the Swift model
interface ASRResponse {
    errorCode: string;
    result?: string[];
}

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {
    return new YoudaoProvider(options);
}

export class YoudaoProvider extends SpeechToTextProvider {
    // API configuration
    private readonly apiURL = "https://openapi.youdao.com/asrapi";
    private appKey: string;
    private appSecret: string;
    private language: string;

    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options);
        console.log("options-", options);
        this.appKey = options.youdao_api_key;
        this.appSecret = options.youdao_api_secret;
        this.language = options.speechRecognitionLanguage.value;
    }

    // SHA256 encryption helper
    private sha256(input: string): string {
        return crypto.createHash('sha256').update(input).digest('hex');
    }

    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "");
        const filePath = preprocessAudio(inputPath, "wav");

        // Read and encode audio file
        const audioData = fs.readFileSync(filePath);
        const base64String = audioData.toString('base64');

        // Prepare request parameters
        const salt = crypto.randomUUID();
        const curtime = Math.floor(Date.now() / 1000).toString();

        // Calculate input for signature
        const input = base64String.length > 20
            ? base64String.slice(0, 10) + base64String.length + base64String.slice(-10)
            : base64String;

        // Calculate signature
        const signStr = this.appKey + input + salt + curtime + this.appSecret;
        const sign = this.sha256(signStr);

        // Request parameters
        const parameters = {
            q: base64String,
            langType: this.language,
            appKey: this.appKey,
            salt: salt,
            curtime: curtime,
            sign: sign,
            signType: "v3",
            format: "wav",
            rate: "16000",
            channel: "1",
            type: "1"
        };

        try {
            // Make API request
            const response = await axios.post<ASRResponse>(this.apiURL, parameters);
            const data = response.data;

            // Clean up temporary file
            if (filePath !== inputPath) {
                fs.unlinkSync(filePath);
            }

            if (data.errorCode === "0" && data.result && data.result.length > 0) {
                return {
                    path: params.audioFilePath,
                    text: data.result[0]
                };
            } else {
                throw new Error(`Youdao ASR Error: ${data.errorCode}`);
            }
        } catch (error) {
            console.error("Youdao ASR Error:", error);
            // Clean up on error
            if (filePath !== inputPath) {
                fs.unlinkSync(filePath);
            }
            throw error;
        }
    }
}
