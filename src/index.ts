/*
 * Copyright (C) 2022 by Fonoster Inc (https://fonoster.com)
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
import { Command, flags } from '@oclif/command'
import { ServerConfig } from './types'
import { voice } from './voice'
import logger from '@fonoster/logger'
import ngrok from 'ngrok'
import merge from 'deepmerge'
import { getConfigFromEnv, getConfigFromFlags } from './config'
import process from 'process'
import { startFileRetentionPolicy } from './file-retention'

class Rox extends Command {
  static description = 'starts a new Rox AI instance'
  static flags = {
    version: flags.version({ char: 'v', description: 'show rox version' }),
    help: flags.help({ char: 'h', description: 'show this help' }),
    "with-ngrok": flags.boolean({ char: 'g', description: 'open a tunnel with ngrok' }),
    "events-server-enabled": flags.boolean({ char: 'e', description: 'starts events socket' }),
    "ngrok-authtoken": flags.string({ description: 'ngrok authentication token' }),
    "default-language-code": flags.string({ description: 'default language' }),
    "otl-exporter-jaeger-url": flags.string({ description: 'if set will send telemetry to Jaeger' }),
    "otl-exporter-zipkin-url": flags.string({ description: 'if set will send telemetry to Zipkin' }),
    "otl-exporter-prometheus-port": flags.string({ description: 'sets Prometheus port. Defaults to 9090' }),
    "otl-exporter-prometheus-endpoint": flags.string({ description: 'sets Prometheus endpoint. Defaults to "/metrics"' }),
    "otl-exporter-gcp-enabled": flags.boolean({ char: 'g', description: 'if set it will send telemetry to GCP' }),
    "google-config-file": flags.string({ description: 'config file with google credentials' }),
    "file-retention-policy-enabled": flags.boolean({ description: 'enable file retention policy' }),
    "file-retention-policy-directory": flags.string({ description: 'directory where the file retention policy will be executed' }),
    "file-retention-policy-cron-expression": flags.string({ description: 'cron expression to run the file retention policy' }),
    "file-retention-policy-max-age": flags.integer({ description: 'max age of files to be deleted in hours' }),
  }

  async run() {
    const { flags } = this.parse(Rox)
    const config = merge.all([
      {
        defaultLanguageCode: "en-US",
        intentsEnginePlatform: "PLATFORM_UNSPECIFIED"
      },
      getConfigFromEnv(),
      getConfigFromFlags(flags),
    ]) as ServerConfig

    process.on('uncaughtException', (error, origin) => {
      const isPortInUse = error && error['code'] === 'EADDRINUSE'

      if (isPortInUse) {
        logger.error("Port 3000 is already in use. Please stop the process that is using it.")

        process.exit(1)
      }

      logger.error('----- Uncaught exception -----')
      logger.error(error)
      logger.error('----- Exception origin -----')
      logger.error(origin)
    })
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('----- Unhandled Rejection at -----')
      logger.error(promise)
      logger.error('----- Reason -----')
      logger.error(reason)
    })

    voice(config)

    startFileRetentionPolicy(config)

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
