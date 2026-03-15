import { Commander, NativeEventUtils } from "@enconvo/api"

/** Download Whisper model request params */
interface DownloadWhisperModelParams {
    /** Unique identifier for tracking the download */
    id: string
    /** WhisperKit model ID to download */
    model_id: string
}

/**
 * Download and preload a WhisperKit STT model into memory
 * @param {Request} req - Request object, body is {@link DownloadWhisperModelParams}
 * @returns Success string on completion
 * @private
 */
export default async function main(req: Request) {
    const body: DownloadWhisperModelParams = await req.json()
    console.log("body", body.model_id)

    // Use a flag to track download completion
    let downloadCompleted = false
    let downloadResult: any = null
    let downloadError: any = null

    // Start the download and load into memory
    Commander.send("whisperKitPreloadModel", {
        model_id: body.model_id
    }).then(resp => {
        console.log("resp", resp)
        downloadResult = resp
        downloadCompleted = true
    }).catch(err => {
        console.log("err", err)
        downloadError = err
        downloadCompleted = true
    })

    // Block with while loop until preload completes
    while (!downloadCompleted) {
        // Sleep for a short time to avoid busy waiting
        NativeEventUtils.sendEvent(`download_whisper_model_${body.model_id}`, {
            id: body.id,
            status: "downloading"
        })
        await new Promise(resolve => setTimeout(resolve, 300))
    }

    // Check if download failed
    if (downloadError) {
        throw new Error(`Download failed: ${downloadError}`)
    }

    NativeEventUtils.sendEvent(`download_whisper_model_${body.model_id}`, {
        id: body.id,
        status: "loaded"
    })

    return "success"
}





