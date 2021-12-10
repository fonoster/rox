#!/usr/bin/env node
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
import { VoiceRequest, VoiceResponse, VoiceServer } from '@fonoster/voice'
import { Cerebro } from './cerebro'
import { eventsServer } from './events/server'
import { nanoid } from 'nanoid'
import { VoiceConfig } from './@types/rox'
import { getSpanExporters, getMeterProvider } from './telemetry'
const { version } = require('../package.json')

export function voice(config: VoiceConfig) {
  logger.info(`rox ai ${version}`)

  const otlSpanExporters = getSpanExporters({
    jaegerUrl: config.roxConfig.otlExporterJaegerUrl,
    zipkinUrl: config.roxConfig.otlExporterZipkinUrl,
    gcpEnabled: config.roxConfig.otlExporterGCPEnabled,
    gcpKeyfile: config.roxConfig.googleConfigFile
  })

  const voiceServer = new VoiceServer({
    otlSpanExporters
  })

  voiceServer.use(config.asr)
  voiceServer.use(config.tts)

  if (config.roxConfig.enableEvents) {
    eventsServer.start()
  }

  const meterProvider = getMeterProvider({
    prometheusPort: config.roxConfig.otlExporterPrometheusPort,
    prometheusEndpoint: config.roxConfig.otlExporterPrometheusEndpoint,
  })

  const meter = meterProvider?.getMeter("rox_metrics")
  const callCounter = meter?.createCounter("call_counter")

  voiceServer.listen(
    async (voiceRequest: VoiceRequest, voiceResponse: VoiceResponse) => {
      try {
        logger.verbose('request:' + JSON.stringify(voiceRequest, null, ' '))
        callCounter?.add(1)

        await voiceResponse.answer()

        const playbackId = nanoid()
        const voiceConfig = {
          name: config.roxConfig.ttsVoice,
          playbackId
        }

        if (config.roxConfig.initialDtmf) {
          await voiceResponse.dtmf({ dtmf: config.roxConfig.initialDtmf })
        }

        if (config.roxConfig.welcomeIntentTrigger) {
          const response = await config.intents.findIntent(
            config.roxConfig.welcomeIntentTrigger,
            {
              telephony: {
                caller_id: voiceRequest.callerNumber
              }
            }
          )
          await voiceResponse.say(response.effects[0].parameters['response'] as string, voiceConfig)
        }

        const eventsClient = config.roxConfig.enableEvents
          ? eventsServer.getConnection(voiceRequest.callerNumber)
          : null

        const cerebro = new Cerebro({
          voiceRequest,
          voiceResponse,
          playbackId,
          intents: config.intents,
          eventsClient,
          voiceConfig,
          activationIntent: config.roxConfig.activationIntent,
          activationTimeout: config.roxConfig.activationTimeout,
        })

        // Open for bussiness
        await cerebro.wake()
      } catch (e) {
        logger.error('@fonoster/rox unexpected error')
      }
    }
  )
}
