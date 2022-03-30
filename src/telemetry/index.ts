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
import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin'
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter'
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { MeterProvider } from '@opentelemetry/sdk-metrics-base'
import logger from '@fonoster/logger'

interface RoxTelmetryConfig {
  jaegerUrl?: string
  zipkinUrl?: string
  gcpEnabled?: boolean
  gcpKeyfile?: string
}

interface RoxMetricConfig {
  prometheusPort?: number
  prometheusEndpoint?: string
}

export function getSpanExporters(config: RoxTelmetryConfig): Array<any> {
  const exporters: any = []

  if (config.gcpEnabled) {
    exporters.push({
      exporter: TraceExporter, config: {
        keyFile: config.gcpKeyfile
      }
    })
  }

  if (config.jaegerUrl) {
    exporters.push({
      exporter: JaegerExporter, config: {
        endpoint: config.jaegerUrl
      }
    })
  }

  if (config.zipkinUrl) {
    exporters.push({
      exporter: ZipkinExporter, config: {
        url: config.zipkinUrl
      }
    })
  }

  return exporters
}

export function getMeterProvider(config: RoxMetricConfig): MeterProvider | undefined {
  config.prometheusPort = config.prometheusPort || PrometheusExporter.DEFAULT_OPTIONS.port
  config.prometheusEndpoint = config.prometheusEndpoint || PrometheusExporter.DEFAULT_OPTIONS.endpoint

  const options = {
    port: config.prometheusPort,
    endpoint: config.prometheusEndpoint,
    startServer: true,
  };

  // Register the exporter
  return new MeterProvider({
    exporter: new PrometheusExporter(options, () => {
      logger.info('starting prometheus scrape process',
        { endpoint: `http://localhost:${config.prometheusPort}${config.prometheusEndpoint}` })
    }),
    interval: 1000,
  })
}
