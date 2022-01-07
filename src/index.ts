/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/rox
 *
 * This file is part of Rox AI
 *
 * Licensed under the MIT License (the "License")
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
import GoogleASR from '@fonoster/googleasr'
import GoogleTTS from '@fonoster/googletts'
import {
  assertEverything
} from './assertions'
import { getIntentsEngine } from './intents/engines'
import { getConfigFromEnv, getConfigFromFlags } from './util'
import { Command, flags } from '@oclif/command'
import { voice } from './voice'
import logger from '@fonoster/logger'
import ngrok from 'ngrok'
import merge from 'deepmerge'
import { RoxConfig } from './@types/rox'

class Rox extends Command {
  static description = 'starts a new Rox AI instance'
  static flags = {
    version: flags.version({ char: 'v', description: 'show rox version' }),
    help: flags.help({ char: 'h', description: 'show this help' }),
    "with-ngrok": flags.boolean({ char: 'g', description: 'open a tunnel with ngrok' }),
    "enable-events": flags.boolean({ char: 'e', description: 'starts events socket' }),
    "ngrok-authtoken": flags.string({ description: 'ngrok authentication token' }),
    "tts-voice": flags.string({ description: 'text to speech voice' }),
    "tts-engine": flags.string({ description: 'text to speech engine' }),
    "asr-engine": flags.string({ description: 'automatic speech recognition engine' }),
    "intents-engine": flags.string({ description: 'intents analysis engine' }),
    "language-code": flags.string({ description: 'optional language code' }),
    "google-config-file": flags.string({ description: 'config file with google credentials' }),
    "intents-engine-agent": flags.string({ description: 'agent for dialogflow cx bots' }),
    "intents-engine-location": flags.string({ description: 'location for dialogflow cx bots' }),
    "intents-engine-platform": flags.string({ description: 'sets the platform for dialogflow cx/es bots (i.e "TELEPHONY")' }),
    "initial-dtmf": flags.string({ description: 'optional initial dtmf' }),
    "welcome-intent-trigger": flags.string({ description: 'phrase that will trigger the welcome intent' }),
    "activation-intent": flags.string({ description: 'intent that will wake the bot; similar to "alexa!" or "hey google!"' }),
    "activation-timeout": flags.string({ description: 'wake timeout' }),
    "otl-exporter-jaeger-url": flags.string({ description: 'if set will send telemetry to Jaeger' }),
    "otl-exporter-zipkin-url": flags.string({ description: 'if set will send telemetry to Zipkin' }),
    "otl-exporter-prometheus-port": flags.string({ description: 'sets Prometheus port. Defaults to 9090' }),
    "otl-exporter-prometheus-endpoint": flags.string({ description: 'sets Prometheus endpoint. Defaults to "/metrics"' }),
    "otl-exporter-gcp-enabled": flags.boolean({ char: 'g', description: 'if set it will send telemetry to GCP' }),
    "init-endpoint": flags.string({ description: 'optional endpoint to retrieve the configuration' }),
    "init-endpoint-username": flags.string({ description: 'optional username for the init endpoint' }),
    "init-endpoint-password": flags.string({ description: 'optional password for the init endpoint' }),
    "transfer-media": flags.string({ description: 'optional media to play while transfering' }),
    "transfer-media-busy": flags.string({ description: 'optional media to play if callee is busy' }),
    "transfer-media-noanswer": flags.string({ description: 'optional media to play if callee does not answer' }),
    "transfer-message": flags.string({ description: 'optional message to play while transfering' }),
    "transfer-message-busy": flags.string({ description: 'optional message to play if callee is busy' }),
    "transfer-message-noanswer": flags.string({ description: 'optional message to play if callee does not answer' }),
  }

  async run() {
    const { flags } = this.parse(Rox)
    const configFromEnv = getConfigFromEnv()
    const configFromFlags = getConfigFromFlags(flags)
    const roxConfig = merge.all([
      {
        languageCode: "en-US",
        intentsEnginePlatform: "PLATFORM_UNSPECIFIED"
      },
      configFromEnv, 
      configFromFlags,
    ]) as RoxConfig
    
    assertEverything(roxConfig)

    const intentsEngine = getIntentsEngine(roxConfig)
    const googleCredentials = {
      keyFilename: roxConfig.googleConfigFile,
      languageCode: roxConfig.languageCode,
    }
    const asr = new GoogleASR(googleCredentials)
    const tts = new GoogleTTS(googleCredentials)

    voice({
      roxConfig,
      asr,
      tts,
      intents: intentsEngine,
      initEndpoint: roxConfig.initEndpoint,
      initEndpointUsername: roxConfig.initEndpointUsername,
      initEndpointPassword: roxConfig.initEndpointPassword
    })

    if (flags["with-ngrok"]) {
      try {
        const ngrokConfig = flags["ngrok-authtoken"]
          ? { addr: 3000, authtoken: flags["ngrok-authtoken"] }
          : { addr: "localhost:3000" }
        const url = await ngrok.connect(ngrokConfig)
        logger.info("application webhook => " + url)
      } catch (e) {
        logger.error("failed to start ngrok tunnel")
        process.exit(1)
      }
    }
  }
}

export = Rox


