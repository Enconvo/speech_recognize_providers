import { SpeechToTextProvider } from "@enconvo/api";
import { preprocessAudio } from "./audio_util";
import fs from "fs"
import { createClient, DeepgramClient } from "@deepgram/sdk";

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new AssemblyAIProvider(options)
}

export class AssemblyAIProvider extends SpeechToTextProvider {

    private client: DeepgramClient
    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)
        console.log("options-", options)
        // The API key we created in step 3
        const credentials = this.options.credentials
        const deepgramApiKey = credentials.deepgram_token;

        this.client = createClient(deepgramApiKey);
    }


    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        const inputPath = params.audioFilePath.replace("file://", "")
        const filePath = preprocessAudio(inputPath)


        let text: string | undefined = undefined
        const { result: transcriptionResult, error } = await this.client.listen.prerecorded.transcribeFile(
            fs.readFileSync(filePath),
            {
                smart_format: true, model: this.options.modelName.value, language: this.options.speechRecognitionLanguage.value
            },
        );

        if (error) {
            console.error("error-", error)
            return {
                path: params.audioFilePath,
                text: `${JSON.stringify(error)}`
            }
        }
        if (!error) console.dir(transcriptionResult, { depth: null });

        if (transcriptionResult) {
            text = transcriptionResult.results.channels[0].alternatives[0].transcript
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







