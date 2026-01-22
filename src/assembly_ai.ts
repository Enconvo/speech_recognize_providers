import { SpeechToTextProvider } from "@enconvo/api";
import { AssemblyAI, BaseServiceParams, TranscribeParams } from 'assemblyai'
import { preprocessAudio } from "./audio_util.ts";
import fs from "fs"

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new AssemblyAIProvider(options)
}

export class AssemblyAIProvider extends SpeechToTextProvider {

    private client: AssemblyAI
    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)
        console.log("options-", options)
        const credentials = this.options.credentials

        const data: BaseServiceParams = {
            apiKey: credentials.apiKey,
        }
        if (credentials.commandName === 'enconvo_ai') {
            data.baseUrl = "https://api.enconvo.com/assembly_ai/"
            // data.baseUrl = "http://127.0.0.1:8181/assembly_ai/"
        }
        this.client = new AssemblyAI(data)
    }

    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        console.log("params-", params)
        const inputPath = params.audioFilePath.replace("file://", "")
        const filePath = preprocessAudio(inputPath)

        const data: TranscribeParams = {
            audio: filePath,
            punctuate: true,
            speaker_labels: params.diarization || false,
            format_text: true,
            speech_model: this.options.modelName.value || "universal"
        }

        if (this.options.speechRecognitionLanguage.value && this.options.speechRecognitionLanguage.value !== "auto") {
            data.language_code = this.options.speechRecognitionLanguage.value
        } else {
            data.language_detection = true
        }

        const transcript = await this.client.transcripts.transcribe(data)
        // console.log("transcript-", JSON.stringify(transcript, null, 2))

        let text: string | undefined = undefined
        let segments: SpeechToTextProvider.TranscriptSegment[] | undefined = undefined
        if (transcript.status === 'error') {
            console.error(`Transcription failed: ${transcript.error}`)
            text = transcript.error
        } else {
            text = transcript.text || ""
            segments = transcript.utterances?.map(utterance => {
                const transcriptSegment: SpeechToTextProvider.TranscriptSegment = {
                    start: utterance.start,
                    end: utterance.end,
                    text: utterance.text,
                    speaker: utterance.speaker
                }
                return transcriptSegment
            })

            if (params.diarization) {
                text = segments?.map(segment => `Speaker${segment.speaker}: ${segment.text}`).join("\n\n")
            }
        }

        // clean up
        if (filePath !== inputPath) {
            fs.unlinkSync(filePath)
        }

        const result: SpeechToTextProvider.SpeechToTextResult = {
            path: params.audioFilePath,
            text: text || "",
            segments: segments || []
        }

        return result
    }


}







