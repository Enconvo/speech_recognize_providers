import { CommandUtil, SpeechToTextProvider } from "@enconvo/api";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
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
        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
        const transport = new StdioClientTransport({
            command: "uv",
            args: ["run", "transcript.py"],
            cwd: CommandUtil.extensionPath("speech_recognize_providers")
        });
        this.mcp.connect(transport);
    }


    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult> {
        await this._mcp()
        const inputPath = params.audioFilePath.replace("file://", "")

        console.log("inputPath-", inputPath)
        const filePath = preprocessAudio(inputPath, "wav")
        console.log("filePath-", filePath)

        console.time("parakeet_mlx")
        const mcpResult = await this.mcp.callTool({
            name: "transcribe_audio",
            arguments: {
                file_path: filePath
            }
        })
        console.log("mcpResult", mcpResult)
        console.timeEnd("parakeet_mlx")
        const text = (mcpResult.structuredContent as any).result

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







