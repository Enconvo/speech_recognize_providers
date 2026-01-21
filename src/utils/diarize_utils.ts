import { SpeechToTextProvider } from "@enconvo/api";

// Diarization segment from fluidDiarize API
export interface DiarizeSegment {
    speaker: string;
    start: number;
    end: number;
}

// Diarization result from fluidDiarize API
export interface DiarizeResult {
    data: {
        segments: DiarizeSegment[];
        success: boolean;
    }
}


export namespace DiarizeUtils {

    /**
     * Format speaker label: replace "S" prefix with "Speaker"
     * e.g., "S1" -> "Speaker1", "S2" -> "Speaker2"
     */
    export function formatSpeakerLabel(speaker: string): string {
        return speaker.replace(/^S(\d+)$/, 'Speaker$1');
    }

    /**
     * Find the best matching speaker for a segment based on time overlap
     */
    export function findBestSpeaker(
        segment: SpeechToTextProvider.TranscriptSegment,
        diarizeSegments: SpeechToTextProvider.TranscriptSegment[]
    ): string | undefined {
        let bestSpeaker: string | undefined;
        let maxOverlap = 0;

        for (const diarize of diarizeSegments) {
            // Calculate overlap between transcript segment and diarization segment
            const overlapStart = Math.max(segment.start, diarize.start);
            const overlapEnd = Math.min(segment.end, diarize.end);
            const overlap = Math.max(0, overlapEnd - overlapStart);

            // Update best speaker if this has more overlap
            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                bestSpeaker = diarize.speaker;
            }
        }

        // Format speaker label before returning
        return bestSpeaker ? formatSpeakerLabel(bestSpeaker) : undefined;
    }

    /**
     * Merge diarization results with transcription segments
     * Assigns speaker labels to segments based on time overlap
     * Merges consecutive segments with the same speaker into one
     */
    export function mergeDiarization(
        segments: SpeechToTextProvider.TranscriptSegment[],
        diarizeResult: DiarizeResult
    ): SpeechToTextProvider.TranscriptSegment[] {
        // Return original segments if diarization failed or has no data
        if (!diarizeResult?.data?.success || !diarizeResult.data.segments?.length) {
            return segments;
        }

        if (segments.length === 0) {
            return [];
        }

        const diarizeSegments = diarizeResult.data.segments;

        // First pass: assign speaker to each segment
        const segmentsWithSpeaker = segments.map(segment => ({
            ...segment,
            speaker: findBestSpeaker(segment, diarizeSegments)
        }));

        // Second pass: merge consecutive segments with the same speaker
        const mergedSegments: SpeechToTextProvider.TranscriptSegment[] = [];
        let currentMerged: SpeechToTextProvider.TranscriptSegment | null = null;

        for (const segment of segmentsWithSpeaker) {
            if (!currentMerged) {
                // Start a new merged segment
                currentMerged = { ...segment };
            } else if (currentMerged.speaker === segment.speaker) {
                // Same speaker, merge the segments
                currentMerged.text = currentMerged.text + segment.text;
                currentMerged.end = segment.end;
            } else {
                // Different speaker, push current and start new
                mergedSegments.push(currentMerged);
                currentMerged = { ...segment };
            }
        }

        // Don't forget the last segment
        if (currentMerged) {
            mergedSegments.push(currentMerged);
        }

        return mergedSegments;
    }
}