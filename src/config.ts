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
import dotenv from 'dotenv';
const result = dotenv.config();
if (result.error) {
  console.log('failed to load .env');
  process.exit(1);
}

import GoogleASR from '@fonoster/googleasr'
import GoogleTTS from '@fonoster/googletts'
import path from 'path'
import DialogFlowES from './intents/dialogflow_es'
import DialogFlowCX from './intents/dialogflow_cx'
import { Intents } from "./@types/intents"
import { 
  assertASREngineIsSupported, 
  assertConfigExist, 
  assertEnvExist, 
  assertIntentsEngineIsSupported, 
  assertTTSEngineIsSupported 
} from './assertions'

export const GOOGLE_CONFIG_FILE =
  process.env.GOOGLE_CONFIG || path.join(require("os").homedir(), ".fonoster", "google.json")

assertEnvExist("INTENTS_ENGINE")
assertEnvExist("ASR_ENGINE")
assertEnvExist("TTS_ENGINE")
assertEnvExist("TTS_VOICE")
assertIntentsEngineIsSupported(process.env.INTENTS_ENGINE)
assertTTSEngineIsSupported(process.env.TTS_ENGINE)
assertASREngineIsSupported(process.env.ASR_ENGINE)

// TODO: The requirements for the engine should be in a config file
if (process.env.INTENTS_ENGINE === "dialogflow.es"
  || process.env.INTENTS_ENGINE === "dialogflow.cx"
  || process.env.TTS_ENGINE === "google"
  || process.env.ASR_ENGINE === "google") {
  assertConfigExist(GOOGLE_CONFIG_FILE)
}

let intentsEngine

if (process.env.INTENTS_ENGINE === "dialogflow.es") {
  const config = require(GOOGLE_CONFIG_FILE)
  intentsEngine = new DialogFlowES({
    projectId: config.project_id,
    keyFilename: GOOGLE_CONFIG_FILE,
    languageCode: process.env.LANGUAGE_CODE || 'en-US'
  })
}

if (process.env.INTENTS_ENGINE === "dialogflow.cx") {
  assertEnvExist("INTENTS_ENGINE_AGENT")
  assertEnvExist("INTENTS_ENGINE_LOCATION")
  const config = require(GOOGLE_CONFIG_FILE)
  intentsEngine = new DialogFlowCX({
    projectId: config.project_id,
    keyFilename: GOOGLE_CONFIG_FILE,
    languageCode: process.env.LANGUAGE_CODE || 'en-US'
  })
}

const googleCredentials = {
  keyFilename: GOOGLE_CONFIG_FILE,
  languageCode: process.env.LANGUAGE_CODE || 'en-US',
}

export const intents:Intents = intentsEngine
export const asr = new GoogleASR(googleCredentials)
export const tts = new GoogleTTS(googleCredentials)
