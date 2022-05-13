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
import logger from '@fonoster/logger'
import Events from 'events'
import { EffectsManager } from './effects'
import { IntentsEngine } from '../intents/types'
import {
  SGatherStream,
  VoiceRequest,
  VoiceResponse,
} from '@fonoster/voice'
import { CerebroConfig, CerebroStatus } from './types'

export class Cerebro {
  voiceResponse: VoiceResponse
  cerebroEvents: Events
  voiceRequest: VoiceRequest
  status: CerebroStatus
  activationTimeout: number
  activeTimer: NodeJS.Timer
  intentsEngine: IntentsEngine
  stream: SGatherStream
  config: CerebroConfig
  lastIntent: any
  effects: EffectsManager
  constructor(config: CerebroConfig) {
    this.voiceResponse = config.voiceResponse
    this.voiceRequest = config.voiceRequest
    this.cerebroEvents = new Events()
    this.status = CerebroStatus.SLEEP
    this.activationTimeout = config.activationTimeout || 15000
    this.intentsEngine = config.intentsEngine
    this.effects = new EffectsManager({
      playbackId: config.voiceConfig.playbackId,
      eventsClient: config.eventsClient,
      voice: config.voiceResponse,
      voiceConfig: config.voiceConfig,
      activationIntentId: config.activationIntentId,
      transfer: config.transfer
    })
    this.config = config
  }

  // Subscribe to events 
  async wake() {
    this.status = CerebroStatus.AWAKE_PASSIVE

    this.voiceResponse.on('error', (error: Error) => {
      this.cerebroEvents.emit('error', error)
    })

    const speechConfig = { source: "speech,dtmf" } as any
    if (this.config.alternativeLanguageCode) {
      speechConfig.model = "command_and_search"
      speechConfig.alternativeLanguageCodes = [this.config.alternativeLanguageCode]
    }

    this.stream = await this.voiceResponse.sgather(speechConfig as any)

    this.stream.on('transcript', async data => {
      if (data.isFinal) {
        const intent = await this.intentsEngine.findIntent(data.transcript,
          {
            telephony: {
              caller_id: this.voiceRequest.callerNumber
            }
          })

        logger.verbose(
          `@rox/cerebro intent [text = '${data.transcript}', ref: ${intent.ref}, confidence: ${intent.confidence}}]`
        )

        await this.effects.invokeEffects(intent,
          this.status,
          async () => {
            await this.stopPlayback()
            if (this.config.activationIntentId) {
              if (this.status === CerebroStatus.AWAKE_ACTIVE) {
                this.resetActiveTimer()
              } else {
                this.startActiveTimer()
              }
            }
          })

        // Need to save this to avoid duplicate intents
        this.lastIntent = intent
      }
    })
  }

  // Unsubscribe from events
  async sleep() {
    logger.verbose('@rox/cerebro is going to sleep')
    await this.voiceResponse.closeMediaPipe()
    this.stream.close()
    this.status = CerebroStatus.SLEEP
  }

  startActiveTimer(): void {
    this.status = CerebroStatus.AWAKE_ACTIVE
    this.activeTimer = setTimeout(() => {
      this.status = CerebroStatus.AWAKE_PASSIVE
      logger.verbose("@rox/cerebro awake [status = passive]")
    }, this.activationTimeout)
    logger.verbose("@rox/cerebro awake [status = active]")
  }

  resetActiveTimer(): void {
    logger.verbose("@rox/cerebro reseting awake status")
    clearTimeout(this.activeTimer)
    this.startActiveTimer()
  }

  async stopPlayback() {
    const { playbackId } = this.config.voiceConfig
    if (playbackId) {
      try {
        const playbackControl = this.voiceResponse.playback(
          playbackId
        )

        logger.verbose(
          `@rox/cerebro stoping playback [playbackId = ${playbackId}]`
        )
        await playbackControl.stop();
      } catch (e) {
        logger.error(`@rox/cerebro e => [${e}]`)
      }
    }
  }
}
