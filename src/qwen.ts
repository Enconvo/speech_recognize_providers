import { SpeechToTextProvider, environment } from "@enconvo/api";
import { preprocessAudio } from "./audio_util.ts";
import fs from "fs";

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {
    return new QwenASRProvider(options)
}

export class QwenASRProvider extends SpeechToTextProvider {

    async preload(): Promise<void> {
        const resp = await fetch(`${environment.localServerBaseUrl}/mlx_manage/mlx_audio/load_model`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model_id: this.options.modelName?.value || "mlx-community/Qwen3-ASR-1.7B-8bit",
                category: "stt"
            })
        })
        console.log("preload stt", resp)
    }


    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")
        const filePath = preprocessAudio(inputPath, "wav")

        const resp = await fetch(`${environment.localServerBaseUrl}/mlx_manage/mlx_audio/stt_transcribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                arguments: {
                    file_path: filePath,
                    language: this.options.language?.value || "auto",
                    verbose: false,
                    model_id: this.options.modelName?.value || "mlx-community/Qwen3-ASR-1.7B-8bit"
                }
            })
        })

        // clean up
        if (filePath !== inputPath) {
            fs.unlinkSync(filePath)
        }

        const data = await resp.json()
        console.log("data", data)

        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: data?.text || "",
            segments: data?.segments || [],
            duration: Math.round(data?.duration || 0)
        }

        return result
    }
}
