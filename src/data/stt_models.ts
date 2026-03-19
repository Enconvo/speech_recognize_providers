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
  model_status?: string;
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
