/*
 * Copyright (C) 2023 by Fonoster Inc (https://fonoster.com)
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
import { ServerConfig } from "./types"
import { getEnvOrBool, getEnvOrDefault, removeEmpty } from "./util"
import dotenv from "dotenv"
import os from "os"

export const getConfigFromEnv = (): ServerConfig => {
  // Load parameters from the environment
  dotenv.config()
  return removeEmpty({
    eventsServerEnabled: process.env.EVENTS_SERVER_ENABLED === "true",
    defaultLanguageCode: process.env.DEFAULT_LANGUAGE_CODE,
    otlExporterJaegerUrl: process.env.OTL_EXPORTER_JAEGER_URL,
    otlExporterZipkinUrl: process.env.OTL_EXPORTER_ZIPKIN_URL,
    otlExporterPrometheusEndpoint: process.env.OTL_EXPORTER_PROMETHEUS_ENDPOINT,
    otlExporterPrometheusPort: getEnvOrDefault(
      "OTL_EXPORTER_PROMETHEUS_PORT",
      9090
    ),
    otlExporterGCPEnabled: getEnvOrBool("OTL_EXPORTER_GCP_ENABLED"),
    fileRetentionPolicyEnabled: getEnvOrBool("FILE_RETENTION_POLICY_ENABLED"),
    fileRetentionPolicyDirectory:
      process.env.FILE_RETENTION_POLICY_DIRECTORY || os.tmpdir(),
    fileRetentionPolicyCronExpression:
      process.env.FILE_RETENTION_POLICY_CRON_EXPRESSION || "0 0 * * *",
    fileRetentionPolicyMaxAge: getEnvOrDefault(
      "FILE_RETENTION_POLICY_MAX_AGE",
      24
    ),
    fileRetentionPolicyExtension:
      process.env.FILE_RETENTION_POLICY_EXTENSION || ".sln24"
  }) as ServerConfig
}

export const getConfigFromFlags = (flags: any): ServerConfig =>
  removeEmpty({
    eventsServerEnabled: flags["events-server-enabled"],
    defaultLanguageCode: flags["default-language-code"],
    otlExporterJaegerUrl: flags["otl-exporter-jaeger-url"],
    otlExporterZipkinUrl: flags["otl-exporter-zipkin-url"],
    otlExporterPrometheusEndpoint: flags["otl-exporter-promethus-endpoint"],
    otlExporterPrometheusPort: flags["otl-exporter-promethus-port"],
    otlExporterGCPEnabled: flags["otl-exporter-gcp-enabled"],
    fileRetentionPolicyEnabled: flags["file-retention-policy-enabled"],
    fileRetentionPolicyDirectory: flags["file-retention-policy-directory"],
    fileRetentionPolicyCronExpression:
      flags["file-retention-policy-cron-expression"],
    fileRetentionPolicyMaxAge: flags["file-retention-policy-max-age"],
    fileRetentionPolicyExtension: flags["file-retention-policy-extension"]
  }) as ServerConfig
