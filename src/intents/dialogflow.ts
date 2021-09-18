import logger from '@fonos/logger'
import dialogflow, { SessionsClient } from '@google-cloud/dialogflow'

import { DialogFlowConfig } from '../@types/cerebro'
import { Intent, Intents } from '../@types/intents'

export default class IntentsAPI implements Intents {
  sessionClient: SessionsClient
  sessionPath: any
  config: any
  constructor(config: DialogFlowConfig) {
    logger.verbose(`@rox config file name = ${config.keyFilename}`)
    logger.verbose(`@rox config file config.projectId = ${config.projectId}`)
    const uuid = require('uuid')
    const sessionId = uuid.v4()
    const credentials = require(config.keyFilename)

    let c = {
			credentials: {
				private_key: credentials.private_key,
				client_email:  credentials.client_email,
			}
		}

    // Create a new session
    this.sessionClient = new dialogflow.SessionsClient(c)
    this.sessionPath = this.sessionClient.projectAgentSessionPath(
      config.projectId,
      sessionId
    )
  }

  async findIntent(
    txt: string
  ): Promise<Intent | null> {
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

    if (!responses || !responses[0].queryResult) {
      return null
    }

    logger.verbose(
      `@rox/cerebro got speech [text=${responses[0].queryResult}]`
    )

    return {
      effectId: "",
      action: responses[0].queryResult.action || '',
      confidence: responses[0].queryResult.intentDetectionConfidence || 0,
      allRequiredParamsPresent: responses[0].queryResult.allRequiredParamsPresent ? true : false
    }
  }
}

