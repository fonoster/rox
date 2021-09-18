#!/usr/bin/env node
import logger from '@fonos/logger'
import { VoiceRequest, VoiceResponse, VoiceServer } from '@fonos/voice'

import { CerebroStatus } from './@types/cerebro'
import { Intent } from './@types/intents'
import { Cerebro } from './cerebro'
import { ACTIONS_FILE, asr, GOOGLE_CONFIG_FILE, PLAYBACK_ID, ROXANNE_CONFIG_FILE, tts } from './config'
import { EffectsManager } from './effects'
import { eventsServer } from './events/server'

const roxanneConfig = require(ROXANNE_CONFIG_FILE)
const actions = require(ACTIONS_FILE)

const voiceServer = new VoiceServer()
voiceServer.use(asr)
voiceServer.use(tts)

voiceServer.listen(
  async (voiceRequest: VoiceRequest, voiceResponse: VoiceResponse) => {
    logger.verbose('request:' + JSON.stringify(voiceRequest, null, ' '))

    const client = eventsServer.getConnection(voiceRequest.callerNumber)
    const effects = new EffectsManager({
      events: null,
      voice: voiceResponse,
      voiceConfig: {
        playbackId: PLAYBACK_ID,
        ssmlGender: 'FEMALE',
        name: 'en-US-Wavenet-H',
      },
      actions
    });

    if (!client) {
      logger.error(
        `@rox no events connection found for ${voiceRequest.callerNumber} [aborting]`
      )
      return
    }

    //client.send({event: 'ANSWERED'})

    const cerebro = new Cerebro({
      keyFilename: GOOGLE_CONFIG_FILE,
      projectId: roxanneConfig.projectId,
      voiceRequest,
      voiceResponse,
      playbackId: PLAYBACK_ID,
      acceptableConfidence: 0.5,
    })

    // Open for bussiness
    await cerebro.wake()

    cerebro.on('intent', async (intent: Intent) => {
      console.log("intent:", intent)
      await effects.invokeEffects(intent.action)
      cerebro.resetActiveTimer()
    })

    // 'Hey rox! activates the bot'
    cerebro.on('status_change', (status: CerebroStatus) => {
      status === CerebroStatus.AWAKE_ACTIVE
        ? client.send({event: 'TALKING'})
        : client.send({event: 'TALKING_FINISHED'})
    })

    cerebro.on('error', (error: Error) => {
      logger.error(error)
    })
  }
)
