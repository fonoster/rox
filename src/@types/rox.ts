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
import GoogleASR from "@fonoster/googleasr"
import GoogleTTS from "@fonoster/googletts"
import { Intents } from "./intents"

export interface RoxConfig {
  ttsVoice: string
  ttsEngine: string
  asrEngine: string
  intentsEngine: string
  languageCode: string
  googleConfigFile: string
  intentsEngineProjectId: string
  intentsEngineAgent?: string
  intentsEngineLocation?: string
  intentsEnginePlatform: string
  initialDtmf?: string
  welcomeIntentTrigger?: string
  enableEvents?: boolean
  activationTimeout?: number
  activationIntent?: string
  interactionTimeout?: number
  otlExporterJaegerUrl?: string
  otlExporterZipkinUrl?: string
  otlExporterPrometheusEndpoint?: string
  otlExporterPrometheusPort?: number
  otlExporterGCPEnabled: boolean
  initEndpoint?: string
  initEndpointUsername?: string
  initEndpointPassword?: string
  transferMedia?: string
  transferMediaNoAnswer?: string
  transferMediaBusy?: string
  transferMessage?: string
  transferMessageNoAnswer?: string
  transferMessageBusy?: string
}

export interface VoiceConfig {
  roxConfig: RoxConfig
  asr: GoogleASR
  tts: GoogleTTS
  intents: Intents
  initEndpoint?: string
  initEndpointUsername?: string
  initEndpointPassword?: string
}

export interface InitEndpoint {
  endpoint: string
  username?: string
  password?: string
}

export interface ProjectConfig {
  intentsEngineProjectId: string
  ttsVoice?: string
  languageCode?: string
  intentsEngineAgent?: string
  intentsEngineLocation?: string
  intentsEnginePlatform?: string
  initialDtmf?: string
  welcomeIntentTrigger?: string
  enableEvents?: boolean
  activationTimeout?: number
  activationIntent?: string
  interactionTimeout?: number
  transferMedia?: string
  transferMediaNoAnswer?: string
  transferMediaBusy?: string
  transferMessage?: string
  transferMessageNoAnswer?: string
  transferMessageBusy?: string
}