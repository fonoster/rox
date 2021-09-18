import { VoiceResponse } from '@fonos/voice'
import { Action, Effect, EffectsRequest } from '../@types/effects'

function randomResponse(responses: Array<string>): string {
  if (responses.length === 1) return responses[0]
  return responses[Math.floor(Math.random() * responses.length)]
}

export class EffectsManager {
  voice: VoiceResponse
  emitter: any
  voiceConfig: any
  actions: Array<Action>
  constructor(request: EffectsRequest) {
    this.voice = request.voice
    this.emitter = request.events
    this.voiceConfig = request.voiceConfig
    this.actions = request.actions
  }

  async invokeEffects(actionId: string) {
    const effects = this.getEffects(actionId);
    for (let e of effects) {
      await this.run(e)
    }
  }

  async run(effect: Effect) {
    switch (effect.type) {
      case 'say':
        await this.voice.say(randomResponse(effect.parameters['responses'] as Array<string>), this.voiceConfig)
        break
      case 'play':
        await this.voice.play(effect.parameters['sound'] as string, this.voiceConfig)
        break
      case 'record':
        await this.voice.record(effect.parameters['options'] as any)
        break
      case 'hangup':
        await this.voice.hangup()
        break
      case 'send_data':
        await this.emitter.send(effect.parameters as any)
        break
      default:
        throw new Error(`received unknown effect ${effect.type}`)
    }
  }

  getEffects(actionId: string): Effect[] {
    const action = this.actions.filter(current => current.action === actionId)[0]
    if (!action || action.effects.length === 0) throw new Error(`found no effects for actionId: ${actionId}`);
    return action.effects;
  }
}

