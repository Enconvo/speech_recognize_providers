import { SpeechToTextProvider } from "@enconvo/api";
import { AssemblyAI } from 'assemblyai'
import { preprocessAudio } from "./audio_util";
import fs from "fs"

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new AssemblyAIProvider(options)
}

export class AssemblyAIProvider extends SpeechToTextProvider {

    private client: AssemblyAI
    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)
        console.log("options-", options)
        this.client = new AssemblyAI({
            apiKey: options.api_key
        })
    }


    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")
        const filePath = preprocessAudio(inputPath)


        const transcript = await this.client.transcripts.transcribe({
            audio: filePath,
            language_code: this.options.speechRecognitionLanguage.value,
        })

        let text: string | undefined = undefined
        if (transcript.status === 'error') {
            console.error(`Transcription failed: ${transcript.error}`)
            text = transcript.error
        } else {
            text = transcript.text || ""
        }

        // clean up
        if (filePath !== inputPath) {
            fs.unlinkSync(filePath)
        }


        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: text || ""
        }

        return result
    }


}







