---
name: speech_recognize_providers
description: Speech-to-Text Providers
metadata:
  author: EnconvoAI
  version: "0.0.226"
---

## API Reference

Just use the `local_api` tool to request these APIs.

To view full parameter details for a specific endpoint, run: `node skills/scripts/api_detail.cjs <endpoint-path>`

| Endpoint | Description |
|----------|-------------|
| `speech_recognize_providers/openai_enconvo` | Speech-to-Text Provider that allows you to use [Groq](https://console.groq.com/docs/speech-text)'s online Speech-to-Text service |
| `speech_recognize_providers/mistral_enconvo` | Speech-to-Text Provider that allows you to use [Groq](https://console.groq.com/docs/speech-text)'s online Speech-to-Text service |
| `speech_recognize_providers/enconvo_cloud_plan` | Speech-to-Text Provider that allows you to use [Groq](https://console.groq.com/docs/speech-text)'s online Speech-to-Text service |
| `speech_recognize_providers/gemini_enconvo` | Speech-to-Text Provider powered by Google Gemini via Enconvo Cloud Plan |
| `speech_recognize_providers/enconvo` | Enconvo Speech-to-Text Provider that allows you to use high speed online Speech-to-Text service |
| `speech_recognize_providers/nvidia_parakeet` | NVIDIA's 600M-parameter multilingual ASR model supporting 25 European languages with automatic language detection, punctuation, capitalization, and word-level timestamps |
| `speech_recognize_providers/qwen` | Alibaba's multilingual ASR powered by Qwen3-ASR, supporting language identification and speech recognition for 30 languages and 22 Chinese dialects, with state-of-the-art accuracy among open-source ASR models |
| `speech_recognize_providers/azure` | Microsoft Speech-to-Text Provider that allows you to use Microsoft Azure's online Speech-to-Text service |
| `speech_recognize_providers/assembly_ai_enconvo` | Assembly AI Speech-to-Text Provider that allows you to use Assembly AI's online Speech-to-Text service |
| `speech_recognize_providers/assembly_ai` | Assembly AI Speech-to-Text Provider that allows you to use Assembly AI's online Speech-to-Text service |
| `speech_recognize_providers/deepgram` | Deepgram Speech-to-Text Provider that allows you to use Deepgram's online Speech-to-Text service |
| `speech_recognize_providers/groq` | Groq Speech-to-Text Provider that allows you to use [Groq](https://console.groq.com/docs/speech-text)'s online Speech-to-Text service |
| `speech_recognize_providers/elevenlab` | ElevenLabs Speech-to-Text Provider that allows you to use [ElevenLabs](https://elevenlabs.io/)'s online Speech-to-Text service |
| `speech_recognize_providers/whisperOffline` | Local Whisper Speech-to-Text Provider that runs on your local machine |
| `speech_recognize_providers/gemini` | Google Gemini Speech-to-Text Provider that uses Gemini's multimodal audio understanding for transcription, supporting up to 9.5 hours of audio |
| `speech_recognize_providers/azure_voices` | get azure_voices list |
| `speech_recognize_providers/whisper_languages` | get whisper_languages list |
| `speech_recognize_providers/azure_speech_regions` | get azure_speech_regions list |
| `speech_recognize_providers/youdao_languages` | get youdao_languages list |
| `speech_recognize_providers/deepgram_languages` | get deepgram_languages list |
| `speech_recognize_providers/assemblyai_languages` | get assemblyai_languages list |
| `speech_recognize_providers/deepgram_models` | get deepgram_models list |
| `speech_recognize_providers/parakeet_models` | get parakeet_models list |
| `speech_recognize_providers/download_nvidia_parakeet_model` |  |
| `speech_recognize_providers/download_whisper_model` |  |
| `speech_recognize_providers/get_stt_models` |  |
