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

export const GOOGLE_CONFIG_FILE =
  process.env.GOOGLE_CONFIG || path.join(require("os").homedir(), ".fonos", "google.json")
export const ROXANNE_CONFIG_FILE =
  process.env.ROXANNE_CONFIG || path.join(require("os").homedir(), ".fonos", "roxanne.json")
export const ACTIONS_FILE =
  process.env.ACTIONS || path.join(require("os").homedir(), ".fonos", "actions.json")

try {
  require(GOOGLE_CONFIG_FILE)
  require(ROXANNE_CONFIG_FILE)
  require(ACTIONS_FILE)
} catch (e) {
  console.error(
    'the files google.json,roxanne.json, and actions.json are required; one or more is missing'
  )
  process.exit(1)
}

// WARNING: Harcoded value
const googleCredentials = {
  keyFilename: GOOGLE_CONFIG_FILE,
  languageCode: 'en-US',
}

export const asr = new GoogleASR(googleCredentials)
export const tts = new GoogleTTS(googleCredentials)
