// 单词级别的详细信息
interface Word {
    text: string;
    offsetMilliseconds: number;
    durationMilliseconds: number;
}

// 短语级别的信息
interface Phrase {
    offsetMilliseconds: number;
    durationMilliseconds: number;
    text: string;
    words: Word[];
    locale: string;
    confidence: number;
}

// 合并的短语
interface CombinedPhrase {
    text: string;
}

// Azure 语音转文字的完整返回结构
interface AzureTranscriptionResponse {
    durationMilliseconds: number;
    combinedPhrases: CombinedPhrase[];
    phrases: Phrase[];
} 