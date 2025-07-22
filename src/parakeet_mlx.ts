import { NativeAPI, SpeechToTextProvider } from "@enconvo/api";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { preprocessAudio } from "./audio_util";
import fs from "fs";

export default function main(options: SpeechToTextProvider.SpeechToTextOptions) {

    return new ParakeetMLXProvider(options)
}

export class ParakeetMLXProvider extends SpeechToTextProvider {

    private mcp: Client;
    constructor(options: SpeechToTextProvider.SpeechToTextOptions) {
        super(options)
    }

    private async _mcp() {
        if (this.mcp) {
            return
        }
    }


    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        await this._mcp()
        const inputPath = params.audioFilePath.replace("file://", "")

        console.log("inputPath-", inputPath)
        const filePath = preprocessAudio(inputPath, "wav")
        console.log("filePath-", filePath)

        console.time("parakeet_mlx")
        const resp = await NativeAPI.callCommand("mlx_manage|hf_manage", {
            method: 'transcribe_audio',
            arguments: {
                file_path: filePath
            }
        })
        console.log("resp", resp)
        console.timeEnd("parakeet_mlx")
        const text = resp.data?.result || ""

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







