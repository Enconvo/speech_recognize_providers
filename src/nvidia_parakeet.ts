import { Commander, SpeechToTextProvider } from "@enconvo/api";
import { preprocessAudio } from "./audio_util.ts";

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new NvidiaParakeetProvider(options)
}

export class NvidiaParakeetProvider extends SpeechToTextProvider {



    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")

        const filePath = preprocessAudio(inputPath, "wav")
        console.log("filePath", filePath, inputPath)

        const resp = await Commander.send("fluidTranscribe", {
            file_path: filePath,
            model_id: this.options.modelName.value || "v3"
        })

        console.log("resp", resp)

        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: resp.data?.text || ""
        }
        return result
    }

}


