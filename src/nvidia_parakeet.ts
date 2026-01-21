import { Commander, NativeAPI, SpeechToTextProvider } from "@enconvo/api";
import Groq from "groq-sdk";
import { AudioChunk, mergeTranscriptionResults, preHandleAudio, preprocessAudio, splitAudio } from "./audio_util.ts";
import fs from "fs"
import path from "path"

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new NvidiaParakeetProvider(options)
}

export class NvidiaParakeetProvider extends SpeechToTextProvider {



    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")

        const filePath = preprocessAudio(inputPath, "wav")

        const resp = await Commander.send("fluidTranscribe", {
            file_path: filePath,
            model_id: this.options.modelName.value || "v3"
        })

        console.log("resp", resp)

        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: ""
        }
        return result
    }

}


