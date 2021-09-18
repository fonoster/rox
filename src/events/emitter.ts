import { EventEmitter } from '../@types/events'
import WebSocket = require('ws')

export class EventEmitterImpl implements EventEmitter {
  ws: WebSocket
  constructor(ws: WebSocket) {
    this.ws = ws
  }

  send(message: Record<string, string>) {
    this.ws.send(
      JSON.stringify(message)
    )
  }
}
