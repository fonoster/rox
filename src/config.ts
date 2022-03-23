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
import dotenv from 'dotenv'
import path from 'path'
import { ServerConfig } from './types'
import { getEnvOrBool, getEnvOrDefault, removeEmpty } from './util'

export const getConfigFromEnv = (): ServerConfig => {
  // Load parameters from the environment
  dotenv.config()
  const defaultConfigPath = path.join(require("os").homedir(), ".fonoster", "google.json")
  return removeEmpty({
    defaultLanguageCode: process.env.DEFAULT_LANGUAGE_CODE,
    googleConfigFile: process.env.GOOGLE_CONFIG_FILE || defaultConfigPath,
    otlExporterJaegerUrl: process.env.OTL_EXPORTER_JAEGER_URL,
    otlExporterZipkinUrl: process.env.OTL_EXPORTER_ZIPKIN_URL,
    otlExporterPrometheusEndpoint: process.env.OTL_EXPORTER_PROMETHEUS_ENDPOINT,
    otlExporterPrometheusPort: getEnvOrDefault("OTL_EXPORTER_PROMETHEUS_PORT", 9090),
    otlExporterGCPEnabled: getEnvOrBool("OTL_EXPORTER_GCP_ENABLED")
  }) as ServerConfig
}

export const getConfigFromFlags = (flags: any): ServerConfig => removeEmpty({
  defaultLanguageCode: flags["default-language-code"],
  googleConfigFile: flags["google-config-file"],
  otlExporterJaegerUrl: flags["otl-exporter-jaeger-url"],
  otlExporterZipkinUrl: flags["otl-exporter-zipkin-url"],
  otlExporterPrometheusEndpoint: flags["otl-exporter-promethus-endpoint"],
  otlExporterPrometheusPort: flags["otl-exporter-promethus-port"],
  otlExporterGCPEnabled: flags["otl-exporter-gcp-enabled"],
}) as ServerConfig
