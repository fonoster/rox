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
import dialogflow, { SessionsClient } from '@google-cloud/dialogflow'
import { Effect } from '../@types/cerebro'

import { DialogFlowConfig, Intent, Intents } from '../@types/intents'
import { convertToSayEffect, convertToSendDataEffect } from './df_utils'

export default class DialogFlow implements Intents {
  sessionClient: SessionsClient
  sessionPath: any
  config: DialogFlowConfig
  constructor(config: DialogFlowConfig) {
    const uuid = require('uuid')
    const sessionId = uuid.v4()
    const credentials = require(config.keyFilename)

    let c = {
      credentials: {
        private_key: credentials.private_key,
        client_email: credentials.client_email,
      }
    }

    // Create a new session
    this.sessionClient = new dialogflow.SessionsClient(c)
    this.sessionPath = this.sessionClient.projectAgentSessionPath(
      config.projectId,
      sessionId
    )
    this.config = config
  }

  async findIntent(
    txt: string
  ): Promise<Intent> {
    const request = {
      session: this.sessionPath,
      queryInput: {
        text: {
          text: txt,
          languageCode: this.config.languageCode,
        },
      },
    }

    const responses = await this.sessionClient.detectIntent(request)

    if (!responses
      || !responses[0].queryResult
      || !responses[0].queryResult.intent
      || !responses[0].queryResult.intent.displayName) {
      throw new Error("@rox/intents unexpect null intent")
    }

    logger.verbose(
      `@rox/intents got speech [text=${JSON.stringify(responses[0], null, ' ')}]`
    )

    const effects = this.getEffects(responses[0].queryResult.fulfillmentMessages as Record<string, any>[])

    return {
      ref: responses[0].queryResult.intent.displayName,
      effects,
      confidence: responses[0].queryResult.intentDetectionConfidence || 0,
      allRequiredParamsPresent: responses[0].queryResult.allRequiredParamsPresent ? true : false
    }
  }

  private getEffects(fulfillmentMessages: Record<string, any>[]): Effect[] {
    const effects = new Array()
    for (const f of fulfillmentMessages) {
      switch (f.payload.fields.effect.stringValue) {
        case "say":
          effects.push(convertToSayEffect(f))
          break;
        case "send_link":
          effects.push(convertToSendDataEffect(f))
          break;
        case "hangup":
          effects.push({ type: "hangup" })
          break;
        default:
          throw new Error(`unknown effect ${f.payload.fields.effect.stringValue}`)
      }
    }
    return effects
  }
}
