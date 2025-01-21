import { SpeechToTextProvider } from "@enconvo/api";
import { preprocessAudio } from "./audio_util";
import sdk from "microsoft-cognitiveservices-speech-sdk";
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';


export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new AzureAIProvider(options)
}

export class AzureAIProvider extends SpeechToTextProvider {

    private speechConfig: sdk.SpeechConfig
    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)
        this.speechConfig = sdk.SpeechConfig.fromSubscription(this.options.resource_key, this.options.region.value);
        this.speechConfig.speechRecognitionLanguage = this.options.speechRecognitionLanguage.value;
    }

    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")

        const filePath = preprocessAudio(inputPath, "wav")
        console.log("filePath-", filePath)

        const transcription = await this.transcribeAudio(filePath)
        let text = ""
        if (transcription) {
            text = transcription.combinedPhrases.map(phrase => phrase.text).join(" ")
        }
        // clean up
        if (filePath !== inputPath) {
            fs.unlinkSync(filePath)
        }
        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: text
        }

        return result
    }


    async transcribeAudio(
        audioFilePath: string
    ): Promise<AzureTranscriptionResponse | undefined> {
        // 构建请求URL
        const url = `https://${this.options.region.value}.api.cognitive.microsoft.com/speechtotext/transcriptions:transcribe?api-version=2024-11-15`;

        // 创建 FormData 实例
        const formData = new FormData();

        // 添加音频文件
        formData.append('audio', fs.createReadStream(audioFilePath));

        // 添加 definition
        formData.append('definition', JSON.stringify({
            locales: [this.options.speechRecognitionLanguage.value]
        }));

        try {
            // 发送请求
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Ocp-Apim-Subscription-Key': this.options.resource_key,
                },
            });

            return response.data as AzureTranscriptionResponse;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error:', error.response?.data || error.message);
            } else {
                console.error('Error:', error);
            }
            return undefined
        }
    }

}







