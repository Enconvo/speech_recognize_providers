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
     * Find the best matching speaker for a segment using multiple strategies:
     * 1. First try overlap-based matching (weighted by overlap duration)
     * 2. If no overlap found, use midpoint matching (find diarize segment containing midpoint)
     * 3. If still no match, find the nearest diarize segment
     */
    export function findBestSpeaker(
        segment: SpeechToTextProvider.TranscriptSegment,
        diarizeSegments: DiarizeSegment[]
    ): string | undefined {
        if (!diarizeSegments || diarizeSegments.length === 0) {
            return undefined;
        }

        // Strategy 1: Find segment with maximum overlap
        let bestSpeaker: string | undefined;
        let maxOverlap = 0;

        for (const diarize of diarizeSegments) {
            const overlapStart = Math.max(segment.start, diarize.start);
            const overlapEnd = Math.min(segment.end, diarize.end);
            const overlap = Math.max(0, overlapEnd - overlapStart);

            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                bestSpeaker = diarize.speaker;
            }
        }

        // If found overlap, return the speaker
        if (bestSpeaker) {
            return formatSpeakerLabel(bestSpeaker);
        }

        // Strategy 2: Use midpoint to find containing diarize segment
        const midpoint = (segment.start + segment.end) / 2;
        for (const diarize of diarizeSegments) {
            if (midpoint >= diarize.start && midpoint <= diarize.end) {
                return formatSpeakerLabel(diarize.speaker);
            }
        }

        // Strategy 3: Find the nearest diarize segment
        let minDistance = Infinity;
        let nearestSpeaker: string | undefined;

        for (const diarize of diarizeSegments) {
            // Calculate distance from segment to diarize segment
            let distance: number;
            if (segment.end < diarize.start) {
                // Segment is before diarize segment
                distance = diarize.start - segment.end;
            } else if (segment.start > diarize.end) {
                // Segment is after diarize segment
                distance = segment.start - diarize.end;
            } else {
                // Overlapping (should have been caught above, but just in case)
                distance = 0;
            }

            if (distance < minDistance) {
                minDistance = distance;
                nearestSpeaker = diarize.speaker;
            }
        }

        return nearestSpeaker ? formatSpeakerLabel(nearestSpeaker) : undefined;
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

        if (!segments || segments.length === 0) {
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