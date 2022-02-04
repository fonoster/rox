/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/rox
 *
 * This file is part of Rox AI
 *
 * Licensed under the MIT License (the "License")
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { VoiceRequest } from '@fonoster/voice'
import dotenv from 'dotenv'
import path from 'path'
import fetch from 'node-fetch'
import { InitEndpoint, ProjectConfig, RoxConfig } from './@types/rox'

export function getConfigFromEnv(): RoxConfig {
  // Load parameters from the environment
  dotenv.config()

  const activationTimeout = process.env.ACTIVATION_TIMEOUT
    ? parseInt(process.env.ACTIVATION_TIMEOUT)
    : 15000

  const interactionTimeout = process.env.INTERACTION_TIMEOUT
    ? parseInt(process.env.INTERACTION_TIMEOUT)
    : -1

  const otlExporterPrometheusPort = process.env.OTL_EXPORTER_PROMETHEUS_PORT
    ? parseInt(process.env.OTL_EXPORTER_PROMETHEUS_PORT)
    : 9090

  const otlExporterGCPEnabled = process.env.OTL_EXPORTER_GCP_ENABLED
    ? process.env.OTL_EXPORTER_GCP_ENABLED.toLowerCase() === "true"
    : false

  const enableEvents = process.env.ENABLE_EVENTS
    ? process.env.ENABLE_EVENTS.toLowerCase() === "true"
    : false

  const config = {
    ttsVoice: process.env.TTS_VOICE as string,
    ttsEngine: process.env.TTS_ENGINE as string,
    asrEngine: process.env.ASR_ENGINE as string,
    intentsEngine: process.env.INTENTS_ENGINE as string,
    languageCode: process.env.LANGUAGE_CODE as string,
    googleConfigFile: process.env.GOOGLE_CONFIG_FILE || path.join(require("os").homedir(), ".fonoster", "google.json"),
    intentsEngineProjectId: process.env.INTENTS_ENGINE_PROJECT_ID,
    intentsEngineAgent: process.env.INTENTS_ENGINE_AGENT,
    intentsEngineLocation: process.env.INTENTS_ENGINE_LOCATION,
    intentsEnginePlatform: process.env.INTENTS_ENGINE_PLATFORM,
    initialDtmf: process.env.INITIAL_DTMF,
    welcomeIntentTrigger: process.env.WELCOME_INTENT_TRIGGER,
    activationIntent: process.env.ACTIVATION_INTENT,
    otlExporterJaegerUrl: process.env.OTL_EXPORTER_JAEGER_URL,
    otlExporterZipkinUrl: process.env.OTL_EXPORTER_ZIPKIN_URL,
    otlExporterPrometheusEndpoint: process.env.OTL_EXPORTER_PROMETHEUS_ENDPOINT,
    initEndpoint: process.env.INIT_ENDPOINT,
    initEndpointUsername: process.env.INIT_ENDPOINT_USERNAME,
    initEndpointPassword: process.env.INIT_ENDPOINT_PASSWORD,
    transferMedia: process.env.TRANSFER_MEDIA,
    transferMediaBusy: process.env.TRANSFER_MEDIA_BUSY,
    transferMediaNoAnswer: process.env.TRANSFER_MEDIA_NOANSWER,
    transferMessage: process.env.TRANSFER_MESSAGE,
    transferMessageBusy: process.env.TRANSFER_MESSAGE_BUSY,
    transferMessageNoAnswer: process.env.TRANSFER_MESSAGE_NOANSWER,
    otlExporterPrometheusPort,
    otlExporterGCPEnabled,
    enableEvents,
    activationTimeout,
    interactionTimeout
  }

  return removeEmpty(config) as RoxConfig
}

export function getConfigFromFlags(flags: any): RoxConfig {
  const activationTimeout = flags["activation-timeout"]
    ? flags["activation-timeout"]
    : 15000

  const interactionTimeout = flags["interaction-timeout"]
    ? flags["interaction-timeout"]
    : -1

  const config: RoxConfig = {
    ttsVoice: flags["tts-voice"],
    ttsEngine: flags["tts-engine"] || void (1),
    asrEngine: flags["asr-engine"],
    intentsEngine: flags["intents-engine"],
    languageCode: flags["language-code"],
    googleConfigFile: flags["google-config-file"],
    intentsEngineProjectId: flags["intents-engine-project-id"],
    intentsEngineAgent: flags["intents-engine-agent"],
    intentsEngineLocation: flags["intents-engine-location"],
    intentsEnginePlatform: flags["intents-engine-platform"],
    initialDtmf: flags["initial-dtmf"],
    welcomeIntentTrigger: flags["welcome-intent-trigger"],
    activationIntent: flags["activation-intent"],
    enableEvents: flags["enable-events"],
    otlExporterJaegerUrl: flags["otl-exporter-jaeger-url"],
    otlExporterZipkinUrl: flags["otl-exporter-zipkin-url"],
    otlExporterPrometheusEndpoint: flags["otl-exporter-promethus-endpoint"],
    otlExporterPrometheusPort: flags["otl-exporter-promethus-port"],
    otlExporterGCPEnabled: flags["otl-exporter-gcp-enabled"],
    initEndpoint: flags["init-webhook"],
    initEndpointUsername: flags["init-webhook-username"],
    initEndpointPassword: flags["init-webhook-password"],
    transferMedia: flags["transfer-media"],
    transferMediaBusy: flags["transfer-media-busy"],
    transferMediaNoAnswer: flags["transfer-media-noanswer"],
    transferMessage: flags["transfer-message"],
    transferMessageBusy: flags["transfer-message-busy"],
    transferMessageNoAnswer: flags["transfer-message-noanswer"],
    activationTimeout,
    interactionTimeout
  }

  return removeEmpty(config) as RoxConfig
}

const removeEmpty = (obj) => {
  let newObj = {}
  Object.keys(obj).forEach((key) => {
    if (obj[key] === Object(obj[key])) newObj[key] = removeEmpty(obj[key])
    else if (obj[key] !== undefined && obj[key] !== -1) newObj[key] = obj[key]
  })
  return newObj
}

const optionsToQueryString = (obj: any): string =>
  Object.keys(obj)
    .map((key: string) => `${key}=${obj[key].toString()}`)
    .join("&")

export async function getProjectConfig(voiceRequest: VoiceRequest, config: InitEndpoint): Promise<ProjectConfig> {
  const params = {
    accessKeyId: voiceRequest.accessKeyId,
    number: voiceRequest.number,
    callerNumber: voiceRequest.callerNumber,
    sessionId: voiceRequest.sessionId
  }
  const fConfig = {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
  }
  if (config.username) {
    fConfig.headers['Authorization'] = Buffer.from(config.username + ':' + config.password).toString('base64')
  }

  const result = await fetch(`${config.endpoint}?` + optionsToQueryString(params),
    fConfig)
  return result.json()
}