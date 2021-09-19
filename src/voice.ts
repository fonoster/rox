#!/usr/bin/env node
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
import logger from '@fonos/logger'
import { VoiceRequest, VoiceResponse, VoiceServer } from '@fonos/voice'
import { Cerebro } from './cerebro'
import { asr, tts } from './config'
import { eventsServer } from './events/server'
import IntentsAPI from './intents/dialogflow'
import { nanoid } from 'nanoid'

const voiceServer = new VoiceServer()
voiceServer.use(asr)
voiceServer.use(tts)

voiceServer.listen(
  async (voiceRequest: VoiceRequest, voiceResponse: VoiceResponse) => {
    logger.verbose('request:' + JSON.stringify(voiceRequest, null, ' '))

    // Get welcome intent
    
    const eventsClient = eventsServer.getConnection(voiceRequest.callerNumber)

    if (!eventsClient) {
      logger.error(
        `@rox no events connection found for ${voiceRequest.callerNumber} [aborting]`
      )
      return
    }

    const intents = new IntentsAPI({
      projectId: "",
      keyFilename: ""
    })

    const cerebro = new Cerebro({
      voiceRequest,
      voiceResponse,
      playbackId: nanoid(),
      intents,
      eventsClient,
      voiceConfig: {}
    })

    // Open for bussiness
    await cerebro.wake()
  }
)
