/*
 * Copyright (C) 2023 by Fonoster Inc (https://fonoster.com)
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
import { PlaybackControl, VoiceResponse } from "@fonoster/voice"
import { Intent } from "../intents/types"
import { nanoid } from "nanoid"
import {
  playBusyAndHangup,
  playNoAnswerAndHangup,
  playTransfering
} from "./helper"
import { EffectsManagerConfig, CerebroStatus, Effect } from "./types"
import { sendClientEvent } from "../util"
import { CLIENT_EVENTS } from "../events/types"
import logger from "@fonoster/logger"

export class EffectsManager {
  voice: VoiceResponse
  config: EffectsManagerConfig
  constructor(config: EffectsManagerConfig) {
    this.voice = config.voice
    this.config = config
  }

  async invokeEffects(
    intent: Intent,
    status: CerebroStatus,
    activateCallback: Function
  ) {
    activateCallback()
    if (this.config.activationIntentId === intent.ref) {
      logger.verbose("fired activation intent")
      return
    } else if (
      this.config.activationIntentId &&
      status != CerebroStatus.AWAKE_ACTIVE
    ) {
      logger.verbose("received an intent but cerebro is not awake")
      // If we have activation intent cerebro needs and active status
      // before we can have any effects
      return
    }

    for (const e of intent.effects) {
      logger.verbose("effects running effect", { type: e.type })
      await this.run(e)
    }
  }

  async run(effect: Effect) {
    switch (effect.type) {
      case "say":
        await this.voice.say(
          effect.parameters["response"] as string,
          this.config.voiceConfig
        )
        break
      case "hangup":
        await this.voice.hangup()

        sendClientEvent(this.config.eventsClient, {
          eventName: CLIENT_EVENTS.HANGUP
        })

        break
      case "transfer":
        // TODO: Add record effect
        await this.transferEffect(this.voice, effect)
        break
      case "send_data":
        // Only send if client support events
        sendClientEvent(this.config.eventsClient, {
          eventName: CLIENT_EVENTS.RECOGNIZING_FINISHED
        })
        sendClientEvent(this.config.eventsClient, {
          eventName: CLIENT_EVENTS.INTENT,
          intent: effect.parameters as any
        })

        break
      default:
        throw new Error(`effects received unknown effect ${effect.type}`)
    }
  }

  async transferEffect(voice: VoiceResponse, effect: Effect) {
    await this.voice.closeMediaPipe()
    const stream = await this.voice.dial(
      effect.parameters["destination"] as string
    )
    const playbackId: string = nanoid()
    const control: PlaybackControl = this.voice.playback(playbackId)

    let stay = true
    const moveForward = async () => {
      stay = false
      await control.stop()
    }

    stream.on("answer", () => {
      moveForward()
    })

    stream.on("busy", async () => {
      await moveForward()
      await playBusyAndHangup(this.voice, playbackId, this.config)
    })

    stream.on("noanswer", async () => {
      await moveForward()
      await playNoAnswerAndHangup(this.voice, playbackId, this.config)
    })

    while (stay) {
      await playTransfering(this.voice, playbackId, this.config)
    }
  }
}
