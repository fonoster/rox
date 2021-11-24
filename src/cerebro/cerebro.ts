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
import Stream from 'stream'
import { EffectsManager } from './effects'
import { Intents } from '../@types/intents'
import {
  PlaybackControl,
  SGatherStream,
  VoiceRequest,
  VoiceResponse,
} from '@fonoster/voice'
import {
  CerebroConfig,
  CerebroStatus
} from '../@types/cerebro'

export class Cerebro {
  voiceResponse: VoiceResponse
  cerebroEvents: Events
  voiceRequest: VoiceRequest
  status: CerebroStatus
  activationTimeout: number
  activeTimer: NodeJS.Timer
  intents: Intents
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
    this.intents = config.intents
    this.effects = new EffectsManager({
      playbackId: config.playbackId,
      eventsClient: config.eventsClient,
      voice: config.voiceResponse,
      voiceConfig: config.voiceConfig,
      activationIntent: config.activationIntent
    })
    this.config = config
  }

  // Subscribe to events
  async wake() {
    this.status = CerebroStatus.AWAKE_PASSIVE

    const readable = new Stream.Readable({
      // The read logic is omitted since the data is pushed to the socket
      // outside of the script's control. However, the read() function
      // must be defined.
      read() { },
    })

    this.voiceResponse.on('ReceivingMedia', (data: any) => {
      readable.push(data)
    })

    this.voiceResponse.on('error', (error: Error) => {
      this.cerebroEvents.emit('error', error)
    })

    this.stream = await this.voiceResponse.sgather()

    this.stream.on('transcript', async data => {
      if (data.isFinal) {
        const intent = await this.intents.findIntent(data.transcript)

        logger.verbose(
          `@rox/cerebro intent [text = '${data.transcript}', ref: ${intent.ref}, confidence: ${intent.confidence}}]`
        )

        await this.effects.invokeEffects(intent,
          this.status,
          async () => {
            await this.stopPlayback()
            if (this.config.activationIntent) {
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
    if (this.config.playbackId) {
      try {
        const playbackControl: PlaybackControl = this.voiceResponse.playback(
          this.config.playbackId
        )

        logger.verbose(
          `@rox/cerebro stoping playback [playbackId = ${this.config.playbackId}]`
        )
        await playbackControl.stop();
      } catch (e) { 
         logger.error(`@rox/cerebro e => [${e}]`)
      }
    }
  }
}
