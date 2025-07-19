import { Commander, JsonRpcMethod, SpeechToTextProvider } from "@enconvo/api";
import { preprocessAudio } from "./audio_util";
import * as fs from 'fs';


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

        console.time("whisperOffline")
        const transcription = await Commander.send(JsonRpcMethod.localWhisperTranscribeFile, { path: filePath })
        const data: { text: string } = transcription.data
        console.log("transcription-", data.text)
        console.timeEnd("whisperOffline")

        let text = data.text
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







