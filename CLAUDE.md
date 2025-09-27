# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Enconvo Extension that provides multiple Speech-to-Text services, allowing you to convert speech to text using various providers. The project follows the Enconvo Extension framework and provides unified interfaces to multiple STT providers.

## Common Development Commands

- **Build**: `npm run build` or `enconvo`
- **Development**: `npm run dev` or `enconvo --dev`
- **Linting**: `npm run lint` (runs eslint)
- **Formatting**: `npm run format` (runs prettier)
- **Type checking**: Use TypeScript compiler directly as no separate typecheck script exists

## Architecture

### Provider Pattern
The codebase follows a provider pattern where each speech-to-text service is implemented as a separate provider class that extends `SpeechToTextProvider` from `@enconvo/api`. All providers follow the same interface:

```typescript
export class ProviderName extends SpeechToTextProvider {
    protected async _audioToText(params: SpeechToTextProvider.AudioToTextParams): Promise<SpeechToTextProvider.SpeechToTextResult>
}
```

### Core Components

1. **Provider Classes** (`src/*.ts`): Individual provider implementations
   - `groq.ts` - Groq Whisper API with chunking and retry logic
   - `azure.ts` - Microsoft Azure Cognitive Services
   - `deepgram.ts` - Deepgram API
   - `assembly_ai.ts` - AssemblyAI service
   - `elevenlab.ts` - ElevenLabs Scribe
   - `parakeet_mlx.ts` - Local MLX-based Parakeet model
   - `whisperOffline.ts` - Local Whisper implementation
   - `enconvo.ts` & `enconvo_cloud_plan.ts` - Enconvo cloud services

2. **Audio Processing Utilities** (`src/audio_util.ts`):
   - Audio format conversion using FFmpeg
   - Audio chunking for large files with overlap handling
   - Transcription result merging with sequence alignment
   - Duration calculation and metadata parsing

3. **Language/Model Data Providers** (`src/*_languages.ts`, `src/*_models.ts`):
   - Dynamic data providers for UI dropdowns
   - Language code mappings for different services
   - Model availability lists

4. **Configuration** (`package.json`):
   - Extensive command definitions with preferences schema
   - Provider-specific configuration options
   - Integration with Enconvo credential system

### Audio Processing Architecture

The audio processing follows a consistent pattern:
1. **Preprocessing**: Convert audio to supported formats (16kHz mono FLAC/WAV)
2. **Chunking**: Split large files into manageable chunks with overlap
3. **Processing**: Send to provider APIs with retry logic
4. **Merging**: Combine overlapped results using sequence alignment

### Error Handling & Retry Logic

- Rate limiting with exponential backoff (Groq implementation in `groq.ts:100-113`)
- Cleanup of temporary files after processing
- Robust audio format handling with fallbacks

### Key Dependencies

- `@enconvo/api` - Core framework integration
- Provider SDKs: `groq-sdk`, `assemblyai`, `elevenlabs`, `@deepgram/sdk`
- Audio processing: `music-metadata`, `ffmpeg` (external binary)
- HTTP clients: `axios`, `form-data`

## Development Guidelines

### Adding New Providers
1. Create new provider class extending `SpeechToTextProvider`
2. Implement `_audioToText` method
3. Add configuration to `package.json` commands array
4. Handle audio preprocessing using utilities from `audio_util.ts`
5. Implement proper error handling and cleanup

### Audio Format Support
- Always use `preprocessAudio()` or `preHandleAudio()` for format conversion
- Support common formats: MP3, WAV, FLAC
- Target 16kHz mono for optimal STT results

### Large File Handling
- Use `splitAudio()` for files exceeding provider limits
- Implement overlap handling for seamless transcription
- Use `mergeTranscriptionResults()` for combining chunks

## Testing

No formal test framework is configured. Test providers manually using the Enconvo interface or create test scripts as needed.