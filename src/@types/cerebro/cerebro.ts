/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/rox
 *
 * This file is part of Rox AI
 *
 * Licensed under the MIT License (the "License");
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
import { VoiceResponse } from '@fonoster/voice'
import { VoiceRequest } from '@fonoster/voice/dist/types'
import { EventsClient } from '../../events/emitter'
import { Intents } from '../intents'

export interface CerebroConfig {
  voiceRequest: VoiceRequest
  voiceResponse: VoiceResponse
  maxUnknownIntents?: number
  activationTimeout?: number
  interactionTimeout?: number
  intents: Intents
  playbackId: string
  voiceConfig: any
  eventsClient: EventsClient | null
  activationIntent?: string
  transferMedia?: string
  transferMediaBusy?: string
  transferMediaNoAnswer?: string
  transferMessage?: string
  transferMessageNoAnswer?: string
  transferMessageBusy?: string
}

export enum CerebroStatus {
  SLEEP,
  AWAKE_ACTIVE,
  AWAKE_PASSIVE
}
