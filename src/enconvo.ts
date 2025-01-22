import { SpeechToTextProvider } from "@enconvo/api";
import { preprocessAudio } from "./audio_util";
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import { env } from "process";


export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new EnconvoProvider(options)
}

export class EnconvoProvider extends SpeechToTextProvider {

    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)
    }

    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")

        const filePath = preprocessAudio(inputPath, "wav")
        console.log("filePath-", filePath)


        // 构建请求URL
        // const url = `http://localhost:8181/v1/stt`;
        const url = `https://api.enconvo.com/v1/stt`;

        // 创建 FormData 实例
        const formData = new FormData();

        // 添加音频文件
        formData.append('audio', fs.createReadStream(filePath));

        // 添加 definition
        formData.append('definition', JSON.stringify({
            locales: [this.options.speechRecognitionLanguage.value]
        }));

        let text = ""

        try {
            // 发送请求
            const response = await axios.post(url, formData, {
                headers: {
                    ...formData.getHeaders(),
                    "accessToken": `${env['accessToken']}`,
                    "client_id": `${env['client_id']}`,
                    "commandKey": `${env['commandKey']}`
                },
            });

            text = (response.data as AzureTranscriptionResponse).combinedPhrases.map(phrase => phrase.text).join(" ")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('API Error:', error.response?.data || error.message);
            } else {
                console.error('Error:', error);
            }
            text = JSON.stringify(error)
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

}







