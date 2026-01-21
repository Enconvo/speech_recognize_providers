import { Commander } from "@enconvo/api"

export default async function main(req: Request) {
    const body: { id: string, model_id: string } = await req.json()
    console.log("body", body.model_id)

    // Use a flag to track download completion
    let downloadCompleted = false
    let downloadResult: any = null
    let downloadError: any = null

    // Start the download
    Commander.send("whisperKitDownloadModel", {
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

    // Block with while loop until download completes
    while (!downloadCompleted) {
        // Sleep for a short time to avoid busy waiting
        Commander.sendEvent(`download_whisper_model_${body.model_id}`, {
            id: body.id,
            status: "downloading"
        })
        await new Promise(resolve => setTimeout(resolve, 300))
    }

    // Check if download failed
    if (downloadError) {
        throw new Error(`Download failed: ${downloadError}`)
    }
    console.log("download_whisper_model_${body.model_id}", `download_whisper_model_${body.model_id}`)

    Commander.sendEvent(`download_whisper_model_${body.model_id}`, {
        id: body.id,
        status: "downloaded"
    })

    return "success"
}





