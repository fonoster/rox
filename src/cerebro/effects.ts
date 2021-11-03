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
import logger from '@fonoster/logger'
import { VoiceResponse } from '@fonoster/voice'
import { CerebroStatus, Effect, EffectsManagerConfig } from '../@types/cerebro'
import { Intent } from '../@types/intents'

export class EffectsManager {
  voice: VoiceResponse
  config: EffectsManagerConfig
  constructor(config: EffectsManagerConfig) {
    this.voice = config.voice
    this.config = config
  }

  async invokeEffects(intent: Intent,
    status: CerebroStatus, activateCallback: Function) {
    activateCallback()
    if (this.config.activationIntent === intent.ref) {
      logger.verbose("@rox/cerebro/effects fired activation intent")
      return;
    } else if (this.config.activationIntent
      && status != CerebroStatus.AWAKE_ACTIVE) {
      logger.verbose("@rox/cerebro/effects got an intent but cerebro is not awake")
      // If we have activation intent cerebro needs and active status
      // before we can have any effects
      return
    }

    for (let e of intent.effects) {
      logger.verbose(`@rox/cerebro/effects running effect [type = ${e.type}]`)
      await this.run(e)
    }
  }

  async run(effect: Effect) {
    switch (effect.type) {
      case 'say':
        await this.voice.say(effect.parameters['response'] as string, this.config.voiceConfig)
        break
      case 'hangup':
        await this.voice.hangup()
        break
      case 'transfer':
        // TODO: Add record effect
        await this.voice.dial(effect.parameters['destination'] as string)
        break
      case 'send_data':
        // Only send if client support events
        if (this.config.eventsClient) {
          this.config.eventsClient.send(effect.parameters as any)
        }
        break
      default:
        throw new Error(`@rox/cerebro/effects received unknown effect ${effect.type}`)
    }
  }
}
