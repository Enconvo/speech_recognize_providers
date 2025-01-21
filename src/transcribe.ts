import { EnconvoResponse, FileUtil, RequestOptions, SpeechToTextProvider } from '@enconvo/api';


interface Params extends RequestOptions {
    prompt?: string
    output_format?: string | {
        value: string
    }
    output_dir?: string
}


export default async function main(request: Request): Promise<EnconvoResponse> {
    const options: Params = await request.json()
    const { audios, videos } = FileUtil.categorizeFiles(options.audio_files || options.context_files || [])

    const provider = await SpeechToTextProvider.fromEnv()
    const results = await provider.audiosToTexts({ audioFilePaths: audios.concat(videos) })

    let content = ""
    if (results.length === 1) {
        content = results[0].text
    } else {
        content = results.map(result => `${result.path}\n\n${result.text}`).join("\n\n")
    }

    return {
        type: "text",
        content: content
    }
}


