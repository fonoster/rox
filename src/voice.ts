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
import logger, { ulogger, ULogType } from '@fonoster/logger'
import Apps from '@fonoster/apps'
import Secrets from '@fonoster/secrets'
import { VoiceRequest, VoiceResponse, VoiceServer } from '@fonoster/voice'
import { Cerebro } from './cerebro'
import { eventsServer } from './events/server'
import { nanoid } from 'nanoid'
import { VoiceConfig } from './types'
import { getSpanExporters, getMeterProvider } from './telemetry'
import { getIntentsEngine } from './intents/engines'
const { version } = require('../package.json')

export function voice(config: VoiceConfig) {
  logger.info(`rox ai ${version}`)
  const meterProvider = getMeterProvider({
    prometheusPort: config.serverConfig.otlExporterPrometheusPort,
    prometheusEndpoint: config.serverConfig.otlExporterPrometheusEndpoint,
  })
  const meter = meterProvider?.getMeter("rox_metrics")
  const callCounter = meter?.createCounter("call_counter")
  const voiceServer = new VoiceServer({
    otlSpanExporters: getSpanExporters({
      jaegerUrl: config.serverConfig.otlExporterJaegerUrl,
      zipkinUrl: config.serverConfig.otlExporterZipkinUrl,
      gcpEnabled: config.serverConfig.otlExporterGCPEnabled,
      gcpKeyfile: config.serverConfig.googleConfigFile
    })
  })
  voiceServer.use(config.asr)
  voiceServer.use(config.tts)

  if (config.serverConfig.enableEventsServer) eventsServer.start()

  voiceServer.listen(
    async (voiceRequest: VoiceRequest, voiceResponse: VoiceResponse) => {
      logger.verbose('received voice request', voiceRequest)
      ulogger({
        accessKeyId: voiceRequest.accessKeyId,
        eventType: ULogType.APP,
        level: "info",
        message: 'received voice request',
        body: {
          sessionId: voiceRequest.sessionId,
          callerId: voiceRequest.callerId,
          number: voiceRequest.number,
          callerNumber: voiceRequest.number,
          appRef: voiceRequest.appRef,
          dialbackEnpoint: voiceRequest.dialbackEnpoint
        }
      })

      // Sending metrics out to Prometheus
      callCounter?.add(1)

      try {
        if (!voiceRequest.appRef) throw new Error("invalid voice request: missing appRef")
        // If set, we overwrite the configuration with the values obtain from the webhook
        const serviceCredentials = {
          accessKeyId: voiceRequest.accessKeyId,
          accessKeySecret: voiceRequest.sessionToken
        }
        const apps = new Apps(serviceCredentials)
        const secrets = new Secrets(serviceCredentials)
        const app = await apps.getApp(voiceRequest.appRef)
        // TODO: We also need to obtain and the secrets for the Speech API.
        const ieSecret = await secrets.getSecret(app.intentsEngineConfig.secretName)
        const intentsEngine =
          getIntentsEngine(app)(JSON.parse(ieSecret.secret))
        intentsEngine?.setProjectId(app.intentsEngineConfig.projectId)

        const voiceConfig = {
          name: app.speechConfig.voice,
          playbackId: nanoid()
        }

        await voiceResponse.answer()

        if (app.initialDtmf)
          await voiceResponse.dtmf({ dtmf: app.initialDtmf })

        if (app.intentsEngineConfig.welcomeIntentId && intentsEngine.findIntentWithEvent) {
          const response = await intentsEngine.findIntentWithEvent(
            app.intentsEngineConfig.welcomeIntentId,
            {
              telephony: {
                caller_id: voiceRequest.callerNumber
              }
            }
          )
          if (response.effects.length > 0) {
            await voiceResponse.say(response.effects[0].parameters['response'] as string, voiceConfig)
          } else {
            logger.warn('no effects found for welcome intent; please add the effect in your backend', { trigger: app.intentsEngineConfig.welcomeIntentId })
            ulogger({
              accessKeyId: voiceRequest.accessKeyId,
              eventType: ULogType.APP,
              level: "warn",
              message: 'no effects found for welcome intent; please add the effect at your intents engine (e.g Dialogflow)',
              body: { trigger: app.intentsEngineConfig.welcomeIntentId }
            })
          }
        }

        const eventsClient = app.enableEvents
          ? eventsServer.getConnection(voiceRequest.callerNumber)
          : null

        const cerebro = new Cerebro({
          voiceRequest,
          voiceResponse,
          eventsClient,
          voiceConfig,
          intentsEngine,
          activationIntentId: app.activationIntentId,
          activationTimeout: app.activationTimeout,
          transfer: app.transferConfig
        })

        // Open for bussiness
        await cerebro.wake()
      } catch (e) {
        ulogger({
          accessKeyId: voiceRequest.accessKeyId,
          eventType: ULogType.APP,
          level: "error",
          message: (e as Error).message
        })
      }
    }
  )
}
