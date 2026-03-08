// Speech-to-text model type definition
export interface SpeechToTextModel {
  id: string;
  name: string;
  description: string;
  icon?: string;
  provider_id: string;
  model_id: string;
  accuracy: number; // Rating 1-5
  speed: number; // Rating 1-5
  language: "english" | "multilingual";
  is_realtime: boolean;
  is_online: boolean;
  is_enconvo_cloud?: boolean; // Model uses Enconvo Cloud service
  is_bring_your_own_key?: boolean; // Model requires user's own API key
  is_Speaker_Diarization?: boolean; // Model supports speaker diarization (identifying different speakers)
  tags: string[];
  supports_punctuation: boolean;
  supports_captions: boolean;
  size?: string; // Model size in MB, e.g. "496 MB" (only for local models)
  is_valid?: boolean;
  is_default?: boolean;
}

// Filter options for querying models
export interface SpeechToTextModelFilter {
  is_online?: boolean;
  is_local?: boolean;
  is_realtime?: boolean;
  is_enconvo_cloud?: boolean;
  is_bring_your_own_key?: boolean;
  is_Speaker_Diarization?: boolean;
  language?: "english" | "multilingual";
  supports_punctuation?: boolean;
  supports_captions?: boolean;
}

// Pre-defined speech-to-text models data
export const speechToTextModels: SpeechToTextModel[] = [
  // Google Gemini (Enconvo Cloud)
  {
    id: "enconvo-gemini-3.1-flash-lite",
    name: "Google Gemini 3.1 Flash Lite (Enconvo Cloud)",
    description: "Most cost-efficient multimodal model with fastest performance for high-frequency, lightweight tasks. Supports audio transcription, structured outputs, and thinking. 1M token input context window.",
    icon: "gemini.png",
    provider_id: "gemini_enconvo",
    model_id: "google/gemini-3.1-flash-lite-preview",
    accuracy: 4,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_enconvo_cloud: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  {
    id: "enconvo-groq-whisper-large-v3-turbo",
    name: "Groq Whisper Large V3 Turbo (Enconvo Cloud)",
    description: "Powered by Groq Whisper Large V3 Turbo via Enconvo Cloud Plan - high-quality transcription with fast cloud processing.",
    provider_id: "enconvo_cloud_plan",
    model_id: "groq/whisper-large-v3-turbo",
    accuracy: 4,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_enconvo_cloud: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  {
    id: "enconvo-gpt-4o-mini-transcribe",
    name: "GPT-4o-Mini-Transcribe (Enconvo Cloud)",
    description: "Powered by GPT-4o-Mini-Transcribe via Enconvo Cloud Plan - high-quality transcription with fast cloud processing.",
    provider_id: "openai_enconvo",
    model_id: "openai/gpt-4o-mini-transcribe",
    accuracy: 4,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_enconvo_cloud: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  // Qwen ASR (Local)
  {
    id: "qwen-asr",
    name: "Qwen3-ASR-1.7B-8bit",
    description: "Alibaba's multilingual ASR powered by Qwen3-ASR, supporting ZH, EN, JA, KO and more.",
    icon: "qwen.png",
    provider_id: "qwen",
    model_id: "mlx-community/Qwen3-ASR-1.7B-8bit",
    accuracy: 5,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: false,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
    size: "1.7 GB",
  },
  {
    id: "nvidia-parakeet-tdt-0.6b-v3",
    name: "Nvidia Parakeet Tdt 0.6B V3",
    description: "Ultra-fast transcription powered by NVIDIA FastConformer. Optimized for conversational speech and voice commands.",
    provider_id: "nvidia_parakeet",
    model_id: "parakeet-tdt-0.6b-v3",
    accuracy: 6,
    speed: 6,
    language: "multilingual",
    is_realtime: false,
    is_online: false,
    tags: ["Best for Multilingual"],
    supports_punctuation: false,
    supports_captions: false,
    size: "496 MB",
  },
  {
    id: "enconvo-mistral-voxtral-mini-latest",
    name: "Mistral Voxtral Mini Latest (Enconvo Cloud)",
    description: "Powered by Mistral Voxtral Mini Latest via Enconvo Cloud Plan - high-quality transcription with fast cloud processing.",
    provider_id: "mistral_enconvo",
    model_id: "mistral/voxtral-mini-latest",
    accuracy: 4,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_enconvo_cloud: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  {
    id: "enconvo-gpt-4o-transcribe",
    name: "GPT-4o-Transcribe (Enconvo Cloud)",
    description: "Powered by GPT-4o-Mini-Transcribe via Enconvo Cloud Plan - high-quality transcription with fast cloud processing.",
    provider_id: "openai_enconvo",
    model_id: "openai/gpt-4o-transcribe",
    accuracy: 4,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_enconvo_cloud: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  {
    id: "nvidia-parakeet-tdt-0.6b-v2",
    name: "Nvidia Parakeet Tdt 0.6B V2",
    description: "Ultra-fast English-only transcription powered by NVIDIA FastConformer V2. Optimized for English dictation and voice commands.",
    provider_id: "nvidia_parakeet",
    model_id: "parakeet-tdt-0.6b-v2",
    accuracy: 6,
    speed: 6,
    language: "english",
    is_realtime: false,
    is_online: false,
    tags: ["Best for English"],
    supports_punctuation: false,
    supports_captions: false,
    size: "496 MB",
  },
  {
    id: "enconvo-groq-whisper-large-v3",
    name: "Whisper Large V3 (Enconvo Cloud)",
    description: "Powered by Groq Whisper Large V3 via Enconvo Cloud Plan - high accuracy transcription for multilingual audio.",
    provider_id: "enconvo_cloud_plan",
    model_id: "groq/whisper-large-v3",
    accuracy: 5,
    speed: 4,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_enconvo_cloud: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  {
    id: "local-whisper-base",
    name: "Local Whisper Base",
    description: "Local Whisper Base - local transcription with high accuracy.",
    provider_id: "whisperOffline",
    model_id: "openai_whisper-base",
    accuracy: 6,
    speed: 6,
    language: "multilingual",
    is_realtime: false,
    is_online: false,
    tags: [""],
    supports_punctuation: false,
    supports_captions: false,
    size: "147 MB",
  },
  {
    id: "local-whisper-small-216mb",
    name: "Local Whisper Small (216 MB)",
    description: "Local Whisper Small - local transcription with high accuracy.",
    provider_id: "whisperOffline",
    model_id: "openai_whisper-small_216MB",
    accuracy: 6,
    speed: 6,
    language: "multilingual",
    is_realtime: false,
    is_online: false,
    tags: [""],
    supports_punctuation: false,
    supports_captions: false,
    size: "216 MB",
  },
  {
    id: "local-whisper-large-v3-turbo-626mb",
    name: "Local Whisper Large V3 Turbo (626 MB)",
    description: "Local Whisper Large V3 Turbo - local transcription with high accuracy.",
    provider_id: "whisperOffline",
    model_id: "openai_whisper-large-v3-v20240930_626MB",
    accuracy: 6,
    speed: 6,
    language: "multilingual",
    is_realtime: false,
    is_online: false,
    tags: [""],
    supports_punctuation: false,
    supports_captions: false,
    size: "626 MB",
  },
  {
    id: "enconvo-azure",
    name: "Microsoft Azure (Enconvo Cloud)",
    description: "Enconvo Speech-to-Text Provider that allows you to use high speed online Speech-to-Text service powered by Microsoft Azure.",
    provider_id: "enconvo",
    model_id: "azure/azure",
    accuracy: 4,
    speed: 5,
    language: "multilingual",
    is_realtime: true,
    is_online: true,
    is_enconvo_cloud: true,
    tags: ["Free"],
    supports_punctuation: false,
    supports_captions: false,
  },
  {
    id: "deepgram-nova-3",
    name: "Deepgram Nova-3",
    description: "Powered by Deepgram Nova-3 - real-time dictation with excellent accuracy. English-only optimized version.",
    provider_id: "deepgram",
    model_id: "nova-3",
    accuracy: 5,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_bring_your_own_key: true,
    tags: ["Fastest"],
    supports_punctuation: true,
    supports_captions: false,
  },
  {
    id: "assembly-ai-universal-enconvo-cloud",
    name: "Assembly AI Universal (Enconvo Cloud)",
    description: "Powered by Assembly AI Universal - real-time dictation with excellent accuracy. Multilingual optimized version.",
    provider_id: "assembly_ai_enconvo",
    model_id: "universal",
    accuracy: 4,
    speed: 4,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_enconvo_cloud: true,
    is_Speaker_Diarization: true,
    tags: ["Most Accurate"],
    supports_punctuation: true,
    supports_captions: false,
  },
  {
    id: "assembly-ai-universal",
    name: "Assembly AI Universal",
    description: "Powered by Assembly AI Universal - real-time dictation with excellent accuracy. Multilingual optimized version.",
    provider_id: "assembly_ai",
    model_id: "universal",
    accuracy: 4,
    speed: 4,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_bring_your_own_key: true,
    is_Speaker_Diarization: true,
    tags: ["Most Accurate"],
    supports_punctuation: true,
    supports_captions: false,
  },
  {
    id: "groq-whisper-v3-turbo",
    name: "Online Groq Whisper Large V3 Turbo",
    description: "Powered by Groq Whisper v3 Turbo - high-quality transcription with fast cloud processing. Handles challenging phrases well.",
    provider_id: "groq",
    model_id: "whisper-large-v3-turbo",
    accuracy: 4,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_bring_your_own_key: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  {
    id: "groq-whisper-large-v3",
    name: "Online Groq Whisper Large V3",
    description: "Powered by Groq Whisper Large V3 - high accuracy transcription for multilingual audio.",
    provider_id: "groq",
    model_id: "whisper-large-v3",
    accuracy: 5,
    speed: 4,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_bring_your_own_key: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  {
    id: "elevenlabs-scribe",
    name: "Online ElevenLabs Scribe V1",
    description: "Powered by ElevenLabs Scribe - high-quality transcription with advanced speech recognition and multilingual support.",
    provider_id: "elevenlab",
    model_id: "scribe_v1",
    accuracy: 5,
    speed: 3,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_bring_your_own_key: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
  // Microsoft Azure (API Key required)
  {
    id: "azure",
    name: "Microsoft Azure",
    description: "Microsoft Speech-to-Text Provider that allows you to use Microsoft Azure's online Speech-to-Text service.",
    provider_id: "azure",
    model_id: "azure",
    accuracy: 4,
    speed: 5,
    language: "multilingual",
    is_realtime: false,
    is_online: true,
    is_bring_your_own_key: true,
    tags: [],
    supports_punctuation: false,
    supports_captions: false,
  },
];

// Helper function to filter models
export function filterSpeechToTextModels(filter: SpeechToTextModelFilter): SpeechToTextModel[] {
  return speechToTextModels.filter((model) => {
    // Filter by online/local
    if (filter.is_online !== undefined && model.is_online !== filter.is_online) {
      return false;
    }
    if (filter.is_local !== undefined && model.is_online === filter.is_local) {
      return false;
    }

    // Filter by realtime
    if (filter.is_realtime !== undefined && model.is_realtime !== filter.is_realtime) {
      return false;
    }

    // Filter by Enconvo Cloud
    if (filter.is_enconvo_cloud !== undefined && model.is_enconvo_cloud !== filter.is_enconvo_cloud) {
      return false;
    }

    // Filter by Bring Your Own Key
    if (filter.is_bring_your_own_key !== undefined && model.is_bring_your_own_key !== filter.is_bring_your_own_key) {
      return false;
    }

    // Filter by Speaker Diarization
    if (filter.is_Speaker_Diarization !== undefined && model.is_Speaker_Diarization !== filter.is_Speaker_Diarization) {
      return false;
    }

    // Filter by language
    if (filter.language !== undefined && model.language !== filter.language) {
      return false;
    }

    // Filter by punctuation support
    if (filter.supports_punctuation !== undefined && model.supports_punctuation !== filter.supports_punctuation) {
      return false;
    }

    // Filter by captions support
    if (filter.supports_captions !== undefined && model.supports_captions !== filter.supports_captions) {
      return false;
    }

    return true;
  });
}

// Get a single model by id
export function getSpeechToTextModelById(id: string): SpeechToTextModel | undefined {
  return speechToTextModels.find((model) => model.id === id);
}
