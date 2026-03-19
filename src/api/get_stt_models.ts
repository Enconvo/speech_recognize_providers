import { Commander, CommandManageUtils, CommandUtil, environment, Extension, ExtensionManageUtils, RequestOptions } from "@enconvo/api";
import { SpeechToTextModel, SpeechToTextModelFilter } from "../data/stt_models.ts";
import fs from "fs";
import path from "path";

/** Get STT models request params */
interface GetSTTModelsRequestOptions extends RequestOptions {
  /** Filter for models that support speaker diarization */
  diarization?: boolean;
  /** Extension name to load models for @default "speech_recognize_providers" */
  extensionName?: string;
}

/**
 * Get available speech-to-text models with filtering and status
 * @param {Request} req - Request object, body is {@link GetSTTModelsRequestOptions}
 * @returns List of STT models with provider icons, validation status, and default selection
 * @private
 */
export default async function main(req: Request) {
  const body: GetSTTModelsRequestOptions = await req.json();
  const extensionName = body.extensionName || "speech_recognize_providers";

  // Read models from package.json
  const packageJsonPath = path.join(CommandUtil.extensionPath(extensionName), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  // Collect models from modelName preference data in each provider command
  const allModels: SpeechToTextModel[] = [];
  for (const command of packageJson.commands || []) {
    if (command.commandType !== "provider") continue;
    const modelNamePref = (command.preferences || []).find((p: any) => p.name === "modelName");
    if (!modelNamePref?.data) continue;
    for (const item of modelNamePref.data) {
      if (!item.id) continue; // skip entries without STT metadata
      allModels.push({
        id: item.id,
        name: item.title,
        description: item.description || "",
        icon: item.icon,
        provider_id: command.name,
        model_id: item.value,
        accuracy: item.accuracy ?? 0,
        speed: item.speed ?? 0,
        language: item.language || "multilingual",
        is_realtime: item.is_realtime ?? false,
        is_online: item.is_online ?? false,
        is_enconvo_cloud: item.is_enconvo_cloud,
        is_bring_your_own_key: item.is_bring_your_own_key,
        is_Speaker_Diarization: item.is_Speaker_Diarization,
        tags: item.tags || [],
        supports_punctuation: item.supports_punctuation ?? false,
        supports_captions: item.supports_captions ?? false,
        size: item.size,
      });
    }
  }

  // Build filter from request body
  const filter: SpeechToTextModelFilter = {};

  if (body.is_online !== undefined) {
    filter.is_online = body.is_online;
  }

  if (body.is_local !== undefined) {
    filter.is_local = body.is_local;
  }

  if (body.is_realtime !== undefined) {
    filter.is_realtime = body.is_realtime;
  }

  if (body.is_enconvo_cloud !== undefined) {
    filter.is_enconvo_cloud = body.is_enconvo_cloud;
  }

  if (body.is_bring_your_own_key !== undefined) {
    filter.is_bring_your_own_key = body.is_bring_your_own_key;
  }

  if (body.is_Speaker_Diarization !== undefined) {
    filter.is_Speaker_Diarization = body.is_Speaker_Diarization;
  }

  // Support legacy 'diarization' field for backwards compatibility
  if (body.diarization !== undefined) {
    filter.is_Speaker_Diarization = body.diarization;
  }

  if (body.language !== undefined) {
    filter.language = body.language;
  }

  if (body.supports_punctuation !== undefined) {
    filter.supports_punctuation = body.supports_punctuation;
  }

  if (body.supports_captions !== undefined) {
    filter.supports_captions = body.supports_captions;
  }

  // Apply filters
  const models = filterModels(allModels, filter);

  const speechRecognizeProviders = await ExtensionManageUtils.loadExtensionConfig({ extensionName: extensionName, useAsRunParams: true });
  const commandConfig = await CommandManageUtils.loadCommandConfig({ commandKey: speechRecognizeProviders.defaultCommand, includes: ["modelName"] });
  const modelName = commandConfig.modelName;
  const providerId = commandConfig.commandName;

  const outputModels = await Promise.all(
    models.map(async (model) => {
      const icon = Extension.getCommandIconPath(extensionName, model.provider_id);
      model.icon = `enconvo://${icon}`;

      if (model.provider_id === "qwen") {
        const isValidResult = await fetch(`${environment.localServerBaseUrl}/mlx_manage/mlx_audio/check_model_status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model_id: model.model_id, category: "stt" }),
        });
        const resp = await isValidResult.json();
        model.is_valid = resp.status === "downloaded" || resp.status === "loaded";
        model.model_status = resp.status;
      } else if (model.provider_id === "nvidia_parakeet") {
        const isValidResult = await Commander.send("fluidIsModelValid", {
          model_id: model.model_id,
        });
        model.is_valid = isValidResult.data.is_valid;
        model.model_status = isValidResult.data.status;
      } else if (model.provider_id === "whisperOffline") {
        const isValidResult = await Commander.send("whisperKitIsModelValid", {
          model_id: model.model_id,
        });
        model.is_valid = isValidResult.data.is_valid;
        model.model_status = isValidResult.data.status;
      }

      model.is_default = model.provider_id === providerId && model.model_id === modelName;
      return model;
    })
  );

  // Sort
  if (extensionName === "speech_recognize_providers") {
    outputModels.sort((a, b) => {
      if (a.id === "enconvo-gpt-4o-mini-transcribe") return -1;
      if (b.id === "enconvo-gpt-4o-mini-transcribe") return 1;
      return 0;
    });
  } else if (extensionName === "transcription_providers") {
    outputModels.sort((a, b) => {
      if (a.id === "assembly-ai-universal-enconvo-cloud") return -1;
      if (b.id === "assembly-ai-universal-enconvo-cloud") return 1;
      return 0;
    });
  }

  return Response.json(outputModels);
}

function filterModels(models: SpeechToTextModel[], filter: SpeechToTextModelFilter): SpeechToTextModel[] {
  return models.filter((model) => {
    if (filter.is_online !== undefined && model.is_online !== filter.is_online) return false;
    if (filter.is_local !== undefined && model.is_online === filter.is_local) return false;
    if (filter.is_realtime !== undefined && model.is_realtime !== filter.is_realtime) return false;
    if (filter.is_enconvo_cloud !== undefined && model.is_enconvo_cloud !== filter.is_enconvo_cloud) return false;
    if (filter.is_bring_your_own_key !== undefined && model.is_bring_your_own_key !== filter.is_bring_your_own_key) return false;
    if (filter.is_Speaker_Diarization !== undefined && model.is_Speaker_Diarization !== filter.is_Speaker_Diarization) return false;
    if (filter.language !== undefined && model.language !== filter.language) return false;
    if (filter.supports_punctuation !== undefined && model.supports_punctuation !== filter.supports_punctuation) return false;
    if (filter.supports_captions !== undefined && model.supports_captions !== filter.supports_captions) return false;
    return true;
  });
}
