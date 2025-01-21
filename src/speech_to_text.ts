import { Groq } from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { AudioChunk, splitAudio } from './audio_util.ts';
import { RequestOptions } from '@enconvo/api';


export default async function main(request: Request) {
    const options: RequestOptions = await request.json()
    const inputPath = (options.context_files?.[0] || "").replace("file://", "")
    // const inputPath = "/Users/ysnows/Desktop/demo.mp3"

    const chunkSize = 1024 * 1024
    const chunkOverlapTime = 0 // seconds
    const processedPath = preprocessAudio(inputPath)

    const chunks = await splitAudio(processedPath, chunkSize, chunkOverlapTime)
    const client = new Groq({ apiKey: "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" })
    const results = await transcribeChunks(client, chunks)
    // const results = [{ "result": " 从前在一个宁静的小村庄里,有一个名叫艾米丽的小女孩。艾米丽对大自然充满了好奇,尤其是她家后院那片神秘的森林。 一天,艾米利决定去森林里探险。 他轻轻地推开树枝,走入了绿荫覆盖的小径,阳光洒在地上,形成了斑驳的光影。 忽然,艾米利听到了轻轻的哼唱声,他循着声音走过去,看见一只美丽的小鸟。", "startTime": 0 }, { "result": " 轻轻地哼唱声,他循着声音走过去,看见一只美丽的鸟正在树枝上鸣唱。 这只鸟,拥有五彩斑斓的羽毛,见到艾米丽也不飞走,反而偏偏飞到她的肩膀上。 鸟用悦耳的声音告诉艾米丽,她叫妙丽,是森林的守护者。 妙丽邀请艾米丽一同去探访森林的奇妙之处。 他们穿过青苔铺成的地毯,聆听树上的松鼠酣畅淋漓地吃着坚果。", "startTime": 30.606 }, { "result": " 聆听树上的松鼠,酣畅淋漓地吃着坚果,观看溪流边蝴蝶翩翩起舞。 在阳光即将沉没之际,妙丽带着艾米丽来到一棵巨大的老树前。 妙丽告诉她,这棵树是森林的灵魂,承载着许多古老的传说和秘密。 艾米丽轻轻触摸着粗糙的树皮,感觉到了内心的宁静和力量。 雖然天色漸暗,但艾米莉心中充滿了溫暖。 她告別了愛美麗,", "startTime": 61.212 }, { "result": " 天色漸暗,但艾米莉心中充滿了溫暖。 她告別了妙麗,帶著滿滿的回憶回到了家。 艾米莉把這次奇妙的森林之旅寫進了日記,成為了她心中永遠珍藏的秘密。 從那以後,艾米莉更加熱愛大自然,並立志要保護這片神奇的森林。 他相信,只要心中有爱,世界就会充满无限的可能。", "startTime": 91.81800000000001 }]

    // Merge overlapping transcription chunks into a single coherent text

    // Merge the transcription results
    const mergedText = mergeTranscriptionResults(results);



    console.log("Results: ", JSON.stringify({
        mergedText,
        results
    }, null, 2))

    return JSON.stringify({
        mergedText,
        results
    }, null, 2)
}



function mergeTranscriptionResults(results: ChunkResult[]): string {
    // Sort results by start time to ensure proper ordering
    const sortedResults = [...results].sort((a, b) => a.startTime - b.startTime);

    // If no results, return empty string
    if (sortedResults.length === 0) {
        return "";
    }

    // Initialize with first chunk
    let mergedText = sortedResults[0].result;

    // Process subsequent chunks
    for (let i = 1; i < sortedResults.length; i++) {
        const currentChunk = sortedResults[i].result;
        const prevChunk = sortedResults[i - 1].result;

        // Find the longest common substring between end of previous chunk and start of current chunk
        let overlap = findLargestOverlap(prevChunk, currentChunk);
        console.log("Overlap: \n", overlap, "\n", prevChunk, "\n", currentChunk)

        // If overlap found, append only the non-overlapping part
        // If no overlap found, append the entire chunk
        if (overlap) {
            mergedText += currentChunk.slice(overlap.length);
        } else {
            mergedText += currentChunk;
        }
    }

    return mergedText;
}

// Helper function to find the largest overlapping text between two strings
function findLargestOverlap(str1: string, str2: string): string {
    let maxOverlap = "";

    // Get the minimum length between the two strings
    const minLength = Math.min(str1.length, str2.length);

    // Try different overlap lengths, starting from the largest possible
    for (let size = minLength; size > 0; size--) {
        const end = str1.slice(-size);
        const start = str2.slice(0, size);

        if (end === start) {
            maxOverlap = end;
            break;
        }
    }

    return maxOverlap;
}







interface ChunkResult {
    result: string;
    startTime: number;
}

/**
 * Preprocess audio file to 16kHz mono FLAC using ffmpeg
 */
function preprocessAudio(inputPath: string): string {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
    }
    // Get the directory of the input file and create output path in same directory
    const outputPath = path.join(path.dirname(inputPath), `${path.basename(inputPath).split(".")[0]}.flac`);

    console.log("Converting audio to 16kHz mono FLAC...");
    try {
        execSync(`ffmpeg -hide_banner -loglevel error -i "${inputPath}" -ar 16000 -ac 1 -c:a flac -y "${outputPath}"`);
        return outputPath;
    } catch (e) {
        throw new Error(`FFmpeg conversion failed: ${e.message}`);
    }
}

/**
 * Transcribe a single audio chunk with Groq API
 */
async function transcribeChunks(
    client: Groq,
    chunks: AudioChunk[],
): Promise<ChunkResult[]> {
    let totalApiTime = 0;
    const results: ChunkResult[] = []
    for (const chunk of chunks) {

        console.log("Transcribing chunk: ", chunk.path)

        const tempFile = chunk.path;
        const MAX_RETRIES = 3; // Maximum number of retry attempts
        const INITIAL_RETRY_DELAY = 60000; // Initial retry delay in milliseconds
        let retryCount = 0;

        try {
            while (retryCount < MAX_RETRIES) {
                const startTime = Date.now();
                try {
                    // Attempt transcription
                    const result = await client.audio.transcriptions.create({
                        file: fs.createReadStream(tempFile),
                        model: "whisper-large-v3",
                        language: "en",
                        response_format: "verbose_json"
                    });

                    // Calculate and log processing time
                    const apiTime = (Date.now() - startTime) / 1000;
                    totalApiTime += apiTime;
                    console.log(`Chunk api completed, time: ${chunk.path}`, apiTime)
                    // Store successful result
                    results.push({ result: result.text, startTime: chunk.start });
                    break; // Exit retry loop on success

                } catch (e: any) {
                    if (e.code === 'rate_limit_exceeded') {
                        retryCount++;
                        if (retryCount >= MAX_RETRIES) {
                            throw new Error(`Failed to process chunk ${chunk.path} after ${MAX_RETRIES} retries`);
                        }
                        // Exponential backoff delay
                        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
                        console.log(`\nRate limit hit for chunk ${chunk.path} - retry ${retryCount}/${MAX_RETRIES} in ${delay / 1000}s...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw e; // Re-throw non-rate-limit errors
                }
            }
        } finally {
            // Cleanup temp file
            // if (fs.existsSync(tempFile)) {
            //     fs.unlinkSync(tempFile);
            // }
        }


    }
    console.log(" total api time: ", totalApiTime)
    return results
}
