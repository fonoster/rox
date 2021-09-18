import GoogleASR from '@fonos/googleasr'
import GoogleTTS from '@fonos/googletts'
import path from 'path'

export const PLAYBACK_ID = 'cerebro001'
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
