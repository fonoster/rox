/*
 * Copyright (C) 2023 by Fonoster Inc (https://fonoster.com)
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
import * as dialogflow from "@google-cloud/dialogflow"
import { IntentsEngine, Intent, DialogFlowESConfig } from "./types"
import { transformPayloadToEffect } from "./df_utils"
import { struct } from "pb-util"
import { Effect } from "../cerebro/types"
import logger from "@fonoster/logger"
import uuid = require("uuid")

export default class DialogFlow implements IntentsEngine {
  sessionClient: dialogflow.v2beta1.SessionsClient
  sessionPath: any
  config: DialogFlowESConfig
  sessionId: string
  projectId: string
  constructor(config: DialogFlowESConfig) {
    this.sessionId = uuid.v4()
    this.config = config
    this.projectId = config.projectId
    // Create a new session
    this.sessionClient = new dialogflow.v2beta1.SessionsClient({
      credentials: config.credentials
    })
    logger.verbose("created new dialogflow/es session", {
      projectId: this.projectId,
      sessionId: this.sessionId
    })
  }

  setProjectId(projectId: string) {
    this.projectId = projectId
  }

  async findIntentWithEvent(name: string, payload?: Record<string, unknown>) {
    const request = {
      queryInput: {
        event: {
          name: name.toUpperCase(),
          languageCode: this.config.languageCode
        }
      }
    }

    return this.detect(request, payload)
  }

  async findIntent(
    txt: string,
    payload?: Record<string, unknown>
  ): Promise<Intent> {
    const request = {
      queryParams: {},
      queryInput: {
        text: {
          text: txt,
          languageCode: this.config.languageCode
        }
      }
    }

    return this.detect(request, payload)
  }

  private async detect(
    request: Record<string, unknown>,
    payload?: Record<string, unknown>
  ): Promise<Intent> {
    const sessionPath = this.sessionClient.projectAgentSessionPath(
      this.projectId,
      this.sessionId
    )

    request.session = sessionPath

    if (payload) {
      request.queryParams = {
        payload: struct.encode(payload as any)
      }
    }

    const responses = await this.sessionClient.detectIntent(request)

    logger.silly("got speech from api", { text: JSON.stringify(responses[0]) })

    if (
      !responses ||
      !responses[0].queryResult ||
      !responses[0].queryResult.intent
    ) {
      throw new Error("got unexpect null intent")
    }

    let effects: Effect[] = []

    if (responses[0].queryResult.fulfillmentMessages) {
      const messages = responses[0].queryResult.fulfillmentMessages.filter(
        (f) => f.platform === this.config.platform
      )
      effects = this.getEffects(messages as Record<string, any>[])
    } else if (responses[0].queryResult.fulfillmentText) {
      effects = [
        {
          type: "say",
          parameters: {
            response: responses[0].queryResult.fulfillmentText
          }
        }
      ]
    }

    return {
      ref: responses[0].queryResult.intent.displayName || "unknown",
      effects,
      confidence: responses[0].queryResult.intentDetectionConfidence || 0,
      allRequiredParamsPresent: responses[0].queryResult
        .allRequiredParamsPresent
        ? true
        : false
    }
  }

  private getEffects(fulfillmentMessages: Record<string, any>[]): Effect[] {
    const effects = []
    for (const f of fulfillmentMessages) {
      if (f.payload) {
        effects.push(transformPayloadToEffect(f.payload))
      } else if (f.telephonySynthesizeSpeech) {
        effects.push({
          type: "say",
          parameters: {
            response:
              f.telephonySynthesizeSpeech.text ||
              f.telephonySynthesizeSpeech.ssml
          }
        })
      } else if (f.telephonyTransferCall) {
        effects.push({
          type: "transfer",
          parameters: {
            destination: f.telephonyTransferCall.phoneNumber
          }
        })
      } else if (f.text) {
        effects.push({
          type: "say",
          parameters: {
            response: f.text.text[0]
          }
        })
      }
    }
    return effects
  }
}
