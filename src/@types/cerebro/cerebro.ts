import { VoiceResponse } from '@fonos/voice'
import { VoiceRequest } from '@fonos/voice/dist/types'

export interface CerebroConfig {
  voiceRequest: VoiceRequest
  voiceResponse: VoiceResponse
  maxUnknownIntents?: number
  activeTimeout?: number
  keyFilename: string
  playbackId?: string
  projectId: string
  acceptableConfidence: number
}

export enum CerebroStatus {
  SLEEP,
  AWAKE_ACTIVE,
  AWAKE_PASSIVE,
}
