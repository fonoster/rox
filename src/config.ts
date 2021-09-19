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
import GoogleASR from '@fonos/googleasr'
import GoogleTTS from '@fonos/googletts'
import path from 'path'
import DialogFlow from './intents/dialogflow'
import { Intents } from "./@types/intents"
import { 
  assertASREngineIsSupported, 
  assertConfigExist, 
  assertEnvExist, 
  assertIntentsEngineIsSupported, 
  assertTTSEngineIsSupported 
} from './assertions'

export const GOOGLE_CONFIG_FILE =
  process.env.GOOGLE_CONFIG || path.join(require("os").homedir(), ".fonos", "google.json")
export const WATSON_CONFIG_FILE =
  process.env.WATSON_CONFIG || path.join(require("os").homedir(), ".fonos", "watson.json")
export const ROX_CONFIG_FILE =
  process.env.ROX_CONFIG || path.join(require("os").homedir(), ".fonos", "rox.json")

assertEnvExist("INTENTS_ENGINE")
assertEnvExist("ASR_ENGINE")
assertEnvExist("TTS_ENGINE")
assertIntentsEngineIsSupported(process.env.INTENTS_ENGINE)
assertTTSEngineIsSupported(process.env.TTS_ENGINE)
assertASREngineIsSupported(process.env.ASR_ENGINE)

// TODO: The requirements for the engine should be in a config 
// file
if (process.env.INTENTS_ENGINE === "dialogflow"
  || process.env.TTS_ENGINE === "google"
  || process.env.ASR_ENGINE === "google") {
  assertConfigExist(GOOGLE_CONFIG_FILE)
}

if (process.env.INTENTS_ENGINE === "watson") {
  assertConfigExist(WATSON_CONFIG_FILE)
}

assertConfigExist(ROX_CONFIG_FILE)

let intentsEngine

if (process.env.INTENTS_ENGINE === "dialogflow") {
  const config = require(GOOGLE_CONFIG_FILE)
  intentsEngine = new DialogFlow({
    projectId: config.project_id,
    keyFilename: GOOGLE_CONFIG_FILE,
    languageCode: process.env.LANGUAGE_CODE || 'en-US'
  })
} else {
  // intentsEngine = new WatsonAssistant()
}

// WARNING: Harcoded value
const googleCredentials = {
  keyFilename: GOOGLE_CONFIG_FILE,
  languageCode: process.env.LANGUAGE_CODE || 'en-US',
}

export const intents:Intents = intentsEngine
export const asr = new GoogleASR(googleCredentials)
export const tts = new GoogleTTS(googleCredentials)
