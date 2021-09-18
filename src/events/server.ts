import WebSocket = require('ws')
import logger from '@fonos/logger'

import { EventEmitter } from '../@types/events'
import { EventEmitterImpl } from './emitter'

// Events server
export class EventsServer {
  clientConnections: Map<string, WebSocket>
  wss: WebSocket.Server
  port: number

  constructor(clientConnections: Map<string, WebSocket>, port = 3001) {
    this.port = port
    this.wss = new WebSocket.Server({ port })
    this.clientConnections = clientConnections
  }

  start() {
    this.wss.on('connection', ws => {
      logger.verbose('incoming client connection')
      ws.on('message', data => {
        // Once we receive the first and only message from client we
        // save the client in the clientConnections map
        const clientId = JSON.parse(data.toString()).clientId
        this.clientConnections.set(clientId, ws)
        logger.verbose(`added clientId: ${clientId} to connection list`)
      })

      ws.send(
        JSON.stringify({
          name: 'CONNECTED',
          payload: {},
        })
      )
    })

    logger.info(`starting events server on port ${this.port}`)
  }

  getConnection(clientId: string): EventEmitter {
    const connection = this.clientConnections.get(clientId)
    if (!connection) {
      throw new Error(`Connection not found for clientId ${clientId}`)
    }
    return new EventEmitterImpl(connection)
  }

  removeConnection(clientId: string): void {
    this.clientConnections.delete(clientId)
  }
}

// Starting events server
export const eventsServer = new EventsServer(new Map())
eventsServer.start()
