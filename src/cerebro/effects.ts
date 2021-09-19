/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/rox
 *
 * This file is part of Rox
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
import { VoiceResponse } from '@fonos/voice'
import { CerebroStatus, Effect, EffectsManagerConfig } from '../@types/cerebro'
import { Intent } from '../@types/intents'

export class EffectsManager {
  voice: VoiceResponse
  eventsClient: any
  voiceConfig: any
  playbackId: string
  constructor(config: EffectsManagerConfig) {
    this.voice = config.voice
    this.eventsClient = config.eventsClient
    this.voiceConfig = config.voiceConfig
    this.playbackId = config.playbackId
  }

  async invokeEffects(intent: Intent,
     status: CerebroStatus, activateCallback: Function) {
    if (process.env.ACTIVATION_INTENT === intent.ref) {
      activateCallback()
      return;
    } else if (process.env.ACTIVATION_INTENT && status != CerebroStatus.AWAKE_ACTIVE) {
      // If we have activation intent cerebro needs and active status
      // before we can have any effects
      return
    }

    for (let e of intent.effects) {
      await this.run(e)
    }
  }

  async run(effect: Effect) {
    switch (effect.type) {
      case 'say':
        await this.voice.say(effect.parameters['response'] as string, this.voiceConfig)
        break
      case 'hangup':
        await this.voice.hangup()
        break
      case 'send_link':
        await this.eventsClient.send(effect.parameters as any)
        break
      default:
        throw new Error(`received unknown effect ${effect.type}`)
    }
  }
}
