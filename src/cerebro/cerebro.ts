/* eslint-disable no-empty */
import logger from '@fonos/logger'
import {
  PlaybackControl,
  SGatherStream,
  VoiceRequest,
  VoiceResponse,
} from '@fonos/voice'
import Events from 'events'
import Stream from 'stream'

import { CerebroConfig, CerebroStatus } from '../@types/cerebro'
import IntentsAPI from '../intents/dialogflow'

export class Cerebro extends Events {
  voiceResponse: VoiceResponse
  cerebroEvents: Events
  voiceRequest: VoiceRequest
  status: CerebroStatus
  activeTimeout: number
  // eslint-disable-next-line no-undef
  activeTimer: NodeJS.Timer
  dialogflow: IntentsAPI
  stream: SGatherStream
  config: CerebroConfig
  lastIntent: any
  constructor(config: CerebroConfig) {
    super()
    this.voiceResponse = config.voiceResponse
    this.voiceRequest = config.voiceRequest
    this.cerebroEvents = new Events()
    this.status = CerebroStatus.SLEEP
    this.activeTimeout = config.activeTimeout || 15000
    this.dialogflow = new IntentsAPI({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    })
    this.config = config
  }

  // Subscribe to events
  async wake() {
    await this.voiceResponse.openMediaPipe()
    this.emit('status_change', CerebroStatus.AWAKE_PASSIVE)
    this.status = CerebroStatus.AWAKE_PASSIVE

    const readable = new Stream.Readable({
      // The read logic is omitted since the data is pushed to the socket
      // outside of the script's control. However, the read() function
      // must be defined.
      read() {},
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
        const intent = await this.dialogflow.findIntent(data.transcript)
        if (!intent) {
          logger.verbose(
            `@rox/cerebro no intent found for: '${data.transcript}'`
          )
          return
        }

        logger.verbose(
          `@rox/cerebro intent [action: ${intent.action}, confidence: ${intent.confidence}}]`
        )

        if (this.lastIntent 
          && intent.action === this.lastIntent.action
          && intent.confidence === this.lastIntent.confidence) {
          logger.verbose('@rox/cerebro ingoring duplicate intent')
          this.lastIntent = null
          return
        }

        if (intent.confidence < this.config.acceptableConfidence) {
          logger.verbose(
            '@rox/cerebro confidence below threshold [ignoring intent]'
          )
          return
        }

        if (
          intent.action === 'activate.bot' &&
          this.getStatus() === CerebroStatus.AWAKE_ACTIVE
        ) {
          await this.stopPlayback()
          this.startActiveTimer()
        } else if (intent.action === 'activate.bot') {
          await this.stopPlayback()
          this.emit('status_change', CerebroStatus.AWAKE_ACTIVE)
          this.startActiveTimer()
        } else if (this.getStatus() === CerebroStatus.AWAKE_ACTIVE) {
          this.emit('intent', intent)
          this.resetActiveTimer()
        }

        // Need to save this to avoid duplicate intents
        this.lastIntent = intent
      }
    })
  }

  // Unsubscribe from events
  async sleep() {
    await this.voiceResponse.closeMediaPipe()
    this.stream.close()
  }

  getStatus(): CerebroStatus {
    return this.status
  }

  startActiveTimer(): void {
    this.status = CerebroStatus.AWAKE_ACTIVE
    this.activeTimer = setTimeout(() => {
      this.emit('status_change', CerebroStatus.AWAKE_PASSIVE)
      this.status = CerebroStatus.AWAKE_PASSIVE
    }, this.activeTimeout)
  }

  resetActiveTimer(): void {
    clearTimeout(this.activeTimer)
    this.startActiveTimer()
  }

  async stopPlayback() {
    if (this.config.playbackId) {
      const playbackControl: PlaybackControl = this.voiceResponse.playback(
        this.config.playbackId
      )
      try {
        logger.verbose(
          `@rox pausing playback [playbackID = ${this.config.playbackId}]`
        )
        await playbackControl.pause()
      } catch (e) {}
    }
  }
}
