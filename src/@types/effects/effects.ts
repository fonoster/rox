import { VoiceResponse } from '@fonos/voice'

import { EventEmitter } from '../events'

export interface Action {
  action: string
  effects: Array<Effect>
}

export interface EffectsRequest {
  events: EventEmitter
  voice: VoiceResponse
  voiceConfig: any
  actions: Array<Action>
}

export interface Effect {
  type: 'say'
  | 'play'
  | 'show_address'
  | 'hangup'
  | 'record'
  | 'send_data'
  parameters: Record<string, unknown>
}