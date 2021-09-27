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
const SUPPORTED_TTS_ENGINES = ["google"]
const SUPPORTED_ASR_ENGINES = ["google"]
const SUPPORTED_INTENTS_ENGINES = ["dialogflow.es", "dialogflow.cx"]

export const assertConfigExist = (path: string) => {
  try {
    require(path)
  } catch (e) {
    console.error(
      `the file ${path} is required but is missing`
    )
    process.exit(1)
  }
}

export const assertEnvExist = (name: string) => {
  if (!process.env[name]) {
    console.error(
      `the environment variable ${name} is required but is missing`
    )
    process.exit(1)
  }
}

export const assertIntentsEngineIsSupported = (name?: string) => {
  if (!name || !SUPPORTED_INTENTS_ENGINES.includes(name)) {
    console.error(
      `the intents engine ${name} is not currently supported`
    )
    process.exit(1)
  }
}

export const assertTTSEngineIsSupported = (name?: string) => {
  if (!name || !SUPPORTED_TTS_ENGINES.includes(name)) {
    console.error(
      `the tts engine ${name} is not currently supported`
    )
    process.exit(1)
  }
}

export const assertASREngineIsSupported = (name?: string) => {
  if (!name || !SUPPORTED_ASR_ENGINES.includes(name)) {
    console.error(
      `the asr engine ${name} is not currently supported`
    )
    process.exit(1)
  }
}

