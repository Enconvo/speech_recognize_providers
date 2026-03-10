import { Commander, CommandManageUtils, environment, Extension, ExtensionManageUtils, RequestOptions } from "@enconvo/api";
import {
  filterSpeechToTextModels,
  SpeechToTextModelFilter,
} from "../data/stt_models.ts";

interface GetSTTModelsRequestOptions extends RequestOptions {
  diarization?: boolean;
  extensionName?: string;
}
export default async function main(req: Request) {
  const body: GetSTTModelsRequestOptions = await req.json();
  // console.log("body", body)
  const extensionName = body.extensionName || "speech_recognize_providers";

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

  // Get filtered models
  const models = filterSpeechToTextModels(filter);

  const speechRecognizeProviders = await ExtensionManageUtils.loadExtensionConfig({ extensionName: extensionName, useAsRunParams: true })
  const commandConfig = await CommandManageUtils.loadCommandConfig({ commandKey: speechRecognizeProviders.defaultCommand, includes: ['modelName'] })
  const modelName = commandConfig.modelName
  const providerId = commandConfig.commandName


  const outputModels = await Promise.all(models.map(async (model) => {
    const icon = Extension.getCommandIconPath(extensionName, model.provider_id)
    model.icon = `enconvo://${icon}`
    if (model.provider_id === "qwen") {
      const isValidResult = await fetch(`${environment.localServerBaseUrl}/mlx_manage/mlx_audio/check_model_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: model.model_id, category: "stt" }),
      })
      const resp = await isValidResult.json()
      model.is_valid = resp.status === "downloaded" || resp.status === "loaded";
      model.model_status = resp.status;
      console.log("check_model_status resp", resp, model.is_valid)
    } else if (model.provider_id === "nvidia_parakeet") {
      const isValidResult = await Commander.send("fluidIsModelValid", {
        model_id: model.model_id,
      })
      model.is_valid = isValidResult.data.is_valid;
      model.model_status = isValidResult.data.status;
    } else if (model.provider_id === "whisperOffline") {
      const isValidResult = await Commander.send("whisperKitIsModelValid", {
        model_id: model.model_id,
      })
      model.is_valid = isValidResult.data.is_valid;
      model.model_status = isValidResult.data.status;
    }
    model.is_default = model.provider_id === providerId && model.model_id === modelName;
    return model
  }));

  if (extensionName === 'speech_recognize_providers') {
    outputModels.sort((a, b) => {
      if (a.id === 'enconvo-gpt-4o-mini-transcribe') return -1;
      if (b.id === 'enconvo-gpt-4o-mini-transcribe') return 1;
      return 0;
    });
  } else if (extensionName === 'transcription_providers') {
    outputModels.sort((a, b) => {
      if (a.id === 'assembly-ai-universal-enconvo-cloud') return -1;
      if (b.id === 'assembly-ai-universal-enconvo-cloud') return 1;
      return 0;
    });
  }


  return Response.json(outputModels);
}
